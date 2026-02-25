
import { loggingService, LogMode } from './loggingService';
import { denoise } from '../lib/DenoisingProtocol';

// Mock types to replace GoogleGenAI types
export interface GenerateContentParameters {
  model?: string;
  contents: any;
  config?: any;
}

export interface GenerateContentResponse {
  text: string;
}

export interface QuotaState {
    isThrottled: boolean;
    retryAfterMs: number;
    lastError: string | null;
}

export class GeminiService {
  private readonly flashModel = 'gemini-3-flash-preview';
  private readonly proModel = 'gemini-3-pro-preview';
  
  public quotaState: QuotaState = {
      isThrottled: false,
      retryAfterMs: 0,
      lastError: null
  };

  // Mock client getter - no longer needed but kept for structure if needed
  private getClient(): any {
    return {
      models: {
        generateContent: async () => ({ text: "Simulerat svar från Gemini (Mock Mode)" }),
        embedContent: async () => ({ embeddings: [{ values: new Array(768).fill(0.1) }] })
      }
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>, 
    retries = 5, 
    initialDelay = 3000
  ): Promise<T> {
    // Simplified retry logic for mock
    try {
      return await operation();
    } catch (error) {
      console.error("Mock operation failed", error);
      throw error;
    }
  }

  async generate(
    params: Omit<GenerateContentParameters, 'model'> & { model?: string }, 
    mode: LogMode = 'fast'
  ): Promise<string> {
    const startTime = Date.now();
    
    let contents = params.contents;
    if (typeof contents === 'string') {
        const normalized = denoise(contents);
        contents = normalized.cleaned;
    }

    // Mock response generation
    const config = params.config;
    if (config?.responseMimeType === 'application/json') {
        // Check if schema expects an array
        const isArray = config?.responseSchema?.type === 'ARRAY' || 
                       (typeof config?.responseSchema?.type === 'string' && config.responseSchema.type.toUpperCase() === 'ARRAY');
        
        if (isArray) {
            return JSON.stringify([]);
        }

        return JSON.stringify({
            mock: true,
            message: "Simulerat JSON-svar",
            contradictions: [],
            uncertainties: [],
            facts: [],
            analysis: "Mock analysis result",
            // Add other common fields to avoid crashes
            classifications: [],
            suggestedCaseTypes: [],
            
            // ProportionalityReport fields
            level: "GRÖN",
            findings: [],
            legalCertaintyScore: 100,
            summary: "Mock summary",
            recommendation: "Mock recommendation",

            // ActionRecommendationReport fields
            impactOnDecision: "None",
            recommendations: [],
            
            // AIOrchestrator fields
            detectedCaseTypes: [],
            legalLinks: [],
            correlations: [],
            
            // AdversarialEngine fields
            assertions: [],
            integrityScore: 100
        });
    }

    const mockResponse = `[MOCK] Detta är ett simulerat svar för prompten. 
    Miljön är inställd på att inte anropa Gemini API.
    
    Analys:
    1. Detta är en testmiljö.
    2. Inga riktiga API-anrop görs.
    3. Systemet fungerar i offline-läge.
    
    Slutsats:
    Systemet är redo för testning utan externa beroenden.`;

    loggingService.addLog({ mode, prompt: "CONTENT_LOCKED (MOCK)", response: "GENERATED (MOCK)", error: null, duration: Date.now() - startTime });
    return mockResponse;
  }

  async embed(text: string): Promise<number[]> {
    // Return a dummy embedding vector (768 dimensions is common for base models)
    return new Array(768).fill(0).map(() => Math.random());
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
