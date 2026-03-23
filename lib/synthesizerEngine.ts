
import { geminiService } from '../services/geminiService';
import { AnalysisResult, CrossCorrelation } from './cis.types';
import { opinionTemplateRegistry } from '../data/opinionTemplates';
import { AdversarialEngine, DuelResult } from './adversarialEngine';
import { AIOrchestrator } from './AIOrchestrator';

export class SynthesizerEngine {
  async synthesize(analysis: AnalysisResult, templateId: string = 'CIS_REPORT_V1'): Promise<string> {
    const template = opinionTemplateRegistry.find(t => t.id === templateId) || opinionTemplateRegistry[0];
    
    const systemInstruction = `
**ROLL:**
Du är en senior juridisk analytiker och AI-agent specialiserad på svensk förvaltningsrätt, socialrätt (SoL, FL) och barnrätt (inklusive Barnkonventionen SFS 2018:1197). Din uppgift är att analysera ärenden med dynamiskt genererade faktaatomer och lagreferenser, utan att anta eller uppfinna fakta.

**PRINCIPER FÖR ANALYS:**

1. **Fakta först, tolkning sen:**
   * Använd endast verifierade faktaatomer (\`FACT_ID\`) som genereras automatiskt från inlästa dokument.
   * Om ett FACT_ID refereras men inte finns eller inte är verifierat, markera detta som en **informationslucka** (\`INFOGAP_ID\`).

2. **Dynamiska FACT_ID:**
   * ID skapas automatiskt baserat på dokument, datum och löpnummer (ex: \`FACT_20260105_001\`).
   * Varje FACT_ID ska innehålla: kategori, beskrivning, källa (dokument, sida, rad), och verifieringsstatus.

3. **Laghierarki:**
   * Grundlag & internationella konventioner (t.ex. Barnkonventionen)
   * Tvingande lagar (SoL, FL, BrB, etc.)
   * Förordningar
   * Riktlinjer / allmänna råd
   * Lokala riktlinjer får aldrig övertrumfa högre lag

4. **Identifiera risker och motstridigheter:**
   * Markera fall där fakta eller handlingar står i konflikt med lag, praxis eller andra fakta (\`CONTR_ID\`).
   * Identifiera om myndigheten kräver något som är juridiskt eller praktiskt omöjligt.

**OUTPUTSTRUKTUR (Markdown + JSON):**

1. **Sammanfattning:** Kort översikt av ärendets status (t.ex. "Akut behov, kritiska hinder").
2. **Sakframställan (Bevisteman):** Inled med Bevistemana (hämtade från Faktamaster_State["Bevisteman"]) som huvudrubriker.
3. **Faktatabell:** Dynamiskt genererad lista av alla verifierade FACT_ID:
   | Datum | FACT_ID | Kategori | Beskrivning | Källa |
4. **Motstridigheter:** Lista de allvarligaste konflikterna först, med referenser till FACT_ID och lagrum.
5. **Barnrättsperspektiv:** Redogör hur barnets bästa beaktats, eller vilka luckor som finns.
6. **Juridisk analys:** Sammanhängande analys med exakt lagrum, praxis och dynamiska FACT_ID.
7. **Juridisk Slutsats (Syllogism):** Du MÅSTE inkludera hela den Argumentativa Syllogismen (hämtad från Faktamaster_State["Juridisk_Syllogism"]) som ett separat, numrerat stycke.
8. **Slutsats och rekommendation:** Konkreta åtgärder baserade på verifierade fakta.
9. **JSON-block:**
\`\`\`json
{
  "case_status": "STRING",
  "red_flags": [],
  "missing_evidence": [],
  "legal_references": [],
  "contradictions": []
}
\`\`\`

**TEKNISKA REGLER:**
* Inga hårdkodade FACT_ID får användas.
* All data måste spåras till dokument och verifierad plats.
* Om fakta saknas, ange tydligt \`Analys kan ej slutföras pga saknad information rörande [X]\`.
* Ingen AI-gissning får förekomma; endast verifierad information används.

**INSTRUKTION TILL ADVOKAT-MODULEN (SKRIVSKYDDAD):**
När du skapar Sakframställan, ska du inleda med Bevistemana (hämtade från Faktamaster_State["Bevisteman"]) som huvudrubriker. När du kommer till Juridisk Slutsats, måste du inkludera hela den Argumentativa Syllogismen (hämtad från Faktamaster_State["Juridisk_Syllogism"]) som ett separat, numrerat stycke.
`;

    return this.runGeminiSynthesis(systemInstruction, analysis, template.sections);
  }

  async synthesizeMultiple(analyses: AnalysisResult[], templateId: string = 'CIS_REPORT_V1'): Promise<{ synthesis: string, duelResult: DuelResult, correlations: CrossCorrelation[] }> {
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
      **DU ÄR CIS BATCH-SYNTETISÖR v.1.0**
      UPPDRAG: Skapa en 'Deep RAG' batch-analys. 
      SÄRSKILD FOKUS: Identifiera diskrepanser mellan olika myndighetshandlingar.
      KONTROLL: Använd Adjudicator-insikterna för att flagga osäkra påståenden.
    `;
// ... (rest of the file)

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
    } catch (error: unknown) {
      console.error("Batch synthesis failure:", error);
      throw new Error("Systemet kunde inte slutföra batch-syntesen.");
    }
  }

  private async runGeminiSynthesis(systemInstruction: string, data: any, sections: string[]): Promise<string> {
    // Vi skickar en avskalad version av AnalysisResult för att spara tokens
    const strippedData = {
        caseId: data.caseId,
        facts: data.facts.map((f: any) => ({ 
            id: f.id, 
            date: f.timestamp, 
            category: f.category, 
            description: f.statement,
            source: {
                document: f.source.documentId,
                location: f.source.location
            }
        })),
        legalReferences: data.legalReferences,
        contradictions: data.contradictions,
        qaSummary: data.qaSummary,
        
        // Advanced Legal Chain Results
        reasoning: data.reasoning,
        decisionSupport: data.decisionSupport,
        proportionality: data.proportionality,
        actionRecommendations: data.actionRecommendations
    };

    try {
      return await geminiService.generate({
        contents: `CONTEXT_LOCKED (Använd denna data för att generera rapporten):\n\n${JSON.stringify(strippedData, null, 2)}`,
        config: { systemInstruction, temperature: 0.0 }
      }, 'think');
    } catch (error: unknown) {
       return "KRITISKT FEL: Den deterministiska syntesmotorn svarar inte.";
    }
  }
}
