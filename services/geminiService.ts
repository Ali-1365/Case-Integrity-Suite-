
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { denoise } from '../lib/DenoisingProtocol';

export interface QuotaState {
    isThrottled: boolean;
    retryAfterMs: number;
    lastError: string | null;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly flashModel = 'gemini-3-flash-preview';
  private readonly proModel = 'gemini-3-pro-preview';
  
  public quotaState: QuotaState = {
      isThrottled: false,
      retryAfterMs: 0,
      lastError: null
  };

  private getClient(): GoogleGenAI {
    if (this.ai) return this.ai;
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY saknas i miljön.");
    this.ai = new GoogleGenAI({ apiKey });
    return this.ai;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>, 
    retries = 5, 
    initialDelay = 3000
  ): Promise<T> {
    let currentDelay = initialDelay;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await operation();
        this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };
        return result;
      } catch (error: any) {
        const errorStr = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
        const isQuotaError = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');

        if (isQuotaError) {
            this.quotaState = { isThrottled: true, retryAfterMs: currentDelay, lastError: "RESOURCE_EXHAUSTED" };
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 2;
                continue;
            }
        }
        throw error;
      }
    }
    throw new Error("Maximala försök uppnådda.");
  }

  async generate(
    params: Omit<GenerateContentParameters, 'model'> & { model?: string }, 
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();
    const client = this.getClient();
    
    let contents = params.contents;
    if (typeof contents === 'string') {
        const normalized = denoise(contents);
        contents = normalized.cleaned;
    }

    const modelToUse = mode === 'think' ? this.proModel : this.flashModel;
    const config = { ...params.config };
    
    // SDK Compliance: Set thinkingBudget AND ensure we don't hit max tokens without it
    if (mode === 'think') {
      config.thinkingConfig = { thinkingBudget: 32768 };
      config.temperature = 0.0;
      // We avoid setting maxOutputTokens to let the model decide, unless explicitly required
    } else {
      config.temperature = 0.0;
    }

    try {
      const text = await this.executeWithRetry(async () => {
        const response: GenerateContentResponse = await client.models.generateContent({
          ...params,
          contents: contents,
          model: params.model || modelToUse,
          config: {
            ...config,
            systemInstruction: `DU ÄR FMJAM ARCHITECT v.7.4. Deterministisk logik. Ingen spekulation. SFS 2025:400 Compliance.\n${config.systemInstruction || ''}`
          },
        });
        return response.text || "";
      });

      loggingService.addLog({ mode, prompt: "CONTENT_LOCKED", response: "GENERATED", error: null, duration: Date.now() - startTime });
      return text;
    } catch (error) {
      const errorMsg = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      loggingService.addLog({ mode, prompt: "ERROR", response: null, error: errorMsg, duration: Date.now() - startTime });
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    const client = this.getClient();
    return await this.executeWithRetry(async () => {
      const res = await client.models.embedContent({
        model: 'models/text-embedding-004',
        contents: { parts: [{ text }] },
      });
      return res.embeddings[0].values;
    });
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
