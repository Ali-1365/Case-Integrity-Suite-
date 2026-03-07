
import { geminiService } from '../services/geminiService';
import { RagIndex, RagIndexChunk } from './RagIndexService';
import { auditService } from './AuditService';
import { queryProvenanceService } from './QueryProvenanceService';
import { legalReasoningService, ReasoningResult } from './LegalReasoningService';
import { decisionSupportService, DecisionSupportResult } from './DecisionSupportService';

export interface RagResult {
  context: string;
  queryId: string;
  hitCount: number;
  reasoning?: ReasoningResult;
  decisionSupport?: DecisionSupportResult;
}

/**
 * FMJAM RagService v.8.0.0-DRIFT
 * Kärnmotor för deterministisk RAG, motivering och beslutsstöd.
 */
import { autoNotary } from './AutoNotaryService';

export class RagService {
  private index: RagIndex | null = null;
  private archiveChunks: { text: string; embedding: number[]; sourceId: string }[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Försök ladda index om det finns
      try {
        const response = await fetch('/rag/index.json');
        if (response.ok) {
          this.index = await response.json();
        }
      } catch (e) {
        console.warn("[RAG] Kunde inte ladda index.json", e);
      }
      
      await this.ingestArchive();
      this.isInitialized = true;
      console.log("%c[SYSTEM]%c DRIFTLÄGE_AKTIVERAT: RagService v8 redo.", "color:white; background:green; padding:2px 4px;", "color:green; font-weight:bold;");
      autoNotary.info('SYSTEM', 'RagService', 'Initierad', { indexSize: this.index?.chunks.length });
    } catch (err) {
      console.error("[RAG] Init failure:", err);
      autoNotary.info('SYSTEM', 'RagService', 'Initiering misslyckades', { error: err });
    }
  }

  async getContextForText(query: string, includeDecisionSupport = true, caseId?: string): Promise<RagResult> {
    const traceId = `RAG-${Date.now()}`;
    autoNotary.startTrace(traceId, 'RagService', 'getContextForText');

    if (!this.isInitialized) {
        autoNotary.endTrace(traceId, 'RagService', 'getContextForText', 'FAILURE', { reason: 'Not initialized' });
        return { context: "", queryId: "N/A", hitCount: 0 };
    }
    
    try {
      const queryEmb = await geminiService.embed(query);
      
      const lawHits = this.index ? this.index.chunks
        .map(c => ({ ...c, sim: this.cosineSim(queryEmb, c.embedding) }))
        .filter(r => r.sim > 0.60)
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 8) : [];

      autoNotary.info(traceId, 'RagService', 'Vektorsökning klar', { hits: lawHits.length });

      const queryId = `AUDIT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

      await auditService.log({
        operationType: 'RAG_QUERY',
        actor: 'USER',
        affectedLaws: Array.from(new Set(lawHits.map(h => `${h.sourceCode} ${h.sfsNumber}`))),
        provenanceHashes: lawHits.map(h => h.provenanceHash),
        resultSummary: `Query: ${query.substring(0, 40)}...`,
        status: 'OK',
        metadata: { query, hitIds: lawHits.map(h => h.id), caseId }
      }, queryId);

      const formattedLaws = lawHits.map(h => 
        `[GROUND_TRUTH: SFS ${h.sfsNumber} | HASH: ${h.provenanceHash}]\n` +
        `LAG: ${h.metadata.title}\nREF: ${h.chapter ? h.chapter + ' kap. ' : ''}${h.section} §\nTEXT: ${h.text}`
      ).join('\n\n---\n\n');

      let reasoning: ReasoningResult | undefined = undefined;
      let decisionSupport: DecisionSupportResult | undefined = undefined;

      if (lawHits.length > 0) {
        const chain = await queryProvenanceService.getChainForQuery(queryId);
        if (chain) {
          // FAS 10: Generera kalibrerad motivering
          autoNotary.info(traceId, 'RagService', 'Genererar juridisk motivering...');
          reasoning = await legalReasoningService.generateReasoning(query, chain);
          
          // FAS 12: Generera beslutsstöd
          if (includeDecisionSupport) {
            autoNotary.info(traceId, 'RagService', 'Genererar beslutsstöd...');
            decisionSupport = await decisionSupportService.generateProposal(query, chain, reasoning, caseId);
          }
        }
      }

      autoNotary.endTrace(traceId, 'RagService', 'getContextForText', 'SUCCESS', { 
          hitCount: lawHits.length, 
          hasReasoning: !!reasoning, 
          hasDecisionSupport: !!decisionSupport 
      });

      return {
        context: `--- JURIDISKT RAMVERK (LOCKED) ---\n${formattedLaws}`,
        queryId,
        hitCount: lawHits.length,
        reasoning,
        decisionSupport
      };
    } catch (e) {
      console.error("[RAG] Drift failure:", e);
      autoNotary.endTrace(traceId, 'RagService', 'getContextForText', 'FAILURE', { error: e });
      return { context: "", queryId: "ERROR", hitCount: 0 };
    }
  }

  private async ingestArchive(): Promise<void> {
    this.archiveChunks = [];
    // ARKIVERAT: Inga statiska ärenden laddas längre.
    // Systemet är nu helt dynamiskt och väntar på användarens input.
  }

  private cosineSim(a: number[], b: number[]): number {
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]; nA += a[i] ** 2; nB += b[i] ** 2;
    }
    const magnitude = Math.sqrt(nA) * Math.sqrt(nB);
    return magnitude === 0 ? 0 : dot / magnitude;
  }
}

export const ragService = new RagService();
