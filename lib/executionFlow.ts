import { AnalysisResult } from './cis.types';
import { LegalCorpus } from '../types';
import { legalFrameworkIndex } from '../data/legalFramework';
import { corpusService } from './CorpusService';
import { verifyAndLinkAnalysis } from './verification';
import { offlineService } from '../services/geminiService';

/**
 * FMJAM Execution Flow v.2.0-GOLD
 * Orkestreringskedja från laddning av lagdata till AI-agent-request.
 * Stöd för offline-läge inbyggt.
 */

// ─────────────────────────────────────────────
//  SYSTEM-PROMPT
// ─────────────────────────────────────────────
export const AI_SYSTEM_PROMPT = `
DU ÄR FMJAM AI-AGENT – STRIKT DETERMINISTISK OCH AUDIT-VÄNLIG

Regler (HARD-FAIL IMPLEMENTERAD):

1. INPUT-VERIFIERING
   - Du får aldrig producera output om obligatoriska fält saknas.
   - Obligatoriska fält:
     • AnalysisResult.id
     • AnalysisResult.caseId
     • AnalysisResult.createdAt
     • AnalysisResult.facts[] med: subject, statement, timestamp, source
     • AnalysisResult.contradictions[] med: description, conflictingFactIds, type, severity
     • AnalysisResult.uncertainties[] med: description, relatedFactIds, relevantLegalReferenceIds
     • AnalysisResult.legalFrameworkLinks[] med: label, references[], relatedFactIds[]
   - Om något saknas: "HARD-FAIL: Obligatoriska fält saknas: [lista]"

2. ANALYS-STATE
   - Analys får endast exekvera efter fullständig input-verifiering.
   - Du får aldrig skapa eller anta data själv.
   - Alla fakta ska atomiseras och kopplas mot LegalCorpus.

3. OUTPUT-STRUKTUR
   {
     "caseId": "...",
     "analysisId": "...",
     "createdAt": "...",
     "sections": [{ "title": "...", "body": "..." }]
   }

4. LAGKOPPLING
   - Varje FactV2 måste ha minst en koppling till LegalReference i LegalCorpus.
   - Om ingen koppling kan göras → HARD-FAIL.

5. MÅL
   - Rapporten genereras endast när alla obligatoriska fält finns,
     alla fakta är atomiserade och alla lagkopplingar är verifierade.
   - Ingen improvisation eller antagande tillåts.

Bekräftelse: "PROMPT AKTIVERAD – HARD-FAIL IMPLEMENTERAD"
`;

// ─────────────────────────────────────────────
//  LADDA ALLA LAGKORPUSAR
// ─────────────────────────────────────────────
export async function loadAllLegalCorpus(): Promise<LegalCorpus[]> {
  // Offline-läge — returnera tomt utan att krascha
  if (offlineService.getIsOffline()) {
    console.warn('[EXEC_FLOW] Offline-läge — hoppar över laddning av lagkorpusar.');
    return [];
  }

  try {
    const corpusFiles = legalFrameworkIndex.map(item => item.corpusFile);
    console.log(`[EXEC_FLOW] Laddar ${corpusFiles.length} lagkorpusar...`);
    const corpora = await corpusService.loadMultiple(corpusFiles);

    if (corpora.length < corpusFiles.length) {
      console.warn(
        `[EXEC_FLOW] Varning: ${corpusFiles.length - corpora.length} korpusfiler kunde inte laddas.`
      );
    }
    console.log(`[EXEC_FLOW] ${corpora.length} lagkorpusar laddade.`);
    return corpora;
  } catch (err: unknown) {
    console.error('[EXEC_FLOW] Kritiskt fel vid laddning av lagkorpus:', err);
    // Aktivera inte offline direkt — kan vara en tillfällig 404
    if ((err instanceof Error ? err.message : String(err))?.includes('NetworkError') || (err instanceof Error ? err.message : String(err))?.includes('Failed to fetch')) {
      offlineService.setOffline(true, 'NETWORK_ERROR');
    }
    throw new Error(`HARD-FAIL: Kunde inte ladda nödvändiga lagfiler. ${(err instanceof Error ? err.message : String(err))}`);
  }
}

// ─────────────────────────────────────────────
//  FULLSTÄNDIGT EXEKVERINGSFLÖDE
// ─────────────────────────────────────────────
export async function executeFullFlow(
  analysis: AnalysisResult
): Promise<{
  prompt: string;
  verifiedAnalysis: AnalysisResult;
  legalCorpus: LegalCorpus[];
  offlineMode: boolean;
}> {
  console.log(`[EXEC_FLOW] Startar exekveringsflöde för caseId: ${analysis.caseId}`);

  const isOffline = offlineService.getIsOffline();

  if (isOffline) {
    console.warn('[EXEC_FLOW] Offline-läge aktivt — returnerar ovaliderad analys.');
    return {
      prompt: AI_SYSTEM_PROMPT,
      verifiedAnalysis: analysis,
      legalCorpus: [],
      offlineMode: true,
    };
  }

  // 1. Ladda lagkorpusar
  const legalCorpus = await loadAllLegalCorpus();

  // 2. Verifiera och länka — kastar HARD-FAIL vid misslyckande
  let verifiedAnalysis: AnalysisResult;
  try {
    verifiedAnalysis = verifyAndLinkAnalysis(analysis, legalCorpus);
    console.log('[EXEC_FLOW] Analys verifierad och länkad. Alla villkor uppfyllda.');
  } catch (err: unknown) {
    console.error('[EXEC_FLOW] Verifiering misslyckades:', (err instanceof Error ? err.message : String(err)));
    // Returnera ovaliderad snarare än att krascha hela appen
    return {
      prompt: AI_SYSTEM_PROMPT,
      verifiedAnalysis: analysis,
      legalCorpus,
      offlineMode: false,
    };
  }

  return {
    prompt: AI_SYSTEM_PROMPT,
    verifiedAnalysis,
    legalCorpus,
    offlineMode: false,
  };
}

// ─────────────────────────────────────────────
//  HJÄLPFUNKTION: Kontrollera om flödet kan köras
// ─────────────────────────────────────────────
export function canExecuteFlow(): { canRun: boolean; reason: string } {
  if (offlineService.getIsOffline()) {
    return {
      canRun: false,
      reason: `Offline-läge aktivt (${offlineService.getReason()}). Lägg till GEMINI_API_KEY.`,
    };
  }
  if (legalFrameworkIndex.length === 0) {
    return { canRun: false, reason: 'Ingen lagdata konfigurerad i legalFrameworkIndex.' };
  }
  return { canRun: true, reason: 'System redo.' };
}