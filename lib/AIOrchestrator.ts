
import { Type } from '@google/genai';
import { FactV2, ContradictionV2, UncertaintyV2, FactCategory } from '../types';
import { LegalFrameworkItem } from './legalReferenceEngine';
import { geminiService } from '../services/geminiService';
import { CASE_TYPE_REGISTRY } from '../data/caseTypeRegistry';
import { CaseType, CrossCorrelation } from './cis.types';

const FACT_CATEGORIES: FactCategory[] = ['EKONOMI', 'BARN', 'TILLGÅNG', 'PROCESS', 'BOENDE', 'HÄLSA'];

const combinedAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        detectedCaseTypes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        facts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { 
                        type: Type.STRING, 
                        description: "En unik, dynamisk identifierare i formatet FACT_YYYYMMDD_NNN, t.ex. 'FACT_20260108_001'."
                    },
                    subject: { type: Type.STRING },
                    statement: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    source: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING },
                            snippet: { type: Type.STRING },
                        },
                        required: ["location", "snippet"]
                    },
                    category: { type: Type.STRING, enum: FACT_CATEGORIES }
                },
                required: ["id", "subject", "statement", "timestamp", "source", "category"]
            }
        },
        contradictions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    conflictingFactIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    type: { type: Type.STRING, enum: ['faktisk', 'rättslig', 'bedömningsmässig'] },
                    severity: { type: Type.STRING, enum: ['låg', 'medel', 'hög'] }
                },
                required: ["id", "description", "conflictingFactIds", "type", "severity"]
            }
        },
        uncertainties: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    relatedFactIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "description", "relatedFactIds"]
            }
        },
        legalLinks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    legalReferenceId: { type: Type.STRING },
                    relatedFactIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    reasoning: { type: Type.STRING }
                },
                required: ["legalReferenceId", "relatedFactIds", "reasoning"]
            }
        }
    },
    required: ["detectedCaseTypes", "facts", "contradictions", "uncertainties", "legalLinks"]
};

const crossCorrelationSchema = {
    type: Type.OBJECT,
    properties: {
        correlations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    sourceDocId: { type: Type.STRING },
                    targetDocId: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['CONTRADICTION', 'REDUNDANCY', 'COMPLEMENTARY'] },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ['id', 'sourceDocId', 'targetDocId', 'type', 'description', 'severity']
            }
        }
    },
    required: ['correlations']
};

export interface AILink {
    legalReferenceId: string;
    relatedFactIds: string[];
    reasoning: string;
}

import { ReasoningResult } from './LegalReasoningService';
import { DecisionSupportResult } from './DecisionSupportService';
import { ProportionalityReport } from './ProportionalityJusticeService';
import { ActionRecommendationReport } from './ActionRecommendationService';
import { ragService } from './ragService';

export interface FullAnalysisPayload {
    detectedCaseTypes: CaseType[];
    facts: FactV2[];
    contradictions: ContradictionV2[];
    uncertainties: UncertaintyV2[];
    links: AILink[];
    
    // Advanced Legal Chain Results
    reasoning?: ReasoningResult;
    decisionSupport?: DecisionSupportResult;
    proportionality?: ProportionalityReport;
    actionRecommendations?: ActionRecommendationReport;
}

import { autoNotary } from './AutoNotaryService';

