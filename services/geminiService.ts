
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, Part, ThinkingLevel } from '@google/genai';
import { loggingService, LogMode } from './loggingService';

export interface QuotaState {
    isThrottled: boolean;
    retryAfterMs: number;
    lastError: string | null;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly flashModel = 'gemini-3-flash-preview';
  private readonly proModel = 'gemini-3.1-pro-preview';


  
  public quotaState: QuotaState = {
      isThrottled: false,
      retryAfterMs: 0,
      lastError: null
  };

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY är inte satt. API-anrop kommer att misslyckas.");
      return;
    }
    this.ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' } as any);
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      this.initializeClient();
      if (!this.ai) {
        throw new Error("Gemini API-klienten kunde inte initialiseras. API-nyckel saknas.");
      }
    }
    return this.ai;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 5, initialDelay = 3000): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        this.quotaState.isThrottled = false;
        this.quotaState.lastError = null;
        this.quotaState.retryAfterMs = 0;
        return await operation();
      } catch (error: any) {
        const isQuotaError = error.message?.toLowerCase().includes('quota') || error.status === 429;
        
        if (isQuotaError && i < retries - 1) {
          loggingService.warn(`Gemini API Quota Exceeded. Attempt ${i + 1}/${retries}. Retrying in ${delay / 1000}s...`, { error: error.message });
          this.quotaState.isThrottled = true;
          this.quotaState.lastError = error.message;
          this.quotaState.retryAfterMs = delay;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          loggingService.error(`Gemini API Error after ${i + 1} attempts`, { error: error.message, stack: error.stack });
          this.quotaState.lastError = error.message;
          throw error;
        }
      }
    }
    const finalError = "Max retries exceeded for Gemini API call.";
    this.quotaState.lastError = finalError;
    loggingService.error(finalError);
    throw new Error(finalError);
  }

  async generate(
    params: Omit<GenerateContentParameters, 'model'> & { model?: string }, 
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();
    let modelName = params.model || (mode === 'think' ? this.proModel : this.flashModel);

    try {
      const client = this.getClient();
      let contents: GenerateContentParameters['contents'] = params.contents;
      const config = params.config || {};
      
      if (mode === 'think') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
          delete (config as any).maxOutputTokens;
      }

      const response = await this.executeWithRetry(async () => {
        return await client.models.generateContent({
          model: modelName,
          contents: typeof contents === 'string' ? [{ text: contents }] : contents as any,
          config: {
            ...config,
            tools: [{ googleSearch: {} }]
          }
        });
      });

      const text = response.text || "";
      const duration = Date.now() - startTime;
      
      // Log grounding sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map(c => c.web?.uri).filter(Boolean) || [];
      
      loggingService.addLog({ 
        mode, 
        prompt: JSON.stringify(contents).substring(0, 500), 
        response: text.substring(0, 500), 
        error: null, 
        duration,
        metadata: { model: modelName, sourcesCount: sources.length }
      });

      if (sources.length > 0) {
        loggingService.debug(`[GEMINI] Grounding sources found: ${sources.length}`, { sources });
      }

      return text;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      loggingService.addLog({ 
        mode, 
        prompt: JSON.stringify(params.contents).substring(0, 500), 
        response: null, 
        error: error.message, 
        duration 
      });
      
      // Fallback mechanism: If Pro fails in 'think' mode, try Flash as fallback
      if (mode === 'think' && modelName === this.proModel) {
        loggingService.warn("Fallback: Pro model failed in think mode, retrying with Flash model...");
        return this.generate(params, 'fast');
      }

      return `SYSTEMFEL: Kunde inte generera svar. ${error.message}`;
    }
  }

  async embed(text: string): Promise<number[]> {
    const client = this.getClient();
    const modelsToTry = ['gemini-embedding-001', 'models/gemini-embedding-001', 'text-embedding-004', 'models/text-embedding-004'];
    
    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        const response = await this.executeWithRetry(async () => {
          const result = await client.models.embedContent({
            model: modelName,
            contents: { parts: [{ text }] },
          });
          return result;
        });

        if (response.embeddings && response.embeddings.length > 0) {
          const values = response.embeddings[0].values;
          if (values) return values;
        }
        if ((response as any).embedding) {
          return (response as any).embedding.values;
        }
      } catch (error: any) {
        console.warn(`Failed to generate embedding with model ${modelName}:`, error.message);
        lastError = error;
      }
    }
    
    const errorDetails = lastError?.message || JSON.stringify(lastError);
    throw new Error(`KRITISKT FEL: Systemet kunde inte generera inbäddning från Gemini API med någon av de tillgängliga modellerna. Senaste fel: ${errorDetails}`);
  }
}

export const geminiService = new GeminiService();

/**
 * GeminiLlmClient v.1.0
 * Implementation of LlmClient interface for OpinionEngine compatibility.
 */
export class GeminiLlmClient {
  async generate(prompt: string, mode: 'fast' | 'think'): Promise<{ text: string }> {
    const text = await geminiService.generate({ contents: prompt }, mode);
    return { text: text || "" };
  }
}
