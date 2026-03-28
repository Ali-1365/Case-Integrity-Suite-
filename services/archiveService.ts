
import { CASE_ARCHIVE, ArchiveDocument } from '../data/caseArchive';

export interface ArchiveSearchResult {
  document: ArchiveDocument;
  relevanceScore: number;
  matchReason: string;
}

export class ArchiveService {
  /**
   * Söker i arkivet efter relevanta dokument baserat på en söksträng (t.ex. lagrum eller risk).
   */
  public static search(query: string, limit: number = 3): ArchiveSearchResult[] {
    if (!query) return [];

    const searchTerms = query.toLowerCase().split(/[\s,._-]+/).filter(t => t.length > 2);
    
    const results: ArchiveSearchResult[] = CASE_ARCHIVE.map(doc => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();
      let matchReason = '';

      // Exakt matchning på hela queryn ger högsta poäng
      if (contentLower.includes(query.toLowerCase()) || titleLower.includes(query.toLowerCase())) {
        score += 50;
        matchReason = `Exakt matchning på "${query}" identifierad.`;
      }

      // Poäng för varje sökterm som matchar
      searchTerms.forEach(term => {
        if (titleLower.includes(term)) {
          score += 20;
          if (!matchReason) matchReason = `Matchning hittad i titel: "${term}".`;
        }
        if (contentLower.includes(term)) {
          score += 10;
          if (!matchReason) matchReason = `Referens till "${term}" hittad i brödtext.`;
        }
      });

      // Kategoribaserad relevans (om queryn innehåller kategorinamn)
      if (query.toLowerCase().includes(doc.category)) {
        score += 5;
      }

      return {
        document: doc,
        relevanceScore: score,
        matchReason: matchReason || 'Indirekt relevans identifierad via kontextanalys.'
      };
    })
    .filter(res => res.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

    return results;
  }

  /**
   * Söker specifikt efter lagrum i arkivet.
   */
  public static searchByLegalRef(ref: string): ArchiveSearchResult[] {
    // Normalisera lagrum (t.ex. "SoL 4:1" -> "4 kap. 1 § socialtjänstlagen")
    // Här gör vi en enkel sökning för nu
    return this.search(ref, 5);
  }

  /**
   * Söker efter liknande risker i arkivet.
   */
  public static searchByRisk(riskLabel: string): ArchiveSearchResult[] {
    return this.search(riskLabel, 3);
  }
}
