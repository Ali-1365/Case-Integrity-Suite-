import { RiskTemplate } from '../lib/riskEngineV6.types';

export const riskTemplateRegistry: RiskTemplate[] = [
    {
        id: "RISK-NOD-001",
        name: "Kritisk underlåtenhet vid nödprövning",
        description: "Identifierar risker där en nödsituation (mat, boende) inte prövas korrekt enligt 4 kap. 1 § SoL 2025, vilket hotar den enskildes existens.",
        triggers: {
          keywords: ["nödbistånd", "akut nöd", "ingen mat", "tomt kylskåp", "ingenstans att bo", "nödprövning", "existensminimum"],
          themes: ["NÖD", "AKUT", "MAT", "FÖRSÖRJNING"],
          legalSourceCodes: ["SoL", "PSA"],
        },
        severity: 5,
        likelihood: 5,
        contextWeights: { "NÖD": 1.8, "HÄLSA": 1.5, "BARN": 2.0 }
    },
    {
        id: "RISK-BARN-001",
        name: "Bristande barnrättslig prövning",
        description: "Bevakar att barnets bästa (1 kap. 2 § SoL 2025) beaktas som en självständig faktor vid beslut, särskilt i ekonomiskt utsatta hushåll.",
        triggers: {
          keywords: ["barnets bästa", "omsorgsbrist", "orosanmälan", "BBIC", "son", "dotter", "omyndig", "barnkonsekvensanalys"],
          themes: ["BARN", "OMSORG", "FÖRÄLDRASKAP", "TRYGGHET"],
          legalSourceCodes: ["SoL", "BK", "FB"],
        },
        severity: 5,
        likelihood: 5,
        contextWeights: { "BARN": 2.2, "NÖD": 1.7, "HÄLSA": 1.4 }
    },
    {
        id: "RISK-TJ-FEL-001",
        name: "Risk för tjänstefel vid myndighetsutövning",
        description: "Flaggar för underlåtenhet att agera, vägran att fatta skriftliga beslut eller allvarliga dokumentationsbrister (20:1 BrB).",
        triggers: {
          keywords: ["tjänstefel", "bristande dokumentation", "ej underrättad", "fördröjd", "vägran", "passivitet", "tjänstefel"],
          themes: ["TJÄNSTEFEL_RISK", "PROCESSFEL", "DOKUMENTATION"],
          legalSourceCodes: ["BrB", "FL", "OSL"],
        },
        severity: 4,
        likelihood: 4,
        contextWeights: { "PROCESS": 1.6, "KOMMUNIKATION": 1.5, "BARN": 1.3 }
    },
    {
        id: "RISK-EVIC-001",
        name: "Systemisk risk för avhysning",
        description: "Identifierar fall med hyresskulder där socialtjänsten riskerar att missa återvinningsfristen eller barnrättslig analys.",
        triggers: {
          keywords: ["hyresskuld", "återvinningsfrist", "vräkning", "avhysning", "treveckorsregeln", "störningar"],
          themes: ["VRÄKNING", "BOENDE", "EKONOMI"],
          legalSourceCodes: ["SoL", "JB"],
        },
        severity: 5,
        likelihood: 4,
        contextWeights: { "VRÄKNING": 1.9, "BARN": 1.7, "NÖD": 1.5 }
    }
];