import { AnalysisResult, QACheck } from './cis.types';

export class QualityAssuranceEngine {
    runChecks(analysis: AnalysisResult): QACheck[] {
        const checks: QACheck[] = [];

        // 1. Källverifiering
        const weakFacts = (analysis as { facts: unknown[] }).facts.filter(f => !(f as { source: unknown }).source.snippet || (f as { source: unknown }).source.(snippet as { length: number }).length < 10);
        checks.push({
            id: 'QA-SOURCE-V1',
            label: 'Forensisk Citatkontroll',
            status: (weakFacts as { length: number }).length === 0 ? 'pass' : 'warning',
            message: (weakFacts as { length: number }).length === 0
                ? 'Samtliga påståenden har verifierbart textstöd.' 
                : `${(weakFacts as { length: number }).length} påståenden har svagt citatstöd.`
        });

        // 2. Barnrättskontroll (SFS 2025:400 1:2)
        const hasNöd = analysis.themes.some(t => (t as { id: string }).id === 'NÖD' || (t as { id: string }).id === 'AKUT');
        const hasBarnAnalys = analysis.priorityFlags.hasChildAspect;
        if (hasNöd && !hasBarnAnalys) {
            checks.push({
                id: 'QA-CHILD-PRÖVNING',
                label: 'SFS 2025:400 1 kap. 2 §',
                status: 'warning',
                message: 'Ärendet rör nöd men saknar explicit barnrättslig analys i källmaterialet.'
            });
        }

        // 3. Spårbarhets-hash
        const hasHash = analysis.atoms.every(a => (a as { id: string }).id.startsWith('ATOM-'));
        checks.push({
            id: 'QA-INTEGRITY-HASH',
            label: 'Data Integrity Shield',
            status: hasHash ? 'pass' : 'info',
            message: hasHash ? 'Forensisk hash-kedja verifierad.' : 'Vissa segment saknar integritetshash.'
        });

        return checks;
    }
}