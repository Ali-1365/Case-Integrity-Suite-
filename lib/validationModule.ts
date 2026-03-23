import { geminiService } from '../services/geminiService';
import { Type, ThinkingLevel } from '@google/genai';

export interface ValidationResult {
    isValid: boolean;
    premiseCount: number;
    feedbackSignal: string | null;
}

const validationSchema = {
    type: Type.OBJECT,
    properties: {
        isValid: { type: Type.BOOLEAN },
        premiseCount: { type: Type.INTEGER },
        feedbackSignal: { type: Type.STRING }
    },
    required: ["isValid", "premiseCount", "feedbackSignal"]
};

export class ValidationModule {
    /**
     * Körs efter Grundorsaksanalys för att validera den Argumentativa Syllogismen.
     * Skapar en återkopplingsslinga till Utredare-modulen om bevis saknas.
     */
    async validateSyllogism(syllogismText: string): Promise<ValidationResult> {
        const systemInstruction = `
            DU ÄR MODUL_VALIDERING v1.0.
            Ditt mandat är att granska den Argumentativa Syllogismen från Grundorsaksanalysen.
            
            REGLER:
            1. Räkna antalet tydliga premisser i syllogismen.
            2. En giltig syllogism MÅSTE innehålla minst tre (3) premisser för att bygga ett starkt ärende.
            3. Om antalet premisser är färre än 3, sätt isValid till false och generera en feedbackSignal till Utredare-modulen om att mer bevis/fakta krävs.
            4. Om antalet premisser är 3 eller fler, sätt isValid till true och feedbackSignal till null.
        `;

        try {
            const response = await geminiService.generate({
                contents: `Granska följande Argumentativa Syllogism:\n\n${syllogismText}`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: validationSchema,
                    temperature: 0.0,
                    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
                }
            }, 'think');

            const parsed = JSON.parse(response.trim());
            return {
                isValid: parsed.isValid,
                premiseCount: parsed.premiseCount,
                feedbackSignal: parsed.isValid ? null : parsed.feedbackSignal || "Otillräckligt antal premisser. Utredare-modulen måste hämta mer bevis."
            };
        } catch (error) {
            console.error("ValidationModule failure:", error);
            // Fallback om AI-valideringen misslyckas
            return {
                isValid: false,
                premiseCount: 0,
                feedbackSignal: "Kritiskt fel vid validering av syllogism. Manuell granskning krävs."
            };
        }
    }
}

export const validationModule = new ValidationModule();
