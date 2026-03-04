import { LegalCorpus } from '../types';
import { loggingService } from '../services/loggingService';

/**
 * CorpusService v.7.3.3-GOLD
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

    const startTime = Date.now();
    try {
      loggingService.debug(`[CORPUS] Loading corpus file: ${fileName}`);
      const url = `/data/${fileName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorMsg = `Kunde inte läsa korpusfil: ${fileName} (HTTP ${response.status})`;
        loggingService.error(errorMsg, { status: response.status });
        throw new Error(errorMsg);
      }
      
      const corpus: LegalCorpus = await response.json();
      
      if (!corpus.paragraphs || !Array.isArray(corpus.paragraphs)) {
        const errorMsg = `Korpusfil ${fileName} har ogiltigt format.`;
        loggingService.error(errorMsg);
        throw new Error(errorMsg);
      }

      this.cache.set(fileName, corpus);
      loggingService.info(`[CORPUS] Successfully loaded ${fileName}`, { 
        paragraphs: corpus.paragraphs.length,
        duration: Date.now() - startTime 
      });
      return corpus;
    } catch (error: any) {
      loggingService.error(`[CORPUS] Ingestion failure for ${fileName}`, { 
        error: error.message,
        duration: Date.now() - startTime 
      });
      return null;
    }
  }

  /**
   * Batch-inläsning för RAG-indexering och fullständig verifiering.
   */
  async loadMultiple(fileNames: string[]): Promise<LegalCorpus[]> {
    const startTime = Date.now();
    loggingService.debug(`[CORPUS] Batch loading ${fileNames.length} files`);
    
    const promises = fileNames.map(name => this.loadCorpus(name));
    const results = await Promise.all(promises);
    const validResults = results.filter((c): c is LegalCorpus => c !== null);
    
    loggingService.info(`[CORPUS] Batch load complete. Success: ${validResults.length}/${fileNames.length}`, {
      duration: Date.now() - startTime
    });
    
    return validResults;
  }

  clearCache(): void {
    this.cache.clear();
    loggingService.debug('[CORPUS] Cache cleared');
  }
}

export const corpusService = new CorpusService();
