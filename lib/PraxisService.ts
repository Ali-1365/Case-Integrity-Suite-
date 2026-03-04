
import { corpusService } from './CorpusService';
import { LegalParagraph } from '../types';

export interface PraxisEntry {
  id: string;
  reference: string; // T.ex. "HFD 2024 ref. 12" eller "JO 123-23"
  linkedLaw: string; // T.ex. "SoL 4:1"
  summary: string;
  provenanceHash: string;
  fullText?: string;
}

/**
 * FMJAM PraxisService v.7.9.0
 * Ansvarar för att hämta vägledande avgöranden kopplade till lagrum.
 */
export class PraxisService {
  /**
   * Söker efter praxis kopplad till en lista av laghänvisningar.
   */
  async getRelevantPraxis(lawRefs: string[]): Promise<PraxisEntry[]> {
    try {
      const response = await fetch('/data/praxis.json');
      if (!response.ok) throw new Error('Kunde inte hämta praxisdata');
      
      const data = await response.json();
      const praxis: PraxisEntry[] = data.paragraphs.map((p: any) => ({
        id: p.id,
        reference: p.reference,
        linkedLaw: p.metadata.revisionNote || "", // Using revisionNote as a proxy for linked law if not explicit
        summary: p.text,
        provenanceHash: p.metadata.provenanceHash
      }));

      // Returnera praxis som matchar de efterfrågade lagarna eller alla om inga specifika begärs
      if (lawRefs.length === 0) return praxis;
      
      return praxis.filter(p => 
        lawRefs.some(ref => 
          p.linkedLaw.toLowerCase().includes(ref.toLowerCase()) || 
          ref.toLowerCase().includes(p.linkedLaw.toLowerCase()) ||
          p.summary.toLowerCase().includes(ref.toLowerCase())
        )
      );
    } catch (error) {
      console.error('PraxisService Error:', error);
      return [];
    }
  }
}

export const praxisService = new PraxisService();
