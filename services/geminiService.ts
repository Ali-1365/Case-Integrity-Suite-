import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { getConfiguredGeminiApiKey, hasStoredGeminiApiKey, offlineService, setStoredGeminiApiKey } from './offlineService';

// ─────────────────────────────────────────────
//  GEMINI SERVICE
// ─────────────────────────────────────────────
export interface QuotaState { isThrottled: boolean; retryAfterMs: number; lastError: string | null; }

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly flashModel = 'gemini-3-flash-preview';
  private readonly proModel   = 'gemini-3.1-pro-preview';
  private readonly liteModel  = 'gemini-3.1-flash-lite-preview';

  public quotaState: QuotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };

  constructor() { this.initializeClient(); }

  private getApiKey(): string {
    const key = getConfiguredGeminiApiKey();
    console.log('[GeminiService] API Key present:', !!key);
    return key;
  }

  private initializeClient(): void {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      loggingService.warn('[GeminiService] Ingen Gemini API-nyckel hittades i VITE_GEMINI_API_KEY, GEMINI_API_KEY, window.GEMINI_API_KEY eller lokal lagring. AI-funktioner använder fallback tills en nyckel finns.');
      this.ai = null;
      offlineService.setOffline(false);
      return;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey } as any);
      console.log('[GeminiService] Klient initierad korrekt.');
      offlineService.setOffline(false);
    } catch (e: any) {
      loggingService.error(`[GeminiService] Initiering misslyckades: ${e.message}`);
      this.ai = null;
      offlineService.setOffline(true, 'NETWORK_ERROR');
    }
  }

  private resolveModelName(mode: LogMode | 'pro' | 'flash' | 'lite', explicitModel?: string): string {
    if (explicitModel) return explicitModel;
    if (mode === 'pro' || mode === 'think') return this.proModel;
    if (mode === 'lite') return this.liteModel;
    return this.flashModel;
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      this.initializeClient();
      if (!this.ai) throw new ApiError('Gemini client could not be initialized.');
    }
    return this.ai;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await operation();
        this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };
        return result;
      } catch (error: any) {
        const msg = (error.message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted') || error.status === 429 || error.status === 503;
        const isAuth  = msg.includes('401') || msg.includes('api_key') || msg.includes('unauthorized') || error.status === 401;
        if (isAuth) {
          this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: error.message || 'Auth error' };
          offlineService.setOffline(true, 'API_KEY_MISSING');
          throw error;
        }
        if (isQuota && i < retries - 1) {
          this.quotaState = { isThrottled: true, retryAfterMs: delay, lastError: error.message || 'Quota exceeded' };
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        if (i === retries - 1) {
          this.quotaState = { isThrottled: isQuota, retryAfterMs: 0, lastError: error.message || 'Gemini error' };
          offlineService.setOffline(true, isQuota ? 'QUOTA_EXCEEDED' : 'NETWORK_ERROR');
          throw error;
        }
      }
    }
    throw new Error('Retry-loop exited unexpectedly');
  }

  async generate(params: Omit<GenerateContentParameters, 'model'> & { model?: string }, mode: LogMode | 'pro' | 'flash' | 'lite' = 'fast'): Promise<string> {
    const startTime = Date.now();

    if (offlineService.getIsOffline()) {
      return getSyntheticResponse(prompt);
    }

    const modelName = this.resolveModelName(mode, params.model);
    const logMode: LogMode = mode === 'think' ? 'think' : 'fast';

    try {
      const client = this.getClient();
      const config = { ...(params.config || {}) } as Record<string, any>;
      if (mode !== 'think' && mode !== 'pro' && 'thinkingConfig' in config && !params.model) {
        delete config.thinkingConfig;
      }

      const response = await this.executeWithRetry(() =>
        client.models.generateContent({ model: modelName, contents: typeof params.contents === 'string' ? [{ role: 'user', parts: [{ text: params.contents }] }] : params.contents, config: config as any })
      );

      const text = (response as any).text || '';
      loggingService.addLog({
        mode: logMode,
        prompt: typeof params.contents === 'string' ? params.contents.slice(0, 500) : JSON.stringify(params.contents).slice(0, 500),
        response: text.slice(0, 500),
        error: null,
        duration: Date.now() - startTime,
        metadata: { model: modelName }
      });
      return text;
    } catch (error: any) {
      loggingService.addLog({
        mode: logMode,
        prompt: typeof params.contents === 'string' ? params.contents.slice(0, 500) : JSON.stringify(params.contents).slice(0, 500),
        response: null,
        error: error?.message || 'Gemini request failed',
        duration: Date.now() - startTime,
        metadata: { model: modelName }
      });
      const prompt = typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents);
      return getSyntheticResponse(prompt);
    }
  }

  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) return this.pseudoEmbed(text);
    
    const client = this.getClient();
    const models = ['text-embedding-004', 'gemini-embedding-001'];
    
    for (const modelName of models) {
      try {
        const response: any = await this.executeWithRetry(() =>
          (client as any).models.embedContent({
            model: modelName,
            contents: { parts: [{ text }] }
          })
        );
        const values = (response as any)?.embeddings?.[0]?.values || (response as any)?.embedding?.values;
        if (values?.length > 0) return values;
      } catch (e: any) {
        console.warn(`[GeminiService] Embedding failed with ${modelName}: ${e.message}`);
      }
    }
    
    console.warn('[GeminiService] All embedding models failed -> Pseudo-embedding fallback.');
    return this.pseudoEmbed(text);
  }

  async hasCustomKey(): Promise<boolean> {
    return hasStoredGeminiApiKey();
  }

  async openKeySelection(): Promise<void> {
    if (typeof window === 'undefined') return;

    const input = window.prompt('Ange din Gemini API-nyckel. Lämna tomt för att avbryta.');
    if (input === null) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    setStoredGeminiApiKey(trimmed);
    (window as any).GEMINI_API_KEY_PRESENT = true;
    this.initializeClient();
  }

  private pseudoEmbed(text: string): number[] {
    const dim = 768;
    const result = new Array(dim).fill(0);
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      result[(c * (i + 1)) % dim] = (result[(c * (i + 1)) % dim] + c / 255) % 1;
    }
    const mag = Math.sqrt(result.reduce((s, v) => s + v * v, 0)) || 1;
    return result.map(v => v / mag);
  }

  async checkApiStatus(): Promise<{ online: boolean; message: string }> {
    try {
      await this.generate({ contents: 'Respond with OK.' }, 'fast');
      offlineService.setOffline(false);
      return { online: true, message: 'API is online and operational.' };
    } catch (e: any) {
      return { online: false, message: `API unavailable: ${e.message}` };
    }
  }

  public async hasCustomKey(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey)
      return (window as any).aistudio.hasSelectedApiKey();
    return false;
  }

  public async openKeySelection(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      this.initializeClient();
    }
  }
}

export const geminiService = new GeminiService();

// ─── GeminiLlmClient ────────────────────────
export class GeminiLlmClient {
  async generate(prompt: string, mode: LogMode = 'fast'): Promise<{ text: string }> {
    const text = await geminiService.generate({ contents: prompt }, mode);
    return { text: text || '' };
  }
}

export { offlineService };
