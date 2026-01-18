
import { corpusService } from './CorpusService';
import { geminiService } from '../services/geminiService';
import { legalFrameworkIndex } from '../data/legalFramework';
import { LegalCorpus, LegalParagraph } from '../types';
import { auditService } from './AuditService';

export interface RagIndexChunk {
  id: string;
  text: string;
  section: number;
  chapter?: number;
  sfsNumber: string;
  sourceCode: string;
  provenanceHash: string;
  versionChain: string[];
  embedding: number[];
  metadata: { title: string; validFrom: string; auditStatus: string; };
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
      affectedLaws.push(`${corpus.sourceCode} ${corpus.sfsNumber}`);
      for (const p of corpus.paragraphs) {
        const chunkText = this.prepareChunkText(corpus, p);
        try {
          const embedding = await geminiService.embed(chunkText);
          chunks.push({
            id: p.id,
            text: p.text,
            section: p.section,
            chapter: p.chapter,
            sfsNumber: corpus.sfsNumber,
            sourceCode: corpus.sourceCode,
            provenanceHash: p.metadata.provenanceHash,
            versionChain: corpus.versionChain,
            embedding: embedding,
            metadata: { title: corpus.title, validFrom: p.metadata.validFrom, auditStatus: "VERIFIED" }
          });
          hashes.push(p.metadata.provenanceHash);
        } catch (e) { console.error(`[RAG_INDEX] Failed paragraph ${p.id}:`, e); }
      }
    }

    const index: RagIndex = { version: this.INDEX_VERSION, createdAt: new Date().toISOString(), chunks: chunks };
    
    await auditService.log({
      operationType: 'INDEX',
      actor: 'SYSTEM',
      affectedLaws,
      provenanceHashes: hashes,
      resultSummary: `RAG Index v${this.INDEX_VERSION} baked. ${chunks.length} chunks mapped to vector space.`,
      status: 'OK'
    });

    return index;
  }

  private prepareChunkText(corpus: LegalCorpus, p: LegalParagraph): string {
    return `LAG: ${corpus.title}\nSFS: ${corpus.sfsNumber}\n${p.chapter ? 'KAPITEL: ' + p.chapter + '\n' : ''}PARAGRAF: ${p.section}\nINNEHÅLL: ${p.text}`;
  }

  exportIndex(index: RagIndex): void {
    const data = JSON.stringify(index, null, 2);
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
