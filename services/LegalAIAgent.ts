
import { corpusService } from '../lib/CorpusService';
import { legalFrameworkIndex } from '../data/legalFramework';
import { FactV2 as Fact } from '../types';
import { CISCase as Case } from '../lib/cis.types';
import { geminiService } from './geminiService';
import { loggingService } from './loggingService';
import { ragService } from '../lib/ragService';

// Ny typ för mer granulär lagdata
interface EnrichedLegalParagraph {
  id: string;
  lawTitle: string;
  lawSourceCode: string;
  chapter?: number;
  section?: number | string;
  reference?: string;
  text: string;
}

/**
 * En interaktiv AI-agent för juridisk analys, baserad på FMJAM-konceptet.
 * Kärnanalysen drivs nu av Gemini Pro.
 */
class LegalAIAgent {
  private laws: EnrichedLegalParagraph[] = [];
  private cases: Case[] = [];

  /**
   * Laddar och förbereder alla lagar från systemets korpus på paragrafnivå.
   */
  async initialize(): Promise<void> {
    if (this.laws.length > 0) return;

    const startTime = Date.now();
    try {
      loggingService.info("[AGENT] Initializing Legal AI Agent...");
      const corpusFiles = legalFrameworkIndex.map(item => item.corpusFile);
      const corpora = await corpusService.loadMultiple(corpusFiles);
      
      const allParagraphs: EnrichedLegalParagraph[] = [];
      corpora.forEach(corpus => {
        corpus.paragraphs.forEach(p => {
          allParagraphs.push({
            id: p.id,
            lawTitle: corpus.title,
            lawSourceCode: corpus.sourceCode,
            chapter: p.chapter,
            section: p.section,
            // @ts-expect-error
            reference: (p as unknown).reference, // Handle Praxis reference
            text: p.text,
          });
        });
      });
      this.laws = allParagraphs;
      
      // Initialize RAG service as well
      await ragService.initialize();
      
      loggingService.info(`[AGENT] Initialization complete. Loaded ${this.laws.length} paragraphs.`, {
        duration: Date.now() - startTime
      });
    } catch (error) {
      loggingService.error("[AGENT] Initialization failed", { error: (error as Error).message });
      throw error;
    }
  }

  addCase(caseData: Case): void {
    if (!this.cases.find(c => c.caseId === caseData.caseId)) {
      this.cases.push(caseData);
      loggingService.debug(`[AGENT] Case added: ${caseData.caseId}`, { facts: caseData.activeResult?.facts.length || 0 });
    }
  }

  getCase(caseId: string): Case | undefined {
    return this.cases.find(c => c.caseId === caseId);
  }

  getAllCases(): Case[] {
    return this.cases;
  }

  /**
   * Genererar ett dynamiskt juridiskt yttrande baserat på ett ärende med hjälp av AI.
   */
  async generateOpinion(caseId: string): Promise<string> {
    const startTime = Date.now();
    loggingService.info(`[AGENT] Generating opinion for case: ${caseId}`);
    
    const caseData = this.getCase(caseId);
    if (!caseData) {
      const errorMsg = `Ärende ${caseId} finns inte.`;
      loggingService.error(`[AGENT] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const systemInstruction = `
      DU ÄR EN SVENSK JURIDISK EXPERT-AI (FMJAM-AGENT).
      Ditt uppdrag är att analysera ett juridiskt ärende. Koppla de givna fakta-punkterna till relevanta lagparagrafer från listan.
      Var extremt noggrann och gör endast kopplingar som är starkt underbyggda.
      
      NYA STRIKTA REGLER:
      - LAGRUMSUPPDATERING: Du måste ALLTID tillämpa gällande rätt baserat på datumet för händelsen. Om du upptäcker att rådatan eller myndighetens beslut använder gamla eller felaktiga lagrum (t.ex. den gamla Socialtjänstlagen), SKA du upplysa om detta fel och istället tillämpa det korrekta, uppdaterade lagrummet i din analys.
      - BRISTANALYS: Du måste PROAKTIVT granska rådatan för att hitta fel som myndigheten kan ha begått. Detta omfattar att identifiera om de har missat att upprätta rapporter, ignorerat bevis eller förgått andra handläggningsfel. Du SKA tydligt påtala dessa brister i din analys.
      
      Strukturera ditt svar i Markdown med följande rubriker:
      - Inledning
      - Fakta- och lagrumskopplingar (för varje fakta, ange lagrum och en kort motivering)
      - Identifierade motstridigheter
      - Myndighetsbrister och Handläggningsfel (Bristanalys)
      - Informationsluckor
      - Sammanfattande slutsats
      
      Använd ett formellt och neutralt språk. Producera ett färdigt juridiskt yttrande utan interna markeringar.
    `;
    
    const facts = caseData.activeResult?.facts || [];
    const factsForPrompt = facts.map(f => ({ id: f.id, description: f.statement }));
    
    // Use RAG to get the most relevant legal context
    const ragResult = await ragService.getContextForText(facts.map(f => f.statement).join(' '), true, caseId);

    const userPrompt = `
      **ÄRENDE:** ${caseData.caseId}
      **FRÅGA:** ${caseData.query}

      **FAKTA:**
      \`\`\`json
      ${JSON.stringify(factsForPrompt, null, 2)}
      \`\`\`

      **JURIDISK KONTEXT (RAG):**
      ${ragResult.context}

      Analysera ärendet enligt systeminstruktionerna och generera ett komplett juridiskt yttrande.
    `;

    try {
      const response = await geminiService.generate({
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 16384 }
        }
      }, 'think');
      
      loggingService.info(`[AGENT] Opinion generated for ${caseId}`, {
        duration: Date.now() - startTime
      });
      return response;
    } catch (e) {
      loggingService.error(`[AGENT] Opinion generation failed for ${caseId}`, { 
        error: (e as Error).message,
        duration: Date.now() - startTime 
      });
      return "### Kritiskt fel i AI-analysmotorn\n\nDet gick inte att generera yttrandet. Kontrollera systemloggarna.";
    }
  }

  queryFacts(caseId: string, keyword: string): Fact[] {
    const caseData = this.getCase(caseId);
    if (!caseData || !caseData.activeResult) return [];
    return caseData.activeResult.facts.filter(f => f.statement.toLowerCase().includes(keyword.toLowerCase()));
  }

  queryContradictions(caseId: string) {
    const caseData = this.getCase(caseId);
    if (!caseData || !caseData.activeResult) return [];
    return caseData.activeResult.contradictions;
  }

  queryLaws(caseId: string): EnrichedLegalParagraph[] {
    const caseData = this.getCase(caseId);
    if (!caseData || !caseData.activeResult) return [];
    
    const relevantParagraphs = new Set<EnrichedLegalParagraph>();
    const keywords = new Set<string>();
    caseData.activeResult.facts.forEach(f => {
      keywords.add(f.category.toLowerCase());
      f.statement.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 4) keywords.add(word.replace(/[^a-zåäö]/g, ''));
      });
    });

    this.laws.forEach(p => {
        const paragraphText = p.text.toLowerCase();
        for (const keyword of keywords) {
            if (paragraphText.includes(keyword)) {
                relevantParagraphs.add(p);
                break;
            }
        }
    });

    return Array.from(relevantParagraphs);
  }
}

export const legalAIAgent = new LegalAIAgent();
