
import { AnalysisResult } from './cis.types';
import { LegalCorpus } from '../types';
import { legalFrameworkIndex } from '../data/legalFramework';
import { corpusService } from './CorpusService';
import { verifyAndLinkAnalysis } from './verification';

/**
 * FMJAM Execution Flow v.1.0-GOLD
 * This module orchestrates the complete, verified, and deterministic execution chain 
 * from loading legal data to preparing a request for the AI agent.
 */

// --- 1. Fullständig systemprompt för AI-agenten ---
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
   - Om något saknas, stoppa exekvering och returnera:
     "HARD-FAIL: Obligatoriska fält saknas: [lista på saknade fält]"

2. ANALYS-STATE
   - Analys får endast exekvera efter fullständig input-verifiering.
   - Du får aldrig skapa eller anta data själv.
   - Alla fakta ska atomiseras och kopplas mot LegalCorpus innan rapport genereras.

3. OUTPUT-STRUKTUR
   - All output ska följa strikt JSON-schema:
     {
       "caseId": "...",
       "analysisId": "...",
       "createdAt": "...",
       "sections": [
          { "title": "...", "body": "..." }
       ]
     }
   - Ingen fri text, inga juridiska slutsatser, inga antaganden.
   - Om något fält inte kan fyllas → HARD-FAIL.

4. LAGKOPPLING
   - Varje FactV2 måste ha minst en koppling till LegalReference i LegalCorpus.
   - Fyll legalFrameworkLinks med label, references[], relatedFactIds[].
   - Om ingen koppling kan göras → HARD-FAIL.

5. MÅL
   - Rapporten genereras endast när:
     • alla obligatoriska fält finns
     • alla fakta är atomiserade
     • alla lagkopplingar är verifierade
   - Rapporten ska vara deterministisk och reproducerbar.
   - Ingen improvisation eller antagande tillåts.

Bekräftelse endast: "PROMPT AKTIVERAD – HARD-FAIL IMPLEMENTERAD"
`;

/**
 * Laddar alla juridiska korpusar som definieras i systemets index.
 * Implementerar en webb-vänlig version av den efterfrågade Node.js-logiken.
 */
export async function loadAllLegalCorpus(): Promise<LegalCorpus[]> {
  try {
    const corpusFiles = legalFrameworkIndex.map(item => item.corpusFile);
    console.log(`[EXEC_FLOW] Loading ${corpusFiles.length} legal corpora...`);
    const corpora = await corpusService.loadMultiple(corpusFiles);
    if (corpora.length < corpusFiles.length) {
      console.warn("[EXEC_FLOW] Varning: Alla korpusfiler kunde inte laddas. Detta kan leda till HARD-FAIL vid verifiering.");
    }
    return corpora;
  } catch (err) {
    console.error("[EXEC_FLOW] Kritiskt fel vid laddning av lagkorpus:", err);
    throw new Error("HARD-FAIL: Kunde inte ladda nödvändiga lagfiler.");
  }
}

/**
 * Det kompletta exekveringsflödet för AI-assistenten.
 * 1. Laddar alla JSON-lagar (LegalCorpus).
 * 2. Kör `verifyAndLinkAnalysis` för att validera och länka analysresultatet.
 * 3. Returnerar ett förberett request-objekt för AI-agenten, eller kastar ett HARD-FAIL-fel.
 */
export async function executeFullFlow(analysis: AnalysisResult): Promise<{ prompt: string, verifiedAnalysis: AnalysisResult, legalCorpus: LegalCorpus[] }> {
    console.log(`[EXEC_FLOW] Startar fullständigt exekveringsflöde för caseId: ${analysis.caseId}`);
    
    // 1. Ladda alla lagkorpusar
    const legalCorpus = await loadAllLegalCorpus();
    
    // 2. Verifiera och länka analysresultatet. Detta steg kastar ett HARD-FAIL-fel vid misslyckande.
    const verifiedAnalysis = verifyAndLinkAnalysis(analysis, legalCorpus);
    console.log("[EXEC_FLOW] Analys verifierad och länkad. Alla villkor uppfyllda.");

    // 3. Förbered och returnera request-objektet
    return {
      prompt: AI_SYSTEM_PROMPT,
      verifiedAnalysis,
      legalCorpus,
    };
}
