
import { EconomicDocument, DebtChain, EconomicAnalysisReport } from './economic.types';
import { ParsedDocument } from '../types';
import { generateId } from './utils';

export class EconomicAnalyzerEngine {
  /**
   * Extraherar information från ett parsat dokument.
   */
  public extractInfo(doc: ParsedDocument): EconomicDocument {
    const text = doc.textContent;
    
    // 1. Belopp (siffror följda av "kr" eller "SEK")
    const amountMatch = text.match(/(\d+[\s\d]*[.,]?\d*)\s*(kr|SEK)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;

    // 2. Datum (vanliga format)
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{2}\.\d{2}\.\d{4})/);
    const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

    // 3. Dokumenttyp (nyckelord)
    const types = ['faktura', 'påminnelse', 'inkasso', 'kronofogden', 'avtal', 'beslut', 'utslag'];
    let docType = 'okänd';
    for (const t of types) {
      if (text.toLowerCase().includes(t)) {
        docType = t;
        break;
      }
    }

    // 4. Referenskandidater (minst 6 tecken, alfanumeriska)
    // Filtrera bort datum och belopp
    const candidates = text.match(/[A-Z0-9]{6,}/gi) || [];
    const references = candidates.filter(c => {
      const isDate = /\d{4}-\d{2}-\d{2}/.test(c);
      const isAmount = /^\d+$/.test(c) && parseFloat(c) === amount;
      return !isDate && !isAmount;
    });

    return {
      id: generateId('ED'),
      name: doc.name,
      type: docType,
      amount,
      date,
      references: Array.from(new Set(references)),
      textContent: text,
      fileType: doc.mimeType
    };
  }

  /**
   * Grupperar dokument till skuldkedjor baserat på unika referenser.
   */
  public groupIntoChains(docs: EconomicDocument[]): DebtChain[] {
    // 1. Identifiera giltiga referenser (förekommer i minst två dokument)
    const refCounts: Record<string, number> = {};
    docs.forEach(doc => {
      doc.references.forEach(ref => {
        refCounts[ref] = (refCounts[ref] || 0) + 1;
      });
    });

    const uniqueRefs = Object.keys(refCounts).filter(ref => refCounts[ref] >= 2);

    // 2. Bygg graf och hitta sammanhängande komponenter
    const chains: DebtChain[] = [];
    const visited = new Set<string>();

    docs.forEach(doc => {
      if (visited.has(doc.id)) return;

      const chainDocs: EconomicDocument[] = [];
      const queue = [doc];
      visited.add(doc.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        chainDocs.push(current);

        // Hitta grannar (dokument som delar minst en unik referens)
        const currentUniqueRefs = current.references.filter(r => uniqueRefs.includes(r));
        
        docs.forEach(other => {
          if (visited.has(other.id)) return;
          const otherUniqueRefs = other.references.filter(r => uniqueRefs.includes(r));
          if (currentUniqueRefs.some(r => otherUniqueRefs.includes(r))) {
            visited.add(other.id);
            queue.push(other);
          }
        });
      }

      if (chainDocs.length > 0) {
        // Sortera kronologiskt
        chainDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const originalAmount = chainDocs[0].amount;
        const currentAmount = chainDocs[chainDocs.length - 1].amount;
        const totalFees = currentAmount - originalAmount;

        // Beräkna tillkomna avgifter per steg
        for (let i = 1; i < chainDocs.length; i++) {
          chainDocs[i].addedFees = chainDocs[i].amount - chainDocs[i-1].amount;
        }

        chains.push({
          id: generateId('CH'),
          originalAmount,
          currentAmount,
          totalFees,
          documents: chainDocs,
          references: Array.from(new Set(chainDocs.flatMap(d => d.references.filter(r => uniqueRefs.includes(r))))),
          status: 'ACTIVE'
        });
      }
    });

    return chains;
  }

  /**
   * Genererar en rapport för analysen.
   */
  public generateReport(chains: DebtChain[]): EconomicAnalysisReport {
    const totalDebt = chains.reduce((acc, c) => acc + c.currentAmount, 0);
    const totalFees = chains.reduce((acc, c) => acc + c.totalFees, 0);

    return {
      timestamp: new Date().toISOString(),
      chains,
      totalDebt,
      totalFees
    };
  }
}

export const economicAnalyzerEngine = new EconomicAnalyzerEngine();
