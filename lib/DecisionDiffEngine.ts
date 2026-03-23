
import { DecisionSupportResult } from './cis.types';

export interface DecisionDiff {
  changedFields: string[];
  proposalChanged: boolean;
  oldProposal?: string;
  newProposal: string;
  riskLevelChanged: boolean;
  oldRisk?: string;
  newRisk: string;
  proportionalityChanged: boolean;
  oldProp?: string;
  newProp: string;
  addedActions: string[];
  removedActions: string[];
  hasChanges: boolean;
}

/**
 * FMJAM DecisionDiffEngine v.1.0-GOLD
 * Beräknar skillnader mellan två beslutsversioner.
 */
export class DecisionDiffEngine {
  calculateDiff(oldRes: DecisionSupportResult | undefined, newRes: DecisionSupportResult): DecisionDiff {
    if (!oldRes) {
      return {
        changedFields: ['INITIAL_VERSION'],
        proposalChanged: true,
        newProposal: newRes.proposal,
        riskLevelChanged: true,
        newRisk: newRes.machineReadable.riskLevel,
        proportionalityChanged: true,
        newProp: newRes.proportionality?.level || 'N/A',
        addedActions: newRes.actions?.recommendations.map(r => r.description) || [],
        removedActions: [],
        hasChanges: true
      };
    }

    const changedFields: string[] = [];
    const proposalChanged = oldRes.proposal !== newRes.proposal;
    const riskLevelChanged = oldRes.machineReadable.riskLevel !== newRes.machineReadable.riskLevel;
    const proportionalityChanged = oldRes.proportionality?.level !== newRes.proportionality?.level;

    if (proposalChanged) changedFields.push('PROPOSAL');
    if (riskLevelChanged) changedFields.push('RISK_LEVEL');
    if (proportionalityChanged) changedFields.push('PROPORTIONALITY');

    // Jämför åtgärder
    const oldActions = oldRes.actions?.recommendations.map(r => r.id) || [];
    const newActions = newRes.actions?.recommendations.map(r => r.id) || [];
    
    const addedActions = newRes.actions?.recommendations
      .filter(r => !oldActions.includes(r.id))
      .map(r => r.description) || [];
      
    const removedActions = oldRes.actions?.recommendations
      .filter(r => !newActions.includes(r.id))
      .map(r => r.description) || [];

    if (addedActions.length > 0 || removedActions.length > 0) {
      changedFields.push('ACTIONS');
    }

    return {
      changedFields,
      proposalChanged,
      oldProposal: oldRes.proposal,
      newProposal: newRes.proposal,
      riskLevelChanged,
      oldRisk: oldRes.machineReadable.riskLevel,
      newRisk: newRes.machineReadable.riskLevel,
      proportionalityChanged,
      oldProp: oldRes.proportionality?.level,
      newProp: newRes.proportionality?.level || 'N/A',
      addedActions,
      removedActions,
      hasChanges: changedFields.length > 0
    };
  }
}

export const decisionDiffEngine = new DecisionDiffEngine();
