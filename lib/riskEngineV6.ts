
import {
  RiskDefinition,
  RiskScoreResult,
  RiskPriority,
  ContextWeight,
} from './riskEngineV6.types';

const mapScoreToPriority = (score: number): RiskPriority => {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

export interface RiskEngineConfig {
  severityWeight?: number;
  likelihoodWeight?: number;
  scaleFactor?: number;
}

export function scoreRisksDynamic(
  risks: RiskDefinition[],
  globalContextWeights: ContextWeight[],
  config: RiskEngineConfig = {}
): RiskScoreResult[] {
  const {
    severityWeight = 0.6,
    likelihoodWeight = 0.4,
    scaleFactor = 4
  } = config;

  const globalWeightMap = new Map(globalContextWeights.map(c => [c.tag, c.weight]));

  return risks.map(risk => {
    const baseScore =
      risk.severity * severityWeight +
      risk.likelihood * likelihoodWeight;

    // Use template-specific weights if they exist, otherwise use global ones
    const contextTags = Object.keys(risk.contextWeights);
    const weightsToUse = contextTags.map(tag => risk.contextWeights[tag] ?? globalWeightMap.get(tag) ?? 1.0);
    
    const contextFactor =
      weightsToUse.length > 0
        ? weightsToUse.reduce((a, b) => a + b, 0) / weightsToUse.length
        : 1.0;
        
    const finalScore = Math.min(100, Math.round(baseScore * contextFactor * scaleFactor * 5));

    return {
      id: `score_${risk.id}`,
      templateId: risk.id,
      label: risk.label,
      severity: risk.severity,
      likelihood: risk.likelihood,
      weight: parseFloat(contextFactor.toFixed(2)),
      score: finalScore,
      priority: mapScoreToPriority(finalScore),
      atomIds: risk.atomIds,
      triggers: [], // This is populated in the final profile, not here
      contextWeightsUsed: risk.contextWeights,
    };
  }).sort((a, b) => b.score - a.score);
}
