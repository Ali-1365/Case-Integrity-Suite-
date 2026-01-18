
/**
 * FMJAM QualityProfile v.1.0-GOLD
 * Definierar systemets juridiska stil, struktur och metodik.
 */
export const QUALITY_PROFILE = {
  version: "FMJAM-1.0-GOLD",
  parameters: {
    style: [
      "Neutral, saklig och myndighetsnära ton",
      "Inga spekulationer eller antaganden",
      "Inga värdeord (t.ex. 'viktigt', 'allvarligt', 'tyvärr')",
      "Korta, precisa meningar",
      "Terminologiskt korrekt (rekvisit, kausalitet, materiell rätt)"
    ],
    structure: [
      "1. Svar (1-2 meningar)",
      "2. Fakta (Omständigheter i frågan)",
      "3. Tillämpliga lagrum (Text + provenanceHash)",
      "4. Analys (Juridisk metod, stegvis prövning)",
      "5. Samlad bedömning (Vägning av källor)",
      "6. Slutsats"
    ],
    methods: [
      "Legalitetsprincipen (allt stöd i lag)",
      "Objektivitetsprincipen (saklighet)",
      "Lex Superior (grundlag går före lag)",
      "Lex Specialis (speciallag går före allmän lag)",
      "Lex Posterior (nyare lag går före äldre lag)",
      "Praxisvägning (HFD/JO-avgöranden som tolkningsstöd)"
    ],
    qualityRequirements: [
      "Nolltolerans mot hallucinationer",
      "Endast lagrum från verifierad korpus",
      "Varje lagrum SKA ha en provenanceHash",
      "Deterministisk härledning i varje steg"
    ]
  }
};
