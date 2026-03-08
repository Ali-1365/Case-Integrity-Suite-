
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { ContradictionV2, UncertaintyV2 } from '../types';

/**
 * FMJAM AIAnalysisEngine v.7.6-GOLD
 * Implementerar Anti-Template 2.0 och Holistisk DFA-analys.
 */
export class AIAnalysisEngine {
  async analyze(facts: any[]): Promise<{ 
    contradictions: ContradictionV2[], 
    uncertainties: UncertaintyV2[],
    gapAnalysis: { description: string, missingAction: string }[],
    holisticFlags: { type: 'SOCIAL_CONTEXT' | 'CHILD_PERSPECTIVE' | 'ENVIRONMENT', message: string }[]
  }> {
    const systemInstruction = `
      DU ÄR FMJAM ORACLE v.7.6-GOLD – BRED JURIDISK ANALYTIKER.
      Ditt uppdrag är att eliminera "tunnelseende" och identifiera schablonartade bedömningar.

      1. ANTI-TEMPLATE 2.0:
         - Identifiera standardformuleringar (t.ex. "arbetsförmåga bedöms finnas i normalt förekommande arbete").
         - Sök efter motbevis i faktaatomer som motsäger dessa schabloner.
         - Flagga som "TEMPLATE_RELIANCE" i contradictions om schablonen saknar stöd i individens unika data.

      2. HOLISTISK DFA-ANALYS:
         - Utvidga [Diagnos] -> [Funktionsnedsättning] -> [Aktivitetsbegränsning] till att inkludera [Social Kontext/Barnperspektiv].
         - Analysera hur medicinska begränsningar interagerar med föräldraansvar, boende och nätverk.
         - Flagga "BRISTANDE HELHETSBEDÖMNING" om social kontext saknas.

      3. GAP-ANALYS (FL 23 §):
         - Identifiera frånvaro av utredning. Vad har myndigheten INTE sagt eller utrett?
         - Lista nödvändiga utredningsåtgärder för en rättssäker prövning.

      RETURNERA JSON:
      {
        "contradictions": [],
        "uncertainties": [],
        "gapAnalysis": [{ "description": "...", "missingAction": "..." }],
        "holisticFlags": [{ "type": "...", "message": "..." }]
      }
    `;

    const res = await geminiService.generate({
      contents: `Analysera följande faktaatomer utifrån Oracle v.7.6-GOLD logik:\n${JSON.stringify(facts)}`,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 8000 }
      }
    }, 'think');
    
    try {
      return JSON.parse(res);
    } catch (e) {
      console.error("Failed to parse Oracle analysis:", e);
      return { contradictions: [], uncertainties: [], gapAnalysis: [], holisticFlags: [] };
    }
  }
}
