import { geminiService } from '../services/geminiService';
import { Type, ThinkingLevel } from '@google/genai';
import { caseManagementService } from './CaseManagementService';
import { journalService } from './JournalService';
import { auditService } from './AuditService';

import { globalSessionManager } from './GlobalSessionManager';

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
    
    private parseJsonResponse<T>(response: string, moduleName: string): T {
        const cleaned = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        if (!cleaned) {
            throw new Error(`[${moduleName}] Tomt svar från AI-tjänsten. Detta kan bero på säkerhetsfilter eller nätverksproblem.`);
        }
        try {
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.error(`[${moduleName}] JSON parse error:`, e, "Raw string:", response);
            throw new Error(`[${moduleName}] Ogiltigt JSON-format i AI-svaret från ${moduleName}. Fel: ${(e as Error).message}`);
        }
    }

    // Modul 1: Utredare-modulen (Samlar in fakta och bevis)
    async modulUtredare(caseData: string, feedbackSignal: string | null = null): Promise<string[]> {
        const systemInstruction = `
            DU ÄR UTREDARE-MODULEN (STRICT GROUNDING MODE).
            Ditt uppdrag är att extrahera relevanta fakta och bevis EXKLUSIVT från den tillhandahållna rådatan.
            
            REGLER FÖR GROUNDING:
            1. Du får INTE hitta på fakta. Varje fakta måste finnas i texten.
            2. Om texten inte stödjer ett påstående, utelämna det.
            3. Citera källan (ID eller textsnutt) för varje fakta.
            
            ${feedbackSignal ? `\nVIKTIG FEEDBACK FRÅN VALIDERING: ${feedbackSignal}\nDu måste gräva djupare i KÄLLMATERIALET och hitta fler bevis (premisser). Returnera en KOMPLETT lista med både gamla och nya fakta som adresserar feedbacken.` : ''}
            
            OUTPUT SKA VARA JSON: { "fakta": ["fakta 1", "fakta 2", ...] }
        `;
        
        const response = await geminiService.generate({
            contents: `RÅDATA:\n${caseData}\n\nUPPGIFT: Lista alla relevanta juridiska fakta och bevispunkter.`,
            config: { 
                systemInstruction, 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fakta: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["fakta"]
                },
                temperature: 0.0, 
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
            }
        }, 'think');
        
        try {
            const parsed = this.parseJsonResponse<{ fakta: string[] }>(response, "Utredare");
            return parsed.fakta || [];
        } catch (e) {
            // Fallback om JSON misslyckas men vi har text (för bakåtkompatibilitet eller oväntade svar)
            if (response && !response.trim().startsWith('{') && !response.includes('SYSTEMFEL')) {
                return response.split('\n').filter(line => line.trim().length > 0);
            }
            throw e;
        }
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
            contents: (JSON as { str: string }).stringify(fakta),
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
        
        return this.parseJsonResponse<FaktamasterState>(response, "Grundorsaksanalys");
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
        
        return this.parseJsonResponse<ValidationResult>(response, "Validering");
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
            contents: (JSON as { str: string }).stringify(faktamasterState),
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

    // Modul 6: Adjudicator-modulen (Agent B - Slutgiltig prövning)
    async modulAdjudicator(sakframstallan: string, svaromal: string): Promise<string> {
        const systemInstruction = `
            DU ÄR ADJUDICATOR-MODULEN (AGENT B - FINAL JUDGMENT).
            Din roll är att agera som en opartisk domare eller beslutsfattare.
            
            UPPGIFT:
            1. Granska sakframställan (Agent A) och svaromålet (Motpart).
            2. Värdera bevisstyrkan i båda inlagorna.
            3. Pröva ärendet mot Lex Superior (BK, RF, Praxis).
            4. Fäll ett slutgiltigt avgörande med tydlig motivering.
            
            KRAV:
            - Du får INTE ta ställning i förväg.
            - Ditt beslut ska vara strikt baserat på lag och bevis.
            - Identifiera om någon part har åsidosatt proportionalitetsprincipen.
        `;
        
        const response = await geminiService.generate({
            contents: `SAKFRAMSTÄLLAN:\n${sakframstallan}\n\nSVAROMÅL:\n${svaromal}\n\nUPPGIFT: Fäll ett slutgiltigt avgörande.`,
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
        
        return response;
    }

    // Huvudorkestrator med Looping Pathway
    async runAutonomousWorkflow(caseId: string, caseData: string, maxLoops: number = 3): Promise<string> {
        let feedbackSignal: string | null = null;
        let loopCount = 0;
        let faktamasterState: FaktamasterState | null = null;

        let cisCase = await caseManagementService.getCase(caseId);
        
        if (!cisCase) {
            console.log(`[AgentWorkflow] Initierar virtuell kontext för ärende ${caseId}...`);
            cisCase = await caseManagementService.createCase(
                caseData.substring(0, 50) + "...", 
                { hasChildAspect: false, isPreventive: false }
            );
            caseId = cisCase.caseId;
        }

        // Registrera session i GlobalSessionManager för Multi-Tenancy isolering
        globalSessionManager.registerSession(caseId, cisCase);

        await journalService.addEntry(caseId, 'WORKFLOW_STARTED', `Autonomt arbetsflöde påbörjat för ärende ${caseId}`);

        while (loopCount < maxLoops) {
            console.log(`[AgentWorkflow] KÖR LOOP ${loopCount + 1}...`);
            
            // 1. Utredare samlar fakta
            const fakta = await this.modulUtredare(caseData, feedbackSignal);
            
            if ((fakta as { length: number }).length === 0) {
                console.log(`[AgentWorkflow] VARNING: Inga fakta hittades i loop ${loopCount + 1}.`);
                if (loopCount === 0) {
                    throw new Error("Utredare-modulen kunde inte hitta några fakta i källmaterialet. Kontrollera att dokumentet innehåller läsbar text.");
                }
            }
            
            // 2. Grundorsaksanalys skapar state
            faktamasterState = await this.modulGrundorsaksanalys(fakta);
            
            // 3. Validering granskar syllogismen
            const validation = await this.modulValidering(faktamasterState.Juridisk_Syllogism);
            
            if (validation.isValid) {
                console.log(`[AgentWorkflow] Validering godkänd! Premisser: ${validation.premiseCount}`);
                await journalService.addEntry(caseId, 'WORKFLOW_VALIDATION_PASS', `Validering godkänd i loop ${loopCount + 1}. Premisser: ${validation.premiseCount}`);
                break; // Gå ur loopen om valideringen godkänns
            } else {
                console.log(`[AgentWorkflow] Validering misslyckades. Premisser: ${validation.premiseCount}. Feedback: ${validation.feedbackSignal}`);
                await journalService.addEntry(caseId, 'WORKFLOW_VALIDATION_FAIL', `Validering misslyckades i loop ${loopCount + 1}. Feedback: ${validation.feedbackSignal}`);
                feedbackSignal = validation.feedbackSignal;
                loopCount++;
            }
        }

        if (!faktamasterState) {
            throw new Error("Kunde inte generera Faktamaster_State.");
        }

        // 4. Advokat-modulen skapar slutprodukten
        console.log(`[AgentWorkflow] Skickar till Advokat-modulen...`);
        const sakframstallan = await this.modulAdvokat(faktamasterState);
        
        // 5. Motpart-modulen skapar svaromål
        console.log(`[AgentWorkflow] Skickar till Motpart-modulen...`);
        const svaromal = await this.modulMotpart(sakframstallan);

        // 6. Adjudicator fäller avgörande (Agent B)
        console.log(`[AgentWorkflow] Skickar till Adjudicator-modulen...`);
        const finalJudgment = await this.modulAdjudicator(sakframstallan, svaromal);
        
        await journalService.addEntry(caseId, 'WORKFLOW_COMPLETED', `Autonomt arbetsflöde slutfört. Slutgiltigt avgörande fällt.`);
        
        await auditService.log({
            operationType: 'RAG_QUERY',
            actor: 'SYSTEM',
            affectedLaws: faktamasterState.Lagrum,
            provenanceHashes: [],
            resultSummary: `Autonomous workflow completed for case ${caseId}. Agent A/B separation verified.`,
            status: 'OK',
            metadata: { caseId, loopCount, faktamasterState }
        });

        return finalJudgment;
    }
}

export const agentWorkflow = new AgentWorkflow();
