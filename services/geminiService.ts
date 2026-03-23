import { GoogleGenAI, GenerateContentParameters, ThinkingLevel } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';

// ─────────────────────────────────────────────
//  OFFLINE SERVICE (inbyggd — ingen extern fil behövs)
// ─────────────────────────────────────────────
type OfflineReason = 'API_KEY_MISSING' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'MANUAL' | null;

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
        (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).OFFLINE_MODE = true;
        (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).OFFLINE_REASON = 'API_KEY_MISSING';
      }
    }
  }

  getIsOffline(): boolean {
    return this._isOffline ||
      (typeof window !== 'undefined' && (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).OFFLINE_MODE === true);
  }

  getReason(): OfflineReason { return this._reason; }

  setOffline(offline: boolean, reason: OfflineReason = null): void {
    this._isOffline = offline;
    this._reason = reason;
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).OFFLINE_MODE = offline;
      (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).OFFLINE_REASON = reason;
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
      return;
    }
    try {
      this.ai = new GoogleGenAI({ apiKey } as unknown);
      console.log('[GeminiService] Klient initierad.');
    } catch (e) {
      loggingService.error(`[GeminiService] Initiering misslyckades: ${(e as Error).message}`);
      offlineService.setOffline(true, 'NETWORK_ERROR');
    }
  }

  private getClient(): GoogleGenAI {
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
      try {
        this.quotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };
        return await operation();
      } catch (error) {
        const msg = ((error as Error).message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') ||
          msg.includes('resource_exhausted') || msg.includes('overloaded') ||
          error.status === 429 || error.status === 503;
        const isAuth = msg.includes('401') || msg.includes('api_key') ||
          msg.includes('unauthorized') || error.status === 401;

        if (isAuth) {
          offlineService.setOffline(true, 'API_KEY_MISSING');
          throw new ApiError(`Auth-fel: ${(error as Error).message}`, { originalError: error });
        }
        if (isQuota && i < retries - 1) {
          console.warn(`[GeminiService] Kvotfel. Försök ${i + 1}/${retries}. Väntar ${delay / 1000}s...`);
          this.quotaState = { isThrottled: true, retryAfterMs: delay, lastError: (error as Error).message };
          await new Promise(r => setTimeout(r, delay));
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
      const prompt = typeof (params as { content?: string, textContent?: string }).textContents === 'string'
        ? (params as { content?: string, textContent?: string }).textContents : (JSON as { str: string }).stringify((params as { content?: string, textContent?: string }).textContents);
      return getSyntheticResponse(prompt);
    }

    let modelName = params.model || (mode === 'think' ? this.proModel : this.flashModel);

    try {
      const client = this.getClient();
      const config = { ...(params.config || {}) };

      if (mode === 'think' && modelName === this.proModel) {
        (config as unknown).thinkingConfig = {
          thinkingBudget: (config as unknown).thinkingConfig?.thinkingBudget ?? 8000
        };
      } else {
        delete (config as unknown).thinkingConfig;
        if (!(config as unknown).maxOutputTokens) (config as unknown).maxOutputTokens = 8192;
      }

      const response = await this.executeWithRetry(async () =>
        (client as { models: { embedContent: (opts: unknown) => unknown } }).models.generateContent({
          model: modelName,
          contents: typeof (params as { content?: string, textContent?: string }).textContents === 'string'
            ? [{ role: 'user', parts: [{ text: (params as { content?: string, textContent?: string }).textContents as string }] }]
            : ((params as { content?: string, textContent?: string }).textContents as unknown),
          config,
        })
      );

      const text = (response as unknown).text || '';
      const duration = Date.now() - startTime;

      loggingService.addLog({
        mode,
        prompt: (JSON as { str: string }).stringify((params as { content?: string, textContent?: string }).textContents).substring(0, 500),
        response: text.substring(0, 500),
        error: null,
        duration,
        metadata: { model: modelName },
      });

      return text;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggingService.addLog({
        mode,
        prompt: (JSON as { str: string }).stringify((params as { content?: string, textContent?: string }).textContents).substring(0, 500),
        response: null,
        error: (error as Error).message,
        duration,
      });

      // Fallback-kedja: Pro → Flash → Lite → Syntetiskt
      if (modelName === this.proModel) {
        console.warn('[GeminiService] Pro misslyckades → Flash.');
        const np = { ...params, model: this.flashModel };
        if (np.config) { const { thinkingConfig, ...r } = np.config as unknown; np.config = r; }
        return this.generate(np, 'fast');
      }
      if (modelName === this.flashModel) {
        console.warn('[GeminiService] Flash misslyckades → Lite.');
        const np = { ...params, model: this.liteModel };
        if (np.config) { const { thinkingConfig, ...r } = np.config as unknown; np.config = r; }
        return this.generate(np, 'fast');
      }
      if (modelName === this.liteModel) {
        console.warn('[GeminiService] Alla modeller misslyckades → Syntetiskt.');
        const prompt = typeof (params as { content?: string, textContent?: string }).textContents === 'string'
          ? (params as { content?: string, textContent?: string }).textContents : (JSON as { str: string }).stringify((params as { content?: string, textContent?: string }).textContents);
        const synthetic = getSyntheticResponse(prompt);
        if ((params.config as unknown)?.responseMimeType === 'application/json') {
          return (JSON as { str: string }).stringify({ status: 'SYNTHETIC_FALLBACK', content: synthetic,
            warning: 'Syntetiskt svar på grund av API-begränsningar.' });
        }
        return synthetic;
      }
      return `SYSTEMFEL: Kunde inte generera svar. ${(error as Error).message}`;
    }
  }

  // ─── EMBED ──────────────────────────────────
  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) {
      console.warn('[GeminiService] Offline → pseudo-embedding.');
      return this.pseudoEmbed(text);
    }
    const client = this.getClient();
    for (const modelName of ['text-embedding-004', 'gemini-embedding-001']) {
      try {
        const response = await this.executeWithRetry(async () =>
          (client as unknown).models.embedContent({
            model: modelName,
            contents: { parts: [{ text }] },
          })
        );
        const values = response?.embeddings?.[0]?.values || (response as unknown)?.embedding?.values;
        if (values?.length > 0) return values;
      } catch (e) {
        console.warn(`[GeminiService] Embed misslyckades (${modelName}): ${(e as Error).message}`);
      }
    }
    console.warn('[GeminiService] Embed API helt nere → pseudo-embedding.');
    return this.pseudoEmbed(text);
  }

  // Deterministisk pseudo-embedding för offline
  private pseudoEmbed(text: string): number[] {
    const dim = 768;
    const result = new Array(dim).fill(0);
    for (let i = 0; i < (text as { length: number }).length; i++) {
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
    } catch (e) {
      return { online: false, message: `API ej tillgänglig: ${(e as Error).message}` };
    }
  }

  public async hasCustomKey(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).aistudio?.hasSelectedApiKey)
      return (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).aistudio.hasSelectedApiKey();
    return false;
  }

  public async openKeySelection(): Promise<void> {
    if (typeof window !== 'undefined' && (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).aistudio?.openSelectKey) {
      await (window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).aistudio.openSelectKey();
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