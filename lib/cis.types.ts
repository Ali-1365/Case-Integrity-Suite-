
import { LegalSourceCode, FactV2, ContradictionV2, UncertaintyV2, KeywordHit } from '../types';
import { PriorityFlags } from './priorityEngine';

export type CaseType = 
  | 'EKONOMISKT_BISTÅND' 
  | 'BARNAVÅRD' 
  | 'MISSBRUKSVÅRD' 
  | 'FUNKTIONSHINDER' 
  | 'ÄLDREOMSORG' 
  | 'BOENDE_VRÄKNING' 
  | 'PROCESS_MYNDIGHETSUTÖVNING' 
  | 'SEKRETESS_OSL' 
  | 'VÅLD_NÄRA_RELATIONER' 
  | 'FAMILJERÄTT' 
  | 'ASYL_INTEGRATION';

export interface Atom {
  id: string;
  documentId: string;
  position: number;
  text: string;
  keywords: string[];
  tags: string[]; 
  startIndex?: number;
  endIndex?: number;
}

export interface LegalFrameworkLink {
  id: string;
  label: string; 
  references: LegalSourceCode[];
  relatedFactIds: string[];
  reasoning?: string; 
}

export interface RiskItemV6 {
    id: string;
    templateId: string;
    label: string;
    severity: number;
    likelihood: number;
    weight: number;
    score: number;
    triggers: string[];
    contextFlags: string[];
}

export interface RiskProfileV6 {
    id: string;
    caseId: string;
    totalScore: number;
    maxScore: number;
    normalizedScore: number;
    items: RiskItemV6[];
    dominantRisks: string[];
}

export interface AuditResult {
    integrityScore: number; 
    hallucinationRisk: 'low' | 'medium' | 'high';
    checks: {
        id: string;
        label: string;
        status: 'ok' | 'failed';
        details: string;
    }[];
    verifiedAt: string;
}

export interface QACheck {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'info';
    message: string;
}

// Alias for transition compatibility
export type Fact = FactV2;

export interface OversightBodyClassification {
    body: 'IVO' | 'JO' | 'JK' | 'DO' | 'Ingen';
    relevance: 'hög' | 'medel' | 'låg' | 'ingen';
    reason: string;
}

export interface DocumentationCheck {
    ruleId: string;
    status: 'pass' | 'fail' | 'not_applicable';
    details: string;
}

/**
 * CrossCorrelation v.1.0
 * Represents a relationship discovered between multiple documents in a batch.
 */
export interface CrossCorrelation {
    id: string;
    sourceDocId: string;
    targetDocId: string;
    type: 'CONTRADICTION' | 'REDUNDANCY' | 'COMPLEMENTARY';
    description: string;
    severity: 'low' | 'medium' | 'high';
}

import { ReasoningResult } from './LegalReasoningService';
import { DecisionSupportResult } from './DecisionSupportService';
import { ProportionalityReport } from './ProportionalityJusticeService';
import { ActionRecommendationReport } from './ActionRecommendationService';

export interface AnalysisResult {
  id: string;
  caseId: string;
  createdAt: string;
  isAggregate?: boolean;
  sourceAnalysisIds?: string[];
  audit?: AuditResult; 
  documents: { id: string; name: string; mimeType: string; }[];
  atoms: Atom[];
  facts: FactV2[];
  contradictions: ContradictionV2[];
  uncertainties: UncertaintyV2[];
  legalFrameworkLinks: LegalFrameworkLink[];
  riskProfile: RiskProfileV6;
  contextState: {
      caseId: string;
      flags: Record<string, boolean>;
      detectedCaseTypes: CaseType[];
  };
  themes: { id: string; label: string; keywords: string[] }[];
  legalReferences: { id: string; source: LegalSourceCode; rawText: string; contextSnippet: string; }[];
  qaSummary: QACheck[];
  synthesis?: string; 
  priorityFlags: PriorityFlags;
  oversightClassifications?: OversightBodyClassification[];
  documentationChecks?: DocumentationCheck[];
  keywordHits?: KeywordHit[];
  externalLinks?: { name: string; url: string; }[];
  
  // Advanced Legal Services Results
  reasoning?: ReasoningResult;
  decisionSupport?: DecisionSupportResult;
  proportionality?: ProportionalityReport;
  actionRecommendations?: ActionRecommendationReport;
}
