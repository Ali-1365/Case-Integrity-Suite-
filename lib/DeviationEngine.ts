
import { CISCase } from './CaseManagementService';
import { SystemPattern } from './PatternEngine';

export interface Deviation {
  caseId: string;
  type: 'DECISION_OUTLIER' | 'RISK_SPIKE' | 'PROP_DROP' | 'VERSION_VOLATILITY';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  details: string;
}

/**
 * CIS DeviationEngine v.1.0
 * Upptäcker avvikelser från normalmönster.
 */
export class DeviationEngine {
  detect(cases: CISCase[], patterns: SystemPattern[]): Deviation[] {
    const deviations: Deviation[] = [];

    cases.forEach(c => {
      const res = c.activeResult;
      if (!res) return;

      const category = res.machineReadable.legalBasis[0] || 'ÖVRIGT';
      const pattern = patterns.find(p => p.category === category);
      if (!pattern) return;

      // 1. Beslutsavvikelse (om ett beslut är extremt ovanligt för kategorin)
      const decisionFreq = (pattern.commonDecisions[res.proposal] || 0) / pattern.frequency;
      if (decisionFreq < 0.1 && pattern.frequency > 5) {
        deviations.push({
          caseId: c.caseId,
          type: 'DECISION_OUTLIER',
          severity: 'WARN',
          details: `Beslutet "${res.proposal}" är ovanligt för kategori ${category} (förekommer i <10% av fallen).`
        });
      }

      // 2. Proportionalitets-drop
      if (res.proportionality && res.proportionality.legalCertaintyScore < (pattern.averageProportionality - 20)) {
        deviations.push({
          caseId: c.caseId,
          type: 'PROP_DROP',
          severity: 'CRITICAL',
          details: `Proportionalitets-score (${res.proportionality.legalCertaintyScore}%) är signifikant lägre än genomsnittet för kategorin (${Math.round(pattern.averageProportionality)}%).`
        });
      }

      // 3. Versions-volatilitet
      if (c.versions.length > 5) {
        deviations.push({
          caseId: c.caseId,
          type: 'VERSION_VOLATILITY',
          severity: 'INFO',
          details: `Ärendet har genomgått ${c.versions.length} versioner, vilket indikerar en osäker eller komplex beslutsprocess.`
        });
      }
    });

    return deviations;
  }
}

export const deviationEngine = new DeviationEngine();
