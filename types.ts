
import { RiskScoreResult } from './lib/riskEngineV6.types';
import { AnalysisResult } from './lib/cis.types';
export type { AnalysisResult };

export type LegalSourceCode = 'RF' | 'SFB' | 'FL' | 'PSA' | 'GDPR' | 'SoL' | 'BrB' | 'OSL' | 'PRAXIS' | 'BK' | 'LVU' | 'LVM' | 'LSS' | 'HSL' | 'FB' | 'SkL' | 'UTLL' | 'KL' | 'DL' | 'JB' | 'FMU' | 'PL' | 'YSL' | 'YSL-S' | 'YSL-V' | 'YFO-S' | 'TF' | 'YGL' | 'SJL' | 'RB' | 'SjukL' | 'LS' | 'LAS' | 'HSS' | 'FHS';

export interface LegalParagraph {
  id: string;
  chapter?: number;
  section?: number | string;
  subSection?: number;
  reference?: string;
  text: string;
  keywords?: string[];
  metadata: {
    validFrom?: string;
    validTo?: string;
    provenanceHash: string;
    revisionNote?: string;
  };
}

export interface LegalCorpus {
  sourceCode: LegalSourceCode;
  sfsNumber: string;
  title: string;
  shortName?: string;
  paragraphs: LegalParagraph[];
  versionChain: string[];
}

export interface ParsedDocument {
  name: string;
  mimeType: string;
  textContent: string;
}

export interface LegalReference {
  id: string;
  source: LegalSourceCode;
  rawText: string;
  chapter?: number;
  section?: number;
  article?: string;
  contextSnippet: string;
  documentName: string;
  position: number;
  valid: boolean;
  validationReason?: string;
  keywords: string[];
}

export interface KeywordHit {
  id: string;
  keyword: string;
  atomId: string;
  position: number;
  snippet: string;
}

export interface AtomTheme {
  id: string;
  label: string;
  keywords: string[];
}

export type FactCategory = 'EKONOMI' | 'BARN' | 'TILLGÅNG' | 'PROCESS' | 'BOENDE' | 'HÄLSA' | 'TJÄNSTEFEL' | 'PERSONSKADA' | 'NÖD' | 'BEVISRÄTT' | 'FL';

export interface FactSource {
  documentId: string;
  location: string;
  snippet: string;
}

export interface FactV2 {
  id: string;
  subject: string;
  statement: string;
  timestamp: string;
  source: FactSource;
  category: FactCategory;
}

export type ContradictionType = 'faktisk' | 'rättslig' | 'bedömningsmässig';
export type SeverityLevel = 'låg' | 'medel' | 'hög';

export interface ContradictionV2 {
  id: string;
  description: string;
  conflictingFactIds: [string, string];
  type: ContradictionType;
  severity: SeverityLevel;
}

export interface UncertaintyV2 {
  id: string;
  description: string;
  relatedFactIds: string[];
  relevantLegalReferenceIds: string[];
}

export interface OpinionConfig {
  templateId?: string;
  style: 'formell' | 'processuell' | 'intern';
  includeSections: string[];
  maxLength?: number;
  customFormatting?: string;
}

export interface OpinionResult {
  documentName: string;
  generatedAt: string;
  config: OpinionConfig;
  content: string;
}

export interface StoredDocument {
    id: string;
    name: string;
    mimeType: string;
    createdAt: string;
    textContent: string;
    analysis: AnalysisResult;
    opinion?: OpinionResult;
}
