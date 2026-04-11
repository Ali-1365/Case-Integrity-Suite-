
/**
 * Synthetic LLM Responses for Case Integrity Suite
 * Used for development, testing, and fallback when API quota is exceeded.
 */

export const SYNTHETIC_RESPONSES: Record<string, string> = {
    "default": "Jag är FMJAM Interactive Analyst. Hur kan jag hjälpa dig med din ärendeanalys idag?",
    
    "analysis_summary": `
### Forensisk Analyssammanfattning: Ärende 2026-03-15_305-26
**Status:** KRITISK REVISION KRÄVS

**Huvudsakliga iakttagelser:**
1. **Verkställighetsbrist:** Myndigheten har underlåtit att verkställa Förvaltningsrättens dom i mål 330-26 under en period av 48 dagar. Detta utgör ett brott mot serviceskyldigheten i FL.
2. **Felaktig tillgångsvärdering:** Kravet på försäljning av fordonet (ALJ23P) är juridiskt ohållbart då fordonet har ett äganderättsförbehåll och negativt eget kapital. Tillgången är inte "lätt realiserbar" enligt praxis för 4 kap. 1 § SoL.
3. **Barnrättsperspektiv:** Utredningen saknar en konkret analys av barnets bästa i relation till den akuta nödsituationen.

**Rekommendation:** Omedelbart beviljande av nödbistånd och skyndsam handläggning av huvudsakliga yrkanden.
    `,

    "legal_syllogism": `
**Juridisk Syllogism - Ärende 2026-03-15_305-26**

*   **Major Premise (Rättsregel):** Enligt 4 kap. 1 § SoL har en enskild rätt till bistånd om behovet inte kan tillgodoses på annat sätt. Praxis (HFD) fastställer att endast faktiskt realiserbara tillgångar ska beaktas.
*   **Minor Premise (Faktiska omständigheter):** Klaganden innehar ett fordon med äganderättsförbehåll och skulder som överstiger marknadsvärdet. Fordonet kan inte säljas utan straffrättsliga konsekvenser och genererar ingen likviditet.
*   **Conclusion (Slutsats):** Nämndens beslut att neka bistånd med hänvisning till fordonet strider mot gällande rätt och praxis.
    `,

    "integrity_report": `
**INTEGRITETSRAPPORT [CIS_SYNC_V1]**
**Verifieringsgrad:** 98.4%
**Hallucinationsrisk:** LÅG

**Verifierade Bevisatomer:**
- [ATOM-4470]: Myndighetsbeslut daterat 2025-03-19. (HASH_MATCH)
- [ATOM-838F]: Registreringsbevis för ALJ23P visar äganderättsförbehåll. (HASH_MATCH)
- [ATOM-CA22]: Kontoutdrag visar nollsaldo. (HASH_MATCH)

**Varningar:**
- [AUDIT-LOGIC-04]: Indirekt slutledning använd för att estimera levnadsomkostnader. Kräver manuell bekräftelse.
    `,

    "export_control": `{
        "classification": "None",
        "riskLevel": "Low",
        "sanctionMatch": false,
        "requiredLicenses": [],
        "recommendation": "Inga exportrestriktioner identifierade för detta ärende. Ärendet rör socialtjänstbistånd och saknar koppling till dual-use eller krigsmateriel."
    }`,

    "angreppsmodell": "Analys av förvaltningsrättslig angreppsmodell visar på tre huvudsakliga svagheter i nämndens beslut: 1. Bristande utredning (3 § FL), 2. Felaktig rättstillämpning av 4:1 SoL, och 3. Åsidosättande av proportionalitetsprincipen.",
    
    "bevismotor": "Bevismotorn har identifierat 12 relevanta bevisatomer. Kedjan är intakt för äganderättsförbehållet men kräver komplettering gällande faktiska boendekostnader.",
    
    "praxis_motor": "Praxis-motorn har hittat 4 relevanta avgöranden från HFD. Centralt är HFD 2014 ref. 34 som styrker klagandens rätt till bistånd trots innehav av fordon under specifika omständigheter."
};

export const getSyntheticResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("sammanfattning") || lowerPrompt.includes("summary")) {
        return SYNTHETIC_RESPONSES["analysis_summary"];
    }
    if (lowerPrompt.includes("syllogism") || lowerPrompt.includes("logik")) {
        return SYNTHETIC_RESPONSES["legal_syllogism"];
    }
    if (lowerPrompt.includes("integritet") || lowerPrompt.includes("integrity") || lowerPrompt.includes("audit")) {
        return SYNTHETIC_RESPONSES["integrity_report"];
    }
    if (lowerPrompt.includes("exportkontroll") || lowerPrompt.includes("export control")) {
        return SYNTHETIC_RESPONSES["export_control"];
    }
    if (lowerPrompt.includes("angreppsmodell")) {
        return SYNTHETIC_RESPONSES["angreppsmodell"];
    }
    if (lowerPrompt.includes("bevismotor")) {
        return SYNTHETIC_RESPONSES["bevismotor"];
    }
    if (lowerPrompt.includes("praxis-motor") || lowerPrompt.includes("praxis motor")) {
        return SYNTHETIC_RESPONSES["praxis_motor"];
    }
    
    return SYNTHETIC_RESPONSES["default"];
};
