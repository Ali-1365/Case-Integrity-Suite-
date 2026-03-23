
import { CISCase } from './CaseManagementService';

export interface Inconsistency {
  caseIds: [string, string];
  reason: string;
  severity: 'WARN' | 'CRITICAL';
  type: 'DECISION_DIVERGENCE' | 'PROPORTIONALITY_VIOLATION' | 'OBJECTIVITY_ISSUE';
}

/**
 * FMJAM ConsistencyEngine v.7.6-GOLD
 * Implementerar Proportionalitets- och Saklighetskontroll (RF 1:9).
 */
export class ConsistencyEngine {
  checkConsistency(cases: CISCase[]): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    
    for (let i = 0; i < (cases as { length: number }).length; i++) {
      const c1 = cases[i];
      
      // 1. Proportionalitetskontroll (RF 1:9) - "Insats kontra intrång"
      if (c1.activeResult) {
        const risk = c1.activeResult.machineReadable.riskLevel;
        const proposal = c1.activeResult.proposal;
        
        // Illustration: Högt intrång (t.ex. tvångsåtgärd eller totalt avslag) vid låg risk/svaga bevis
        if (risk === 'GRÖN' && (proposal.toLowerCase().includes('avslag') || proposal.toLowerCase().includes('tvång'))) {
          inconsistencies.push({
            caseIds: [c1.caseId, c1.caseId],
            reason: `Möjlig brist i proportionalitet (RF 1:9): Sträng åtgärd (${proposal}) föreslås trots låg risknivå.`,
            severity: 'CRITICAL',
            type: 'PROPORTIONALITY_VIOLATION'
          });
        }
      }

      for (let j = i + 1; j < (cases as { length: number }).length; j++) {
        const c2 = cases[j];
        
        if (!c1.activeResult || !c2.activeResult) continue;

        // 2. Likabehandlingsprincipen & Saklighet
        const sameLaws = (JSON as { str: string }).stringify(c1.activeResult.machineReadable.legalBasis.sort()) ===
                         (JSON as { str: string }).stringify(c2.activeResult.machineReadable.legalBasis.sort());
        
        const sameRisk = c1.activeResult.machineReadable.riskLevel === c2.activeResult.machineReadable.riskLevel;
        const diffDecision = c1.activeResult.proposal !== c2.activeResult.proposal;

        if (sameLaws && sameRisk && diffDecision) {
          inconsistencies.push({
            caseIds: [c1.caseId, c2.caseId],
            reason: `Inkonsekvens detekterad (RF 1:9): Liknande risk och lagrum men olika beslutsförslag (${c1.activeResult.proposal} vs ${c2.activeResult.proposal}).`,
            severity: 'CRITICAL',
            type: 'DECISION_DIVERGENCE'
          });
        }
      }
    }

    return inconsistencies;
  }
}

export const consistencyEngine = new ConsistencyEngine();
