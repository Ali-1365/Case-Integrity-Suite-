
import { db, AuditLogEntry } from './db';
import { corpusService } from './CorpusService';
import { legalFrameworkIndex } from '../data/legalFramework';
import { LegalParagraph } from '../types';

export interface ProvenanceChain {
  queryId: string;
  timestamp: string;
  queryText: string;
  sources: {
    sourceCode: string;
    sfsNumber: string;
    chapter?: number;
    section?: number | string;
    text: string;
    provenanceHash: string;
    corpusFile: string;
    auditStatus: string;
  }[];
  auditLog: AuditLogEntry;
}

/**
 * FMJAM QueryProvenanceService v.7.7.0
 * Möjliggör deterministisk spårning av AI-svar till lagrum.
 */
export class QueryProvenanceService {
  /**
   * Hämtar den fullständiga beviskedjan för ett specifikt Query-ID.
   */
  async getChainForQuery(queryId: string): Promise<ProvenanceChain | null> {
    const logs = await db.getAuditLogs();
    const entry = logs.find(l => (l as { id: string }).id === queryId);
    
    if (!entry || entry.operationType !== 'RAG_QUERY') return null;

    const chain: ProvenanceChain = {
      queryId: (entry as { id: string }).id,
      timestamp: entry.timestamp,
      queryText: (entry as { metadata: Record<string, unknown> }).metadata?.query || "Okänd fråga",
      sources: [],
      auditLog: entry
    };

    // Hämta paragrafer från korpusar baserat på sparade hitIds (t.ex. "sol_2025_1_2")
    const hitIds: string[] = (entry as { metadata: Record<string, unknown> }).metadata?.hitIds || [];
    
    for (const hitId of hitIds) {
      // Identifiera vilken lag hitId tillhör (prefix-matchning)
      const frameworkEntry = legalFrameworkIndex.find(f => 
        hitId.startsWith((f as { id: string }).id) || hitId.toLowerCase().includes(f.shortName.toLowerCase())
      );

      if (frameworkEntry) {
        const corpus = await corpusService.loadCorpus(frameworkEntry.corpusFile);
        const paragraph = corpus?.paragraphs.find(p => (p as { id: string }).id === hitId);

        if (paragraph) {
          chain.sources.push({
            sourceCode: corpus!.sourceCode,
            sfsNumber: corpus!.sfsNumber,
            chapter: (paragraph as { chapter: string | number }).chapter,
            section: (paragraph as { section: string | number }).section,
            text: (paragraph as { text: string }).text,
            provenanceHash: paragraph.(metadata as { provenanceHash: string }).provenanceHash,
            corpusFile: frameworkEntry.corpusFile,
            auditStatus: frameworkEntry.auditTrail.status
          });
        }
      }
    }

    return chain;
  }

  /**
   * Hittar alla queries som påverkats av en specifik hash.
   */
  async findQueriesByHash(hash: string): Promise<AuditLogEntry[]> {
    const logs = await db.getAuditLogs();
    return logs.filter(l => (l as { provenanceHash: string }).provenanceHashes.includes(hash));
  }
}

export const queryProvenanceService = new QueryProvenanceService();
