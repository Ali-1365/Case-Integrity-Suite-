import { AnalysisResult } from '../lib/cis.types';

export const syntheticAnalysisResult: AnalysisResult = {
  id: "analysis_synthetic_001_full_max_critical",
  caseId: "Syntetiskt Ärende SoL 2025:400 – Medvetet tjänstefel, ansvarsomkastning, bevisundertryckande & Lex Sarah",
  createdAt: "2026-03-04T15:47:00Z",
  qaSummary: [
    { id: "qa_01", label: "Systematiska fel", status: "warning", message: "Systematiska och medvetna fel i myndighetsutövning: oriktiga sakuppgifter, bevisundertryckande, cirkulär bevisbörda, ansvarsomkastning (barnet/föräldern lastas för kommunens underlåtenhet)" },
    { id: "qa_02", label: "Ekonomisk skada", status: "warning", message: "Ekonomisk katastrof: skuldsättning, Kronofogden, förlorad försörjning, bilförlust, el/telefon avstängda" },
    { id: "qa_03", label: "Personskada", status: "warning", message: "Personskada: förvärrad CRPS, utebliven rehabilitering, nervskada, suicidtankar, smärtproblematik" },
    { id: "qa_04", label: "Barnrätt", status: "warning", message: "Kränkning av barnets rättigheter: matbrist, osäker bostad, avsaknad av trygghet och kommunikation" },
    { id: "qa_05", label: "Processfel", status: "warning", message: "Processuella fel: vägran att träffa klagande, motstridiga muntliga besked vs journal, dom utan verkställighet" },
    { id: "qa_06", label: "Lex Sarah", status: "warning", message: "Fortsatt akut nödsituation – Lex Sarah-utlösande missförhållanden ej hanterade" },
    { id: "qa_07", label: "FL-täckning", status: "info", message: "Utökad FL-täckning: §§ 5–34 inklusive legalitet (5 §), serviceskyldighet (6 §), utredningsskyldighet (23 §), motivering (32 §), jäv (16–18 §§), överklagande (33 §) och inhibition (34 §)" }
  ],

  documents: [
    { id: "doc_001", name: "Transkription – Sökande A.H. och Socialtjänsten", mimeType: "application/synthetic" },
    { id: "doc_002", name: "Journalanteckningar vs muntliga besked (diskrepans)", mimeType: "application/pdf" },
    { id: "doc_003", name: "Läkarintyg CRPS, nervskada, suicidrisk", mimeType: "application/pdf" },
    { id: "doc_004", name: "Dom – underkännande av bilkrav utan verkställighet", mimeType: "application/pdf" },
    { id: "doc_005", name: "Kronofogden – betalningsföreläggande & utmätning", mimeType: "application/pdf" },
    { id: "doc_006", name: "El/telefon-avstängningsbeslut från leverantör", mimeType: "application/pdf" },
    { id: "doc_007", name: "Förvaltningslagen (2017:900) – fullständiga utdrag §§ 1–34", mimeType: "application/pdf" }
  ],

  atoms: [
    { id: "atom_100", documentId: "doc_001", position: 1, text: "Sökande i akut nöd – saknar medel för uppehälle.", keywords: ["akut nöd"], tags: ["nöd", "ekonomi"], hash: "sha256:7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p" },
    { id: "atom_150", documentId: "doc_001", position: 2, text: "Barnet riskerar att fara illa – ingen mat hemma.", keywords: ["barn", "matbrist"], tags: ["barn", "nödsituation"], hash: "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" },
    { id: "atom_520", documentId: "doc_001", position: 11, text: "Medvetet oriktiga sakuppgifter i journalen – bryter mot dokumentationsplikten (14 kap. 3 § SoL).", tags: ["LexSarah", "medvetet fel"], hash: "sha256:b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7" },
    { id: "atom_560", documentId: "doc_001", position: 15, text: "Ansvarsomkastning: barnet och föräldern lastas för konsekvenserna av kommunens underlåtenhet.", tags: ["ansvarsomkastning", "barnrätt"], hash: "sha256:c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8" },
    { id: "atom_570", documentId: "doc_002", position: 1, text: "Dokumenterad diskrepans mellan handläggarnas muntliga uttalanden och journalföring.", tags: ["motstridiga besked", "journalfusk"], hash: "sha256:d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9" },
    { id: "atom_580", documentId: "doc_003", position: 1, text: "CRPS-rehabilitering förhindrad p.g.a. ekonomisk skada och avstängd el/telefon.", tags: ["personskada", "CRPS"], hash: "sha256:e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0" },
    { id: "atom_590", documentId: "doc_001", position: 16, text: "Suicidtankar och förvärrad smärtproblematik till följd av nödsituationen.", tags: ["personskada", "suicidrisk"], hash: "sha256:f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1" },
    { id: "atom_600", documentId: "doc_004", position: 1, text: "Dom underkänner bilkravet som avslagsgrund – ingen verkställighet.", tags: ["dom", "utebliven verkställighet"], hash: "sha256:g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2" },
    { id: "atom_610", documentId: "doc_001", position: 17, text: "Handläggaren vägrar träffa besökaren/klaganden.", tags: ["vägran möte", "processfel"], hash: "sha256:h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3" },
    { id: "atom_620", documentId: "doc_001", position: 18, text: "El och telefon fortsatt avstängda – akut nödsituation förvärras.", tags: ["nödsituation", "avstängning"], hash: "sha256:i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4" },
    { id: "atom_630", documentId: "doc_003", position: 2, text: "Nervskada, sensibilitet borta i tå 2–4, fotled – sjukskrivning och handikapp.", tags: ["nervskada", "handikapp"], hash: "sha256:j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5" },
    { id: "atom_640", documentId: "doc_001", position: 19, text: "Krav på lagbrott från tjänstemän – bevisbördan cirkulär och omvänd.", tags: ["cirkulär bevisbörda", "tjänstefel"], hash: "sha256:k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" },
    { id: "atom_700", documentId: "doc_005", position: 1, text: "Kronofogden inblandad – betalningsföreläggande p.g.a. kommunens underlåtenhet.", tags: ["Kronofogden", "skuldsättning"], hash: "sha256:l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7" },
    { id: "atom_710", documentId: "doc_001", position: 22, text: "Bilens förlorade värde och uppsägning p.g.a. obetald hyra – orsakad av kommunens fel.", tags: ["bilförlust", "ekonomisk skada"], hash: "sha256:m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8" },
    { id: "atom_720", documentId: "doc_003", position: 3, text: "ADHD-operation försenad p.g.a. ekonomisk kris och stress.", tags: ["ADHD", "försenad vård"], hash: "sha256:n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9" },
    { id: "atom_800", documentId: "doc_007", position: 1, text: "FL 5 § – saklighet och proportionalitet åsidosatt genom oriktiga uppgifter och oproportionerliga krav.", keywords: ["FL5", "saklighet"], tags: ["FL"], hash: "sha256:o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0" },
    { id: "atom_810", documentId: "doc_007", position: 2, text: "FL 6 § – serviceskyldighet grovt åsidosatt genom vägran att träffa i akut nödsituation.", keywords: ["FL6", "serviceskyldighet"], tags: ["FL"], hash: "sha256:p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1" },
    { id: "atom_820", documentId: "doc_007", position: 3, text: "FL 23 § – utredningsskyldighet underlåten trots dokumenterad barnrisk.", keywords: ["FL23", "utredningsskyldighet"], tags: ["FL"], hash: "sha256:q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" },
    { id: "atom_830", documentId: "doc_007", position: 4, text: "FL 32 § – utebliven motivering vid muntliga avslag trots upprepad begäran.", keywords: ["FL32", "motivering"], tags: ["FL"], hash: "sha256:r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3" },
    { id: "atom_840", documentId: "doc_007", position: 5, text: "FL 16–18 §§ – jäv och underlåten jävsanmälan – opartiskhet ifrågasatt.", keywords: ["FL16-18", "jäv"], tags: ["FL"], hash: "sha256:s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4" },
    { id: "atom_850", documentId: "doc_007", position: 6, text: "FL 33 § – underlåten information om överklaganderätt.", keywords: ["FL33", "överklagande"], tags: ["FL"], hash: "sha256:t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5" }
  ],

  facts: [
    { id: "fact_13", subject: "Kommunen", statement: "har medvetet infört oriktiga sakuppgifter och undertryckt bevis.", category: 'TJÄNSTEFEL', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_001", location: "p1", snippet: "Medvetet oriktiga sakuppgifter" } },
    { id: "fact_14", subject: "Barnet / föräldern", statement: "lastas för konsekvenserna av kommunens underlåtenhet (ansvarsomkastning).", category: 'BARN', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_001", location: "p2", snippet: "Ansvarsomkastning" } },
    { id: "fact_15", subject: "Klaganden", statement: "har drabbats av ekonomisk skada (skuldsättning, Kronofogden, förlorad försörjning, bilförlust).", category: 'EKONOMI', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_005", location: "p1", snippet: "Kronofogden" } },
    { id: "fact_16", subject: "Klaganden", statement: "personskada: förhindrad CRPS-rehabilitering, förvärrad smärta, suicidtankar, nervskada.", category: 'PERSONSKADA', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_003", location: "p1", snippet: "CRPS" } },
    { id: "fact_17", subject: "Socialnämnden", statement: "har orsakat fortsatt nödsituation – el/telefon avstängda trots akut behov.", category: 'NÖD', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_006", location: "p1", snippet: "Avstängning" } },
    { id: "fact_18", subject: "Domstolen", statement: "underkänner bilkravet men ingen verkställighet – nytt fel i myndighetsutövning.", category: 'PROCESS', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_004", location: "p1", snippet: "Dom" } },
    { id: "fact_19", subject: "Kommunen", statement: "har skapat cirkulär bevisbörda och omvänd ansvarsfördelning.", category: 'BEVISRÄTT', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_001", location: "p19", snippet: "Cirkulär bevisbörda" } },
    { id: "fact_20", subject: "Barnet", statement: "berövas mat, trygghet, el och kommunikation – direkt kränkning av barnets rättigheter.", category: 'BARN', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_001", location: "p2", snippet: "Barnrätt" } },
    { id: "fact_21", subject: "Kommunen", statement: "har underlåtit utredningsskyldighet enligt FL 23 § trots dokumenterad barnrisk.", category: 'FL', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_007", location: "p3", snippet: "FL 23 §" } },
    { id: "fact_22", subject: "Kommunen", statement: "har lämnat muntliga avslag utan motivering enligt FL 32 §.", category: 'FL', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_007", location: "p4", snippet: "FL 32 §" } },
    { id: "fact_23", subject: "Kommunen", statement: "har underlåtit jävsanmälan enligt FL 18 §.", category: 'FL', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_007", location: "p5", snippet: "FL 18 §" } },
    { id: "fact_24", subject: "Kommunen", statement: "har underlåtit att informera om överklaganderätt enligt FL 33 §.", category: 'FL', timestamp: "2026-03-04T15:47:00Z", source: { documentId: "doc_007", location: "p6", snippet: "FL 33 §" } }
  ],

  contradictions: [
    { id: "contr_01", description: "Muntliga löften om bistånd vs frånvarande i journalen – medveten diskrepans.", conflictingFactIds: ["fact_13", "fact_17"], type: "faktisk", severity: "hög" },
    { id: "contr_02", description: "Dom som underkänner bilkrav vs fortsatt avslag och utmätning hos Kronofogden.", conflictingFactIds: ["fact_15", "fact_18"], type: "faktisk", severity: "hög" },
    { id: "contr_03", description: "Kommunens påstående om sökandens vållande vs dokumenterad underlåtenhet från nämndens sida.", conflictingFactIds: ["fact_13", "fact_19"], type: "rättslig", severity: "hög" },
    { id: "contr_04", description: "Utredning påstås genomförd vs ingen utredning av barnrisk eller medicinska behov (FL 23 §).", conflictingFactIds: ["fact_21", "fact_17"], type: "bedömningsmässig", severity: "hög" },
    { id: "contr_05", description: "Beslut fattat muntligt vs krav på motivering enligt FL 32 §.", conflictingFactIds: ["fact_22", "fact_13"], type: "rättslig", severity: "hög" }
  ],

  uncertainties: [
    { id: "unc_01", description: "Exakt uppsåtsgrad hos enskilda handläggare (krävs för tjänstefel och regress).", relatedFactIds: ["fact_13"], relevantLegalReferenceIds: ["lawlink_brb_20_1"] },
    { id: "unc_02", description: "Orsakssamband mellan kommunens fel och CRPS-förvärring (läkarutlåtande krävs).", relatedFactIds: ["fact_16"], relevantLegalReferenceIds: ["lawlink_skl_3_2"] },
    { id: "unc_03", description: "Preskriptionstidens början vid fortsatt nödsituation (varje ny skada?).", relatedFactIds: ["fact_17"], relevantLegalReferenceIds: ["lawlink_skl_3_2"] },
    { id: "unc_04", description: "Uppsåtsgrad vid underlåten jävsanmälan enligt FL 18 §.", relatedFactIds: ["fact_23"], relevantLegalReferenceIds: ["lawlink_fl_16_18"] },
    { id: "unc_05", description: "Om utebliven motivering enligt FL 32 § i sig utgör självständigt fel enligt SkL 3:2.", relatedFactIds: ["fact_22"], relevantLegalReferenceIds: ["lawlink_fl_32"] }
  ],

    legalFrameworkLinks: [
        { id: "lawlink_sol_4_1", label: "Socialtjänstlagen (2025:400) 4 kap. 1 § – yttersta ansvar", references: ["SoL"], relatedFactIds: ["fact_15", "fact_17"] },
        { id: "lawlink_sol_3_1", label: "Socialtjänstlagen (2025:400) 3 kap. 1 § – barnets bästa", references: ["SoL"], relatedFactIds: ["fact_14", "fact_20"] },
        { id: "lawlink_sol_27_lexsarah", label: "Socialtjänstlagen (2025:400) 27 kap. – Lex Sarah", references: ["SoL"], relatedFactIds: ["fact_13"] },
        { id: "lawlink_fl_5", label: "Förvaltningslagen 5 § – saklighet, opartiskhet, proportionalitet", references: ["FL"], relatedFactIds: ["fact_13", "fact_21"] },
        { id: "lawlink_fl_6", label: "Förvaltningslagen 6 § – serviceskyldighet", references: ["FL"], relatedFactIds: ["fact_17"] },
        { id: "lawlink_fl_23", label: "Förvaltningslagen 23 § – utredningsskyldighet", references: ["FL"], relatedFactIds: ["fact_21"] },
        { id: "lawlink_fl_32", label: "Förvaltningslagen 32 § – motivering av beslut", references: ["FL"], relatedFactIds: ["fact_22"] },
        { id: "lawlink_fl_16_18", label: "Förvaltningslagen 16–18 §§ – jäv och jävsanmälan", references: ["FL"], relatedFactIds: ["fact_23"] },
        { id: "lawlink_fl_33", label: "Förvaltningslagen 33 § – överklagande och besvärsrätt", references: ["FL"], relatedFactIds: ["fact_24"] },
        { id: "lawlink_skl_3_2", label: "Skadeståndslagen 3 kap. 2 § – fel i myndighetsutövning", references: ["SkL"], relatedFactIds: ["fact_15", "fact_16"] },
        { id: "lawlink_brb_20_1", label: "Brottsbalken 20 kap. 1 § – tjänstefel", references: ["BrB"], relatedFactIds: ["fact_13", "fact_19"] }
    ],

  riskProfile: {
    id: "rp_synthetic_001_extreme",
    caseId: "Syntetiskt Ärende SoL 2025:400",
    totalScore: 1180,
    maxScore: 700,
    normalizedScore: 168.6,
    items: [
      { id: "score_LEXSARAH-003", templateId: "LEX-SARAH", label: "Medvetet oriktiga uppgifter + systematiska Lex Sarah-missförhållanden", severity: 5, likelihood: 5, weight: 2.5, score: 180 },
      { id: "score_SKL-3-2-002", templateId: "SKL-3-2", label: "Fel i myndighetsutövning orsakat personskada + ekonomisk katastrof", severity: 5, likelihood: 5, weight: 2.4, score: 170 },
      { id: "score_BARNKONV-002", templateId: "BARNKONV", label: "Grovt kränkande ansvarsomkastning – barnets rättigheter åsidosatta", severity: 5, likelihood: 5, weight: 2.3, score: 165 },
      { id: "score_TJÄNSTEFEL-002", templateId: "TJÄNSTEFEL", label: "Medvetet underlåtenhet i akut nödsituation + tjänstefel", severity: 5, likelihood: 5, weight: 2.2, score: 160 },
      { id: "score_BEVISEVIDENS-001", templateId: "BEVIS", label: "Bevisundertryckande + cirkulär bevisbörda", severity: 5, likelihood: 4, weight: 2.1, score: 147 },
      { id: "score_FL-23-001", templateId: "FL", label: "Underlåten utredningsskyldighet (FL 23 §)", severity: 5, likelihood: 5, weight: 2.2, score: 165 },
      { id: "score_FL-32-001", templateId: "FL", label: "Utebliven motivering (FL 32 §)", severity: 4, likelihood: 5, weight: 2.0, score: 140 },
      { id: "score_FL-16-18-001", templateId: "FL", label: "Jävsbrott och underlåten anmälan (FL 16–18 §§)", severity: 4, likelihood: 4, weight: 2.1, score: 130 }
    ],
    dominantRisks: [
      "Medvetet tjänstefel & bevisundertryckande",
      "Grovt kränkande ansvarsomkastning och barnrättsbrott",
      "SkL 3:2-ansvar för personskada och ekonomisk skada",
      "Lex Sarah-utlösande systematiska missförhållanden",
      "FL 23 § – underlåten utredningsskyldighet",
      "FL 32 § – utebliven motivering",
      "FL 16–18 §§ – jävsbrott"
    ]
  },

  matchedRules: [
    { ruleId: "MYND-01", title: "Tjänstefel/fel i myndighetsutövning", confidence: 0.99, triggeredBy: ["fact_13", "fact_19"] },
    { ruleId: "SD-08", title: "Systemfel och tjänstefel", confidence: 0.99, triggeredBy: ["fact_13", "fact_14", "fact_19"] },
    { ruleId: "HF-09", title: "Handläggningsfel (systematiska)", confidence: 0.98, triggeredBy: ["fact_13", "fact_17"] },
    { ruleId: "SOL-LSS-01", title: "Fel i bistånd/insats-bedömning", confidence: 0.97, triggeredBy: ["fact_15", "fact_20"] },
    { ruleId: "PROC-02", title: "Kommunicering/delgivning/jäv – process", confidence: 0.98, triggeredBy: ["fact_18"] },
    { ruleId: "FL-05", title: "Saklighet, opartiskhet, proportionalitet (FL 5 §)", confidence: 0.99, triggeredBy: ["fact_13", "fact_21"] },
    { ruleId: "FL-23", title: "Utredningsskyldighet (FL 23 §)", confidence: 0.98, triggeredBy: ["fact_21"] },
    { ruleId: "FL-32", title: "Motivering av beslut (FL 32 §)", confidence: 0.97, triggeredBy: ["fact_22"] },
    { ruleId: "FL-16-18", title: "Jäv och jävsanmälan (FL 16–18 §§)", confidence: 0.95, triggeredBy: ["fact_23"] },
    { ruleId: "FL-33", title: "Överklagande och besvärsrätt (FL 33 §)", confidence: 0.94, triggeredBy: ["fact_24"] }
  ],

  documentationChecks: [
    { ruleId: '14kap_3_SoL', status: 'fail', details: 'Medvetet oriktiga sakuppgifter – dokumentationsplikt grovt åsidosatt' },
    { ruleId: 'LexSarah_27kap_1-3', status: 'fail', details: 'Missförhållanden ej rapporterade till IVO – Lex Sarah-skyldighet underlåten' },
    { ruleId: 'SkL_3_2', status: 'fail', details: 'Fel i myndighetsutövning – personskada + ekonomisk skada' },
    { ruleId: 'BrB_20_1', status: 'not_applicable', details: 'Tjänstefel vid medvetet oriktiga uppgifter – uppsåt utreds' },
    { ruleId: 'FL_5', status: 'fail', details: 'Saklighets- och proportionalitetsbrott – medvetet oriktiga uppgifter' },
    { ruleId: 'FL_23', status: 'fail', details: 'Underlåten utredningsskyldighet – barnrisk och medicinska behov ej utredd' },
    { ruleId: 'FL_32', status: 'fail', details: 'Utebliven motivering vid muntliga avslag' },
    { ruleId: 'FL_16-18', status: 'not_applicable', details: 'Underlåten jävsanmälan – opartiskhet ifrågasatt' }
  ],

  priorityFlags: {
    hasChildAspect: true,
    isPreventive: false,
    lexSarahPotential: true,
    conventionViolation: true,
    sklLiability: true,
    acuteEmergency: true,
    consciousMisconduct: true,
    evidenceSuppression: true,
    responsibilityReversal: true,
    kronofogdenInvolved: true,
    flSaklighet: true,
    flUtredning: true,
    flMotivering: true,
    flJav: true
  },

  evidenceChain: [
    { id: "ev_01", factId: "fact_13", legalReferenceId: "lawlink_brb_20_1", strength: 0.99, reasoning: "Muntliga löften om bistånd → saknas i journal → bevisundertryckande" },
    { id: "ev_02", factId: "fact_18", legalReferenceId: "lawlink_skl_3_2", strength: 0.98, reasoning: "Dom underkänner bilkrav → ingen verkställighet → fortsatt utmätning hos Kronofogden" },
    { id: "ev_03", factId: "fact_16", legalReferenceId: "lawlink_skl_3_2", strength: 0.97, reasoning: "Läkarintyg CRPS + nervskada → utebliven rehabilitering → förvärrad personskada" },
    { id: "ev_04", factId: "fact_20", legalReferenceId: "lawlink_sol_3_1", strength: 0.96, reasoning: "Barnet utan mat/el/telefon → kommunens underlåtenhet → ansvarsomkastning" },
    { id: "ev_05", factId: "fact_13", legalReferenceId: "lawlink_fl_5", strength: 0.99, reasoning: "FL 5 § – saklighetsbrott genom medvetet oriktiga uppgifter" },
    { id: "ev_06", factId: "fact_21", legalReferenceId: "lawlink_fl_23", strength: 0.98, reasoning: "FL 23 § – underlåten utredningsskyldighet → barnrisk och medicinska behov ignorerade" },
    { id: "ev_07", factId: "fact_22", legalReferenceId: "lawlink_fl_32", strength: 0.97, reasoning: "FL 32 § – utebliven motivering → muntliga avslag utan skriftlig grund" },
    { id: "ev_08", factId: "fact_23", legalReferenceId: "lawlink_fl_16_18", strength: 0.95, reasoning: "FL 16–18 §§ – jävsbrott → underlåten anmälan av opartiskhetsfråga" }
  ],

  externalLinks: [
    { name: 'Socialtjänstlagen (2025:400)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialtjanstlag-2025400_sfs-2025-400/' },
    { name: 'Förvaltningslagen (2017:900)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forvaltningslag-2017900_sfs-2017-900/' },
    { name: 'Skadeståndslagen (1972:207)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/skadestandslag-1972207_sfs-1972-207/' },
    { name: 'IVO – Lex Sarah-anmälan', url: 'https://www.ivo.se/lex-sarah/' },
    { name: 'JO – anmälan om myndighetsfel', url: 'https://www.jo.se/anmal/' },
    { name: 'Kronofogden – betalningsföreläggande', url: 'https://www.kronofogden.se/' }
  ],
  contextState: {
    caseId: "Syntetiskt Ärende SoL 2025:400",
    flags: { isCritical: true, hasChild: true },
    detectedCaseTypes: ['PROCESS_MYNDIGHETSUTÖVNING', 'BARNAVÅRD', 'EKONOMISKT_BISTÅND']
  },
  themes: [
    { id: "theme_01", label: "Tjänstefel", keywords: ["oriktiga uppgifter", "bevisundertryckande"] },
    { id: "theme_02", label: "Barnrätt", keywords: ["barnrisk", "ansvarsomkastning"] }
  ],
  legalReferences: [
    { id: "ref_01", source: "FL", rawText: "FL 5 §", contextSnippet: "Saklighet och proportionalitet" },
    { id: "ref_02", source: "SoL", rawText: "SoL 2025:400", contextSnippet: "Ny socialtjänstlag" }
  ]
};

// UTÖKAD VALIDERINGSFUNKTION
export function validateAnalysisResult(result: AnalysisResult): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!result.id) errors.push("Saknar id");
  if (!result.caseId) errors.push("Saknar caseId");
  if (!result.createdAt) errors.push("Saknar createdAt");
  if (!Array.isArray(result.qaSummary) || result.qaSummary.length === 0) errors.push("qaSummary måste vara en icke-tom array");

  if (!Array.isArray(result.atoms)) errors.push("atoms måste vara en array");
  result.atoms.forEach((atom, i) => {
    if (atom.text.includes("FL") && !atom.tags?.includes("FL")) errors.push(`atoms[${i}]: FL-referens saknar tag "FL"`);
  });

  if (!Array.isArray(result.facts)) errors.push("facts måste vara en array");
  result.facts.forEach((fact, i) => {
    if (fact.category === 'FL' && !fact.statement.includes("FL")) errors.push(`facts[${i}]: FL-fact saknar paragrafhänvisning`);
  });

  if (result.riskProfile && result.riskProfile.normalizedScore > 200) errors.push("riskProfile: normalizedScore ovanligt hög (>200)");

  const hasFLFlag = result.priorityFlags.flSaklighet || result.priorityFlags.flUtredning || result.priorityFlags.flMotivering || result.priorityFlags.flJav;
  if (result.legalFrameworkLinks.some(l => l.references.includes("FL")) && !hasFLFlag) errors.push("priorityFlags saknar FL-flaggor trots FL-referenser");

  return { isValid: errors.length === 0, errors };
}

// JO-ANMÄLAN (färdig text)
export const joAnmalanText = `Till Justitieombudsmannen (JO)

Ärende: Systematiska fel i myndighetsutövning enligt Förvaltningslagen (2017:900) §§ 5, 6, 23, 32, 16–18 och 33.

Anmälan görs av: [Ditt namn]

Kommunen har begått grova fel:
- FL 5 §: Saklighet och proportionalitet åsidosatt genom oriktiga uppgifter och ansvarsomkastning.
- FL 6 §: Serviceskyldighet grovt åsidosatt genom vägran att träffa klagande.
- FL 23 §: Utredningsskyldighet underlåten trots barnrisk.
- FL 32 §: Utebliven motivering vid muntliga avslag.
- FL 16–18 §§: Jävsförhållanden ej anmälda.
- FL 33 §: Underlåten information om överklaganderätt.

Dessa fel har orsakat personskada och ekonomisk katastrof. Hemställan om utredning och åtgärder.

Bilagor: [lista]`;


// LEX SARAH-ANMÄLAN TILL IVO (färdig text)
export const lexSarahAnmalanText = `Till Inspektionen för vård och omsorg (IVO) – Lex Sarah-anmälan

Ärende: Missförhållanden som innebär fara för barnets hälsa och utveckling enligt SoL 27 kap.

Anmälan görs av: [Ditt namn]

Kommunen har underlåtit:
- FL 23 §: Utredningsskyldighet
- FL 6 §: Serviceskyldighet
- FL 5 §: Saklighet och proportionalitet
- FL 32 §: Motivering

Missförhållandena utgör fara för barnet (matbrist, elavstängning, CRPS-förvärring). Hemställan om utredning och åtgärder.

Bilagor: [lista]`;