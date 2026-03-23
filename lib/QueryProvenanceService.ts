
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
    const entry = logs.find(l => l.id === queryId);
    
    if (!entry || entry.operationType !== 'RAG_QUERY') return null;

    const chain: ProvenanceChain = {
      queryId: entry.id,
      timestamp: entry.timestamp,
      queryText: entry.metadata?.query || "Okänd fråga",
      sources: [],
      auditLog: entry
    };

    // Hämta paragrafer från korpusar baserat på sparade hitIds (t.ex. "sol_2025_1_2")
    const hitIds: string[] = entry.metadata?.hitIds || [];
    
    // Optimerad inläsning av korpusar
    const requiredFrameworks = new Map<string, typeof legalFrameworkIndex[0]>();
    const hitToFramework = new Map<string, typeof legalFrameworkIndex[0]>();

    for (const hitId of hitIds) {
      const frameworkEntry = legalFrameworkIndex.find(f => 
        hitId.startsWith(f.id) || hitId.toLowerCase().includes(f.shortName.toLowerCase())
      );
      if (frameworkEntry) {
        requiredFrameworks.set(frameworkEntry.corpusFile, frameworkEntry);
        hitToFramework.set(hitId, frameworkEntry);
      }
    }

    // Ladda alla unika korpusar parallellt
    const uniqueCorpusFiles = Array.from(requiredFrameworks.keys());

    const loadedCorpusEntries = await Promise.all(
      uniqueCorpusFiles.map(async file => {
        const corpus = await corpusService.loadCorpus(file);
        return { file, corpus };
      })
    );

    const safeCorpusMap = new Map(
      loadedCorpusEntries
        .filter(entry => entry.corpus !== null)
        .map(entry => [entry.file, entry.corpus])
    );

    for (const hitId of hitIds) {
      const frameworkEntry = hitToFramework.get(hitId);

      if (frameworkEntry) {
        const corpus = safeCorpusMap.get(frameworkEntry.corpusFile);
        if (corpus) {
          const paragraph = corpus.paragraphs.find(p => p.id === hitId);

          if (paragraph) {
            chain.sources.push({
              sourceCode: corpus.sourceCode,
              sfsNumber: corpus.sfsNumber,
              chapter: paragraph.chapter,
              section: paragraph.section,
              text: paragraph.text,
              provenanceHash: paragraph.metadata.provenanceHash,
              corpusFile: frameworkEntry.corpusFile,
              auditStatus: frameworkEntry.auditTrail.status
            });
          }
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
    return logs.filter(l => l.provenanceHashes.includes(hash));
  }
}

export const queryProvenanceService = new QueryProvenanceService();
