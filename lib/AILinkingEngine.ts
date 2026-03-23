
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';

export class AILinkingEngine {
  async link(facts: import("../types").FactV2[], laws: import("../types").LegalCorpus[]): Promise<unknown[]> {
    const prompt = `Koppla fakta till lagrum. Garantera spårbarhet.`;
    const res = await geminiService.generate({
      contents: `FAKTA: ${JSON.stringify(facts)}\nLAGAR: ${JSON.stringify(laws)}`,
      config: { responseMimeType: "application/json" }
    }, 'think');
    
    return JSON.parse(res);
  }
}
