
import { AnalysisResult } from '../lib/fmjam.types';

export const syntheticAnalysisResult: AnalysisResult = {
  id: "analysis_synthetic_001",
  caseId: "Syntetiskt Ärende SoL-FL-BrB",
  createdAt: "2026-01-07T17:52:43Z",
  qaSummary: [],
  documents: [
    {
      id: "doc_001",
      name: "Transkription – Sökande A.H. och Socialtjänsten",
      mimeType: "application/synthetic",
    }
  ],
  atoms: [
    { id: "atom_100", documentId: "doc_001", position: 1, text: "Sökande uppger att hen befinner sig i akut nöd och saknar medel för uppehälle.", keywords: ["akut nöd", "saknar medel", "uppehälle"], tags: ["nöd", "ekonomi"] },
    { id: "atom_150", documentId: "doc_001", position: 2, text: "Sökande uppger att det inte finns mat hemma och att barnet riskerar att fara illa.", keywords: ["barn", "ingen mat", "riskerar att fara illa"], tags: ["barn", "matbrist"] },
    { id: "atom_200", documentId: "doc_001", position: 3, text: "Sökande äger en bil som socialtjänsten anser ska säljas.", keywords: ["bil", "sälja", "tillgång"], tags: ["tillgång", "bil"] },
    { id: "atom_250", documentId: "doc_001", position: 4, text: "Bilen är belånad och har en kreditspärr, vilket hindrar försäljning.", keywords: ["kreditspärr", "belånad bil", "hindrad försäljning"], tags: ["kreditspärr", "tillgång"] },
    { id: "atom_300", documentId: "doc_001", position: 5, text: "Sökande uppger att två olika handläggare lämnat motstridiga muntliga besked om hur bilen ska hanteras.", keywords: ["muntligt besked", "motstridiga instruktioner"], tags: ["kommunikation", "myndighetskontakt"] },
    { id: "atom_350", documentId: "doc_001", position: 6, text: "Sökande uppger att handläggare nekat att fatta ett formellt skriftligt beslut om avslag.", keywords: ["vägran", "skriftligt beslut", "avslag"], tags: ["beslut", "formalia"] },
    { id: "atom_400", documentId: "doc_001", position: 7, text: "Sökande uppger att socialjouren bedömt att den initiala handläggningen inte var korrekt.", keywords: ["socialjour", "felaktig hantering"], tags: ["socialjour", "bedömning"] },
    { id: "atom_450", documentId: "doc_001", position: 8, text: "Kravet på att sälja en kreditspärrad bil har kopplats till lagrummet BrB 10 kap. 4 § i underlaget.", keywords: ["lovligt förfogande", "BrB 10:4", "kreditspärrad bil"], tags: ["straffrätt", "lagrum"] }
  ],
  facts: [
    { id: "fact_01", subject: "Sökande", statement: "befinner sig i en akut nödsituation och saknar medel för uppehälle.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Början av transkription", snippet: "Sökande uppger att hen befinner sig i akut nöd och saknar medel för uppehälle." }, category: 'EKONOMI' },
    { id: "fact_02", subject: "Sökandes barn", statement: "riskerar att fara illa på grund av brist på mat.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Början av transkription", snippet: "Sökande uppger att det inte finns mat hemma och att barnet riskerar att fara illa." }, category: 'BARN' },
    { id: "fact_03", subject: "Sökandes bil", statement: "är belånad och har en kreditspärr, vilket hindrar försäljning.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Mitten av transkription", snippet: "Bilen är belånad och har en kreditspärr, vilket hindrar försäljning." }, category: 'TILLGÅNG' },
    { id: "fact_04", subject: "Sökande", statement: "har fått motstridiga muntliga instruktioner från med två olika handläggare gällande bilen.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Mitten av transkription", snippet: "Sökande uppger att två olika handläggare lämnat motstridiga muntliga besked om hur bilen ska hanteras." }, category: 'PROCESS' },
    { id: "fact_05", subject: "Handläggare", statement: "har enligt uppgift nekat att fatta ett formellt, skriftligt beslut om avslag.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Mitten av transkription", snippet: "Sökande uppger att handläggare nekat att fatta ett formellt skriftligt beslut om avslag." }, category: 'PROCESS' },
    { id: "fact_06", subject: "Socialjouren", statement: "uppgav att den initiala handläggningen inte var korrekt.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Slutet av transkription", snippet: "Sökande uppger att socialjouren bedömt att den initiala handläggningen inte var korrekt." }, category: 'PROCESS' },
    { id: "fact_07", subject: "Kravet att sälja bilen", statement: "har i underlaget kopplats till lagrummet BrB 10 kap. 4 §.", timestamp: "Okänd", source: { documentId: "doc_001", location: "Slutet av transkription", snippet: "Kravet på att sälja en kreditspärrad bil har kopplats till lagrummet BrB 10 kap. 4 § i underlaget." }, category: 'PROCESS' }
  ],
  contradictions: [],
  uncertainties: [],
  legalFrameworkLinks: [
    { id: "lawlink_01", label: "SoL 4 kap. 1 §", references: ["SoL"], relatedFactIds: ["fact_01", "fact_02", "fact_03"] },
    { id: "lawlink_02", label: "SoL 2 kap. 1 §", references: ["SoL"], relatedFactIds: ["fact_06"] },
    { id: "lawlink_03", label: "FL 6 § (Serviceskyldighet)", references: ["FL"], relatedFactIds: ["fact_04", "fact_05"] },
    { id: "lawlink_04", label: "BrB 10 kap. 4 §", references: ["BrB"], relatedFactIds: ["fact_07"] }
  ],
  riskProfile: {
    id: "rp_synthetic_001", caseId: "Syntetiskt Ärende SoL-FL-BrB", totalScore: 285, maxScore: 400, normalizedScore: 71,
    items: [
      { id: "score_RISK-NOD-001", templateId: "RISK-NOD-001", label: "Underlåten nödprövning", severity: 5, likelihood: 5, weight: 1.5, score: 100, triggers: ["theme: nöd", "keyword: akut nöd"], contextFlags: ["NÖD"] },
      { id: "score_RISK-BARN-001", templateId: "RISK-BARN-001", label: "Bristande barnperspektiv", severity: 5, likelihood: 4, weight: 1.6, score: 92, triggers: ["theme: barn", "keyword: barn utan mat"], contextFlags: ["BARN"] },
      { id: "score_RISK-FL6-001", templateId: "RISK-FL6-001", label: "Bristande serviceskyldighet", severity: 3, likelihood: 5, weight: 1.2, score: 54, triggers: ["theme: myndighetsutövning", "law: FL"], contextFlags: ["KOMMUNIKATION"] },
      { id: "score_RISK-TILLGANG-001", templateId: "RISK-TILLGANG-001", label: "Felaktig tillgångsbedömning", severity: 4, likelihood: 4, weight: 1, score: 39, triggers: ["theme: egendom", "keyword: kreditspärr"], contextFlags: [] },
    ],
    dominantRisks: ["Underlåten nödprövning", "Bristande barnperspektiv", "Bristande serviceskyldighet"]
  },
  contextState: {
    caseId: "Syntetiskt Ärende SoL-FL-BrB", flags: { barn: true, nöd: true, förebyggande: false }, detectedCaseTypes: []
  },
  themes: [
    { id: "nöd", label: "Nöd", keywords: ["akut nöd"] },
    { id: "barn", label: "Barn", keywords: ["barn", "ingen mat"] },
    { id: "tillgång", label: "Tillgång", keywords: ["bil", "kreditspärr"] },
    { id: "kommunikation", label: "Kommunikation", keywords: ["muntligt besked"] },
    { id: "process", label: "Process", keywords: ["vägran", "beslut"] }
  ],
  legalReferences: [
    { id: "SoL-1", source: "SoL", rawText: "4 kap. 1 § SoL", contextSnippet: "...enligt 4 kap. 1 § SoL..." },
    { id: "FL-1", source: "FL", rawText: "6 § FL", contextSnippet: "...strider mot 6 § FL..." },
    { id: "BrB-1", source: "BrB", rawText: "10 kap. 4 § BrB", contextSnippet: "...uppmaning till brott enligt 10 kap. 4 § BrB..." }
  ],
  keywordHits: [
    { id: "kw-1", keyword: "akut nöd", atomId: "NÖD", position: 0, snippet: "...akut nöd..." },
    { id: "kw-2", keyword: "ingen mat", atomId: "MAT", position: 80, snippet: "...ingen mat..." },
    { id: "kw-3", keyword: "kreditspärr", atomId: "KREDITSPÄRR", position: 250, snippet: "...kreditspärr..." }
  ],
  oversightClassifications: [
    { body: 'JO', relevance: 'hög', reason: 'Ärendet involverar potentiella brister i myndighetsutövning, inklusive motstridiga besked och vägran att fatta ett formellt beslut, vilket är ett kärnområde för JO.' },
    { body: 'IVO', relevance: 'medel', reason: 'Eftersom ett barn riskerar att fara illa på grund av socialtjänstens hantering av ärendet, kan IVO ha ett tillsynsansvar gällande socialtjänstens skyldigheter mot barn.' }
  ],
  documentationChecks: [
    { ruleId: 'SoL_11_5', status: 'not_applicable', details: 'Regeln är inte tillämplig eftersom texten inte verkar behandla insatser utan individuell behovsprövning.' }
  ],
  priorityFlags: { hasChildAspect: true, isPreventive: false },
  externalLinks: [
    { name: 'Socialtjänstlagen (SoL)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialtjanstlag-2001453_sfs-2001-453/' },
    { name: 'Förvaltningslagen (FL)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forvaltningslag-2017900_sfs-2017-900/' },
    { name: 'Brottsbalken (BrB)', url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/brottsbalk-1962700_sfs-1962-700/' },
    { name: 'Justitieombudsmannen (JO)', url: 'https://www.jo.se/' },
    { name: 'Inspektionen för vård och omsorg (IVO)', url: 'https://www.ivo.se/' }
  ]
};
