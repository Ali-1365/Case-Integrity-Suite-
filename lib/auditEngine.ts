
import { AnalysisResult, AuditResult } from './cis.types';
import { LEGAL_SOURCES } from '../data/legalSources';

export class AuditEngine {
    /**
     * Kör en fullständig forensisk revision av ett analysresultat.
     */
    runAudit(analysis: AnalysisResult): AuditResult {
        const checks: AuditResult['checks'] = [];
        let score = 100;

        // 1. Verifiera att alla fakta har en existerande atom-koppling via textlikhet
        const factsWithNoTextSupport = analysis.facts.filter(fact => {
            const hasMatch = analysis.atoms.some(atom => 
                atom.text.includes(fact.source.snippet) || fact.source.snippet.includes(atom.text)
            );
            return !hasMatch;
        });

        if (factsWithNoTextSupport.length > 0) {
            score -= 30;
            checks.push({
                id: 'AUDIT-HALLUCINATION-01',
                label: 'Bevisatomer vs Fakta',
                status: 'failed',
                details: `${factsWithNoTextSupport.length} faktapunkter saknar direkt textstöd. Risk för LLM-hallucination.`
            });
        } else {
            checks.push({
                id: 'AUDIT-HALLUCINATION-01',
                label: 'Bevisatomer vs Fakta',
                status: 'ok',
                details: '100% av faktaatomer är spårbara till källtexten.'
            });
        }

        // 2. Registry Gap Analysis: Kontrollera om lagrummen i analysen finns i GOLD-registret
        const unregisteredLaws: string[] = [];
        analysis.legalReferences.forEach(ref => {
            const exists = LEGAL_SOURCES.some(source => {
                const labelMatch = ref.rawText.toLowerCase().includes(source.label.toLowerCase());
                const idMatch = ref.id.toLowerCase().startsWith(source.id.toLowerCase());
                // Matchning på kapitel och paragraf i det nu kompletta 1-16 registret
                const sectionMatch = source.reference === ref.source && 
                                   ref.rawText.includes(`${source.chapter} kap.`) && 
                                   ref.rawText.includes(`${source.section} §`);
                return labelMatch || idMatch || sectionMatch;
            });
            
            if (!exists) {
                unregisteredLaws.push(ref.rawText);
            }
        });

        if (unregisteredLaws.length > 0) {
            score -= 25;
            const uniqueUnregistered = Array.from(new Set(unregisteredLaws));
            checks.push({
                id: 'AUDIT-REGISTRY-GAP',
                label: 'GOLD Registry Compliance',
                status: 'failed',
                details: `Varning: Följande lagrum saknas i systemets verifierade register: ${uniqueUnregistered.join(', ')}. Dessa kan inte verifieras ordagrant.`
            });
        } else {
            checks.push({
                id: 'AUDIT-REGISTRY-GAP',
                label: 'GOLD Registry Compliance',
                status: 'ok',
                details: 'Alla identifierade lagrum matchar systemets interna GOLD-standard (SoL 2001/2025).'
            });
        }

        // 3. Verifiera lagrumskonsekvens (SFS 2025:400 vs 2001:453)
        const obsoleteLaws = analysis.legalReferences.filter(r => 
            r.rawText.includes("2001:453") && new Date(analysis.createdAt) > new Date("2025-07-01")
        );

        if (obsoleteLaws.length > 0) {
            score -= 15;
            checks.push({
                id: 'AUDIT-LEGAL-VERSION',
                label: 'Versionskontroll Lagstöd',
                status: 'failed',
                details: `Varning: ${obsoleteLaws.length} referenser till gamla SoL (2001) hittades i ett ärende som skapats efter 2025-reformen.`
            });
        } else {
            checks.push({
                id: 'AUDIT-LEGAL-VERSION',
                label: 'Versionskontroll Lagstöd',
                status: 'ok',
                details: 'Vald lagrumsserie är förenlig med ärendets tidpunkt.'
            });
        }

        return {
            integrityScore: Math.max(0, score),
            hallucinationRisk: score > 80 ? 'low' : score > 50 ? 'medium' : 'high',
            checks,
            verifiedAt: new Date().toISOString()
        };
    }
}
