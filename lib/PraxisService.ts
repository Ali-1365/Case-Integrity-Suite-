
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
   * Söker efter praxis kopplad till en lista av laghänvisningar via backend API.
   */
  async getRelevantPraxis(lawRefs: string[]): Promise<PraxisEntry[]> {
    try {
      if (lawRefs.length === 0) {
        // Fallback om inga specifika lagar begärs, hämta alla (eller hantera annorlunda)
        const response = await fetch('/data/praxis.json');
        if (!response.ok) throw new Error('Kunde inte hämta praxisdata');
        const data = await response.json();
        return data.paragraphs.map((p: any) => ({
          id: p.id,
          reference: p.reference,
          linkedLaw: p.metadata.revisionNote || "",
          summary: p.text,
          provenanceHash: p.metadata.provenanceHash
        }));
      }

      const results: PraxisEntry[] = [];

      const response = await fetch(`/api/praxis/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lawRefs })
      });

      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((p: any) => ({
          id: p.id,
          reference: p.reference,
          linkedLaw: p.metadata.revisionNote || "",
          summary: p.text,
          provenanceHash: p.metadata.provenanceHash
        }));
        results.push(...mapped);
      }
      
      // Ta bort dubbletter
      return Array.from(new Map(results.map(item => [item.id, item])).values());
    } catch (error) {
      console.error('PraxisService Error:', error);
      return [];
    }
  }
}

export const praxisService = new PraxisService();
