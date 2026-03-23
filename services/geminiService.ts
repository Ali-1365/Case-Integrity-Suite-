import { GoogleGenAI, GenerateContentParameters } from '@google/genai';
import { loggingService } from './loggingService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';
import { getConfiguredGeminiApiKey, offlineService } from './offlineService';

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
    const key = getConfiguredGeminiApiKey();
    console.log('[GeminiService] API Key present:', !!key);
    return key;
  }

  private initializeClient(): void {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      loggingService.warn('[GeminiService] Ingen Gemini API-nyckel hittades i VITE_GEMINI_API_KEY, GEMINI_API_KEY eller window.GEMINI_API_KEY. AI-funktioner använder fallback tills en nyckel finns.');
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
        const values = (response as any)?.embeddings?.[0]?.values || (response as any)?.embedding?.values;
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

export { offlineService };
