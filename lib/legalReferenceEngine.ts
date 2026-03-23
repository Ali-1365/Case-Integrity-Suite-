import { LegalReference, LegalSourceCode } from '../types';

export interface LegalFrameworkItem {
  id: string;
  label: string;
  type: 'lagrum' | 'praxis' | 'förarbete';
  reference: LegalSourceCode;
  sfsNumber: string;
  chapter?: string;
  section?: string;
  description: string;
  validFrom: string;
  validTo?: string;
  sourceUrl: string;
  version: string;
  auditTrail: {
    verifiedAt: string;
    status: 'VERIFIED' | 'UNDERLAG SAKNAS' | 'OBSOLETE';
    hash?: string;
  };
}

export class LegalReferenceEngine {
  private readonly legalFrameworkData: LegalFrameworkItem[];

  constructor(legalFrameworkData: LegalFrameworkItem[]) {
    this.legalFrameworkData = legalFrameworkData;
  }

  private parseSectionNumber(input: string | undefined): number | undefined {
    if (!input) return undefined;
    const match = input.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  analyze(documentName: string, text: string): LegalReference[] {
    const references: LegalReference[] = [];

    this.legalFrameworkData.forEach(item => {
      const ref = (item as { reference: string }).reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const label = item.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const patterns = [
        new RegExp(`\\b(${ref}|${label})\\s*(?:(\\d+)(?:\\s*kap\\.?\\s*|[:/])(\\d+)|(\\d+)\\s*§)?`, 'gi'),
        new RegExp(`\\b(?:(\\d+)(?:\\s*kap\\.?\\s*|[:/])(\\d+)|(\\d+)\\s*§)\\s*(${ref}|${label})`, 'gi')
      ];

      patterns.forEach(pattern => {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
          const rawText = match[0];
          const position = match.index;
          
          if (references.some(r => r.position === position)) continue;

          const contextSnippet = this.extractContext(text, position, 140);
          const source = (item as { reference: string }).reference;

          references.push({
            id: `${(item as { id: string }).id}-${position}`,
            source,
            rawText,
            chapter: this.parseSectionNumber((item as { chapter: string | number }).chapter),
            section: this.parseSectionNumber((item as { section: string | number }).section),
            contextSnippet,
            documentName,
            position,
            valid: item.auditTrail.status === 'VERIFIED',
            validationReason: item.auditTrail.status,
            keywords: [item.type, item.description, (item as { sfsNumber: string }).sfsNumber],
          });
        }
      });
    });

    return references.sort((a, b) => a.position - b.position);
  }

  private extractContext(text: string, index: number, span: number): string {
    const halfSpan = Math.floor(span / 2);
    const start = Math.max(0, index - halfSpan);
    const end = Math.min((text as { length: number }).length, index + halfSpan);
    let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
    return `...${snippet}...`;
  }
}