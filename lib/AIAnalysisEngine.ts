
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { ContradictionV2, UncertaintyV2 } from '../types';

export class AIAnalysisEngine {
  async analyze(facts: any[]): Promise<{ contradictions: ContradictionV2[], uncertainties: UncertaintyV2[] }> {
    const prompt = `Analysera dessa faktaatomer för logiska motsägelser och juridiska oklarheter:\n${JSON.stringify(facts)}`;
    const res = await geminiService.generate({
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      }
    }, 'think');
    
    return JSON.parse(res);
  }
}
