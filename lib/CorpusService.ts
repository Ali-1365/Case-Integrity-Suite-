
import { LegalCorpus } from '../types';

/**
 * CorpusService v.7.3.2-GOLD
 * Hanterar deterministisk inläsning av lagar från JSON-filer i public/data/.
 */
export class CorpusService {
  private cache: Map<string, LegalCorpus> = new Map();

  /**
   * Läser in en specifik lagfil från den publika datamappen.
   */
  async loadCorpus(fileName: string): Promise<LegalCorpus | null> {
    if (this.cache.has(fileName)) {
      return this.cache.get(fileName)!;
    }

    try {
      // FMJAM FIX: Fetch must point to the web root for static files in public/
      const url = `/data/${fileName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Kunde inte läsa korpusfil: ${fileName} (HTTP ${response.status})`);
      }
      
      const corpus: LegalCorpus = await response.json();
      
      if (!corpus.paragraphs || !Array.isArray(corpus.paragraphs)) {
        throw new Error(`Korpusfil ${fileName} har ogiltigt format.`);
      }

      this.cache.set(fileName, corpus);
      return corpus;
    } catch (error) {
      console.error(`[CORPUS_SERVICE] Ingestion failure for ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Batch-inläsning för RAG-indexering.
   */
  async loadMultiple(fileNames: string[]): Promise<LegalCorpus[]> {
    const promises = fileNames.map(name => this.loadCorpus(name));
    const results = await Promise.all(promises);
    return results.filter((c): c is LegalCorpus => c !== null);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const corpusService = new CorpusService();
