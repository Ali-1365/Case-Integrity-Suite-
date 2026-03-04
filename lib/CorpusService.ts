import { LegalCorpus } from '../types';
import { loggingService } from '../services/loggingService';
import { BaseService } from './BaseService';

/**
 * CorpusService v.7.3.4-GOLD
 * Hanterar deterministisk inläsning av lagar från JSON-filer i public/data/.
 */
export class CorpusService extends BaseService {
  protected serviceName = 'CORPUS';
  private cache: Map<string, LegalCorpus> = new Map();

  /**
   * Läser in en specifik lagfil från den publika datamappen.
   */
  async loadCorpus(fileName: string): Promise<LegalCorpus | null> {
    return this.executeWithLogging('loadCorpus', { fileName }, async () => {
      if (this.cache.has(fileName)) {
        return this.cache.get(fileName)!;
      }

      const url = `/data/${fileName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorMsg = `Kunde inte läsa korpusfil: ${fileName} (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }
      
      const corpus: LegalCorpus = await response.json();
      
      if (!corpus.paragraphs || !Array.isArray(corpus.paragraphs)) {
        const errorMsg = `Korpusfil ${fileName} har ogiltigt format.`;
        throw new Error(errorMsg);
      }

      this.cache.set(fileName, corpus);
      return corpus;
    }).catch(() => null);
  }

  /**
   * Batch-inläsning för RAG-indexering och fullständig verifiering.
   */
  async loadMultiple(fileNames: string[]): Promise<LegalCorpus[]> {
    return this.executeWithLogging('loadMultiple', { count: fileNames.length }, async () => {
      const promises = fileNames.map(name => this.loadCorpus(name));
      const results = await Promise.all(promises);
      return results.filter((c): c is LegalCorpus => c !== null);
    });
  }

  clearCache(): void {
    this.cache.clear();
    loggingService.debug('[CORPUS] Cache cleared');
  }
}

export const corpusService = new CorpusService();
