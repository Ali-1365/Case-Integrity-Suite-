import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';
import { generateId } from '../lib/utils';

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
const getApiKey = (): string => {
  // Vite injects these via 'define' in vite.config.ts
  return (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY || process.env.API_KEY : '') || '';
};

import { offlineService, OfflineReason } from './offlineService';

// Initialize offline state if key is missing
if (!getApiKey()) {
  offlineService.setOffline(true, 'API_KEY_MISSING');
}

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

  constructor() {
    this.initializeClient();
    offlineService.subscribe((offline, reason) => {
      if (offline && (reason === 'QUOTA_EXCEEDED' || reason === 'NETWORK_ERROR')) {
        this.startRecoveryPolling();
      } else if (!offline) {
        this.stopRecoveryPolling();
      }
    });
  }

  private initializeClient(): void {
    const apiKey = getApiKey();
    if (!apiKey) {
      offlineService.setOffline(true, 'API_KEY_MISSING');
      return;
    }
    try {
      this.ai = new GoogleGenAI({ apiKey });
      offlineService.setOffline(false);
      console.log('[GeminiService] Client initialized successfully.');
    } catch (e: any) {
      console.error('[GeminiService] Initialization error:', e);
      offlineService.setOffline(true, 'NETWORK_ERROR');
    }
  }

  private _recoveryTimer: any = null;

  private startRecoveryPolling() {
    if (this._recoveryTimer) return;
    this._recoveryTimer = setInterval(async () => {
      if (!offlineService.getIsOffline()) {
        this.stopRecoveryPolling();
        return;
      }
      try {
        const status = await this.checkApiStatus();
        if (status.online) {
          offlineService.setOffline(false);
          this.stopRecoveryPolling();
        }
      } catch { /* Continue polling */ }
    }, 60000);
  }

  private stopRecoveryPolling() {
    if (this._recoveryTimer) {
      clearInterval(this._recoveryTimer);
      this._recoveryTimer = null;
    }
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
          throw new ApiError(`Auth error: ${error.message}`, { originalError: error });
        }

        if (isQuota && i < retries - 1) {
          console.warn(`[GeminiService] Quota/Overload error. Retry ${i + 1}/${retries}. Waiting ${delay / 1000}s...`);
          this.quotaState = { isThrottled: true, retryAfterMs: delay, lastError: error.message };
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        if (i === retries - 1) {
          this.quotaState.lastError = error.message;
          if (isQuota) offlineService.setOffline(true, 'QUOTA_EXCEEDED');
          else offlineService.setOffline(true, 'NETWORK_ERROR');
          throw new ApiError(`API error after ${i + 1} attempts: ${error.message}`, { originalError: error });
        }
        
        throw error;
      }
    }
    throw new Error('Retry-loop exited unexpectedly');
  }

  async generate(
    params: string | (Omit<GenerateContentParameters, 'model'> & { model?: string }),
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();
    const correlationId = generateId('GEN');
    loggingService.setCorrelationId(correlationId);

    const isString = typeof params === 'string';
    const prompt = isString ? params : (typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents));

    if (offlineService.getIsOffline()) {
      return getSyntheticResponse(prompt);
    }

    let modelName = (!isString && params.model) || (mode === 'think' ? this.proModel : this.flashModel);

    try {
      const client = this.getClient();
      const config = isString ? {} : { ...(params.config || {}) };

      // Handle thinking mode for Gemini 3 series models
      if (mode === 'think' && modelName === this.proModel) {
        (config as any).thinkingConfig = {
          thinkingBudget: (config as any).thinkingConfig?.thinkingBudget ?? 32768
        };
      } else {
        delete (config as any).thinkingConfig;
        if (!(config as any).maxOutputTokens) (config as any).maxOutputTokens = 8192;
      }

      const response = await this.executeWithRetry(() =>
        client.models.generateContent({
          model: modelName,
          contents: isString
            ? [{ role: 'user', parts: [{ text: params }] }]
            : params.contents,
          config
        })
      );

      const text = (response as any).text || '';
      const duration = Date.now() - startTime;

      loggingService.addLog({
        mode,
        prompt: prompt.substring(0, 500),
        response: text.substring(0, 500),
        error: null,
        duration,
        metadata: { model: modelName, correlationId },
      });

      return text;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      loggingService.addLog({
        mode,
        prompt: prompt.substring(0, 500),
        response: null,
        error: error.message,
        duration,
        metadata: { model: modelName, correlationId }
      });

      // Fallback chain: Pro -> Flash -> Lite -> Synthetic
      if (modelName === this.proModel) {
        console.warn('[GeminiService] Pro failed -> Falling back to Flash.');
        const nextParams = isString ? prompt : { ...params, model: this.flashModel };
        if (!isString && (nextParams as any).config) {
          const { thinkingConfig, ...rest } = (nextParams as any).config as any;
          (nextParams as any).config = rest;
        }
        return this.generate(nextParams, 'fast');
      }
      if (modelName === this.flashModel) {
        console.warn('[GeminiService] Flash failed -> Falling back to Lite.');
        const nextParams = isString ? prompt : { ...params, model: this.liteModel };
        if (!isString && (nextParams as any).config) {
          const { thinkingConfig, ...rest } = (nextParams as any).config as any;
          (nextParams as any).config = rest;
        }
        return this.generate(nextParams, 'fast');
      }
      if (modelName === this.liteModel) {
        console.warn('[GeminiService] All models failed -> Synthetic fallback.');
        return getSyntheticResponse(prompt);
      }

      return `SYSTEM ERROR: Could not generate response. ${error.message}`;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) return this.pseudoEmbed(text);
    
    const client = this.getClient();
    const models = ['gemini-embedding-001'];
    
    for (const modelName of models) {
      try {
        const response: any = await this.executeWithRetry(() =>
          (client as any).models.embedContent({
            model: modelName,
            contents: { parts: [{ text }] }
          })
        );
        const values = response?.embeddings?.[0]?.values || response?.embedding?.values;
        if (values?.length > 0) return values;
      } catch (e: any) {
        console.warn(`[GeminiService] Embedding failed with ${modelName}: ${e.message}`);
      }
    }
    
    console.warn('[GeminiService] All embedding models failed -> Pseudo-embedding fallback.');
    return this.pseudoEmbed(text);
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