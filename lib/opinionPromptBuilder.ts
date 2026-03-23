
import { OpinionConfig } from '../types';
import { AnalysisResult } from './cis.types';

export class OpinionPromptBuilder {
  buildPrompt(analysis: AnalysisResult, config: OpinionConfig): string {
    const axioms = `
**JURIDISK AI-KÄRNA - FMJAM GOLD EDITION - ABSOLUTA AXIOM**
1. **KÄLLTVÅNG (STRICT GROUNDING)**: Varje påstående SKA inledas med en pinpoint-referens [KÄLLA: ID]. Du får INTE hitta på fakta.
2. **ZERO SPEKULATION**: Om data saknas för ett lagrum eller bevissteg, skriv [INFORMATION_GAP: Beskrivning]. Gissa aldrig.
3. **STRUKTUR**: Använd strikt formella rubriker. Inga inledande artigheter.
4. **TON**: Använd en strikt juridisk och formell ton (Domarstil).
5. **INGEN SAMMANFATTNING**: Producera enbart det juridiska yttrandet. Inga analyser av ditt eget arbete eller sammanfattningar.
6. **BEVISVÄRDERING (8-STEGSMODELLEN)**: Följ strikt 8-stegsmodellen enligt RB 35-38 kap:
   - Steg 1: Identifiering av bevisfakta.
   - Steg 2: Prövning av bevisets relevans.
   - Steg 3: Bedömning av bevisets äkthet.
   - Steg 4: Analys av bevisets styrka (isolerat).
   - Steg 5: Kontroll mot motbevisning.
   - Steg 6: Sammanvägd bevisstyrka.
   - Steg 7: Tillämpning av beviskrav (t.ex. "styrkt", "sannolikt").
   - Steg 8: Slutsats i bevisfrågan.
7. **INTEGRITET**: Varje avsnitt ska kunna verifieras mot den forensiska kedjan.
    `;

    const contextData = {
        caseId: analysis.caseId,
        facts: analysis.facts.map(f => ({ id: f.id, text: f.statement, source: f.source.snippet, hash: f.id })), // Using ID as placeholder for hash in prompt
        laws: analysis.legalReferences.map(l => ({ id: l.id, ref: l.rawText, text: l.contextSnippet })),
        risks: analysis.riskProfile.dominantRisks,
        audit: analysis.audit,
        integrityChain: analysis.atoms?.map(a => a.id) || []
    };

    const templateSpecifics = config.templateId === 'FORENSIC_DETAILED_V1' 
        ? "PRODUCERA: En fullständig domstolsinlaga med tabellöversikt över bevisläget."
        : "PRODUCERA: Ett formellt juridiskt yttrande optimerat för myndighetskommunikation.";

    return `
DU ÄR FMJAM SENIOR ORACLE v.7.2 (ANTI-HALLUCINATION MODE).
${axioms}

${templateSpecifics}

**INDATA (LOCKED CONTEXT - ENDA TILLÅTNA KÄLLA):**
\`\`\`json
${JSON.stringify(contextData, null, 2)}
\`\`\`

**INSTRUKTION:**
Generera yttrandet baserat ENBART på ovanstående data. Om en uppgift inte finns i "INDATA", får den inte nämnas.

**YTTRANDE (FORMATERAT I MARKDOWN):**
`;
  }
}
