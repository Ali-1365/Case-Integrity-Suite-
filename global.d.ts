import { Fact, ContradictionV2 as Contradiction, LegalParagraph, CISCase } from './lib/cis.types';
import { LegalSourceCode } from './types';
import { StoredDocument, Invoice } from './types';

declare global {
  interface Window {
    OFFLINE_MODE?: boolean;
    OFFLINE_REASON?: string;
    aistudio?: {
      hasSelectedApiKey: () => boolean;
      openSelectKey: () => Promise<void>;
    };
  }
}

export {};
