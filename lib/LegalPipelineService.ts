
import { geminiService } from '../services/geminiService';
import { ThinkingLevel, Type } from '@google/genai';
import { auditService } from './AuditService';
import { journalService } from './JournalService';

export interface PipelineReport {
    stepId: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'error' | 'blocked';
    output?: string;
    error?: string;
    metadata?: any;
}

export interface PipelineState {
    caseId: string;
    draftV1?: string;
    correctedV2?: string;
    judgeReport?: string;
    evidenceReport?: string;
    caseLawReport?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    attackModel?: string;
    finalV3?: string;
    reports: PipelineReport[];
    isExportBlocked: boolean;
}

export class LegalPipelineService {
    
    // Steg 1: Genereringslager - document_draft_v1
    async generateDraft(caseId: string, caseData: string): Promise<string> {
        const systemInstruction = `
            DU ÄR GENERERINGSLAGRET v.1.0.
            Ditt uppdrag är att producera ett första utkast till en juridisk processinlaga baserat på ärendedata.
            
            FOKUS:
            - Formell juridisk struktur.
            - Tydliga yrkanden.
            - Sakframställning.
        `;
        
        return await geminiService.generate({
            contents: `ÄRENDEDATA:\n${caseData}\n\nUPPGIFT: Generera document_draft_v1.`,
            config: { systemInstruction, temperature: 0.7, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 2: Korrigeringsmodul - document_corrected_v2
    async correctionModule(draft: string): Promise<string> {
        const systemInstruction = `
            SYSTEMINSTRUKTION – KORRIGERING AV REDAN PRODUCERAD PROCESSINLAGA.
            
            SYFTE:
            - Eliminera upprepningar.
            - Eliminera dubletter.
            - Strukturera argument.
            - Koppla fakta → bevis → rättsregel.
            
            DU SKA INTE LÄGGA TILL NYA FAKTA, BARA STRUKTURERA OCH RENSA.
        `;
        
        return await geminiService.generate({
            contents: `UTKAST (v1):\n${draft}\n\nUPPGIFT: Producera document_corrected_v2.`,
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 3: Domar-simulator
    async judgeSimulator(document: string): Promise<string> {
        const systemInstruction = `
            DU ÄR DOMAR-SIMULATORN.
            Analysera inlagan ur en domares perspektiv.
            
            IDENTIFIERA:
            - Möjliga avslagsgrunder.
            - Svaga argument.
            - Bevisproblem.
            - Processuella hinder.
            
            VAR KRITISK OCH OBJEKTIV.
        `;
        
        return await geminiService.generate({
            contents: `PROCESSINLAGA:\n${document}\n\nUPPGIFT: Generera judge_simulation_report.`,
            config: { systemInstruction, temperature: 0.2, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 4: Bevismotor
    async evidenceEngine(document: string): Promise<string> {
        const systemInstruction = `
            DU ÄR BEVISMOTORN.
            Extrahera och kontrollera beviskedjan.
            
            EXTRAHERA:
            - Faktapåståenden.
            - Bevis.
            - Bevisteman.
            
            KONTROLLERA KEDJAN: faktum → bevis → rättsregel.
        `;
        
        return await geminiService.generate({
            contents: `PROCESSINLAGA:\n${document}\n\nUPPGIFT: Generera evidence_analysis_report.`,
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 5: Praxis-motor
    async caseLawEngine(document: string): Promise<string> {
        const systemInstruction = `
            DU ÄR PRAXIS-MOTORN.
            Kontrollera om argumentationen är förenlig med praxis från:
            - Högsta förvaltningsdomstolen (HFD).
            - Kammarrätt.
            - Förvaltningsrätt.
        `;
        
        return await geminiService.generate({
            contents: `PROCESSINLAGA:\n${document}\n\nUPPGIFT: Generera case_law_analysis.`,
            config: { systemInstruction, temperature: 0.0, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 6: Processrisk-analys
    async processRiskAnalysis(document: string, evidence: string, caseLaw: string): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
        const systemInstruction = `
            DU ÄR PROCESSRISK-ANALYSATORN.
            Analysera risken för förlust i domstol.
            
            BASERA PÅ:
            - Bevisstyrka.
            - Rättsligt stöd.
            - Praxis.
            - Processuella frågor.
            
            OUTPUT SKA VARA ENBART ETT ORD: LOW, MEDIUM eller HIGH.
        `;
        
        const response = await geminiService.generate({
            contents: `INLAGA:\n${document}\n\nBEVISANALYS:\n${evidence}\n\nPRAXISANALYS:\n${caseLaw}`,
            config: { systemInstruction, temperature: 0.0 }
        }, 'fast');
        
        const clean = response.trim().toUpperCase();
        if (clean.includes('HIGH')) return 'HIGH';
        if (clean.includes('MEDIUM')) return 'MEDIUM';
        return 'LOW';
    }

    // Steg 7: Förvaltningsrättslig angreppsmodell
    async administrativeAttackModel(document: string): Promise<string> {
        const systemInstruction = `
            DU ÄR FÖRVALTNINGSRÄTTSLIG ANGREPPSMODELL.
            Analysera om myndighetsbeslutet kan angripas enligt Förvaltningslagen (2017:900).
            
            GRUNDER:
            - Utredningsbrist.
            - Proportionalitetsbrott.
            - Objektivitetsbrott.
            - Felaktig rättstillämpning.
        `;
        
        return await geminiService.generate({
            contents: `PROCESSINLAGA:\n${document}\n\nUPPGIFT: Analysera angreppspunkter.`,
            config: { systemInstruction, temperature: 0.2, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
        }, 'think');
    }

    // Steg 8: Exportkontroll
    async exportControl(state: PipelineState): Promise<{ isBlocked: boolean; reason?: string }> {
        const systemInstruction = `
            DU ÄR EXPORTKONTROLLEN.
            Gör en slutlig kontroll av hela pipelinen.
            
            STOPPA EXPORT OM:
            - Dubletter finns kvar.
            - Faktapåståenden saknar bevis.
            - Bevis motsäger varandra.
            - Praxis talar emot argumentationen.
            - Processrisk = HIGH.
            
            Svara i JSON-format.
        `;
        
        const response = await geminiService.generate({
            contents: JSON.stringify({
                document: state.correctedV2,
                evidence: state.evidenceReport,
                caseLaw: state.caseLawReport,
                risk: state.riskLevel
            }),
            config: { 
                systemInstruction, 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isBlocked: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["isBlocked"]
                }
            }
        }, 'fast');
        
        return JSON.parse(response.trim());
    }

    // Slutsteg: Export av finalt dokument
    async exportFinalDocument(corrected: string): Promise<string> {
        const systemInstruction = `
            DU ÄR EXPORTLAGRET.
            Producera det slutgiltiga dokumentet (document_final_v3).
            Rensa bort alla interna kommentarer eller analysnoteringar.
            Säkerställ perfekt formatering.
        `;
        
        return await geminiService.generate({
            contents: `KORRIGERAD INLAGA:\n${corrected}\n\nUPPGIFT: Producera document_final_v3.`,
            config: { systemInstruction, temperature: 0.0 }
        }, 'fast');
    }

    // Orkestrator
    async runFullPipeline(caseId: string, caseData: string, onUpdate: (state: PipelineState) => void): Promise<PipelineState> {
        const state: PipelineState = {
            caseId,
            reports: [
                { stepId: '1', label: 'Genereringslager (v1)', status: 'pending' },
                { stepId: '2', label: 'Korrigeringsmodul (v2)', status: 'pending' },
                { stepId: '3', label: 'Domar-simulator', status: 'pending' },
                { stepId: '4', label: 'Bevismotor', status: 'pending' },
                { stepId: '5', label: 'Praxis-motor', status: 'pending' },
                { stepId: '6', label: 'Processrisk-analys', status: 'pending' },
                { stepId: '7', label: 'Förvaltningsrättslig angreppsmodell', status: 'pending' },
                { stepId: '8', label: 'Exportkontroll', status: 'pending' },
                { stepId: '9', label: 'Slutgiltig Export (v3)', status: 'pending' },
            ],
            isExportBlocked: false
        };

        const updateStatus = (stepId: string, status: PipelineReport['status'], output?: string, error?: string) => {
            const report = state.reports.find(r => r.stepId === stepId);
            if (report) {
                report.status = status;
                if (output) report.output = output;
                if (error) report.error = error;
            }
            onUpdate({ ...state });
        };

        try {
            // Steg 1
            updateStatus('1', 'running');
            state.draftV1 = await this.generateDraft(caseId, caseData);
            updateStatus('1', 'completed', state.draftV1);

            // Steg 2
            updateStatus('2', 'running');
            state.correctedV2 = await this.correctionModule(state.draftV1);
            updateStatus('2', 'completed', state.correctedV2);

            // Steg 3-7 körs i parallell för bättre prestanda
            updateStatus('3', 'running');
            updateStatus('4', 'running');
            updateStatus('5', 'running');
            updateStatus('6', 'running');
            updateStatus('7', 'running');

            const [judgeReport, evidenceReport, caseLawReport, attackModel] = await Promise.all([
                this.judgeSimulator(state.correctedV2),
                this.evidenceEngine(state.correctedV2),
                this.caseLawEngine(state.correctedV2),
                this.administrativeAttackModel(state.correctedV2)
            ]);

            state.judgeReport = judgeReport;
            updateStatus('3', 'completed', state.judgeReport);

            state.evidenceReport = evidenceReport;
            updateStatus('4', 'completed', state.evidenceReport);

            state.caseLawReport = caseLawReport;
            updateStatus('5', 'completed', state.caseLawReport);

            state.attackModel = attackModel;
            updateStatus('7', 'completed', state.attackModel);

            // Risk-analys kräver bevis och praxis rapporter
            state.riskLevel = await this.processRiskAnalysis(state.correctedV2, state.evidenceReport, state.caseLawReport);
            updateStatus('6', 'completed', `Riskklass: ${state.riskLevel}`);

            // Steg 8
            updateStatus('8', 'running');
            const control = await this.exportControl(state);
            state.isExportBlocked = control.isBlocked;
            if (control.isBlocked) {
                updateStatus('8', 'error', `EXPORT STOPPAD: ${control.reason}`);
                updateStatus('9', 'blocked');
                return state;
            }
            updateStatus('8', 'completed', "Exportkontroll godkänd.");

            // Steg 9
            updateStatus('9', 'running');
            state.finalV3 = await this.exportFinalDocument(state.correctedV2);
            updateStatus('9', 'completed', state.finalV3);

            await journalService.addEntry(caseId, 'PIPELINE_COMPLETED', `Fullständig juridisk pipeline slutförd för ${caseId}`);
            
        } catch (error: unknown) {
            console.error("Pipeline error:", error);
            await journalService.addEntry(caseId, 'PIPELINE_ERROR', `Fel i pipeline: ${(error instanceof Error ? error.message : String(error))}`);
        }

        return state;
    }
}

export const legalPipelineService = new LegalPipelineService();
