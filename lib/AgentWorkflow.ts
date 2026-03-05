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
            DU ÄR UTREDARE-MODULEN (STRICT GROUNDING MODE).
            Ditt uppdrag är att extrahera relevanta fakta och bevis EXKLUSIVT från den tillhandahållna rådatan.
            
            REGLER FÖR GROUNDING:
            1. Du får INTE hitta på fakta. Varje fakta måste finnas i texten.
            2. Om texten inte stödjer ett påstående, utelämna det.
            3. Citera källan (ID eller textsnutt) för varje fakta.
            
            ${feedbackSignal ? `\nVIKTIG FEEDBACK FRÅN VALIDERING: ${feedbackSignal}\nDu måste gräva djupare i KÄLLMATERIALET och hitta fler bevis (premisser). Hitta INTE på nya.` : ''}
        `;
        
        const response = await geminiService.generate({
            contents: `RÅDATA:\n${caseData}\n\nUPPGIFT: Lista alla relevanta juridiska fakta och bevispunkter.`,
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
        
        return response.split('\n').filter(line => line.trim().length > 0);
    }

    // Modul 2: Grundorsaksanalys (Skapar Faktamaster_State)
    async modulGrundorsaksanalys(fakta: string[]): Promise<FaktamasterState> {
        const systemInstruction = `
            DU ÄR MODUL_GRUNDORSAKSANALYS (LOGIC CORE).
            Analysera följande fakta och strukturera dem i en Faktamaster_State.
            
            KRAV:
            1. 'Bevisteman': Identifiera huvudteman (t.ex. "Uppsåt", "Skada", "Kausalitet").
            2. 'Juridisk_Syllogism': Bygg en logisk kedja (Premiss 1 -> Premiss 2 -> Slutsats).
            3. 'Fakta': Lista de fakta som stödjer syllogismen.
            4. 'Lagrum': Identifiera tillämpliga lagrum från kontexten.
            
            VARNING: Du får endast använda fakta från listan. Ingen extern kunskap.
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
                temperature: 0.0, 
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
            }
        }, 'think');
        
        return JSON.parse(response.trim()) as FaktamasterState;
    }

    // Modul 3: Validering (Kontrollerar syllogismen och skapar loop)
    async modulValidering(syllogism: string): Promise<ValidationResult> {
        const systemInstruction = `
            DU ÄR MODUL_VALIDERING (QUALITY GATE).
            Granska den Argumentativa Syllogismen.
            
            KRITERIER:
            1. Är logiken hållbar? (Premisserna leder till slutsatsen)
            2. Finns det minst 3 premisser?
            3. Är språket formellt och juridiskt korrekt?
            
            OUTPUT:
            - isValid: true om alla kriterier är uppfyllda.
            - premiseCount: Antal identifierade premisser.
            - feedbackSignal: Om isValid är false, ge specifik instruktion om vad som saknas (t.ex. "Saknar bevis för uppsåt").
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
            DU ÄR ADVOKAT-MODULEN (FINAL OUTPUT).
            Ditt uppdrag är att skriva en formell juridisk sakframställan baserad EXKLUSIVT på Faktamaster_State.
            
            STRUKTUR & TON:
            - Ton: Formell, objektiv, övertygande (domstolsinlaga).
            - Struktur:
              1. YRKANDE (Härled från slutsatsen)
              2. SAKFRAMSTÄLLAN (Använd 'Bevisteman' som rubriker)
              3. RÄTTSLIG ARGUMENTATION (Använd 'Juridisk_Syllogism')
              4. SLUTSATS
            
            ANTI-HALLUCINATION REGEL:
            - Du får INTE lägga till information som inte finns i Faktamaster_State.
            - Alla påståenden ska stödjas av fakta i statet.
        `;
        
        const response = await geminiService.generate({
            contents: JSON.stringify(faktamasterState),
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
        
        return response;
    }

    // Modul 5: Motpart-modulen (Adversarial Duel)
    async modulMotpart(sakframstallan: string): Promise<string> {
        const systemInstruction = `
            DU ÄR MOTPARTS-MODULEN (ADVERSARIAL AGENT).
            Din roll är att agera som en aggressiv och skicklig motpart (t.ex. kommunjurist eller försäkringskassehandläggare).
            
            UPPGIFT:
            Granska den inkommande sakframställan och skriv ett formellt SVAROMÅL där du:
            1. Bestrider yrkandet.
            2. Attackerar svagheter i bevisföringen.
            3. Ifrågasätter tolkningen av lagrummen.
            4. Lyfter fram alternativa förklaringar (rimligt tvivel).
            
            TON:
            - Skarp, kritisk, men formellt korrekt.
            - Fokusera på att "skjuta ner" argumenten.
        `;
        
        const response = await geminiService.generate({
            contents: `INKOMMANDE SAKFRAMSTÄLLAN:\n${sakframstallan}\n\nUPPGIFT: Skriv ett bestridande svaromål.`,
            config: { systemInstruction, temperature: 0.3, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
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
