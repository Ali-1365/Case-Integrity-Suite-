import { RiskTemplate } from '../lib/riskEngineV6.types';

export const ADDITIONAL_RISK_TEMPLATES: RiskTemplate[] = [
  {
    id: "RISK-BISTAND-001",
    name: "Felaktig avräkning av inkomst",
    description: "Risk för oskälig levnadsnivå genom felaktig hantering av fiktiva inkomster eller Swish-insättningar.",
    triggers: {
      keywords: ["kontoutdrag", "swish", "inkomst", "avslag", "riksnorm"],
      themes: ["EKONOMI", "TILLGÅNG"]
    },
    severity: 4,
    likelihood: 3,
    contextWeights: { "NÖD": 1.5, "PROCESS": 1.2 }
  },
  {
    id: "RISK-BARN-002",
    name: "Bristande BBIC-struktur",
    description: "Utredningen följer inte den lagstadgade BBIC-strukturen för barns behov.",
    triggers: {
      keywords: ["BBIC", "utredning", "barnets behov", "omsorg"],
      themes: ["BARN", "PROCESS"]
    },
    severity: 3,
    likelihood: 4,
    contextWeights: { "BARN": 1.8 }
  },
  {
    id: "RISK-DV-001",
    name: "Otillräcklig skyddsbedömning (VNR)",
    description: "Brister i bedömningen av hotbild vid våld i nära relationer.",
    triggers: {
      keywords: ["våld", "hot", "skyddat boende", "kvinnofrid"],
      themes: ["HÄLSA", "BOENDE", "BARN"]
    },
    severity: 5,
    likelihood: 4,
    contextWeights: { "BARN": 2.0, "NÖD": 1.9 }
  }
];