
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
    // FMJAM FAS 9: I detta skede simulerar vi uppslag mot en praxis-indexering.
    // I en fullskalig miljö laddas dessa från public/data/praxis_*.json
    
    const mockPraxis: PraxisEntry[] = [
      {
        id: "PRAXIS-HFD-2024-12",
        reference: "HFD 2024 ref. 12",
        linkedLaw: "SoL 4:1",
        summary: "Högsta förvaltningsdomstolen fastställer att rätten till bistånd för livsföring i övrigt även omfattar kostnader för digital delaktighet.",
        provenanceHash: "sha256-praxis9928374..."
      },
      {
        id: "PRAXIS-JO-123-23",
        reference: "JO dnr 123-23",
        linkedLaw: "FL 6 §",
        summary: "JO kritiserar en nämnd för att inte ha besvarat en begäran om nödbistånd skyndsamt, vilket strider mot serviceskyldigheten.",
        provenanceHash: "sha256-jo882716..."
      }
    ];

    // Returnera endast praxis som matchar de efterfrågade lagarna
    return mockPraxis.filter(p => lawRefs.some(ref => p.linkedLaw.includes(ref) || ref.includes(p.linkedLaw)));
  }
}

export const praxisService = new PraxisService();
