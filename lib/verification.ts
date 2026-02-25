
import { AnalysisResult, LegalFrameworkLink } from './fmjam.types';
import { generateReportFromAnalysis, GeneratedReport } from './reportGenerator';
import { LegalCorpus } from '../types';

interface VerificationError {
  missingFields: string[];
}

/**
 * Verifierar att AnalysisResult innehåller alla obligatoriska fält och kopplar fakta till lagar.
 * Om något saknas: HARD-FAIL (throw error)
 */
export function verifyAndLinkAnalysis(
  analysis: AnalysisResult,
  legalCorpus: LegalCorpus[]
): AnalysisResult {
  const missingFields: string[] = [];

  // 1. INPUT-VERIFIERING (enligt systemprompt)
  if (!analysis.id) missingFields.push('analysis.id');
  if (!analysis.caseId) missingFields.push('analysis.caseId');
  if (!analysis.createdAt) missingFields.push('analysis.createdAt');
  if (!analysis.facts || analysis.facts.length === 0) missingFields.push('analysis.facts[]');
  if (!analysis.contradictions) missingFields.push('analysis.contradictions[]');
  if (!analysis.uncertainties) missingFields.push('analysis.uncertainties[]');

  // HARD-FAIL om något obligatoriskt saknas
  if (missingFields.length > 0) {
    throw new Error(`HARD-FAIL: Obligatoriska fält saknas: ${missingFields.join(', ')}`);
  }

  // 2. LAGKOPPLING (enligt systemprompt)
  const legalLinks: LegalFrameworkLink[] = analysis.facts.flatMap(fact => {
    const uniqueCorpusMatches = new Set<LegalCorpus>();
    legalCorpus.forEach(corpus => {
      const hasMatch = corpus.paragraphs.some(p => fact.statement.toLowerCase().includes(p.text.toLowerCase()));
      if (hasMatch) {
        uniqueCorpusMatches.add(corpus);
      }
    });

    return Array.from(uniqueCorpusMatches).map(corpus => ({
        id: `link-${fact.id}-${corpus.sourceCode}`,
        label: `${corpus.title} (Automatisk koppling)`,
        references: [corpus.sourceCode],
        relatedFactIds: [fact.id],
        reasoning: `Faktumets innehåll matchar text från lagkorpus ${corpus.sfsNumber}.`
    }));
  });

  if (legalLinks.length === 0) {
    throw new Error('HARD-FAIL: Inga lagkopplingar kunde göras för fakta. Varje FactV2 måste ha minst en koppling till LegalCorpus.');
  }

  // Returnera det uppdaterade och verifierade analysresultatet
  return {
    ...analysis,
    legalFrameworkLinks: legalLinks
  };
}

/**
 * Genererar en deterministisk rapport endast efter att fullständig verifiering har genomförts.
 * Detta är den enda säkra vägen att generera en rapport.
 */
export function generateVerifiedReport(
  analysis: AnalysisResult,
  legalCorpus: LegalCorpus[]
): GeneratedReport {
  // Kör verifiering och lagkoppling. Vid fel kastas ett Error (HARD-FAIL).
  const verifiedAnalysis = verifyAndLinkAnalysis(analysis, legalCorpus);
  
  // Endast om verifieringen lyckas, generera rapporten.
  return generateReportFromAnalysis(verifiedAnalysis);
}
