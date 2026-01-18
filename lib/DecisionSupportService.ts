
import { geminiService } from '../services/geminiService';
import { ReasoningResult } from './LegalReasoningService';
import { ProvenanceChain } from './QueryProvenanceService';
import { auditService } from './AuditService';
import { QUALITY_PROFILE } from './QualityProfile';
import { proportionalityJusticeService, ProportionalityReport } from './ProportionalityJusticeService';
import { actionRecommendationService, ActionRecommendationReport } from './ActionRecommendationService';

export type DecisionProposal = 'JA' | 'NEJ' | 'BEHÖVER UTREDNING';

export interface DecisionObject {
  decision: DecisionProposal;
  legalBasis: string[];
  provenance: string[];
  riskLevel: string;
  queryId: string;
  reasoningId: string;
  consolidationId: string;
  riskId: string;
  decisionId: string;
  proportionalityId?: string;
  actionId?: string;
  caseId?: string; // FAS 15
}

export interface DecisionSupportResult {
  decisionId: string;
  proposal: DecisionProposal;
  summary: string;
  fullMarkdown: string;
  machineReadable: DecisionObject;
  reasoning: ReasoningResult;
  proportionality?: ProportionalityReport;
  actions?: ActionRecommendationReport;
}

/**
 * FMJAM DecisionSupportService v.1.3-GOLD (Case Aware)
 * Syntetiserar beslutsförslag, prövar proportionalitet och föreslår åtgärder inom ramen för ett ärende.
 */
export class DecisionSupportService {
  async generateProposal(query: string, chain: ProvenanceChain, reasoning: ReasoningResult, caseId?: string): Promise<DecisionSupportResult> {
    const decisionId = `DECIDE-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const consolidation = reasoning.consolidation!;
    const risk = consolidation.riskReport!;

    const systemInstruction = `
      DU ÄR FMJAM DECISION ORACLE v.1.0-GOLD.
      Ditt uppdrag är att generera ett formellt BESLUTSUTKAST baserat på inkomna analyser.
      
      STIL: ${QUALITY_PROFILE.parameters.style.join('. ')}
      
      DU MÅSTE KATEGORISERA BESLUTET SOM:
      1. JA (Om alla rekvisit är uppfyllda och risken är låg)
      2. NEJ (Om rekvisit saknas eller lagstöd talar emot)
      3. BEHÖVER UTREDNING (Om risken är RÖD eller motstridig praxis finns)
    `;

    try {
      const response = await geminiService.generate({
        contents: `Skapa beslutsunderlag för: "${query}" utifrån resonemang ${reasoning.reasoningId}`,
        config: {
          systemInstruction,
          temperature: 0.0,
          thinkingConfig: { thinkingBudget: 16384 }
        }
      }, 'think');

      let proposal: DecisionProposal = 'BEHÖVER UTREDNING';
      if (response.includes('REKOMMENDERAT BESLUT: JA')) proposal = 'JA';
      else if (response.includes('REKOMMENDERAT BESLUT: NEJ')) proposal = 'NEJ';

      // Proportionalitet & Åtgärder
      const proportionality = await proportionalityJusticeService.analyze(query, response, risk, consolidation);
      const actions = await actionRecommendationService.generateRecommendations(query, response, risk, proportionality, consolidation);

      const machineReadable: DecisionObject = {
        decision: proposal,
        legalBasis: consolidation.affectedNorms,
        provenance: consolidation.provenanceHashes,
        riskLevel: risk.level,
        queryId: reasoning.queryId,
        reasoningId: reasoning.reasoningId,
        consolidationId: consolidation.consolidationId,
        riskId: risk.riskId,
        decisionId,
        proportionalityId: proportionality.proportionalityId,
        actionId: actions.actionId,
        caseId // FAS 15
      };

      await auditService.log({
        operationType: 'RAG_QUERY',
        actor: 'SYSTEM',
        affectedLaws: consolidation.affectedNorms,
        provenanceHashes: consolidation.provenanceHashes,
        resultSummary: `Decision generated for case ${caseId || 'N/A'}: ${decisionId}. Proposal: ${proposal}.`,
        status: 'OK',
        metadata: { decisionId, recommendedDecision: proposal, caseId }
      });

      return {
        decisionId,
        proposal,
        summary: `Beslutsförslag ${proposal} genererat för ärende ${caseId || 'N/A'}.`,
        fullMarkdown: response,
        machineReadable,
        reasoning,
        proportionality,
        actions
      };
    } catch (e) {
      throw new Error("Kritiskt fel i beslutsstödsmodulen.");
    }
  }
}

export const decisionSupportService = new DecisionSupportService();
