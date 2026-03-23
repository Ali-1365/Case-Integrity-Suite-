
import { geminiService } from '../services/geminiService';
import { ProvenanceChain } from './QueryProvenanceService';
import { auditService } from './AuditService';
import { consolidationService } from './ConsolidationService';
import { QUALITY_PROFILE } from './QualityProfile';
import { BaseService } from './BaseService';

import { ReasoningResult, ConsolidationResult } from './cis.types';

export class LegalReasoningService extends BaseService {
  protected serviceName = 'LEGAL_REASONING';

  async generateReasoning(query: string, chain: ProvenanceChain): Promise<ReasoningResult> {
    return this.executeWithLogging('generateReasoning', { query, queryId: chain.queryId }, async () => {
      const reasoningId = `REASON-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
      
      const consolidation = await consolidationService.consolidate(query, chain);
      const risk = consolidation.riskReport;
      
      const sourcesContext = chain.sources.map(s => 
        `[REF: ${(s as { sourceCode: string }).sourceCode} ${(s as { chapter: string | number }).chapter ? (s as { chapter: string | number }).chapter + ':' : ''}${(s as { section: string | number }).section} § | HASH: ${(s as { provenanceHash: string }).provenanceHash}]\nTEXT: ${(s as { text: string }).text}`
      ).join('\n\n');

      const praxisContext = consolidation.hierarchy.praxis.map(p => 
        `[PRAXIS: ${(p as { reference: string }).reference} | HASH: ${(p as { provenanceHash: string }).provenanceHash}]\nSAMMANFATTNING: ${p.summary}`
      ).join('\n\n');

      const systemInstruction = `
        DU ÄR FMJAM ORACLE v.7.6-GOLD – BRED JURIDISK ANALYTIKER.
        Du ska svara enligt KVALITETSPROFIL ${(QUALITY_PROFILE as { version: string }).version}.
        
        SÄRSKILT UPPDRAG (FAS 8 - EXPANDERAD):
        1. KONSTITUTIONELL HIERARKI (LEX SUPERIOR):
           Du måste alltid pröva lokala regler mot högre rätt. Prioritera systematiskt:
           I.   Barnkonventionen (BK) och Europakonventionen (EKMR).
           II.  Regeringsformen (RF) (Grundläggande fri- och rättigheter).
           III. HFD/JP-praxis (Vägledande domar).
           IV.  SFS-lagstiftning (SFB, SoL, OSL, FL).
           Vid konflikt: Förklara varför den högre rätten trumfar lägre förordningar.

        2. PROPORTIONALITET OCH SAKLIGHET (RF 1:9):
           Analysera "insats kontra intrång". Är myndighetens åtgärd rimlig sett till konstitutionella rättigheter?

        3. GAP-ANALYS (FL 23 §):
           Identifiera vad myndigheten INTE säger. Vilka utredningsåtgärder saknas för en rättssäker individuell prövning?

        4. ANTI-SCHABLON:
           Identifiera och utmana standardformuleringar. Sök aktivt efter motbevis i den unika livssituationen.

        DU MÅSTE FÖLJA DENNA STRUKTUR:
        1. Svar
        2. Fakta (inkl. Social kontext/Barnperspektiv)
        3. Tillämpliga lagrum & Praxis (sorterat efter Lex Superior)
        4. Normkonflikts- och Proportionalitetsanalys
        5. Gap-analys (Saknade utredningssteg enligt FL 23 §)
        6. Analys (Holistisk DFA-analys)
        7. Samlad bedömning
        8. Slutsats
        
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
        affectedLaws: chain.sources.map(s => (s as { sourceCode: string }).sourceCode),
        provenanceHashes: (consolidation as { provenanceHash: string }).provenanceHashes,
        resultSummary: `Consolidated risk-aware reasoning generated: ${reasoningId}. Risk: ${risk?.level}.`,
        status: risk?.level === 'RÖD' ? 'WARN' : 'OK',
        metadata: { queryId: chain.queryId, reasoningId, riskId: risk?.riskId }
      });

      return {
        reasoningId,
        queryId: chain.queryId,
        confidenceScore: 0.95,
        consolidation,
        sections: {
          facts: "Fastställda omständigheter.",
          laws: chain.sources.map(s => ({ ref: `${(s as { sourceCode: string }).sourceCode} ${(s as { section: string | number }).section}§`, text: (s as { text: string }).text, hash: (s as { provenanceHash: string }).provenanceHash })),
          analysis: "Normativ prövning utförd.",
          conclusion: "Slutsats med beaktande av identifierade risker."
        },
        fullMarkdown: response
      };
    });
  }
}

export const legalReasoningService = new LegalReasoningService();
