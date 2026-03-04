export const LEGAL_FRAMEWORK_MD = `
# Juridiskt Ramverk för Case Integrity Suite Analysis Engine v.6.2.2-GOLD

## 1. Syfte och Omfattning
Detta ramverk reglerar den tekniska och juridiska analysprocessen inom applikationen med fullt fokus på **Socialtjänstlagen (SFS 2025:400)**. Syftet är att säkerställa att alla automatiserade analyser sker i enlighet med gällande rätt och den senaste praxisen.

## 2. Den Nya Socialtjänstlagen (Ground Truth)
Systemet är konfigurerat för att identifiera och tillämpa bestämmelser från följande källor:

*   **Socialtjänstlagen (2025:400) - SoL:** Portalparagraf (1:1), Barnets bästa (1:2), Kommunens yttersta ansvar (2:1), Informationsskyldighet (3:1), Rätt till bistånd (4:1), Dokumentationsskyldighet (11:5), Aktinsyn (11:8) och Lex Sarah (16:6).
*   **Förvaltningslagen (2017:900) - FL:** Legalitet (§ 5), Serviceskyldighet (§ 6), Saklighet (§ 9), Jäv (§ 11), Officialprincip (§ 23), Kommunikation (§ 25) och Motivering (§ 31).
*   **Regeringsformen (1974:152) - RF:** Det allmännas ansvar för välfärd (1:2).
*   **Brottsbalken (1962:700) - BrB:** Tjänstefel (20:1) och Olovligt förfogande (10:4).
*   **Barnkonventionen (SFS 2018:1197):** Barnets bästa (art. 3) och rätten att bli hörd (art. 12).
*   **Vägledande Praxis:** Inkluderar avgöranden från HFD, RÅ, JO och Kammarrätten rörande individuell prövning, akut hemlöshet och proportionalitet.

## 3. Deterministiska Axiom för v.6.2
Analysmotorn opererar utifrån strikta säkerhetsregler:

1.  **Legalitetskontroll:** Varje risk som flaggas ska kunna härledas till ett specifikt lagrum eller förarbete.
2.  **Källtvång:** AI-motorn får aldrig referera till fakta utan ett ordagrant citat från källdokumentet.
3.  **Prioriteringslogik:** Ärenden som rör barn (BARN) eller akut nöd (NÖD) tilldelas automatiskt högsta prioritet via kontextvikter (multiplikator 1.75 - 1.85).
4.  **Versionslås:** Alla laghänvisningar valideras mot 2025-standard. Gamla referenser (t.ex. SoL 2001) flaggas som "OBSOLETE" om händelsen sker efter reformen.

## 4. Kvalitetssäkring (QA)
Systemet kör realtidsvalidering av:
- Dokumentationsstöd enligt 11 kap. 5 § SoL.
- Motivationsskyldighet vid avslag av nödbistånd.
- Korrekta pinpoint-referenser till SFS 2025:400.

*Senast reviderad: 2026-01-11*
*Version: 6.2.2-GOLD-COMPLIANT*
`;