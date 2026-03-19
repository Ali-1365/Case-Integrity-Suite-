
import { LegalSourceCode, FactV2, ContradictionV2, UncertaintyV2, KeywordHit } from '../types';
import { PriorityFlags } from './priorityEngine';
import { JournalEntry } from './JournalService';
import { DecisionJournalEntry } from './DecisionJournalService';

export type CaseStatus = 'INITIERAT' | 'UNDER_UTREDNING' | 'BESLUTAT' | 'KORRIGERAT' | 'AVSLUTAT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operationType: 'INGEST' | 'INDEX' | 'RAG_QUERY';
  actor: 'SYSTEM' | 'USER';
  affectedLaws: string[];
  provenanceHashes: string[];
  resultSummary: string;
  status: 'OK' | 'WARN' | 'ERROR';
  metadata?: any;
}

export interface CaseVersion {
  versionId: number;
  timestamp: string;
  changes: string;
  reason: string;
  decisionSnapshot: string;
  provenance: string[];
  journalEntry?: DecisionJournalEntry;
}

export interface CISCase {
  caseId: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  query: string;
  currentVersion: number;
  activeResult?: DecisionSupportResult;
  versions: CaseVersion[];
  journal: JournalEntry[];
  auditIds: string[];
  priorityFlags: { hasChildAspect: boolean; isPreventive: boolean; };
}

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
  hash: string; // Forensisk SHA-256 hash
  keywords?: string[];
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
    triggers?: string[];
    contextFlags?: string[];
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

export interface MatchedRule {
    ruleId: string;
    title: string;
    confidence: number;
    triggeredBy: string[];
}

export interface EvidenceChainItem {
    id: string;
    factId: string;
    legalReferenceId: string;
    strength: number;
    reasoning: string;
}

export type RiskLevel = 'GRÖN' | 'GUL' | 'RÖD';

export interface NormConflict {
  type: 'LEX_SUPERIOR' | 'LEX_SPECIALIS' | 'LEX_POSTERIOR' | 'PRAXIS_AMBIGUITY' | 'PROCEDURAL_VS_MATERIAL';
  description: string;
  affectedSources: string[]; // ProvenanceHashes
  severity: RiskLevel;
}

export interface RiskReport {
  riskId: string;
  level: RiskLevel;
  conflicts: NormConflict[];
  assessment: string;
}

export interface ConsolidationResult {
  consolidationId: string;
  hierarchy: {
    constitution: any[];
    law: any[];
    regulation: any[];
    praxis: any[];
  };
  interplayAnalysis: string;
  affectedNorms: string[];
  provenanceHashes: string[];
  riskReport?: RiskReport;
}

export interface ReasoningResult {
  reasoningId: string;
  queryId: string;
  confidenceScore: number;
  consolidation?: ConsolidationResult;
  sections: {
    facts: string;
    laws: { ref: string; text: string; hash: string }[];
    analysis: string;
    conclusion: string;
  };
  fullMarkdown: string;
}

export type DecisionProposal = 'JA' | 'NEJ' | 'BEHÖVER UTREDNING';

export interface DecisionObject {
  decision: DecisionProposal;
  legalBasis: string[];
  provenance: string[];
  riskLevel: string;
  queryId: string;
  reasoningId: string;
  consolidationId: string;
  riskId: string;
  decisionId: string;
  proportionalityId?: string;
  actionId?: string;
  caseId?: string;
}

export type ProportionalityLevel = 'GRÖN' | 'GUL' | 'RÖD';

export interface JusticeFinding {
  step: string;
  finding: string;
  status: 'PASS' | 'WARN' | 'FAIL';
}

export interface ProportionalityReport {
  proportionalityId: string;
  level: ProportionalityLevel;
  findings: JusticeFinding[];
  legalCertaintyScore: number;
  summary: string;
  recommendation: string;
}

export interface ActionItem {
  id: string;
  category: 'MILDER_ALTERNATIVE' | 'FURTHER_INVESTIGATION' | 'CORRECTIVE_ACTION';
  description: string;
  motivation: string;
  legalReference: string;
  provenanceHash?: string;
}

export interface ActionRecommendationReport {
  actionId: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: ActionItem[];
  impactOnDecision: string;
}

export interface DecisionSupportResult {
  decisionId: string;
  proposal: DecisionProposal;
  summary: string;
  fullMarkdown: string;
  machineReadable: DecisionObject;
  reasoning: ReasoningResult;
  proportionality?: ProportionalityReport;
  actions?: ActionRecommendationReport;
  facts: FactV2[];
  contradictions: ContradictionV2[];
  atoms: Atom[];
}

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
  legalReferences: { id: string; source: LegalSourceCode; rawText: string; contextSnippet: string; valid?: boolean; }[];
  qaSummary: QACheck[];
  matchedRules?: MatchedRule[];
  evidenceChain?: EvidenceChainItem[];
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
  
  // v.7.6-GOLD Oracle Fields
  gapAnalysis?: { description: string, missingAction: string }[];
  holisticFlags?: { type: 'SOCIAL_CONTEXT' | 'CHILD_PERSPECTIVE' | 'ENVIRONMENT', message: string }[];
}
