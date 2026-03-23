
import { AnalysisResult, LegalFrameworkLink } from './cis.types';
import { generateReportFromAnalysis, GeneratedReport } from './reportGenerator';
import { LegalCorpus } from '../types';
import { legalMappingService } from './LegalMappingService';

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

  // 2. SYSTEMATISK LAGKOPPLING (v.2.0 - Nyckelordsbaserad)
  const systematicReferences: { id: string; source: any; rawText: string; contextSnippet: string; }[] = [];
  const legalLinks: LegalFrameworkLink[] = analysis.facts.flatMap(fact => {
    const mappings = legalMappingService.mapFactToLaw(fact.statement, legalCorpus);
    
    mappings.slice(0, 3).forEach(m => {
      systematicReferences.push({
        id: `ref-${m.paragraph.id}`,
        source: m.corpus.sourceCode,
        rawText: `${m.corpus.shortName || m.corpus.sourceCode} ${m.paragraph.chapter}:${m.paragraph.section} §`,
        contextSnippet: m.paragraph.text
      });
    });

    // Ta de 3 mest relevanta matchningarna per faktum
    return mappings.slice(0, 3).map(m => ({
        id: `link-${fact.id}-${m.paragraph.id}`,
        label: `${m.corpus.title} ${m.paragraph.chapter}:${m.paragraph.section} §`,
        references: [m.corpus.sourceCode],
        relatedFactIds: [fact.id],
        reasoning: `Systematisk koppling via nyckelord: ${m.matchedKeywords.join(', ')}. Relevans: ${Math.round(m.score * 100)}%.`
    }));
  });

  // Avduplicera referenser baserat på ID
  const uniqueRefs = Array.from(new Map(systematicReferences.map(r => [r.id, r])).values());

  if (legalLinks.length === 0) {
    throw new Error('HARD-FAIL: Inga lagkopplingar kunde göras för fakta. Varje FactV2 måste ha minst en koppling till LegalCorpus.');
  }

  // Returnera det uppdaterade och verifierade analysresultatet
  return {
    ...analysis,
    legalFrameworkLinks: legalLinks,
    legalReferences: uniqueRefs
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
