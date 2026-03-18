
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, Part, ThinkingLevel } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';

export interface QuotaState {
    isThrottled: boolean;
    retryAfterMs: number;
    lastError: string | null;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly flashModel = 'gemini-3-flash-preview';
  private readonly proModel = 'gemini-3.1-pro-preview';
  private readonly liteModel = 'gemini-3.1-flash-lite-preview';

  public quotaState: QuotaState = {
      isThrottled: false,
      retryAfterMs: 0,
      lastError: null
  };

  public async hasCustomKey(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
      return await (window as any).aistudio.hasSelectedApiKey();
    }
    return false;
  }

  public async openKeySelection(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // After selection, we should re-initialize the client to use the new key
      this.initializeClient();
    }
  }

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      loggingService.error("System Configuration Error: GEMINI_API_KEY is missing. AI services will be unavailable.");
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

  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        this.quotaState.isThrottled = false;
        this.quotaState.lastError = null;
        this.quotaState.retryAfterMs = 0;
        return await operation();
      } catch (error: any) {
        const isQuotaError = error.message?.toLowerCase().includes('quota') || 
                             error.message?.toLowerCase().includes('429') || 
                             error.status === 429 ||
                             error.status === 503 ||
                             error.message?.toLowerCase().includes('overloaded');
        
        if (isQuotaError) {
          const isLastRetry = i === retries - 1;
          if (!isLastRetry) {
            loggingService.warn(`Gemini API Quota/Load Error. Attempt ${i + 1}/${retries}. Retrying in ${delay / 1000}s...`, { error: error.message });
            this.quotaState.isThrottled = true;
            this.quotaState.lastError = error.message;
            this.quotaState.retryAfterMs = delay;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
            this.quotaState.isThrottled = true;
            this.quotaState.lastError = error.message;
            throw new ApiError(`Gemini API Error after ${i + 1} attempts: ${error.message}`, { originalError: error });
          }
        } else {
          if (i === retries - 1) {
             this.quotaState.lastError = error.message;
             throw new ApiError(`Gemini API Error after ${i + 1} attempts: ${error.message}`, { originalError: error });
          }
          throw error;
        }
      }
    }
    throw new Error("Unexpected retry loop exit");
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
      
      if (mode === 'think' && modelName === this.proModel) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
          delete (config as any).maxOutputTokens;
      } else {
          // För andra modeller, säkerställ att vi inte begränsar i onödan
          if (!(config as any).maxOutputTokens) {
              (config as any).maxOutputTokens = 8192; // Högt värde för att undvika trunkering
          }
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
      if (!text && config.responseMimeType === "application/json") {
          loggingService.warn(`[GEMINI] Empty JSON response from model ${modelName}. This might be a safety block or model confusion.`);
      }

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
      
      // Fallback 1: Pro -> Flash
      if (modelName === this.proModel) {
        loggingService.warn("Service Recovery: Pro model failed, initiating fallback to Flash model...", { originalModel: modelName });
        const newParams = { ...params, model: this.flashModel };
        // Remove thinking config for Flash to ensure compatibility
        if (newParams.config) {
            const { thinkingConfig, ...restConfig } = newParams.config as any;
            newParams.config = restConfig;
        }
        return this.generate(newParams, 'fast');
      }

      // Fallback 2: Flash -> Lite
      if (modelName === this.flashModel) {
        loggingService.warn("Service Recovery: Flash model failed, initiating fallback to Lite model...", { originalModel: modelName });
        const newParams = { ...params, model: this.liteModel };
        if (newParams.config) {
            const { thinkingConfig, ...restConfig } = newParams.config as any;
            newParams.config = restConfig;
        }
        return this.generate(newParams, 'fast');
      }

      // Fallback 3: Lite -> Synthetic
      if (modelName === this.liteModel) {
        loggingService.warn("Service Recovery: All models failed or quota exceeded. Initiating Synthetic Response Fallback.");
        const prompt = typeof params.contents === 'string' 
            ? params.contents 
            : JSON.stringify(params.contents);
        
        const synthetic = getSyntheticResponse(prompt);
        
        // If JSON was requested, wrap synthetic response in a JSON structure if it's not already
        if (params.config?.responseMimeType === "application/json") {
            return JSON.stringify({
                status: "SYNTHETIC_FALLBACK",
                content: synthetic,
                warning: "Detta är ett syntetiskt svar på grund av API-begränsningar."
            });
        }
        
        return synthetic;
      }

      return `SYSTEMFEL: Kunde inte generera svar. ${error.message}`;
    }
  }

  async embed(text: string): Promise<number[]> {
    const client = this.getClient();
    const modelsToTry = ['gemini-embedding-2-preview', 'gemini-embedding-001', 'text-embedding-004'];
    
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