export class AIOrchestrator {
  async runFullAnalysis(documentText: string, documentId: string, legalFramework: LegalFrameworkItem[], ragContext?: string): Promise<FullAnalysisPayload> {
    const traceId = `TRACE-${documentId}-${Date.now()}`;
    autoNotary.startTrace(traceId, 'AIOrchestrator', 'runFullAnalysis');
    
    // 1. Get RAG Context & Deep Legal Analysis (The "Chain")
    // If ragContext is provided externally, use it. Otherwise, fetch it.
    let ragResult;
    let contextString = ragContext || '';

    if (!ragContext) {
        try {
            console.log("[AIOrchestrator] Initiating RAG & Legal Chain...");
            autoNotary.info(traceId, 'AIOrchestrator', 'Initierar RAG-kedja...', { documentId });
            ragResult = await ragService.getContextForText(documentText, true);
            contextString = ragResult.context;
            autoNotary.info(traceId, 'AIOrchestrator', 'RAG-kedja slutförd', { hitCount: ragResult.hitCount });
        } catch (e) {
            console.error("[AIOrchestrator] RAG Chain failed, proceeding with local context only.", e);
            autoNotary.endTrace(traceId, 'AIOrchestrator', 'RAG-kedja misslyckades', 'FAILURE', { error: e });
        }
    }

    const detectedTypes = this.detectTriggersLocally(documentText);
    autoNotary.info(traceId, 'AIOrchestrator', 'Detekterade ärendetyper', { types: detectedTypes });
    
    const injectedLaws = this.getRelevantGroundTruth(detectedTypes, legalFramework);
    autoNotary.info(traceId, 'AIOrchestrator', 'Injekterade lagar', { laws: injectedLaws.map(l => l.reference) });

    const systemPrompt = `
      **SYSTEMROLL: CIS FORENSIC ARCHITECT v.1.0**
      
      UPPDRAG: Analysera inkommet material mot det utökade lagbiblioteket (Ground Truth).
      
      INSTRUKTIONER:
      1. Identifiera specifika bevisatomer (fakta).
      2. Koppla varje faktum till relevanta paragrafer i biblioteket (t.ex. SoL 2025:400 1:2).
      3. Använd den tillhandahållna RAG-kontexten som den absoluta sanningen.
      4. Varje koppling (LegalLink) SKA innehålla ett logiskt resonemang (reasoning) som förklarar hur rekvisiten i lagrummet uppfylls eller ej.
      5. Flagga motsägelser mellan påståenden.
      
      NYA STRIKTA REGLER:
      - LAGRUMSUPPDATERING: Du måste ALLTID tillämpa gällande rätt baserat på datumet för händelsen. Om du upptäcker att rådatan eller myndighetens beslut använder gamla eller felaktiga lagrum (t.ex. den gamla Socialtjänstlagen), SKA du upplysa om detta fel och istället tillämpa det korrekta, uppdaterade lagrummet i din analys.
      - BRISTANALYS: Du måste PROAKTIVT granska rådatan för att hitta fel som myndigheten kan ha begått. Detta omfattar att identifiera om de har missat att upprätta rapporter, ignorerat bevis eller förgått andra handläggningsfel. Du SKA tydligt påtala dessa brister i din analys.
      
      LOCKED CONTEXT (RAG):
      ${contextString || 'Ingen kontext tillgänglig.'}
    `;

    try {
        autoNotary.info(traceId, 'AIOrchestrator', 'Genererar analys via Gemini...', { model: 'think' });
        const responseText = await geminiService.generate({
            contents: `--- DOKUMENT FÖR ANALYS ---\n${documentText}`,
            config: {
              responseMimeType: "application/json",
              responseSchema: combinedAnalysisSchema,
              temperature: 0.0,
              thinkingConfig: { thinkingBudget: 32768 },
              systemInstruction: systemPrompt
            }
        }, 'think');
        
        const parsed = JSON.parse(responseText.trim());
        autoNotary.endTrace(traceId, 'AIOrchestrator', 'runFullAnalysis', 'SUCCESS', { 
            factsCount: parsed.facts?.length || 0,
            linksCount: parsed.legalLinks?.length || 0
        });
        
        return {
            detectedCaseTypes: parsed.detectedCaseTypes || detectedTypes,
            facts: (parsed.facts || []).map((f: any) => ({ ...f, source: { ...f.source, documentId }})),
            contradictions: parsed.contradictions || [],
            uncertainties: parsed.uncertainties || [],
            links: parsed.legalLinks || [],
            
            // Attach the deep legal analysis results from the RAG chain
            reasoning: ragResult?.reasoning,
            decisionSupport: ragResult?.decisionSupport,
            proportionality: ragResult?.decisionSupport?.proportionality,
            actionRecommendations: ragResult?.decisionSupport?.actions
        };
    } catch (error) {
        console.error("Integrity Core failure:", error);
        autoNotary.endTrace(traceId, 'AIOrchestrator', 'runFullAnalysis', 'FAILURE', { error });
        throw error;
    }
  }

  async runCrossCorrelation(documents: { id: string, name: string, facts: FactV2[] }[]): Promise<CrossCorrelation[]> {
    const systemPrompt = `
      **DU ÄR CIS CROSS-CORRELATION ENGINE v.1.0**
      Ditt uppdrag: Identifiera relationer mellan flera dokument (Batch).
      
      RELATIONSTYPER:
      1. CONTRADICTION: Dokument A säger X, Dokument B säger Y.
      2. REDUNDANCY: Samma fakta upprepas utan mervärde.
      3. COMPLEMENTARY: Dokument B fyller en lucka i Dokument A.
      
      Analysera fakta och identifiera korsreferenser. Svara i strikt JSON enligt schema.
    `;

    const payload = JSON.stringify(documents.map(d => ({
        id: d.id,
        name: d.name,
        facts: d.facts.map(f => ({ id: f.id, statement: f.statement }))
    })));

    try {
        const response = await geminiService.generate({
            contents: `DATA FÖR BATCH-KORRELERING:\n${payload}`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: crossCorrelationSchema,
                temperature: 0.0,
                thinkingConfig: { thinkingBudget: 16384 }
            }
        }, 'think');

        const parsed = JSON.parse(response.trim());
        return (parsed.correlations || []).map((c: any) => ({
            ...c,
            id: c.id || `CORR-${crypto.randomUUID().substring(0, 8)}`
        }));
    } catch (error) {
        console.error("CrossCorrelation failure:", error);
        return [];
    }
  }

  private detectTriggersLocally(text: string): CaseType[] {
    const types: CaseType[] = [];
    const lowerText = text.toLowerCase();
    CASE_TYPE_REGISTRY.forEach(def => {
      if (def.keywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
        types.push(def.type);
      }
    });
    return types.length > 0 ? types : ['PROCESS_MYNDIGHETSUTÖVNING'];
  }

  private getRelevantGroundTruth(types: CaseType[], framework: LegalFrameworkItem[]): LegalFrameworkItem[] {
    const relevantLaws = new Set<string>();
    types.forEach(t => {
      const def = CASE_TYPE_REGISTRY.find(d => d.type === t);
      def?.primaryLaws.forEach(law => relevantLaws.add(law));
    });
    return framework.filter(item => relevantLaws.has(item.reference) || item.reference === 'FL' || item.auditTrail.status === 'VERIFIED');
  }
}
