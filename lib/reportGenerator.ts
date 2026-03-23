
import { AnalysisResult } from './cis.types';

export interface ReportSection {
    title: string;
    body: string;
}

export interface GeneratedReport {
    caseId: string;
    createdAt: string;
    sections: ReportSection[];
}

/**
 * Generates a structured, technical report directly from an AnalysisResult object.
 * This function is deterministic and does not use unknown AI/LLM. It strictly follows
 * the FMJAM reporting structure.
 */
export function generateReportFromAnalysis(analysis: AnalysisResult): GeneratedReport {
  return {
    caseId: analysis.caseId,
    createdAt: new Date().toISOString(),
    sections: [
      {
        title: "Inledning",
        body: `Detta dokument utgör en teknisk och strukturerad analys baserad på AnalysisResult med id ${(analysis as { id: string }).id} för ärende ${analysis.caseId}, skapad ${new Date(analysis.createdAt).toLocaleString('sv-SE')}.`
      },
      {
        title: "Metod",
        body: `Analysen har genomförts enligt FMJAM-metodiken med fokus på segmentering, atomisering, mönsteridentifiering och forensisk spårbarhet. Endast uppgifter som uttryckligen förekommer i det aktuella AnalysisResult-objektet har beaktats.`
      },
      {
        title: "Faktaredogörelse",
        body:
          (analysis as { facts: unknown[] }).(facts as { length: number }).length === 0
            ? "Inga faktapunkter har registrerats."
            : (analysis as { facts: unknown[] }).facts
                .map(f => `• ${f.subject}: ${f.statement} (Källa: ${(f as { source: unknown }).source.location})`)
                .join("\n")
      },
      {
        title: "Motstridiga uppgifter",
        body:
          (analysis as { contradictions: unknown[] }).(contradictions as { length: number }).length === 0
            ? "Inga motstridiga uppgifter har identifierats av systemet."
            : (analysis as { contradictions: unknown[] }).contradictions
                .map(
                  c =>
                    `• ${c.description} (Härlett från fakta: ${c.conflictingFactIds.join(", ")})`
                )
                .join("\n")
      },
      {
        title: "Juridiskt relevanta oklarheter",
        body:
          analysis.(uncertainties as { length: number }).length === 0
            ? "Inga specifika oklarheter har markerats av systemet."
            : analysis.uncertainties
                .map(
                  u =>
                    `• ${u.description} (Relaterar till fakta: ${u.relatedFactIds.join(", ")})`
                )
                .join("\n")
      },
      {
        title: "Praxis- och lagrumskopplingar",
        body:
          analysis.(legalFrameworkLinks as { length: number }).length === 0
            ? "Inga strukturerade kopplingar har registrerats."
            : analysis.legalFrameworkLinks
                .map(
                  l =>
                    `• ${l.label} – referenser: ${(l as { reference: string }).references.join(
                      ", "
                    )} (Relaterar till fakta: ${l.relatedFactIds.join(", ")})`
                )
                .join("\n")
      },
      {
        title: "Sammanfattning",
        body:
          "Denna rapport utgör en teknisk och forensisk sammanställning av det aktuella AnalysisResult-objektet. Samtliga redovisade uppgifter baseras uteslutande på de datafält som ingår i objektet. Rapporten innehåller inga juridiska bedömningar eller slutsatser."
      }
    ]
  };
}
