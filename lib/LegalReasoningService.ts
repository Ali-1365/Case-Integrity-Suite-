
import { geminiService } from '../services/geminiService';
import { ProvenanceChain } from './QueryProvenanceService';
import { auditService } from './AuditService';
import { consolidationService, ConsolidationResult } from './ConsolidationService';
import { QUALITY_PROFILE } from './QualityProfile';
import { BaseService } from './BaseService';

import { ReasoningResult } from './cis.types';

export class LegalReasoningService extends BaseService {
  protected serviceName = 'LEGAL_REASONING';

  async generateReasoning(query: string, chain: ProvenanceChain): Promise<ReasoningResult> {
    return this.executeWithLogging('generateReasoning', { query, queryId: chain.queryId }, async () => {
      const reasoningId = `REASON-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
      
      const consolidation = await consolidationService.consolidate(query, chain);
      const risk = consolidation.riskReport;
      
      const sourcesContext = chain.sources.map(s => 
        `[REF: ${s.sourceCode} ${s.chapter ? s.chapter + ':' : ''}${s.section} § | HASH: ${s.provenanceHash}]\nTEXT: ${s.text}`
      ).join('\n\n');

      const praxisContext = consolidation.hierarchy.praxis.map(p => 
        `[PRAXIS: ${p.reference} | HASH: ${p.provenanceHash}]\nSAMMANFATTNING: ${p.summary}`
      ).join('\n\n');

      const systemInstruction = `
        DU ÄR FMJAM CALIBRATED REASONING ENGINE v.1.1-RISK_AWARE.
        Du ska svara enligt KVALITETSPROFIL ${QUALITY_PROFILE.version}.
        
        SÄRSKILT UPPDRAG (FAS 11):
        Identifiera och motivera eventuella NORMKONFLIKTER.
        Om risknivån är ${risk?.level || 'GRÖN'}, förklara varför i sektionen "RISK- OCH NORMKONFLIKTSANALYS".
        
        DU MÅSTE FÖLJA DENNA STRUKTUR:
        1. Svar
        2. Fakta
        3. Tillämpliga lagrum & Praxis
        4. Risk- och normkonfliktsanalys (NY SEKTION)
        5. Analys
        6. Samlad bedömning
        7. Slutsats
        
        LOCKED SOURCES:
        ${sourcesContext}
        
        LOCKED PRAXIS:
        ${praxisContext || 'Ingen specifik praxis.'}
      `;

      const response = await geminiService.generate({
        contents: `Genomför fördjupad risk- och normanalys för: "${query}"`,
        config: {
          systemInstruction,
          temperature: 0.0,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      }, 'think');

      await auditService.log({
        operationType: 'RAG_QUERY',
        actor: 'SYSTEM',
        affectedLaws: chain.sources.map(s => s.sourceCode),
        provenanceHashes: consolidation.provenanceHashes,
        resultSummary: `Consolidated risk-aware reasoning generated: ${reasoningId}. Risk: ${risk?.level}.`,
        status: risk?.level === 'RÖD' ? 'WARN' : 'OK',
        metadata: { queryId: chain.queryId, reasoningId, riskId: risk?.riskId }
      });

      return {
        reasoningId,
        queryId: chain.queryId,
        consolidation,
        sections: {
          facts: "Fastställda omständigheter.",
          laws: chain.sources.map(s => ({ ref: `${s.sourceCode} ${s.section}§`, text: s.text, hash: s.provenanceHash })),
          analysis: "Normativ prövning utförd.",
          conclusion: "Slutsats med beaktande av identifierade risker."
        },
        fullMarkdown: response
      };
    });
  }
}

export const legalReasoningService = new LegalReasoningService();
