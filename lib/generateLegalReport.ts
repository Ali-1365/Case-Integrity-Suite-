
export interface Fact {
  id: string;             // Ex: "FACT_001"
  date: string;           // Ex: "2026-01-07"
  category: string;       // Ex: "EKONOMI"
  description: string;
  source: string;         // Ex: dokumentnamn
}

export interface LegalReference {
  law: string;            // Ex: "Socialtjänstlag"
  year: string;           // Ex: "2025:400"
  section?: string;       // Ex: "12 kap 1 §"
  linkedFacts: string[];  // lista med FACT_ID
  commentary?: string;
}

export interface Contradiction {
  id: string;
  description: string;
  relatedFacts: string[];
}

export interface InformationGap {
  id: string;
  description: string;
  relatedFacts: string[];
}

export interface LegalReport {
  caseId: string;
  createdAt: string;
  sections: {
    title: string;
    body: string;
  }[];
}

/**
 * Genererar en dynamisk juridisk rapport baserat på fakta och lagrum
 */
export function generateLegalReport(
  caseId: string,
  facts: Fact[],
  legalReferences: LegalReference[],
  contradictions: Contradiction[] = [],
  infoGaps: InformationGap[] = []
): LegalReport {
  const createdAt = new Date().toISOString();

  // 1. Inledning
  const intro = `Denna rapport sammanställer verifierade fakta och juridiska kopplingar i ärende ${caseId}. Analysen baseras på verifierade faktaatomer och relevanta lagrum.`

  // 2. Metod
  const method = `Analysen är deterministisk. Varje påstående härleds från verifierade fakta och relevanta juridiska källor. Ingen spekulation utförs.`

  // 3. Faktaredogörelse
  const factsTable = facts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(f => `${f.date} | [${(f as { id: string }).id}] | ${f.category} | ${f.description} (Källa: ${(f as { source: unknown }).source})`)
    .join('\n');

  // 4. Motstridiga uppgifter
  const contradictionsText = (contradictions as { length: number }).length > 0
    ? contradictions.map(c => `[${(c as { id: string }).id}] ${c.description} (Relaterade fakta: ${c.relatedFacts.join(', ')})`).join('\n')
    : 'Inga motstridiga uppgifter identifierade.';

  // 5. Informationsluckor
  const infoGapsText = (infoGaps as { length: number }).length > 0
    ? infoGaps.map(g => `[${(g as { id: string }).id}] ${g.description} (Relaterade fakta: ${g.relatedFacts.join(', ')})`).join('\n')
    : 'Inga informationsluckor identifierade.';

  // 6. Praxis- och lagrumskopplingar
  const legalText = (legalReferences as { length: number }).length > 0
    ? legalReferences.map(l => `${l.law} ${l.year}${(l as { section: string | number }).section ? ' ' + (l as { section: string | number }).section : ''} | Kopplade fakta: ${l.linkedFacts.join(', ')}${l.commentary ? ' | Kommentar: ' + l.commentary : ''}`).join('\n')
    : 'Inga lagrum kopplade.';

  // 7. Juridisk bedömning
  const legalAssessment = `Bedömning sker med utgångspunkt från verifierade fakta, identifierade motstridigheter och relevanta lagrum. Eventuell risk för felaktig rättstillämpning framgår av kopplingarna.`

  // 8. Slutsats
  const conclusion = `Slutsatsen summerar kritiska frågor, konflikter och möjliga konsekvenser baserat på ovanstående analys. Alla fakta är spårbara via FACT_ID och lagrum.`

  return {
    caseId,
    createdAt,
    sections: [
      { title: 'Inledning', body: intro },
      { title: 'Metod', body: method },
      { title: 'Faktaredogörelse', body: factsTable },
      { title: 'Motstridiga uppgifter', body: contradictionsText },
      { title: 'Informationsluckor', body: infoGapsText },
      { title: 'Praxis- och lagrumskopplingar', body: legalText },
      { title: 'Juridisk bedömning', body: legalAssessment },
      { title: 'Slutsats', body: conclusion },
    ]
  };
}
