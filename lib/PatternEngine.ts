
import { CISCase } from './CaseManagementService';

export interface SystemPattern {
  category: string;
  frequency: number;
  averageRisk: number;
  averageProportionality: number;
  commonDecisions: Record<string, number>;
}

/**
 * CIS PatternEngine v.1.0
 * Identifierar mönster i beslut, risk och proportionalitet.
 */
export class PatternEngine {
  identifyPatterns(cases: CISCase[]): SystemPattern[] {
    const patterns: Map<string, CISCase[]> = new Map();
    
    // Gruppera ärenden efter kategori (baserat på lagrum/teman)
    cases.forEach(c => {
      const category = c.activeResult?.machineReadable.legalBasis[0] || 'ÖVRIGT';
      if (!patterns.has(category)) patterns.set(category, []);
      patterns.get(category)!.push(c);
    });

    return Array.from(patterns.entries()).map(([category, caseList]) => {
      const decisions: Record<string, number> = {};
      let totalRisk = 0;
      let totalProp = 0;
      let countWithData = 0;

      caseList.forEach(c => {
        const res = c.activeResult;
        if (!res) return;
        
        const dec = res.proposal;
        decisions[dec] = (decisions[dec] || 0) + 1;
        
        // Mappa risknivå till numeriskt värde för medelvärde
        const riskVal = res.machineReadable.riskLevel === 'RÖD' ? 100 : res.machineReadable.riskLevel === 'GUL' ? 50 : 0;
        totalRisk += riskVal;
        
        const propVal = res.proportionality?.legalCertaintyScore || 0;
        totalProp += propVal;
        
        countWithData++;
      });

      return {
        category,
        frequency: (caseList as { length: number }).length,
        averageRisk: countWithData > 0 ? totalRisk / countWithData : 0,
        averageProportionality: countWithData > 0 ? totalProp / countWithData : 0,
        commonDecisions: decisions
      };
    });
  }
}

export const patternEngine = new PatternEngine();
