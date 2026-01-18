
import { corpusService } from '../lib/CorpusService';
import { legalFrameworkIndex } from '../data/legalFramework';
import { Fact, Case } from '../lib/LegalAgentTypes';
import { geminiService } from './geminiService';

// Ny typ för mer granulär lagdata
interface EnrichedLegalParagraph {
  id: string;
  lawTitle: string;
  lawSourceCode: string;
  chapter?: number;
  section: number;
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
          text: p.text,
        });
      });
    });
    this.laws = allParagraphs;
  }

  addCase(caseData: Case): void {
    if (!this.cases.find(c => c.id === caseData.id)) {
      this.cases.push(caseData);
    }
  }

  getCase(caseId: string): Case | undefined {
    return this.cases.find(c => c.id === caseId);
  }

  getAllCases(): Case[] {
    return this.cases;
  }

  /**
   * Genererar ett dynamiskt juridiskt yttrande baserat på ett ärende med hjälp av AI.
   */
  async generateOpinion(caseId: string): Promise<string> {
    const caseData = this.getCase(caseId);
    if (!caseData) throw new Error(`Ärende ${caseId} finns inte.`);

    const systemInstruction = `
      DU ÄR EN SVENSK JURIDISK EXPERT-AI (FMJAM-AGENT).
      Ditt uppdrag är att analysera ett juridiskt ärende. Koppla de givna fakta-punkterna till relevanta lagparagrafer från listan.
      Var extremt noggrann och gör endast kopplingar som är starkt underbyggda.
      
      Strukturera ditt svar i Markdown med följande rubriker:
      - Inledning
      - Fakta- och lagrumskopplingar (för varje fakta, ange lagrum och en kort motivering)
      - Identifierade motstridigheter
      - Informationsluckor
      - Sammanfattande slutsats
      
      Använd ett formellt och neutralt språk. Producera ett färdigt juridiskt yttrande utan interna markeringar.
    `;
    
    const factsForPrompt = caseData.facts.map(f => ({ id: f.id, description: f.description }));
    const lawsForPrompt = this.laws.map(p => ({
      id: p.id,
      law: p.lawTitle,
      ref: `${p.chapter ? p.chapter + ' kap. ' : ''}${p.section} §`,
      text: p.text.substring(0, 250) + '...' // Truncate to save tokens
    }));

    const userPrompt = `
      **ÄRENDE:** ${caseData.id}

      **FAKTA:**
      \`\`\`json
      ${JSON.stringify(factsForPrompt, null, 2)}
      \`\`\`

      **TILLGÄNGLIGA LAGRUM:**
      \`\`\`json
      ${JSON.stringify(lawsForPrompt, null, 2)}
      \`\`\`

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
      return response;
    } catch (e) {
      console.error("AI Opinion Generation failed:", e);
      return "### Kritiskt fel i AI-analysmotorn\n\nDet gick inte att generera yttrandet. Kontrollera systemloggarna.";
    }
  }

  queryFacts(caseId: string, keyword: string): Fact[] {
    const caseData = this.getCase(caseId);
    if (!caseData) return [];
    return caseData.facts.filter(f => f.description.toLowerCase().includes(keyword.toLowerCase()));
  }

  queryContradictions(caseId: string) {
    const caseData = this.getCase(caseId);
    if (!caseData) return [];
    return caseData.contradictions;
  }

  queryLaws(caseId: string): EnrichedLegalParagraph[] {
    const caseData = this.getCase(caseId);
    if (!caseData) return [];
    
    const relevantParagraphs = new Set<EnrichedLegalParagraph>();
    const keywords = new Set<string>();
    caseData.facts.forEach(f => {
      keywords.add(f.category.toLowerCase());
      f.description.toLowerCase().split(/\s+/).forEach(word => {
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
