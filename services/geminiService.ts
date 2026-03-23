import { GoogleGenAI, GenerateContentParameters, ThinkingLevel } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';

// ─────────────────────────────────────────────
//  OFFLINE SERVICE (inbyggd — ingen extern fil behövs)
// ─────────────────────────────────────────────
type OfflineReason = 'API_KEY_MISSING' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'MANUAL' | 'SERVER_ERROR' | null;

class OfflineService {
  private _isOffline: boolean = false;
  private _reason: OfflineReason = null;
  private _subscribers: ((offline: boolean, reason: OfflineReason) => void)[] = [];

  constructor() {
    const apiKey =
      (typeof process !== 'undefined'
        ? process.env?.GEMINI_API_KEY || process.env?.API_KEY
        : null) || '';

    if (!apiKey) {
      this._isOffline = true;
      this._reason = 'API_KEY_MISSING';
      if (typeof window !== 'undefined') {
        (window as any).OFFLINE_MODE = true;
        (window as any).OFFLINE_REASON = 'API_KEY_MISSING';
      }
    }
  }

  getIsOffline(): boolean {
    return this._isOffline ||
      (typeof window !== 'undefined' && (window as any).OFFLINE_MODE === true);
  }

  getReason(): OfflineReason { return this._reason; }

  setOffline(offline: boolean, reason: OfflineReason = null): void {
    if (this._isOffline === offline && this._reason === reason) return;

    this._isOffline = offline;
    this._reason = reason;
    if (typeof window !== 'undefined') {
      (window as any).OFFLINE_MODE = offline;
      (window as any).OFFLINE_REASON = reason;
    }
    this._subscribers.forEach(fn => fn(offline, reason));
    if (offline) {
      console.warn(`[OfflineService] Offline aktiverat. Anledning: ${reason}`);
    } else {
      console.log('[OfflineService] System återkopplat till online-läge.');
    }
  }

  subscribe(fn: (offline: boolean, reason: OfflineReason) => void): () => void {
    this._subscribers.push(fn);
    return () => { this._subscribers = this._subscribers.filter(s => s !== fn); };
  }
}

export const offlineService = new OfflineService();

