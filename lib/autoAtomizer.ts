
import { Atom } from './cis.types';
import { generateSHA256 } from './hashHelper';

export class AutoAtomizer {
  // Utökad lista på juridiska och administrativa förkortningar
  private readonly legalAbbreviations = [
    'kap', 'st', 'p', 'prop', 's', 'ff', 'inkl', 'ex', 't.ex', 'fr.o.m', 't.o.m', 
    'm.fl', 'bl.a', 'dvs', 'o.s.v', 'ca', 'bil', 'närsl', 'ref', 'sthlm', 'SFS',
    'vol', 'kapitel', 'paragraf', 'stycke', 'punkt', 'avs', 'betr', 'bilaga'
  ];

  /**
   * Segmenterar text i diskreta atomer med avancerad meningsdetektering och indexspårning.
   */
  async atomize(text: string, documentId: string): Promise<Atom[]> {
    if (!text) return [];

    // Vi segmenterar på originaltexten för att bibehålla korrekta index
    // Men vi normaliserar segments-innehållet internt för analys
    
    // Robust Segmentering: Delar vid punkter, utropstecken eller frågetecken följt av blanksteg och stor bokstav
    const sentenceRegex = /[^.!?]*[.!?](?=\s+[A-ZÅÄÖ]|$)/g;
    let match: RegExpExecArray | null;
    const atoms: Atom[] = [];
    let sequence = 1;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const segmentRaw = match[0];
      const segmentText = segmentRaw.trim();
      
      // Ignorera extremt korta segment (skräp)
      if (segmentText.length < 5) continue;

      // Forensisk hashning för total integritet
      const hash = await generateSHA256(segmentText);
      const forensicId = `ATOM-${hash.substring(0, 10).toUpperCase()}`;

      atoms.push({
        id: forensicId,
        documentId,
        position: sequence++,
        text: segmentText,
        startIndex: match.index,
        endIndex: match.index + segmentRaw.length,
        keywords: [],
        tags: []
      });
    }

    // Om ingen mening hittades (t.ex. bara en kort rad utan punkt), returnera hela texten som en atom
    if (atoms.length === 0 && text.trim().length > 0) {
        atoms.push({
            id: `ATOM-INIT-${documentId.substring(0,5)}`,
            documentId,
            position: 1,
            text: text.trim(),
            startIndex: 0,
            endIndex: text.length,
            keywords: [],
            tags: []
        });
    }

    return atoms;
  }
}
