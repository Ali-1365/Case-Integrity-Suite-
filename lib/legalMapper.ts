
import { LegalFrameworkItem } from '../types';
import { LEGAL_SOURCES } from '../data/legalSources';

export class LegalMapper {
  /**
   * Maps a raw legal reference string to a registered LegalFrameworkItem.
   */
  static mapToRegistry(rawText: string): LegalFrameworkItem | null {
    const normalized = rawText.toLowerCase();
    
    return LEGAL_SOURCES.find(item => {
      const labelMatch = normalized.includes(item.label.toLowerCase());
      const refMatch = normalized.includes(item.reference.toLowerCase());
      const sfsMatch = item.sfsNumber && normalized.includes(item.sfsNumber);
      
      // If we have a specific chapter/section, check that too
      if (item.chapter && item.section) {
        const pattern = new RegExp(`${item.chapter}\\s*kap\\.?\\s*${item.section}\\s*§`, 'i');
        return pattern.test(normalized) && (refMatch || sfsMatch);
      }
      
      return labelMatch || (refMatch && sfsMatch);
    }) || null;
  }

  static getProvenanceLabel(item: LegalFrameworkItem): string {
    return `[SFS ${item.sfsNumber} | ${item.reference} ${item.chapter ? item.chapter + ' kap. ' : ''}${item.section ? item.section + ' §' : ''}]`;
  }
}
