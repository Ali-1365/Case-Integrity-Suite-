
import { KEYWORD_PATTERNS } from './keywordPatterns';
import { KEYWORD_TO_ATOM } from './atomMapping';
import { KeywordHit } from '../types';

export class KeywordEngine {
  /**
   * Analyserar text och extraherar juridiska nyckelord baserat på definierade mönster.
   * Returnerar KeywordHit-objekt med precisa positioner för integrering i analysresultat.
   */
  analyze(text: string): KeywordHit[] {
    const hits: KeywordHit[] = [];

    Object.entries(KEYWORD_PATTERNS).forEach(([label, pattern]) => {
      // Säkerställ att vi använder en global flagga för matchAll
      const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
      const globalPattern = new RegExp(pattern.source, flags);
      
      for (const match of text.matchAll(globalPattern)) {
        const position = match.index ?? 0;
        const matchedText = match[0];
        const snippet = this.extractContext(text, position, 120);
        const atomId = KEYWORD_TO_ATOM[label] ?? 'oklassificerad';

        hits.push({
          id: `${label}-${position}`,
          keyword: matchedText, // Lagra den faktiska texten som hittades
          atomId,
          position,
          snippet,
        });
      }
    });

    // Sortera efter position i dokumentet
    return hits.sort((a, b) => a.position - b.position);
  }

  private extractContext(text: string, index: number, span: number): string {
    const halfSpan = Math.floor(span / 2);
    const start = Math.max(0, index - halfSpan);
    const end = Math.min(text.length, index + halfSpan);
    
    let snippet = text.slice(start, end);
    snippet = snippet.replace(/\s+/g, ' ').trim(); // Normalisera blanksteg i snippet

    return `...${snippet}...`;
  }
}
