
import { geminiService } from '../services/geminiService';
import { AnalysisResult, CrossCorrelation } from './fmjam.types';
import { opinionTemplateRegistry } from '../data/opinionTemplates';
import { AdversarialEngine, DuelResult } from './adversarialEngine';
import { AIOrchestrator } from './AIOrchestrator';

export class SynthesizerEngine {
  async synthesize(analysis: AnalysisResult, templateId: string = 'FMJAM_REPORT_V1'): Promise<string> {
    const template = opinionTemplateRegistry.find(t => t.id === templateId) || opinionTemplateRegistry[0];
    
    const systemInstruction = `
      **DU ÄR GLOBAL JURIDISK AI-SYSTEM v2.2-GOLD - DETERMINISTISK AGGREGATOR**
      UPPDRAG: Sammanställ en rapport med OBRUTEN HÄRLEDNINGSKEDJA enligt SFS 2025:400.
      
      PROTOKOLL:
      1. **NEUTRALITET**: Ingen tolkning. Endast fakta som kan styrkas av källatomer.
      2. **PROVENANCE**: Varje stycke SKA inledas med [KÄLLA: ID] för den atom eller fakta som styrker påståendet.
      3. **REDOVISNING AV LUCKOR**: Skriv explicit [INFORMATION_GAP] om stöd saknas.
      4. **TABELLER**: Använd markdown-tabeller för tidslinjer och brist-listor.
    `;

    return this.runGeminiSynthesis(systemInstruction, analysis, template.sections);
  }

  async synthesizeMultiple(analyses: AnalysisResult[], templateId: string = 'FMJAM_REPORT_V1'): Promise<{ synthesis: string, duelResult: DuelResult, correlations: CrossCorrelation[] }> {
    const adversarialEngine = new AdversarialEngine();
    const orchestrator = new AIOrchestrator();
    
    const allFacts = analyses.flatMap(a => a.facts);
    const allAtoms = analyses.flatMap(a => a.atoms);

    // 1. Adversarial Duel (Agent B granskar Agent A)
    const duelResult = await adversarialEngine.performDuel(allFacts, allAtoms);

    // 2. Cross-Correlation (Hitta motsägelser mellan filer)
    const correlations = await orchestrator.runCrossCorrelation(analyses.map(a => ({
        id: a.id,
        name: a.caseId,
        facts: a.facts
    })));

    // 3. Deep RAG Batch Synthesis
    const systemInstruction = `
      **DU ÄR FMJAM BATCH-SYNTETISÖR v.6.5-GOLD**
      UPPDRAG: Skapa en 'Deep RAG' batch-analys. 
      SÄRSKILD FOKUS: Identifiera diskrepanser mellan olika myndighetshandlingar.
      KONTROLL: Använd Adjudicator-insikterna för att flagga osäkra påståenden.
    `;

    const inputPayload = JSON.stringify({
        documents: analyses.map(a => ({ id: a.id, name: a.caseId, factsCount: a.facts.length })),
        adversarialAudit: duelResult,
        crossCorrelations: correlations,
        legalReferences: Array.from(new Set(analyses.flatMap(a => a.legalReferences.map(r => r.rawText))))
    }, null, 2);

    try {
      const synthesis = await geminiService.generate({
        contents: `BATCH_STATE_LOCKED:\n\n${inputPayload}`,
        config: { 
            systemInstruction, 
            temperature: 0.0,
            thinkingConfig: { thinkingBudget: 32768 }
        }
      }, 'think');

      return { synthesis, duelResult, correlations };
    } catch (error) {
      console.error("Batch synthesis failure:", error);
      throw new Error("Systemet kunde inte slutföra batch-syntesen.");
    }
  }

  private async runGeminiSynthesis(systemInstruction: string, data: any, sections: string[]): Promise<string> {
    // Vi skickar en avskalad version av AnalysisResult för att spara tokens
    const strippedData = {
        caseId: data.caseId,
        facts: data.facts,
        legalReferences: data.legalReferences,
        contradictions: data.contradictions,
        qaSummary: data.qaSummary
    };

    try {
      return await geminiService.generate({
        contents: `CONTEXT_PKK:\n\n${JSON.stringify(strippedData, null, 2)}\n\nSECTIONS:\n${sections.join('\n')}`,
        config: { systemInstruction, temperature: 0.0 }
      }, 'fast');
    } catch (error) {
       return "KRITISKT FEL: Den deterministiska syntesmotorn svarar inte.";
    }
  }
}
