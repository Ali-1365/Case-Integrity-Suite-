
import { LegalSourceCode } from '../types';

export type RiskSeverity = 1 | 2 | 3 | 4 | 5;      // 1 = låg, 5 = extrem
export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;    // sannolikhet
export type RiskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// A generic risk template that defines a pattern, now aligned with FMJAM spec
export interface RiskTemplate {
  id: string;
  name: string;
  description: string;
  triggers: {
    keywords?: string[];
    themes?: string[];
    legalSourceCodes?: LegalSourceCode[];
    // praxis?: string[]; // Future use
    // atoms?: string[]; // Future use
    // numeric?: Record<string, number>; // Future use
  };
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  // Per-template context weights, as per the new spec
  contextWeights: Record<string, number>;
  // Replaces contextTags for clearer connection
}

// A complete risk definition created at runtime to be sent to the scorer
export interface RiskDefinition {
  id: string;
  label: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  contextWeights: Record<string, number>;
  atomIds: string[];
}

export interface ContextWeight {
  tag: string;
  weight: number;
}

// This now corresponds to RiskItemV6 from fmjam.types.ts but is kept here for module separation
export interface RiskScoreResult {
  id: string;
  templateId: string; // Added for traceability
  label: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  weight: number; // The calculated context factor
  score: number; // The final score
  priority: RiskPriority;
  atomIds: string[];
  triggers: string[];
  contextWeightsUsed: Record<string, number>;
}
