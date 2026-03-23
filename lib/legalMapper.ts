
import { LegalFrameworkItem } from './legalReferenceEngine';
import { LEGAL_SOURCES } from '../data/legalSources';

export class LegalMapper {
  /**
   * Maps a raw legal reference string to a registered LegalFrameworkItem.
   */
  static mapToRegistry(rawText: string): LegalFrameworkItem | null {
    const normalized = rawText.toLowerCase();
    
    return LEGAL_SOURCES.find(item => {
      const labelMatch = normalized.includes(item.label.toLowerCase());
      const refMatch = normalized.includes((item as { reference: string }).reference.toLowerCase());
      const sfsMatch = (item as { sfsNumber: string }).sfsNumber && normalized.includes((item as { sfsNumber: string }).sfsNumber);
      
      // If we have a specific chapter/section, check that too
      if ((item as { chapter: string | number }).chapter && (item as { section: string | number }).section) {
        const pattern = new RegExp(`${(item as { chapter: string | number }).chapter}\\s*kap\\.?\\s*${(item as { section: string | number }).section}\\s*§`, 'i');
        return pattern.test(normalized) && (refMatch || sfsMatch);
      }
      
      return labelMatch || (refMatch && sfsMatch);
    }) || null;
  }

  static getProvenanceLabel(item: LegalFrameworkItem): string {
    return `[SFS ${(item as { sfsNumber: string }).sfsNumber} | ${(item as { reference: string }).reference} ${(item as { chapter: string | number }).chapter ? (item as { chapter: string | number }).chapter + ' kap. ' : ''}${(item as { section: string | number }).section ? (item as { section: string | number }).section + ' §' : ''}]`;
  }
}
