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
  private _recoveryTimer: any = null;

  constructor() {
    console.log('[OfflineService] Constructor called.');
    // Check initial API status from the backend
    this.checkInitialStatus();
  }

  private async checkInitialStatus() {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        if (!data.hasKey) {
          this.setOffline(true, 'API_KEY_MISSING');
        }
      }
    } catch (e) {
      this.setOffline(true, 'NETWORK_ERROR');
    }
  }

  getIsOffline(): boolean {
    return this._isOffline ||
      (typeof window !== 'undefined' && (window as any).OFFLINE_MODE === true);
  }

  getReason(): OfflineReason { return this._reason; }

  setOffline(offline: boolean, reason: OfflineReason = null): void {
    const wasOffline = this._isOffline;
    this._isOffline = offline;
    this._reason = reason;

    if (typeof window !== 'undefined') {
      (window as any).OFFLINE_MODE = offline;
      (window as any).OFFLINE_REASON = reason;
    }

    this._subscribers.forEach(fn => fn(offline, reason));

    if (offline) {
      console.warn(`[OfflineService] Offline aktiverat. Anledning: ${reason}`);
      // Starta automatisk återställningskontroll för alla fel, inklusive saknad nyckel
      this.startRecoveryPolling();
    } else {
      if (wasOffline) {
        console.log('[OfflineService] System återkopplat till online-läge automatiskt.');
        this.stopRecoveryPolling();
      }
    }
  }

  private startRecoveryPolling() {
    if (this._recoveryTimer) return;
    console.log('[OfflineService] Startar automatisk återställningskontroll (var 60:e sek)...');
    
    this._recoveryTimer = setInterval(async () => {
      if (!this._isOffline) {
        this.stopRecoveryPolling();
        return;
      }

      console.log('[OfflineService] Testar API-anslutning för återställning...');
      try {
        const response = await fetch('/api/ai/status');
        if (response.ok) {
          const data = await response.json();
          if (data.hasKey) {
             const status = await geminiService.checkApiStatus();
             if (status.online) {
               console.log('[OfflineService] API åter tillgängligt! Växlar till online.');
               this.setOffline(false);
               this.stopRecoveryPolling();
             }
          }
        }
      } catch (e) {
        // Fortsätt polla
      }
    }, 60000); // Kolla varje minut
  }

  private stopRecoveryPolling() {
    if (this._recoveryTimer) {
      clearInterval(this._recoveryTimer);
      this._recoveryTimer = null;
      console.log('[OfflineService] Återställningskontroll stoppad.');
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
    // Client initialization is now handled securely on the backend.
    console.log('[GeminiService] Använder backend proxy för AI-anrop.');
  }

  private getClient() {
    // No longer returning GoogleGenAI instance on the frontend.
    return null;
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
      } catch (error: any) {
        const msg = (error.message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') ||
          msg.includes('resource_exhausted') || msg.includes('overloaded') ||
          error.status === 429 || error.status === 503;
        const isAuth = msg.includes('401') || msg.includes('api_key') ||
          msg.includes('unauthorized') || error.status === 401;

        if (isAuth) {
          offlineService.setOffline(true, 'API_KEY_MISSING');
          throw new ApiError(`Auth-fel: ${error.message}`, { originalError: error });
        }
        const isNetwork = !error.status || error.status >= 500;

        if ((isQuota || isNetwork) && i < retries - 1) {
          console.warn(`[GeminiService] Fel (${isQuota ? 'Kvot' : 'Nätverk'}). Försök ${i + 1}/${retries}. Väntar ${delay / 1000}s...`);
          this.quotaState = { isThrottled: isQuota, retryAfterMs: delay, lastError: error.message };
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        } else {
          this.quotaState.lastError = error.message;
          if (isQuota) offlineService.setOffline(true, 'QUOTA_EXCEEDED');
          else offlineService.setOffline(true, 'NETWORK_ERROR');
          throw new ApiError(`API-fel efter ${i + 1} försök: ${error.message}`, { originalError: error });
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
      const config = { ...(params.config || {}) };

      if (mode === 'think' && modelName === this.proModel) {
        (config as any).thinkingConfig = {
          thinkingBudget: (config as any).thinkingConfig?.thinkingBudget ?? 8000
        };
      } else {
        delete (config as any).thinkingConfig;
        if (!(config as any).maxOutputTokens) (config as any).maxOutputTokens = 8192;
      }

      const response = await this.executeWithRetry(async () => {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            contents: typeof params.contents === 'string'
              ? [{ role: 'user', parts: [{ text: params.contents as string }] }]
              : params.contents,
            config,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = errorData.error || res.statusText || 'Okänt serverfel';
          const err: any = new Error(errorMsg);
          err.status = res.status;
          throw err;
        }

        return res.json();
      });

      const text = response?.text || '';
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
      if (modelName === this.liteModel) {
        console.warn('[GeminiService] Alla modeller misslyckades → Syntetiskt.');
        const prompt = typeof params.contents === 'string'
          ? params.contents : JSON.stringify(params.contents);
        const synthetic = getSyntheticResponse(prompt);
        if ((params.config as any)?.responseMimeType === 'application/json') {
          return JSON.stringify({ status: 'SYNTHETIC_FALLBACK', content: synthetic,
            warning: 'Syntetiskt svar på grund av API-begränsningar.' });
        }
        return synthetic;
      }
      return `SYSTEMFEL: Kunde inte generera svar. ${error.message}`;
    }
  }

  // ─── EMBED ──────────────────────────────────
  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) {
      console.warn('[GeminiService] Offline → pseudo-embedding.');
      return this.pseudoEmbed(text);
    }
    for (const modelName of ['text-embedding-004', 'gemini-embedding-001']) {
      try {
        const response = await this.executeWithRetry(async () => {
          const res = await fetch('/api/ai/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelName,
              contents: { parts: [{ text }] },
            }),
          });

          if (!res.ok) {
             const errorData = await res.json().catch(() => ({}));
             const err: any = new Error(errorData.error || res.statusText);
             err.status = res.status;
             throw err;
          }
          return res.json();
        });

        const values = response?.embeddings?.[0]?.values || response?.embedding?.values;
        if (values?.length > 0) return values;
      } catch (e: any) {
        console.warn(`[GeminiService] Embed misslyckades (${modelName}): ${e.message}`);
      }
    }
    console.warn('[GeminiService] Embed API helt nere → pseudo-embedding.');
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
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.flashModel,
          contents: [{ role: 'user', parts: [{ text: 'Svara med OK.' }] }]
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      await res.json();
      const latencyMs = Date.now() - start;
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