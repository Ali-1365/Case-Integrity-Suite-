# VITBOK: FMJAM-ARKITEKTUREN (v.1.0-GOLD)
**Metodik för deterministiskt juridiskt beslutsstöd och forensisk spårbarhet**

## A. Syfte och målbild
FMJAM (Forensic Multi-Jurisdictional Analysis Method) är en systemarkitektur och juridisk metod framtagen för att lösa gapet mellan generativ AI och kraven på rättssäkerhet i myndighetsutövning. Modellen adresserar utmaningarna med "black box"-logik genom att ersätta osäkra förutsägelser med en obruten, deterministisk härledningskedja.

Syftet är att ge handläggare och beslutsfattare ett kraftfullt verktyg som stärker transparensen, objektiviteten och spårbarheten i enlighet med Förvaltningslagen (FL) och Socialtjänstlagen (SoL 2025:400).

## B. Grundprinciper
Arkitekturen vilar på sex fundamentala pelare:

1.  **Determinism:** Samma rättsliga ingångsvärden och bevisatomer ska genom systemets logiska motorer leda till samma strukturerade förslag.
2.  **Proveniens:** Varje påstående, riskflagg eller beslutsutkast är låst mot en specifik käll-hash (SHA-256) i originalmaterialet.
3.  **Auditabilitet:** Varje steg i processen loggas i en oföränderlig revisionskedja (Audit Trail).
4.  **Modularitet:** Systemet är uppbyggt av diskreta motorer (Ingestion, Reasoning, Risk, Decision) som kan valideras oberoende av varandra.
5.  **Neutralitet:** Motorn är kalibrerad för att exekvera juridisk metod utan värderande språk eller spekulation.
6.  **Rättskällehierarki:** Systemet tillämpar strikt Lex Superior, där grundlag och konventioner (t.ex. Barnkonventionen) styr tolkningen av materiell lag.

## C. Datamodell och ID-kedja
FMJAM använder en unik, länkad ID-struktur för att garantera att inga data kan manipuleras eller "tappas bort" under analysens gång:

-   **queryId:** Den initiala frågeställningen.
-   **caseId:** Ärendets unika behållare.
-   **reasoningId:** Den specifika juridiska motiveringens avtryck.
-   **consolidationId:** Sammanvägningen av lagrum och praxis.
-   **riskId:** Resultatet av normkonfliktsanalysen.
-   **decisionId:** Det genererade beslutsutkastet.
-   **journalEntryId:** Den formella noteringen i händelseloggen.

Dessa objekt binds samman genom kryptografiska hashar, vilket skapar en digital beviskedja (Chain of Custody) från första fråga till slutgiltig diff.

## D. FMJAM-faserna (FAS 1–16)
Systemet har utvecklats genom 16 faser, uppdelade i fyra funktionella lager:

### Lager 1: Rättskälleinhämtning & motivering (FAS 1–10)
Fokus ligger på att extrahera "bevisatomer" från dokument, rensa brus (Denoising) och matcha dessa mot ett verifierat lagbibliotek (Ground Truth). Genom "Adversarial Logic" granskas varje påstående kritiskt innan det accepteras i kedjan. Slutprodukten är en kalibrerad juridisk motivering.

### Lager 2: Konsolidering & risk (FAS 11)
Här sker sammanvägningen av olika rättskällor. Systemet identifierar aktivt normkonflikter (t.ex. när en speciallag krockar med en allmän lag) och värderar den rättsliga risken (Grön/Gul/Röd).

### Lager 3: Beslut, proportionalitet & åtgärder (FAS 12–14)
I detta lager genereras ett formellt beslutsutkast. Förslaget prövas automatiskt mot en 5-stegsmodell för proportionalitet (Justice Guard) för att säkra att ingreppet mot den enskilde är lagligt, lämpligt och nödvändigt. Systemet föreslår även korrigerande åtgärder för att minimera rättsliga risker.

### Lager 4: Ärende, journal, version & diff (FAS 15–16)
Det slutgiltiga lagret hanterar ärendets livscykel. Här sker automatisk journalföring (FL 27 §) och versionshantering. En deterministisk diff-motor förklarar exakt vad som ändrats mellan två beslutsutkast och vilken rättslig betydelse ändringen har.

## E. End-to-end-flöde
Processen följer en linjär och verifierbar väg:
1.  **Ingestion:** Källmaterial läses in och segmenteras i hashad data.
2.  **RAG-analys:** Data matchas mot "LOCKED" juridisk kontext.
3.  **Reasoning:** Juridisk logik appliceras och förklaras.
4.  **Consolidation:** Risker och normkonflikter flaggas.
5.  **Strategy:** Beslut utformas och proportionalitetsprövas.
6.  **Persistence:** Ärendet sparas, journalförs och versionsstämplas.
7.  **Review:** Beslutsfattaren granskar diffen mellan versioner för att förstå utvecklingen.

## F. Rättslig grund
FMJAM stärker rättssäkerheten genom att stödja fundamentala rättsprinciper:
-   **Legalitetsprincipen:** Säkerställer att varje förslag har stöd i lag.
-   **Objektivitetsprincipen:** Eliminerar godtycklighet genom källstyrd analys.
-   **Motiveringsskyldigheten:** Genererar djupa, källhänvisade resonemang för varje ställningstagande.
-   **Barnets bästa:** Inkluderar barnrättslig analys som en obligatorisk parameter i nödprövningar.

## G. Revisionsspår (Audit Trail)
Systemet uppfyller högsta krav på dokumentation och kontroll. En revisor kan i efterhand följa varje beslut bakåt till de exakta meningar i källdokumenten som låg till grund för bedömningen. Genom "Beslutsjournalen" skapas en kronologisk berättelse om ärendets mognad och de juridiska vägval som gjorts.

## H. Systemets mognadsgrad
FMJAM är efter FAS 16 en funktionellt komplett arkitektur för juridiskt beslutsstöd. Den är redo för drift i miljöer där kraven på transparens och oföränderlighet är absoluta. Modellen möjliggör en hög grad av automatisering utan att förlora den mänskliga kontrollen, då systemet fungerar som en "Oracle" – en rådgivare vars slutsatser alltid är fullt bevisbara.

## I. Nästa steg
Den framtida utvecklingen av FMJAM-ekosystemet inkluderar:
-   **Controller-lager:** Övergripande kvalitetskontroll av flera samtidiga ärenden.
-   **Multi-ärende-dashboard:** Aggregerad statistik över rättsliga risker på verksamhetsnivå.
-   **KPI-motor:** Mätning av handläggningstider och rättssäkerhets-score.
-   **Governance-modell:** Formella ramverk för hur FMJAM-logiken uppdateras vid lagändringar.

---
**FMJAM – Forensic Multi-Jurisdictional Analysis Method**
*Status: FAS 16 COMPLETE | GOLD EDITION*
*SFS 2025:400 Compliant*