// ─────────────────────────────────────────────
//  QUOTA STATE
// ─────────────────────────────────────────────
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
      this.ai = null;
      return;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey } as any);
      console.log('[GeminiService] Klient initierad.');

      // If we were offline solely due to missing API key or network error and we successfully re-initialized, we can mark as online.
      if (offlineService.getReason() === 'API_KEY_MISSING') {
         offlineService.setOffline(false);
      }
    } catch (e: any) {
      loggingService.error(`[GeminiService] Initiering misslyckades: ${e.message}`);
      offlineService.setOffline(true, 'NETWORK_ERROR');
      this.ai = null;
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      this.initializeClient();
      if (!this.ai) {
        throw new Error(`Gemini-klienten kunde inte initialiseras. Anledning: ${offlineService.getReason()}`);
      }
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
      try {
        const result = await operation();
        this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };
        return result;
      } catch (error: any) {
        const msg = (error.message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') ||
          msg.includes('resource_exhausted') || msg.includes('overloaded') ||
          error.status === 429 || error.status === 503;
        const isAuth = msg.includes('401') || msg.includes('api_key') ||
          msg.includes('unauthorized') || error.status === 401;
        const isNetwork = msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('econnrefused');

        if (isAuth) {
          offlineService.setOffline(true, 'API_KEY_MISSING');
          throw new ApiError(`Auth-fel: ${error.message}`, { originalError: error });
        }

        // Retry logic for Quota, Network, or Server errors
        const shouldRetry = isQuota || isNetwork || error.status >= 500;

        if (shouldRetry && i < retries - 1) {
          console.warn(`[GeminiService] Transient fel (${isQuota ? 'Kvot' : 'Nätverk/Server'}). Försök ${i + 1}/${retries}. Väntar ${delay / 1000}s...`);

          if (isQuota) {
            this.quotaState = { isThrottled: true, retryAfterMs: delay, lastError: error.message };
          }

          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        } else {
          // No more retries or non-retryable error
          this.quotaState.lastError = error.message;

          if (isQuota) {
             offlineService.setOffline(true, 'QUOTA_EXCEEDED');
          } else if (isNetwork) {
             offlineService.setOffline(true, 'NETWORK_ERROR');
          } else if (error.status >= 500) {
             offlineService.setOffline(true, 'SERVER_ERROR');
          }

          if (i === retries - 1 && shouldRetry) {
             throw new ApiError(`API-fel efter ${i + 1} försök: ${error.message}`, { originalError: error });
          } else {
             throw error; // Throw immediately for non-retryable errors
          }
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
      console.warn(`[GeminiService] Offline (${offlineService.getReason()}) → syntetiskt svar.`);
      const prompt = typeof params.contents === 'string'
        ? params.contents : JSON.stringify(params.contents);
      return getSyntheticResponse(prompt);
    }

    let modelName = params.model || (mode === 'think' ? this.proModel : this.flashModel);

    try {
      const client = this.getClient();
      const config = { ...(params.config || {}) };

      if (mode === 'think' && modelName === this.proModel) {
        (config as any).thinkingConfig = {
          thinkingBudget: (config as any).thinkingConfig?.thinkingBudget ?? 8000
        };
      } else {
        delete (config as any).thinkingConfig;
        if (!(config as any).maxOutputTokens) (config as any).maxOutputTokens = 8192;
      }

      const response = await this.executeWithRetry(async () =>
        client.models.generateContent({
          model: modelName,
          contents: typeof params.contents === 'string'
            ? [{ role: 'user', parts: [{ text: params.contents as string }] }]
            : (params.contents as any),
          config,
        })
      );

      const text = (response as any).text || '';
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
    } catch (error: any) {
      const duration = Date.now() - startTime;
      loggingService.addLog({
        mode,
        prompt: JSON.stringify(params.contents).substring(0, 500),
        response: null,
        error: error.message,
        duration,
      });

      // Fallback-kedja: Pro → Flash → Lite → Syntetiskt
      // If we are already offline due to executeWithRetry, instantly return synthetic to prevent slow cascade.
      if (offlineService.getIsOffline()) {
         console.warn(`[GeminiService] API markerat som offline efter fel i ${modelName} → Syntetiskt.`);
         const prompt = typeof params.contents === 'string'
           ? params.contents : JSON.stringify(params.contents);
         return getSyntheticResponse(prompt);
      }

      if (modelName === this.proModel) {
        console.warn('[GeminiService] Pro misslyckades → Flash.');
        const np = { ...params, model: this.flashModel };
        if (np.config) { const { thinkingConfig, ...r } = np.config as any; np.config = r; }
        return this.generate(np, 'fast');
      }
      if (modelName === this.flashModel) {
        console.warn('[GeminiService] Flash misslyckades → Lite.');
        const np = { ...params, model: this.liteModel };
        if (np.config) { const { thinkingConfig, ...r } = np.config as any; np.config = r; }
        return this.generate(np, 'fast');
      }

      console.warn(`[GeminiService] Modell ${modelName} misslyckades → Syntetiskt.`);
      const prompt = typeof params.contents === 'string'
        ? params.contents : JSON.stringify(params.contents);
      const synthetic = getSyntheticResponse(prompt);

      if ((params.config as any)?.responseMimeType === 'application/json') {
        return JSON.stringify({ status: 'SYNTHETIC_FALLBACK', content: synthetic,
          warning: 'Syntetiskt svar på grund av API-begränsningar.' });
      }
      return synthetic;
    }
  }

  // ─── EMBED ──────────────────────────────────
  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) {
      console.warn(`[GeminiService] Offline (${offlineService.getReason()}) → pseudo-embedding.`);
      return this.pseudoEmbed(text);
    }

    let client;
    try {
      client = this.getClient();
    } catch (e) {
      // If client cannot be initialized, we should drop to pseudo-embed
      console.warn('[GeminiService] Embed kunde inte initiera klient → pseudo-embedding.');
      return this.pseudoEmbed(text);
    }

    let lastError = null;

    for (const modelName of ['text-embedding-004', 'gemini-embedding-001']) {
      try {
        const response = await this.executeWithRetry(async () =>
          (client as any).models.embedContent({
            model: modelName,
            contents: { parts: [{ text }] },
          })
        );
        const values = response?.embeddings?.[0]?.values || (response as any)?.embedding?.values;
        if (values?.length > 0) return values;
      } catch (e: any) {
        console.warn(`[GeminiService] Embed misslyckades (${modelName}): ${e.message}`);
        lastError = e;

        // If API key is missing or quota is exceeded, don't try the next model
        if (offlineService.getIsOffline()) {
           break;
        }
      }
    }

    console.warn('[GeminiService] Embed API helt nere → pseudo-embedding.');
    // Ensure we mark the service offline if both embedding models failed due to network/server errors
    if (!offlineService.getIsOffline()) {
        const isAuth = lastError?.message?.includes('401') || lastError?.message?.includes('api_key');
        const isQuota = lastError?.message?.includes('429') || lastError?.message?.includes('quota');

        if (isAuth) offlineService.setOffline(true, 'API_KEY_MISSING');
        else if (isQuota) offlineService.setOffline(true, 'QUOTA_EXCEEDED');
        else offlineService.setOffline(true, 'NETWORK_ERROR');
    }

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
      // We must bypass the standard `generate` offline check here to truly test the API.
      // So we instantiate a temporary client and run a direct call.
      const apiKey =
        (typeof process !== 'undefined'
          ? process.env?.GEMINI_API_KEY || process.env?.API_KEY
          : null) || '';

      if (!apiKey) {
         return { online: false, message: 'API-nyckel saknas.' };
      }

      const testClient = new GoogleGenAI({ apiKey } as any);

      await testClient.models.generateContent({
        model: this.flashModel,
        contents: [{ role: 'user', parts: [{ text: 'Svara med OK.' }] }]
      });

      const latencyMs = Date.now() - start;
      offlineService.setOffline(false);
      return { online: true, latencyMs, message: 'API ansluten och operativ.' };
    } catch (e: any) {
      return { online: false, message: `API ej tillgänglig: ${e.message}` };
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
  async generate(prompt: string, mode: 'fast' | 'think'): Promise<{ text: string }> {
    const text = await geminiService.generate({ contents: prompt }, mode);
    return { text: text || '' };
  }
}
