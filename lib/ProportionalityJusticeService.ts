
import { geminiService } from '../services/geminiService';
import { auditService } from './AuditService';
import { QUALITY_PROFILE } from './QualityProfile';
import { Type } from '@google/genai';
import { RiskReport, ConsolidationResult, ProportionalityLevel, JusticeFinding, ProportionalityReport } from './cis.types';

const proportionalitySchema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.STRING, enum: ['GRÖN', 'GUL', 'RÖD'] },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.STRING },
          finding: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['PASS', 'WARN', 'FAIL'] }
        },
        required: ['step', 'finding', 'status']
      }
    },
    legalCertaintyScore: { type: Type.INTEGER },
    summary: { type: Type.STRING },
    recommendation: { type: Type.STRING }
  },
  required: ['level', 'findings', 'legalCertaintyScore', 'summary', 'recommendation']
};

/**
 * FMJAM ProportionalityJusticeService v.1.0-GOLD
 * Utför juridisk 5-stegsprövning för att säkra rättssäkerhet.
 */
export class ProportionalityJusticeService {
  async analyze(
    query: string,
    decisionProposal: string,
    riskReport: RiskReport,
    consolidation: ConsolidationResult
  ): Promise<ProportionalityReport> {
    const proportionalityId = `PROP-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

    const systemInstruction = `
      DU ÄR FMJAM JUSTICE & PROPORTIONALITY GUARD v.1.0.
      Din uppgift är att granska ett beslutsförslag utifrån 5-stegsmodellen för PROPORTIONALITET och RÄTTSSÄKERHET.
      
      ANALYSMODELL (5 STEG):
      1. Legitimitet: Har myndigheten uttryckligt lagstöd? (Ground Truth: ${consolidation.affectedNorms.join(', ')})
      2. Lämplighet: Leder den föreslagna åtgärden till det legitima målet?
      3. Nödvändighet: Finns det en mindre ingripande åtgärd som uppnår samma mål? (Lika-rättsprincipen)
      4. Balans: Väger det legitima målet tyngre än intrånget för den enskilde?
      5. Rättssäkerhet: Är resultatet förutsebart och förenligt med likabehandlingsprincipen?
      
      STIL: ${QUALITY_PROFILE.parameters.style.join('. ')}
    `;

    const payload = {
      fråga: query,
      beslutsförslag: decisionProposal,
      risknivå: riskReport.level,
      normer: consolidation.affectedNorms
    };

    try {
      const responseText = await geminiService.generate({
        contents: `Analysera proportionalitet för: ${JSON.stringify(payload)}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: proportionalitySchema,
          temperature: 0.0,
          thinkingConfig: { thinkingBudget: 16384 }
        }
      }, 'think');

      const parsed = JSON.parse(responseText.trim());

      const report: ProportionalityReport = {
        proportionalityId,
        ...parsed
      };

      // Logga till audit
      await auditService.log({
        operationType: 'RAG_QUERY',
        actor: 'SYSTEM',
        affectedLaws: consolidation.affectedNorms,
        provenanceHashes: consolidation.provenanceHashes,
        resultSummary: `Proportionality analysis complete: ${proportionalityId}. Level: ${report.level}. Score: ${report.legalCertaintyScore}.`,
        status: report.level === 'RÖD' ? 'WARN' : 'OK',
        metadata: { 
          proportionalityId, 
          proportionalityLevel: report.level, 
          justiceFindings: report.findings.map(f => f.status) 
        }
      });

      return report;
    } catch (e) {
      console.error("Proportionality check collapse:", e);
      throw new Error("Kritiskt fel i proportionalitetsmotorn.");
    }
  }
}

export const proportionalityJusticeService = new ProportionalityJusticeService();
