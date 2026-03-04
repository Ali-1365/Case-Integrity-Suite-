import { geminiService } from '../services/geminiService';
import { Type, ThinkingLevel } from '@google/genai';

export interface FaktamasterState {
    Bevisteman: string[];
    Juridisk_Syllogism: string;
    Fakta: string[];
    Lagrum: string[];
}

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

export class AgentWorkflow {
    
    // Modul 1: Utredare-modulen (Samlar in fakta och bevis)
    async modulUtredare(caseData: string, feedbackSignal: string | null = null): Promise<string[]> {
        const systemInstruction = `
            DU ÄR UTREDARE-MODULEN.
            Ditt uppdrag är att extrahera relevanta fakta och bevis från rådatan.
            ${feedbackSignal ? `\nVIKTIG FEEDBACK FRÅN VALIDERING: ${feedbackSignal}\nDu måste gräva djupare och hitta fler bevis (premisser) för att bygga ett starkare ärende.` : ''}
        `;
        
        const response = await geminiService.generate({
            contents: caseData,
            config: { systemInstruction, temperature: 0.2, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
        
        // Förenklad simulering: returnerar fakta som en array av strängar
        return response.split('\n').filter(line => line.trim().length > 0);
    }

    // Modul 2: Grundorsaksanalys (Skapar Faktamaster_State)
    async modulGrundorsaksanalys(fakta: string[]): Promise<FaktamasterState> {
        const systemInstruction = `
            DU ÄR MODUL_GRUNDORSAKSANALYS.
            Analysera följande fakta och strukturera dem i en Faktamaster_State.
            Du måste identifiera 'Bevisteman' och bygga en 'Juridisk_Syllogism' (som innehåller premisser och en slutsats).
        `;
        
        const response = await geminiService.generate({
            contents: JSON.stringify(fakta),
            config: { 
                systemInstruction, 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        Bevisteman: { type: Type.ARRAY, items: { type: Type.STRING } },
                        Juridisk_Syllogism: { type: Type.STRING },
                        Fakta: { type: Type.ARRAY, items: { type: Type.STRING } },
                        Lagrum: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["Bevisteman", "Juridisk_Syllogism", "Fakta", "Lagrum"]
                },
                temperature: 0.1, 
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
            }
        }, 'think');
        
        return JSON.parse(response.trim()) as FaktamasterState;
    }

    // Modul 3: Validering (Kontrollerar syllogismen och skapar loop)
    async modulValidering(syllogism: string): Promise<ValidationResult> {
        const systemInstruction = `
            DU ÄR MODUL_VALIDERING.
            Ditt mandat är att granska den Argumentativa Syllogismen från Grundorsaksanalysen.
            
            REGLER:
            1. Räkna antalet tydliga premisser i syllogismen.
            2. En giltig syllogism MÅSTE innehålla minst tre (3) premisser för att bygga ett starkt ärende.
            3. Om antalet premisser är färre än 3, sätt isValid till false och generera en feedbackSignal till Utredare-modulen om att mer bevis/fakta krävs.
            4. Om antalet premisser är 3 eller fler, sätt isValid till true och feedbackSignal till null.
        `;
        
        const response = await geminiService.generate({
            contents: `Granska följande Argumentativa Syllogism:\n\n${syllogism}`,
            config: { 
                systemInstruction, 
                responseMimeType: "application/json",
                responseSchema: validationSchema,
                temperature: 0.0, 
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
            }
        }, 'think');
        
        return JSON.parse(response.trim()) as ValidationResult;
    }

    // Modul 4: Advokat-modulen (Skapar slutgiltig sakframställan)
    async modulAdvokat(faktamasterState: FaktamasterState): Promise<string> {
        const systemInstruction = `
            DU ÄR ADVOKAT-MODULEN (SKRIVSKYDDAD).
            Ditt uppdrag är att ta emot strukturerad data från Faktamaster_State och producera en formell juridisk sakframställan.
            
            INSTRUKTION TILL ADVOKAT-MODULEN:
            1. När du skapar Sakframställan, ska du inleda med Bevistemana (hämtade från Faktamaster_State["Bevisteman"]) som huvudrubriker.
            2. När du kommer till Juridisk Slutsats, måste du inkludera hela den Argumentativa Syllogismen (hämtad från Faktamaster_State["Juridisk_Syllogism"]) som ett separat, numrerat stycke.
        `;
        
        const response = await geminiService.generate({
            contents: JSON.stringify(faktamasterState),
            config: { systemInstruction, temperature: 0.1, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
        
        return response;
    }

    // Huvudorkestrator med Looping Pathway
    async runAutonomousWorkflow(caseData: string, maxLoops: number = 3): Promise<string> {
        let feedbackSignal: string | null = null;
        let loopCount = 0;
        let faktamasterState: FaktamasterState | null = null;

        while (loopCount < maxLoops) {
            console.log(`[AgentWorkflow] KÖR LOOP ${loopCount + 1}...`);
            
            // 1. Utredare samlar fakta
            const fakta = await this.modulUtredare(caseData, feedbackSignal);
            
            // 2. Grundorsaksanalys skapar state
            faktamasterState = await this.modulGrundorsaksanalys(fakta);
            
            // 3. Validering granskar syllogismen
            const validation = await this.modulValidering(faktamasterState.Juridisk_Syllogism);
            
            if (validation.isValid) {
                console.log(`[AgentWorkflow] Validering godkänd! Premisser: ${validation.premiseCount}`);
                break; // Gå ur loopen om valideringen godkänns
            } else {
                console.log(`[AgentWorkflow] Validering misslyckades. Premisser: ${validation.premiseCount}. Feedback: ${validation.feedbackSignal}`);
                feedbackSignal = validation.feedbackSignal;
                loopCount++;
            }
        }

        if (!faktamasterState) {
            throw new Error("Kunde inte generera Faktamaster_State.");
        }

        // 4. Advokat-modulen skapar slutprodukten
        console.log(`[AgentWorkflow] Skickar till Advokat-modulen...`);
        const finalReport = await this.modulAdvokat(faktamasterState);
        
        return finalReport;
    }
}

export const agentWorkflow = new AgentWorkflow();
