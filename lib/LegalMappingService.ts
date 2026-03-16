
import { KeywordHit, LegalCorpus, LegalParagraph } from '../types';
import { KeywordEngine } from './keywordEngine';

export interface MappingResult {
  paragraph: LegalParagraph;
  corpus: LegalCorpus;
  matchedKeywords: string[];
  score: number;
}

export class LegalMappingService {
  private keywordEngine: KeywordEngine;

  constructor() {
    this.keywordEngine = new KeywordEngine();
  }

  /**
   * Systematiskt kopplar fakta till lagrum baserat på nyckelord.
   * Särskilt optimerad för Socialtjänstlagen (2025:400).
   */
  public mapFactToLaw(factStatement: string, legalCorpora: LegalCorpus[]): MappingResult[] {
    const hits = this.keywordEngine.analyze(factStatement);
    const factKeywords = hits.map(h => h.keyword.toLowerCase());
    
    const results: MappingResult[] = [];

    legalCorpora.forEach(corpus => {
      // Vi prioriterar Socialtjänstlagen om det finns matchningar där
      const isSoL = corpus.sourceCode === 'SoL';
      
      corpus.paragraphs.forEach(paragraph => {
        if (!paragraph.keywords) return;

        const matchedKeywords = paragraph.keywords.filter(pk => 
          factKeywords.some(fk => {
            const fkLower = fk.toLowerCase();
            const pkLower = pk.toLowerCase();
            return fkLower.includes(pkLower) || pkLower.includes(fkLower);
          })
        );

        if (matchedKeywords.length > 0) {
          // Beräkna en relevanspoäng. SoL får en liten boost om det är relevant.
          let score = matchedKeywords.length / paragraph.keywords.length;
          if (isSoL) score *= 1.2; 

          results.push({
            paragraph,
            corpus,
            matchedKeywords,
            score
          });
        }
      });
    });

    // Sortera efter relevanspoäng
    return results.sort((a, b) => b.score - a.score);
  }
}

export const legalMappingService = new LegalMappingService();
