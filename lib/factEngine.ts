
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { FactV2, FactCategory } from '../types';

const FACT_CATEGORIES: FactCategory[] = ['EKONOMI', 'BARN', 'TILLGÅNG', 'PROCESS', 'BOENDE', 'HÄLSA'];

const specificFactSchema = {
    type: Type.OBJECT,
    properties: {
        facts: {
            type: Type.ARRAY,
            description: "En lista av alla identifierade specifika juridisk-ekonomiska fakta.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "En unik identifierare, t.ex. 'FE-1'." },
                    subject: { type: Type.STRING, description: "Vem: Aktören faktan handlar om." },
                    statement: { type: Type.STRING, description: "Vad: Ett komplett, neutralt påstående om den specifika omständigheten." },
                    timestamp: { type: Type.STRING, description: "När: Datum eller tidsperiod (ange 'Okänd' om information saknas)." },
                    source: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING, description: "Ungefärlig plats i dokumentet." },
                            snippet: { type: Type.STRING, description: "Den exakta textsträngen som styrker faktan." },
                        },
                        required: ["location", "snippet"]
                    },
                    category: { type: Type.STRING, enum: FACT_CATEGORIES }
                },
                required: ["id", "subject", "statement", "timestamp", "source", "category"]
            }
        }
    },
    required: ["facts"]
};

export class FactEngine {
  /**
   * Analyserar text för att hitta specifika, högvärdiga juridisk-ekonomiska fakta.
   */
  async analyze(documentText: string, documentId: string): Promise<FactV2[]> {
    const systemInstruction = `
      **SYSTEMROLL: FMJAM SPECIFIK FAKTAEXTRAKTOR v.6.2.2-GOLD**
      
      UPPDRAG: Extrahera specifika faktaatomer utan tolkning.
      
      STRIKTA REGLER:
      1. **NEUTRALITET**: Omvandla aldrig personliga åsikter till objektiva fakta. Skriv: "Sökande uppger att..." istället för "Det är...".
      2. **PRECISION**: Fokusera på 'obetalda hyror', 'placeringsavgift', 'föreläggande från KFM' och 'bilinnehav/lån'.
      3. **CITERING**: Varje faktum SKA ha en 'snippet' som är ett exakt citat.
      4. **INGA ANTAGANDEN**: Rapportera endast det som uttryckligen står.
    `;
    
    try {
        const responseText = await geminiService.generate({
            contents: `--- DOKUMENTTEXT ---\n${documentText}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: specificFactSchema,
                temperature: 0.0
            }
        }, 'fast');
        
        const parsed = JSON.parse(responseText.trim());
        const facts: FactV2[] = (parsed as { facts: unknown[] }).facts || [];

        return facts.map(fact => ({
            ...fact,
            source: { ...(fact as { source: unknown }).source, documentId }
        }));
    } catch (error) {
        console.error("Specialized FactEngine failed:", error);
        return [];
    }
  }
}
