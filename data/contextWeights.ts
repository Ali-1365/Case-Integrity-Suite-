import { ContextWeight } from "../lib/riskEngineV6.types";

export const DEFAULT_CONTEXT_WEIGHTS: ContextWeight[] = [
  { "tag": "BARN", "weight": 1.85 },
  { "tag": "NÖD", "weight": 1.75 },
  { "tag": "VRÄKNING", "weight": 1.60 },
  { "tag": "HÄLSA", "weight": 1.45 },
  { "tag": "KOMMUNIKATION", "weight": 1.25 },
  { "tag": "PROCESS", "weight": 1.35 },
  { "tag": "DOKUMENTATION", "weight": 1.30 }
];