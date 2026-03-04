
import { ParsedDocument, FactV2, ContradictionV2, UncertaintyV2, LegalReference, KeywordHit } from '../types';
import { AnalysisResult, Atom, LegalFrameworkLink, OversightBodyClassification, DocumentationCheck } from './cis.types';
import { RiskTemplate, ContextWeight } from './riskEngineV6.types';
import { LegalFrameworkItem } from './legalReferenceEngine';
import { AILink } from './AIOrchestrator';
import { PriorityFlags } from './priorityEngine';

import { ReasoningResult } from './LegalReasoningService';
import { DecisionSupportResult } from './DecisionSupportService';
import { ProportionalityReport } from './ProportionalityJusticeService';
import { ActionRecommendationReport } from './ActionRecommendationService';

export class NormalizationEngine {
  constructor(private riskTemplates: RiskTemplate[], private contextWeights: ContextWeight[]) {}

  runFullPipeline(
    doc: ParsedDocument,
    aiFacts: FactV2[],
    aiContradictions: ContradictionV2[],
    aiUncertainties: UncertaintyV2[],
    legalRefs: LegalReference[],
    keywordHits: KeywordHit[],
    aiLinks: AILink[],
    oversight: OversightBodyClassification[],
    priority: PriorityFlags,
    docChecks: DocumentationCheck[],
    framework: LegalFrameworkItem[],
    atoms: Atom[] = [],
    
    // Advanced Legal Results
    reasoning?: ReasoningResult,
    decisionSupport?: DecisionSupportResult,
    proportionality?: ProportionalityReport,
    actionRecommendations?: ActionRecommendationReport
  ): AnalysisResult {
    return {
      id: `AN-${crypto.randomUUID().substring(0,8)}`,
      caseId: doc.name,
      createdAt: new Date().toISOString(),
      documents: [{ id: 'DOC-1', name: doc.name, mimeType: doc.mimeType }],
      atoms,
      facts: aiFacts,
      contradictions: aiContradictions,
      uncertainties: aiUncertainties,
      legalFrameworkLinks: aiLinks.map(l => ({
          id: l.legalReferenceId,
          label: framework.find(f => f.id === l.legalReferenceId)?.label || l.legalReferenceId,
          references: ['SoL'],
          relatedFactIds: l.relatedFactIds,
          reasoning: l.reasoning
      })),
      riskProfile: {
          id: 'RP-1',
          caseId: doc.name,
          totalScore: 0,
          maxScore: 100,
          normalizedScore: 0,
          items: [],
          dominantRisks: []
      },
      contextState: {
          caseId: doc.name,
          flags: { barn: priority.hasChildAspect },
          detectedCaseTypes: []
      },
      themes: [],
      legalReferences: legalRefs.map(r => ({ id: r.id, source: r.source, rawText: r.rawText, contextSnippet: r.contextSnippet })),
      qaSummary: [],
      priorityFlags: priority,
      oversightClassifications: oversight,
      documentationChecks: docChecks,
      keywordHits: keywordHits,
      
      // Pass through advanced results
      reasoning,
      decisionSupport,
      proportionality,
      actionRecommendations
    };
  }
}
