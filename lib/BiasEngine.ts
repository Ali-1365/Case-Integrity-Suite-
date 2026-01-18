
import { FMJAMCase } from './CaseManagementService';
import { SystemPattern } from './PatternEngine';

export interface BiasIndicator {
  label: string;
  description: string;
  impactScore: number; // 0-100
}

/**
 * FMJAM BiasEngine v.1.0
 * Identifierar systematiska skevheter och oproportionerliga beslutsmönster.
 */
export class BiasEngine {
  analyzeBias(cases: FMJAMCase[], patterns: SystemPattern[]): BiasIndicator[] {
    const indicators: BiasIndicator[] = [];

    // 1. Analysera om "NEJ"-beslut korrelerar med specifika kategorier mer än förväntat
    patterns.forEach(p => {
      const totalDecisions = p.frequency;
      const negativeDecisions = p.commonDecisions['NEJ'] || 0;
      const negativeRate = negativeDecisions / totalDecisions;

      if (negativeRate > 0.8 && totalDecisions > 3) {
        indicators.push({
          label: `Hög avslagsfrekvens: ${p.category}`,
          description: `Kategorin ${p.category} har en avslagsfrekvens på ${Math.round(negativeRate * 100)}%. Kräver manuell revision av objektivitet.`,
          impactScore: negativeRate * 100
        });
      }
    });

    // 2. Kontrollera om ärenden med Barn-aspekt har systemiskt lägre proportionalitet
    const childCases = cases.filter(c => c.priorityFlags.hasChildAspect);
    if (childCases.length > 0) {
      const avgPropChild = childCases.reduce((acc, c) => acc + (c.activeResult?.proportionality?.legalCertaintyScore || 0), 0) / childCases.length;
      const globalAvgProp = patterns.reduce((acc, p) => acc + p.averageProportionality, 0) / patterns.length;

      if (avgPropChild < (globalAvgProp - 10)) {
        indicators.push({
          label: 'Skevhet i barnrättslig prövning',
          description: `Ärenden rörande barn har i genomsnitt lägre rättssäkerhets-score (${Math.round(avgPropChild)}%) än systemgenomsnittet (${Math.round(globalAvgProp)}%).`,
          impactScore: 75
        });
      }
    }

    return indicators;
  }
}

export const biasEngine = new BiasEngine();
