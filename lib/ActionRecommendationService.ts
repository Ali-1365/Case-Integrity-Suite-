
import { geminiService } from '../services/geminiService';
import { RiskReport, ConsolidationResult, ProportionalityReport, ActionItem, ActionRecommendationReport } from './cis.types';
import { auditService } from './AuditService';
import { QUALITY_PROFILE } from './QualityProfile';
import { Type } from '@google/genai';

const actionSchema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    impactOnDecision: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['MILDER_ALTERNATIVE', 'FURTHER_INVESTIGATION', 'CORRECTIVE_ACTION'] },
          description: { type: Type.STRING },
          motivation: { type: Type.STRING },
          legalReference: { type: Type.STRING }
        },
        required: ['id', 'category', 'description', 'motivation', 'legalReference']
      }
    }
  },
  required: ['level', 'impactOnDecision', 'recommendations']
};

/**
 * FMJAM ActionRecommendationService v.1.0-GOLD
 * Genererar exekverbara åtgärder baserat på juridisk risk och proportionalitet.
 */
export class ActionRecommendationService {
  async generateRecommendations(
    query: string,
    decisionProposal: string,
    risk: RiskReport,
    prop: ProportionalityReport,
    consolidation: ConsolidationResult
  ): Promise<ActionRecommendationReport> {
    const actionId = `ACT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

    const systemInstruction = `
      DU ÄR FMJAM ACTION STRATEGIST v.1.0.
      Ditt uppdrag är att föreslå JURIDISKA ÅTGÄRDER för att säkra rättssäkerhet och proportionalitet.
      
      INDATA:
      - Beslutsutkast: ${decisionProposal}
      - Risknivå: ${risk.level}
      - Proportionalitet: ${prop.level} (Score: ${prop.legalCertaintyScore}%)
      - Lagrum: ${consolidation.affectedNorms.join(', ')}
      
      KATEGORIER FÖR ÅTGÄRDER:
      1. Mildare åtgärder (MILDER_ALTERNATIVE): Alternativ till det föreslagna ingreppet.
      2. Kompletterande utredning (FURTHER_INVESTIGATION): Fakta som saknas (FL 23 §).
      3. Korrigerande åtgärder (CORRECTIVE_ACTION): Hur beslutet måste ändras för att bli lagligt.
      
      STIL: ${QUALITY_PROFILE.parameters.style.join('. ')}
      Regel: Varje åtgärd ska vara neutral och direkt kopplad till ett lagrum.
    `;

    try {
      const responseText = await geminiService.generate({
        contents: `Generera åtgärdsplan för: ${query}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: actionSchema,
          temperature: 0.0,
          thinkingConfig: { thinkingBudget: 16384 }
        }
      }, 'think');

      const parsed = JSON.parse(responseText.trim());

      const report: ActionRecommendationReport = {
        actionId,
        ...parsed
      };

      // Logga till audit
      await auditService.log({
        operationType: 'RAG_QUERY',
        actor: 'SYSTEM',
        affectedLaws: consolidation.affectedNorms,
        provenanceHashes: consolidation.provenanceHashes,
        resultSummary: `Action recommendations generated: ${actionId}. Actions: ${report.recommendations.length}.`,
        status: 'OK',
        metadata: { 
          actionId, 
          recommendedActions: report.recommendations.map(r => r.id),
          impact: report.impactOnDecision 
        }
      });

      return report;
    } catch (e: unknown) {
      console.error("Action Engine failure:", e);
      throw new Error("Kritiskt fel i åtgärdsmotorn.");
    }
  }
}

export const actionRecommendationService = new ActionRecommendationService();
