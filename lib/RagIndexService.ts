
import { corpusService } from './CorpusService';
import { geminiService } from '../services/geminiService';
import { legalFrameworkIndex } from '../data/legalFramework';
import { LegalCorpus, LegalParagraph } from '../types';
import { auditService } from './AuditService';

export interface RagIndexChunk {
  id: string;
  text: string;
  section?: number | string;
  chapter?: number;
  sfsNumber: string;
  sourceCode: string;
  provenanceHash: string;
  versionChain: string[];
  embedding: number[];
  metadata: { title: string; validFrom?: string; auditStatus: string; };
}

export interface RagIndex {
  version: string;
  createdAt: string;
  chunks: RagIndexChunk[];
}

export class RagIndexService {
  private readonly INDEX_VERSION = "7.6.0";

  async buildIndex(): Promise<RagIndex> {
    console.log(`[RAG_INDEX] Starting build sequence v${this.INDEX_VERSION}...`);
    const chunks: RagIndexChunk[] = [];
    const corpusFiles = legalFrameworkIndex.map(l => l.corpusFile);
    const corpora = await corpusService.loadMultiple(corpusFiles);
    const affectedLaws: string[] = [];
    const hashes: string[] = [];

    for (const corpus of corpora) {
      affectedLaws.push(`${(corpus as { sourceCode: string }).sourceCode} ${(corpus as { sfsNumber: string }).sfsNumber}`);
      for (const p of corpus.paragraphs) {
        const chunkText = this.prepareChunkText(corpus, p);
        try {
          const embedding = await geminiService.embed(chunkText);
          chunks.push({
            id: (p as { id: string }).id,
            text: (p as { text: string }).text,
            section: (p as { section: string | number }).section,
            chapter: (p as { chapter: string | number }).chapter,
            sfsNumber: (corpus as { sfsNumber: string }).sfsNumber,
            sourceCode: (corpus as { sourceCode: string }).sourceCode,
            provenanceHash: p.(metadata as { provenanceHash: string }).provenanceHash,
            versionChain: corpus.versionChain,
            embedding: embedding,
            metadata: { title: corpus.title, validFrom: (p as { metadata: Record<string, unknown> }).metadata.validFrom, auditStatus: "VERIFIED" }
          });
          hashes.push(p.(metadata as { provenanceHash: string }).provenanceHash);
        } catch (e) { console.error(`[RAG_INDEX] Failed paragraph ${(p as { id: string }).id}:`, e); }
      }
    }

    const index: RagIndex = { version: this.INDEX_VERSION, createdAt: new Date().toISOString(), chunks: chunks };
    
    await auditService.log({
      operationType: 'INDEX',
      actor: 'SYSTEM',
      affectedLaws,
      provenanceHashes: hashes,
      resultSummary: `RAG Index v${this.INDEX_VERSION} baked. ${(chunks as { length: number }).length} chunks mapped to vector space.`,
      status: 'OK'
    });

    return index;
  }

  private prepareChunkText(corpus: LegalCorpus, p: LegalParagraph): string {
    return `LAG: ${corpus.title}\nSFS: ${(corpus as { sfsNumber: string }).sfsNumber}\n${(p as { chapter: string | number }).chapter ? 'KAPITEL: ' + (p as { chapter: string | number }).chapter + '\n' : ''}PARAGRAF: ${(p as { section: string | number }).section}\nINNEHÅLL: ${(p as { text: string }).text}`;
  }

  async bakeMissingEmbeddings(currentIndex: RagIndex): Promise<RagIndex> {
    console.log(`[RAG_INDEX] Baking missing embeddings for index v${(currentIndex as { version: string }).version}...`);
    const updatedChunks = [...currentIndex.chunks];
    let bakedCount = 0;

    for (let i = 0; i < (updatedChunks as { length: number }).length; i++) {
      const chunk = updatedChunks[i];
      if (!(chunk as { embedding?: { values: number[] } }).embedding || (chunk as { embedding?: { values: number[] } }).(embedding as { length: number }).length === 0) {
        // Find the corpus to get full context if possible, or use chunk text
        const chunkText = `LAG: ${(chunk as { metadata: Record<string, unknown> }).metadata.title}\nSFS: ${(chunk as { sfsNumber: string }).sfsNumber}\nPARAGRAF: ${(chunk as { section: string | number }).section}\nINNEHÅLL: ${(chunk as { text: string }).text}`;
        try {
          const embedding = await geminiService.embed(chunkText);
          updatedChunks[i] = { ...chunk, embedding };
          bakedCount++;
          if (bakedCount % 10 === 0) console.log(`[RAG_INDEX] Baked ${bakedCount} embeddings...`);
        } catch (e) {
          console.error(`[RAG_INDEX] Failed to bake embedding for chunk ${(chunk as { id: string }).id}:`, e);
        }
      }
    }

    console.log(`[RAG_INDEX] Baking complete. ${bakedCount} new embeddings generated.`);
    return {
      ...currentIndex,
      createdAt: new Date().toISOString(),
      chunks: updatedChunks
    };
  }

  exportIndex(index: RagIndex): void {
    const data = (JSON as { str: string }).stringify(index, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fmjam_rag_index_${this.INDEX_VERSION}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const ragIndexService = new RagIndexService();
