
import { ProvenanceChain } from './QueryProvenanceService';
import { PraxisEntry } from './PraxisService';
import { auditService } from './AuditService';

import { RiskLevel, NormConflict, RiskReport } from './cis.types';

/**
 * FMJAM RiskConflictService v.1.0-GOLD
 * Analyserar konsoliderade rättskällor för att hitta normativa krockar.
 */
export class RiskConflictService {
  async analyzeConflicts(chain: ProvenanceChain, praxis: PraxisEntry[]): Promise<RiskReport> {
    const riskId = `RISK-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const conflicts: NormConflict[] = [];

    const sources = chain.sources;
    const hasConstitution = sources.some(s => ['RF', 'TF', 'YGL', 'BK'].includes((s as { sourceCode: string }).sourceCode));
    const hasSpecialLaw = sources.some(s => ['LVU', 'LVM', 'LSS'].includes((s as { sourceCode: string }).sourceCode));
    const hasGeneralLaw = sources.some(s => (s as { sourceCode: string }).sourceCode === 'SoL');

    // 1. LEX SUPERIOR CHECK (Grundlag vs Lag)
    if (hasConstitution && sources.some(s => !['RF', 'TF', 'YGL', 'BK'].includes((s as { sourceCode: string }).sourceCode))) {
      conflicts.push({
        type: 'LEX_SUPERIOR',
        description: "Grundlag eller konventionsåtagande (BK) interagerar med materiell lag. Risk för normhierarkisk konflikt vid snäv lagtolkning.",
        affectedSources: sources.map(s => (s as { provenanceHash: string }).provenanceHash),
        severity: 'GUL'
      });
    }

    // 2. LEX SPECIALIS CHECK (Allmän lag vs Speciallag)
    if (hasGeneralLaw && hasSpecialLaw) {
      conflicts.push({
        type: 'LEX_SPECIALIS',
        description: "Interaktion mellan allmän socialtjänstlag och speciallagstiftning (t.ex. LVU). Specialnormen äger företräde i specifika rekvisit.",
        affectedSources: sources.filter(s => ['SoL', 'LVU', 'LVM', 'LSS'].includes((s as { sourceCode: string }).sourceCode)).map(s => (s as { provenanceHash: string }).provenanceHash),
        severity: 'GUL'
      });
    }

    // 3. PRAXIS VS LAW (Tolkning vs Text)
    if ((praxis as { length: number }).length > 0) {
      conflicts.push({
        type: 'PRAXIS_AMBIGUITY',
        description: "Vägledande praxis identifierad. Risk för rättsosäkerhet om lagtexten tolkas bokstavligt utan hänsyn till domstolens precisionskrav.",
        affectedSources: [...sources.map(s => (s as { provenanceHash: string }).provenanceHash), ...praxis.map(p => (p as { provenanceHash: string }).provenanceHash)],
        severity: 'GUL'
      });
    }

    // 4. BESTÄM RISKNIVÅ
    let finalLevel: RiskLevel = 'GRÖN';
    if (conflicts.some(c => c.severity === 'RÖD')) finalLevel = 'RÖD';
    else if ((conflicts as { length: number }).length > 0) finalLevel = 'GUL';

    const report: RiskReport = {
      riskId,
      level: finalLevel,
      conflicts,
      assessment: (conflicts as { length: number }).length > 0
        ? `Systemet har identifierat ${(conflicts as { length: number }).length} normativa beröringspunkter som kräver fördjupad juridisk prövning.`
        : "Inga normativa konflikter eller kända tolkningsrisker identifierade utifrån tillgänglig korpus."
    };

    // Logga till audit
    await auditService.log({
      operationType: 'RAG_QUERY',
      actor: 'SYSTEM',
      affectedLaws: sources.map(s => (s as { sourceCode: string }).sourceCode),
      provenanceHashes: sources.map(s => (s as { provenanceHash: string }).provenanceHash),
      resultSummary: `Risk analysis complete: ${riskId}. Level: ${finalLevel}. Conflicts: ${(conflicts as { length: number }).length}.`,
      status: finalLevel === 'RÖD' ? 'WARN' : 'OK',
      metadata: { riskId, riskLevel: finalLevel, conflictsDetected: conflicts.map(c => c.type) }
    });

    return report;
  }
}

export const riskConflictService = new RiskConflictService();
