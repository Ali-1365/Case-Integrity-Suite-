
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, Part } from '@google/genai';
import { loggingService, LogMode } from './loggingService';

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
        if (error.message.includes('quota')) {
          console.warn(`Gemini API Quota Exceeded. Retrying in ${delay / 1000}s...`);
          this.quotaState.isThrottled = true;
          this.quotaState.lastError = error.message;
          this.quotaState.retryAfterMs = delay;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          console.error("Gemini API Error:", error);
          this.quotaState.lastError = error.message;
          throw error;
        }
      }
    }
    this.quotaState.lastError = "Max retries exceeded for Gemini API call.";
    throw new Error("Max retries exceeded for Gemini API call.");
  }

  async generate(
    params: Omit<GenerateContentParameters, 'model'> & { model?: string }, 
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();
    const client = this.getClient();
    const modelName = params.model || this.flashModel; // Default to flash model

    let contents: GenerateContentParameters['contents'] = params.contents;
    if (typeof contents === 'string') {
        // No denoise here as it was removed
    }

    const config = params.config; // Re-insert this line

    try {
      const response = await this.executeWithRetry(async () => {
        const result = await client.models.generateContent({
          model: modelName,
          contents: [{ text: contents as string }], // Ensure contents is a string for this call
          config: config // Use the declared config
        });
        return result;
      });

      const text = response.text || "";
      loggingService.addLog({ mode, prompt: contents as string, response: text, error: null, duration: Date.now() - startTime });
      return text;
    } catch (error: any) {
      loggingService.addLog({ mode, prompt: contents as string, response: "", error: error.message, duration: Date.now() - startTime });
      console.error("Error generating content from Gemini:", error);
      const errorDetails = error.message || JSON.stringify(error);
      return `KRITISKT FEL: Systemet kunde inte generera innehåll från Gemini API. Detaljer: ${errorDetails}`;
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
