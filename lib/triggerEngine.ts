import { GoogleGenAI, Type } from '@google/genai';
import { OversightBodyClassification } from './fmjam.types';
import { CASE_TYPE_REGISTRY } from '../data/caseTypeRegistry';

const oversightSchema = {
    type: Type.OBJECT,
    properties: {
        classifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    body: { type: Type.STRING, enum: ['IVO', 'JO', 'JK', 'DO', 'Ingen'] },
                    relevance: { type: Type.STRING, enum: ['hög', 'medel', 'låg', 'ingen'] },
                    reason: { type: Type.STRING }
                },
                required: ['body', 'relevance', 'reason']
            }
        },
        suggestedCaseTypes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['classifications', 'suggestedCaseTypes']
};

export class TriggerEngine {
  private readonly ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API-nyckel saknas i systemmiljön.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async classify(text: string): Promise<{ oversight: OversightBodyClassification[], caseTypes: string[] }> {
    const systemPrompt = `
      **TILLSYNSANALYTIKER & ÄRENDEKLASSIFICERARE - FMJAM v.7.0-GOLD**
      1. Klassificera ärendet enligt standardiserade FMJAM-ärendetyper.
      2. Avgör relevans för tillsynsorgan (IVO, JO, JK, DO).
      3. Verifiera om det finns indikationer på tjänstefel eller systemiska brister.
    `;
    
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `${systemPrompt}\n\n--- DOKUMENTTEXT ---\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: oversightSchema,
            }
        });
        
        const parsed = JSON.parse(response.text.trim());
        return {
            oversight: (parsed.classifications || []).filter((c: any) => c.body !== 'Ingen' && c.relevance !== 'ingen'),
            caseTypes: parsed.suggestedCaseTypes || []
        };
    } catch (error) {
        console.error("TriggerEngine failure:", error);
        return { oversight: [], caseTypes: [] };
    }
  }
}