import { GoogleGenAI, GenerateContentParameters } from '@google/genai';
import { loggingService, LogMode } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { ApiError } from '../lib/errors';

// ─────────────────────────────────────────────
//  OFFLINE SERVICE
// ─────────────────────────────────────────────
type OfflineReason = 'API_KEY_MISSING' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | null;

class OfflineService {
  private _isOffline: boolean = false;
  private _reason: OfflineReason = null;
  private _subscribers: ((offline: boolean, reason: OfflineReason) => void)[] = [];

  constructor() {
    const apiKey = this.getApiKey();
    if (!apiKey) this.setOffline(true, 'API_KEY_MISSING');
  }

  private getApiKey(): string {
    let key = '';
    if (typeof import.meta !== 'undefined' && import.meta.env) key = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!key && typeof window !== 'undefined') key = (window as any).GEMINI_API_KEY || '';
    console.log('[OfflineService] API Key present:', !!key);
    return key;
  }

  getIsOffline(): boolean { return this._isOffline; }
  getReason(): OfflineReason { return this._reason; }

  setOffline(offline: boolean, reason: OfflineReason = null) {
    const wasOffline = this._isOffline;
    this._isOffline = offline;
    this._reason = reason;
    if (typeof window !== 'undefined') {
      (window as any).OFFLINE_MODE = offline;
      (window as any).OFFLINE_REASON = reason;
    }
    this._subscribers.forEach(fn => fn(offline, reason));

    if (offline && (reason === 'QUOTA_EXCEEDED' || reason === 'NETWORK_ERROR')) this.startRecoveryPolling();
    else if (!offline && wasOffline) this.stopRecoveryPolling();
  }

  private startRecoveryPolling() {
    if (this._recoveryTimer) return;
    this._recoveryTimer = setInterval(async () => {
      if (!this._isOffline) { this.stopRecoveryPolling(); return; }
      try {
        const status = await geminiService.checkApiStatus();
        if (status.online) this.setOffline(false);
      } catch { /* fortsätt */ }
    }, 60000);
  }

  private stopRecoveryPolling() {
    if (this._recoveryTimer) { clearInterval(this._recoveryTimer); this._recoveryTimer = null; }
  }

  subscribe(fn: (offline: boolean, reason: OfflineReason) => void): () => void {
    this._subscribers.push(fn);
    return () => { this._subscribers = this._subscribers.filter(s => s !== fn); };
  }
}

export const offlineService = new OfflineService();

// ─────────────────────────────────────────────
//  GEMINI SERVICE
// ─────────────────────────────────────────────
export interface QuotaState { isThrottled: boolean; retryAfterMs: number; lastError: string | null; }

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly flashModel = 'gemini-2.0-flash';
  private readonly proModel   = 'gemini-2.5-pro-preview-05-06';
  private readonly liteModel  = 'gemini-2.0-flash-lite';

  public quotaState: QuotaState = { isThrottled: false, retryAfterMs: 0, lastError: null };

  constructor() { this.initializeClient(); }

  private getApiKey(): string {
    let key = '';
    if (typeof import.meta !== 'undefined' && import.meta.env) key = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!key && typeof window !== 'undefined') key = (window as any).GEMINI_API_KEY || '';
    return key;
  }

  private initializeClient(): void {
    const apiKey = this.getApiKey();
    if (!apiKey) { offlineService.setOffline(true, 'API_KEY_MISSING'); return; }
    try { this.ai = new GoogleGenAI({ apiKey } as any); offlineService.setOffline(false); }
    catch (e: any) { offlineService.setOffline(true, 'NETWORK_ERROR'); }
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) { this.initializeClient(); if (!this.ai) throw new Error('Gemini-klienten kunde inte initialiseras.'); }
    return this.ai;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try { return await operation(); }
      catch (error: any) {
        const msg = (error.message || '').toLowerCase();
        const isQuota = msg.includes('quota') || msg.includes('429') || error.status === 429 || error.status === 503;
        const isAuth  = msg.includes('401') || error.status === 401;
        if (isAuth) { offlineService.setOffline(true, 'API_KEY_MISSING'); throw error; }
        if (isQuota && i < retries - 1) { await new Promise(r => setTimeout(r, delay)); delay *= 2; continue; }
        if (i === retries - 1) { offlineService.setOffline(true, isQuota ? 'QUOTA_EXCEEDED' : 'NETWORK_ERROR'); throw error; }
      }
    }
    throw new Error('Retry-loop exited unexpectedly');
  }

  async generate(params: Omit<GenerateContentParameters, 'model'> & { model?: string }): Promise<string> {
    if (offlineService.getIsOffline()) {
      const prompt = typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents);
      return getSyntheticResponse(prompt);
    }
    const modelName = params.model || this.flashModel;
    try {
      const client = this.getClient();
      const config = params.config || {};
      const response = await this.executeWithRetry(() =>
        client.models.generateContent({ model: modelName, contents: typeof params.contents === 'string' ? [{ role: 'user', parts: [{ text: params.contents }] }] : params.contents, config })
      );
      return (response as any).text || '';
    } catch {
      const prompt = typeof params.contents === 'string' ? params.contents : JSON.stringify(params.contents);
      return getSyntheticResponse(prompt);
    }
  }

  async embed(text: string): Promise<number[]> {
    if (offlineService.getIsOffline()) return this.pseudoEmbed(text);
    const client = this.getClient();
    for (const modelName of ['text-embedding-004', 'gemini-embedding-001']) {
      try {
        const response = await this.executeWithRetry(() =>
          (client as any).models.embedContent({ model: modelName, contents: { parts: [{ text }] } })
        );
        const values = response?.embeddings?.[0]?.values || (response as any)?.embedding?.values;
        if (values?.length > 0) return values;
      } catch { continue; }
    }
    return this.pseudoEmbed(text);
  }

  private pseudoEmbed(text: string): number[] {
    const dim = 768; const result = new Array(dim).fill(0);
    for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); result[(c * (i+1)) % dim] = (result[(c * (i+1)) % dim] + c / 255) % 1; }
    const mag = Math.sqrt(result.reduce((s,v) => s+v*v,0)) || 1; return result.map(v => v/mag);
  }

  async checkApiStatus(): Promise<{ online: boolean; message: string }> {
    try { await this.generate({ contents: 'Svara med OK.' }); offlineService.setOffline(false); return { online: true, message: 'API online' }; }
    catch (e: any) { offlineService.setOffline(true, 'NETWORK_ERROR'); return { online: false, message: e.message }; }
  }
}

export const geminiService = new GeminiService();

// ─── GeminiLlmClient ────────────────────────
export class GeminiLlmClient {
  async generate(prompt: string): Promise<{ text: string }> {
    const text = await geminiService.generate({ contents: prompt });
    return { text: text || '' };
  }
}