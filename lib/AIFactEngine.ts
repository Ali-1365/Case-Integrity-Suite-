
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { FactV2 } from '../types';

export class AIFactEngine {
  static readonly schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        subject: { type: Type.STRING },
        statement: { type: Type.STRING },
        timestamp: { type: Type.STRING },
        source: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING },
            snippet: { type: Type.STRING }
          },
          required: ["location", "snippet"]
        },
        category: { type: Type.STRING }
      },
      required: ["id", "subject", "statement", "timestamp", "source", "category"]
    }
  };

  async extract(text: string, docId: string): Promise<FactV2[]> {
    const prompt = `Extrahera samtliga juridiska och administrativa fakta från denna text. Svara i JSON.`;
    const res = await geminiService.generate({
      contents: text,
      config: { responseMimeType: "application/json", responseSchema: AIFactEngine.schema }
    }, 'fast');
    
    return JSON.parse(res).map((f: unknown) => ({ ...(f as {}), source: { ...(f as { source: unknown }).source, documentId: docId } }));
  }
}
