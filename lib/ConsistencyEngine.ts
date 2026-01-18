
import { FMJAMCase } from './CaseManagementService';

export interface Inconsistency {
  caseIds: [string, string];
  reason: string;
  severity: 'WARN' | 'CRITICAL';
}

/**
 * FMJAM ConsistencyEngine v.1.0
 * Jämför liknande ärenden och flaggar inkonsekvens enligt likabehandlingsprincipen.
 */
export class ConsistencyEngine {
  checkConsistency(cases: FMJAMCase[]): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    
    // Vi jämför parvis (deterministiskt men resurskrävande i stora volymer)
    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        const c1 = cases[i];
        const c2 = cases[j];
        
        if (!c1.activeResult || !c2.activeResult) continue;

        // Om samma lagrum och liknande risknivå men helt olika beslut
        const sameLaws = JSON.stringify(c1.activeResult.machineReadable.legalBasis.sort()) === 
                         JSON.stringify(c2.activeResult.machineReadable.legalBasis.sort());
        
        const sameRisk = c1.activeResult.machineReadable.riskLevel === c2.activeResult.machineReadable.riskLevel;
        const diffDecision = c1.activeResult.proposal !== c2.activeResult.proposal;

        if (sameLaws && sameRisk && diffDecision) {
          inconsistencies.push({
            caseIds: [c1.caseId, c2.caseId],
            reason: `Inkonsekvens detekterad: Liknande risk och lagrum men olika beslutsförslag (${c1.activeResult.proposal} vs ${c2.activeResult.proposal}).`,
            severity: 'CRITICAL'
          });
        }
      }
    }

    return inconsistencies;
  }
}

export const consistencyEngine = new ConsistencyEngine();
