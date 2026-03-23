import { GoogleGenAI, GenerateContentParameters, ThinkingLevel } from '@google/genai';
import { Content } from '@google/genai';

export interface GeminiConfig {
    thinkingConfig?: { thinkingBudget?: number };
    maxOutputTokens?: number;
    responseMimeType?: string;
}

export interface GeminiResponse {
    text?: string | (() => string);
    embedding?: { values: number[] };
}

export interface GeminiClient {
    models: {
        embedContent: (params: { model: string; contents: string | string[] | { parts: { text: string }[] }[] }) => Promise<{ embeddings: { values: number[] }[] }>;
    };
}

import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';
import { offlineService } from './offlineService';
export { offlineService };

export interface QuotaState {
  isThrottled: boolean;
  retryAfterMs: number;
  lastError: string | null;
}

// ─────────────────────────────────────────────
//  GEMINI SERVICE
// ─────────────────────────────────────────────
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  // ✅ KORREKTA modellnamn (mars 2026)
  private readonly flashModel = 'gemini-2.0-flash';
  private readonly proModel   = 'gemini-2.5-pro-preview-05-06';
  private readonly liteModel  = 'gemini-2.0-flash-lite';

  public quotaState: QuotaState = {
    isThrottled: false,
    retryAfterMs: 0,
    lastError: null,
  };

  constructor() { this.initializeClient(); }

  private initializeClient(): void {
    const apiKey =
      (typeof process !== 'undefined'
        ? process.env?.GEMINI_API_KEY || process.env?.API_KEY
        : null) || '';

    if (!apiKey) {
      loggingService.error('[GeminiService] GEMINI_API_KEY saknas. AI-tjänster otillgängliga.');
      offlineService.setOffline(true, 'API_KEY_MISSING');
      return;
    }
    try {
      this.ai = new GoogleGenAI({ apiKey } as { apiKey: string });
      console.log('[GeminiService] Klient initierad.');
    } catch (e: unknown) {
      loggingService.error(`[GeminiService] Initiering misslyckades: ${(e as Error).message}`);
      offlineService.setOffline(true, 'NETWORK_ERROR');
    }
  }

  private getClient(): GoogleGenAI {
    if (offlineService.getIsOffline()) {
        throw new Error('OFFLINE_MODE');
    }
    if (!this.ai) {
      this.initializeClient();
      if (!this.ai) throw new Error('Gemini-klienten kunde inte initialiseras. API-nyckel saknas.');
    }
    return this.ai;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    initialDelay = 2000
  ): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      if (offlineService.getIsOffline()) throw new Error('OFFLINE_MODE');
      try {
        this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };
        return await operation();
      } catch (error: unknown) {
        const msg = ((error as Error).message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') ||
          msg.includes('resource_exhausted') || msg.includes('overloaded') ||
          (error as any).status === 429 || (error as any).status === 503;
        const isAuth = msg.includes('401') || msg.includes('api_key') ||
          msg.includes('unauthorized') || (error as any).status === 401;

        if (isAuth) {
          offlineService.setOffline(true, 'API_KEY_MISSING');
          throw new ApiError(`Auth-fel: ${(error as Error).message}`, { originalError: error });
        }
        if (isQuota && i < retries - 1) {
          console.warn(`[GeminiService] Kvotfel. Försök ${i + 1}/${retries}. Väntar ${delay / 1000}s...`);
          this.quotaState = { isThrottled: true, retryAfterMs: delay, lastError: (error as Error).message };
          await new Promise(r => setTimeout(r, delay));
          if (offlineService.getIsOffline()) throw new Error('OFFLINE_MODE');
          delay *= 2;
        } else if (i === retries - 1) {
          this.quotaState.lastError = (error as Error).message;
          if (isQuota) offlineService.setOffline(true, 'QUOTA_EXCEEDED');
          else offlineService.setOffline(true, 'NETWORK_ERROR');
          throw new ApiError(`API-fel efter ${i + 1} försök: ${(error as Error).message}`, { originalError: error });
        } else {
          throw error;
        }
      }
    }
    throw new Error('Oväntad retry-loop exit');
  }

  // ─── GENERATE ───────────────────────────────
  async generate(
    params: Omit<GenerateContentParameters, 'model'> & { model?: string },
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();

    if (offlineService.getIsOffline()) {
      console.warn('[GeminiService] Offline → syntetiskt svar.');
      const prompt = typeof params.contents === 'string'
        ? params.contents : JSON.stringify(params.contents);
      return getSyntheticResponse(prompt);
    }

    let modelName = params.model || (mode === 'think' ? this.proModel : this.flashModel);

    try {
      const client = this.getClient();
      const config = { ...(params.config || {}) };

      if (mode === 'think' && modelName === this.proModel) {
        (config as GeminiConfig).thinkingConfig = {
          thinkingBudget: (config as GeminiConfig).thinkingConfig?.thinkingBudget ?? 8000
        };
      } else {
        delete (config as GeminiConfig).thinkingConfig;
        if (!(config as GeminiConfig).maxOutputTokens) (config as GeminiConfig).maxOutputTokens = 8192;
      }

      const response = await this.executeWithRetry(async () =>
        client.models.generateContent({
          model: modelName,
          contents: typeof params.contents === 'string'
            ? [{ role: 'user', parts: [{ text: params.contents as string }] }]
            : (params.contents as unknown as Content[]),
          config,
        })
      );

      const text = typeof (response as GeminiResponse).text === "function" ? ((response as GeminiResponse).text as () => string)() : ((response as GeminiResponse).text as string) || '';
      const duration = Date.now() - startTime;

      loggingService.addLog({
        mode,
        prompt: JSON.stringify(params.contents).substring(0, 500),
        response: text.substring(0, 500),
        error: null,
        duration,
        metadata: { model: modelName },
      });

      return text;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const isAuthError = offlineService.getReason() === 'API_KEY_MISSING' || ((error as Error).message || '').toLowerCase().includes('auth') || (error as Error).message === 'OFFLINE_MODE';

      loggingService.addLog({
        mode,
        prompt: JSON.stringify(params.contents).substring(0, 500),
        response: null,
        error: (error as Error).message,
        duration,
      });

      // Fallback-kedja: Pro → Flash → Lite → Syntetiskt
      if (!isAuthError) {
          if (modelName === this.proModel) {
            console.warn('[GeminiService] Pro misslyckades → Flash.');
            const np = { ...params, model: this.flashModel };
            if (np.config) { const { thinkingConfig, ...r } = np.config as GeminiConfig; np.config = r; }
            return this.generate(np, 'fast');
          }
          if (modelName === this.flashModel) {
            console.warn('[GeminiService] Flash misslyckades → Lite.');
            const np = { ...params, model: this.liteModel };
            if (np.config) { const { thinkingConfig, ...r } = np.config as GeminiConfig; np.config = r; }
            return this.generate(np, 'fast');
          }
      }

      console.warn('[GeminiService] Alla modeller misslyckades eller offline → Syntetiskt.');
      const prompt = typeof params.contents === 'string'
        ? params.contents : JSON.stringify(params.contents);
      const synthetic = getSyntheticResponse(prompt);
      if ((params.config as GeminiConfig)?.responseMimeType === 'application/json') {
        return JSON.stringify({ status: 'SYNTHETIC_FALLBACK', content: synthetic,
          warning: 'Syntetiskt svar på grund av API-begränsningar eller offline-läge.' });
      }
      return synthetic;
    }
  }

  // ─── EMBED ──────────────────────────────────
  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) {
      console.warn('[GeminiService] Offline → pseudo-embedding.');
      return this.pseudoEmbed(text);
    }

    try {
      const client = this.getClient();
      for (const modelName of ['text-embedding-004', 'gemini-embedding-001']) {
        try {
          const response = await this.executeWithRetry(async () =>
            (client as GeminiClient).models.embedContent({
              model: modelName,
              contents: [{ parts: [{ text }] }],
            })
          );
          const values = response?.embeddings?.[0]?.values || (response as GeminiResponse)?.embedding?.values;
          if (values?.length > 0) return values;
        } catch (e: unknown) {
          console.warn(`[GeminiService] Embed misslyckades (${modelName}): ${(e as Error).message}`);
          if (offlineService.getReason() === 'API_KEY_MISSING' || (e as Error).message === 'OFFLINE_MODE') break;
        }
      }
    } catch (e: unknown) {
      console.warn('[GeminiService] Initieringsfel för embed:', e);
    }
    console.warn('[GeminiService] Embed API helt nere eller otillgängligt → pseudo-embedding.');
    return this.pseudoEmbed(text);
  }

  // Deterministisk pseudo-embedding för offline
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

  // ─── API-STATUSKONTROLL ──────────────────────
  async checkApiStatus(): Promise<{ online: boolean; latencyMs?: number; message: string }> {
    const start = Date.now();
    try {
      await this.generate({ contents: 'Svara med OK.' }, 'fast');
      const latencyMs = Date.now() - start;
      offlineService.setOffline(false);
      return { online: true, latencyMs, message: 'API ansluten och operativ.' };
    } catch (e: unknown) {
      return { online: false, message: `API ej tillgänglig: ${(e as Error).message}` };
    }
  }

  public async hasCustomKey(): Promise<boolean> {
    if (typeof window !== 'undefined' && ((window as Window & typeof globalThis & { aistudio?: { hasSelectedApiKey: () => boolean, openSelectKey: () => Promise<void> } }).aistudio)?.hasSelectedApiKey)
      return ((window as Window & typeof globalThis & { aistudio?: { hasSelectedApiKey: () => boolean, openSelectKey: () => Promise<void> } }).aistudio).hasSelectedApiKey();
    return false;
  }

  public async openKeySelection(): Promise<void> {
    if (typeof window !== 'undefined' && ((window as Window & typeof globalThis & { aistudio?: { hasSelectedApiKey: () => boolean, openSelectKey: () => Promise<void> } }).aistudio)?.openSelectKey) {
      await ((window as Window & typeof globalThis & { aistudio?: { hasSelectedApiKey: () => boolean, openSelectKey: () => Promise<void> } }).aistudio).openSelectKey();
      this.initializeClient();
    }
  }
}

export const geminiService = new GeminiService();

// ─── GeminiLlmClient ────────────────────────
export class GeminiLlmClient {
  async generate(prompt: string, mode: 'fast' | 'think'): Promise<{ text: string }> {
    const text = await geminiService.generate({ contents: prompt }, mode);
    return { text: text || '' };
  }
}
