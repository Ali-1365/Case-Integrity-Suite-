
import { ParsedDocument, FactV2, ContradictionV2, UncertaintyV2, LegalReference, KeywordHit } from '../types';
import { AnalysisResult, Atom, LegalFrameworkLink, OversightBodyClassification, DocumentationCheck } from './cis.types';
import { RiskTemplate, ContextWeight } from './riskEngineV6.types';
import { LegalFrameworkItem } from '../types';
import { AILink } from './AIOrchestrator';
import { PriorityFlags } from './priorityEngine';

import { ReasoningResult, DecisionSupportResult, ProportionalityReport, ActionRecommendationReport } from './cis.types';

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
    // 1. Map AI Facts to Atoms if atoms are empty
    const finalAtoms: Atom[] = atoms.length > 0 ? atoms : aiFacts.map((f, idx) => ({
      id: `${f.id.replace('FACT', 'ATOM')}-${idx}`,
      text: f.source.snippet,
      tags: [f.category],
      documentId: doc.name,
      position: idx,
      confidence: 1.0,
      hash: "FALLBACK_HASH_NOT_VERIFIED",
      source: {
        documentId: doc.name,
        page: 1,
        index: idx
      }
    }));

    // 2. Extract Themes from categories
    const categories = Array.from(new Set(aiFacts.map(f => f.category)));
    const themes = categories.map(cat => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
      score: aiFacts.filter(f => f.category === cat).length / aiFacts.length,
      keywords: Array.from(new Set(aiFacts.filter(f => f.category === cat).map(f => f.subject))),
      relatedAtomIds: finalAtoms.filter(a => a.tags.includes(cat)).map(a => a.id)
    }));

    // 3. Calculate Risk Profile
    const totalContradictions = aiContradictions.length;
    const totalUncertainties = aiUncertainties.length;
    const riskScore = Math.min(100, (totalContradictions * 15) + (totalUncertainties * 5));
    
    const dominantRisks = Array.from(new Set([
      ...(totalContradictions > 0 ? ['Motsägelsefulla uppgifter'] : []),
      ...(totalUncertainties > 0 ? ['Bristande beslutsunderlag'] : []),
      ...(priority.hasChildAspect ? ['Barnrättslig risk'] : []),
      ...(aiFacts.some(f => f.category === 'EKONOMI') ? ['Ekonomisk instabilitet'] : [])
    ])).slice(0, 3);

    return {
      id: `AN-${crypto.randomUUID().substring(0,8)}`,
      caseId: doc.name,
      createdAt: new Date().toISOString(),
      documents: [{ id: 'DOC-1', name: doc.name, mimeType: doc.mimeType }],
      atoms: finalAtoms,
      facts: aiFacts,
      contradictions: aiContradictions,
      uncertainties: aiUncertainties,
      legalFrameworkLinks: aiLinks.map(l => {
          const fwItem = framework.find(f => f.id === l.legalReferenceId);
          return {
            id: l.legalReferenceId,
            label: fwItem?.label || l.legalReferenceId,
            references: fwItem ? [fwItem.reference] : ['SoL'],
            relatedFactIds: l.relatedFactIds,
            reasoning: l.reasoning
          };
      }),
      riskProfile: {
          id: `RP-${crypto.randomUUID().substring(0,4)}`,
          caseId: doc.name,
          totalScore: riskScore,
          maxScore: 100,
          normalizedScore: riskScore,
          items: [],
          dominantRisks: dominantRisks
      },
      contextState: {
          caseId: doc.name,
          flags: { barn: priority.hasChildAspect },
          detectedCaseTypes: []
      },
      themes: themes,
      legalReferences: legalRefs.map(r => ({ id: r.id, source: r.source, rawText: r.rawText, contextSnippet: r.contextSnippet })),
      qaSummary: [],
      priorityFlags: priority,
      oversightClassifications: oversight,
      documentationChecks: docChecks,
      keywordHits: keywordHits,
      
      // Pass through advanced results
      reasoning,
      decisionSupport: decisionSupport ? { ...decisionSupport, atoms: finalAtoms } : undefined,
      proportionality,
      actionRecommendations
    };
  }
}
