
import { OpinionConfig } from '../types';
import { AnalysisResult } from './cis.types';

export class OpinionPromptBuilder {
  buildPrompt(analysis: AnalysisResult, config: OpinionConfig): string {
    const axioms = `
**JURIDISK AI-KÄRNA - FMJAM GOLD EDITION - ABSOLUTA AXIOM**
1. **KÄLLTVÅNG (STRICT GROUNDING)**: Varje påstående SKA inledas med en pinpoint-referens [KÄLLA: ID] eller [ARKIV: ID]. Du får INTE hitta på fakta.
2. **ZERO SPEKULATION**: Om data saknas för ett lagrum, skriv [INFORMATION_GAP: Beskrivning]. Gissa aldrig.
3. **STRUKTUR**: Använd strikt formella rubriker. Inga inledande artigheter ("Här är ditt yttrande...").
4. **ADVERSARIAL CHECK**: Beakta Adjudicator-kritiken: ${JSON.stringify(analysis.audit?.checks || [])}.
5. **TERMINOLOGI**: Använd korrekt juridisk svenska (t.ex. "rekvisit", "kausalitet", "men", "skälig").
    `;

    const contextData = {
        caseId: analysis.caseId,
        facts: analysis.facts.map(f => ({ id: f.id, text: f.statement, source: f.source.snippet })),
        laws: analysis.legalReferences.map(l => ({ id: l.id, ref: l.rawText, text: l.contextSnippet })),
        risks: analysis.riskProfile.dominantRisks,
        audit: analysis.audit
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
