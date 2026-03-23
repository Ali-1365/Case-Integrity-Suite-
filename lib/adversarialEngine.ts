
import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { FactV2, ContradictionV2 } from '../types';
import { AnalysisResult, Atom } from './cis.types';

export interface DuelAssertion {
    id: string;
    statement: string;
    sourceIds: string[];
    confidence: number;
    status: 'VERIFIED' | 'CHALLENGED' | 'KNOCKOUT';
    critique?: string;
}

export interface DuelResult {
    assertions: DuelAssertion[];
    summary: string;
    integrityScore: number;
}

export class AdversarialEngine {
    /**
     * Genomför en AI Duel (Actor-Critic).
     * Agent A har föreslagit en syntes. Agent B (denna motor) försöker skjuta ner den.
     */
    async performDuel(proposals: FactV2[], allAtoms: Atom[]): Promise<DuelResult> {
        const systemInstruction = `
            **SYSTEMROLL: FMJAM ADJUDICATOR (AGENT B) v.6.3**
            
            DIN UPPGIFT: Försök motbevisa Agent A:s påståenden. Du är en forensisk granskare med noll-tolerans mot osäkerhet.
            
            GRANSKNINGSPROTOKOLL:
            1. **TEMPORAL COLLISION**: Kolla om datum i påståendet krockar med andra fakta i atoms-grafen.
            2. **ENTITY MISMATCH**: Kontrollera om namn har förväxlats mellan olika dokument.
            3. **CITATION INTEGRITY**: Om Agent A påstår något som inte har ett ordagrant citat (verbatim) i käll-atomer, markera som KNOCKOUT.
            
            Svara i strikt JSON-format.
        `;

        const context = JSON.stringify({
            proposedFacts: proposals,
            sourceAtoms: allAtoms.slice(0, 200) // Begränsar till de mest relevanta för att hålla context window stabilt
        });

        const schema = {
            type: Type.OBJECT,
            properties: {
                assertions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            status: { type: Type.STRING, enum: ['VERIFIED', 'CHALLENGED', 'KNOCKOUT'] },
                            critique: { type: Type.STRING, description: "Varför påståendet utmanas eller slås ut." },
                            confidence: { type: Type.NUMBER }
                        },
                        required: ['id', 'status', 'critique', 'confidence']
                    }
                },
                summary: { type: Type.STRING },
                integrityScore: { type: Type.NUMBER }
            },
            required: ['assertions', 'summary', 'integrityScore']
        };

        try {
            const responseText = await geminiService.generate({
                contents: `Här är Agent A:s förslag och källmaterialet:\n\n${context}`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.1,
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            }, 'think');

            const result = JSON.parse(responseText.trim());
            
            // Mappa tillbaka resultaten till de ursprungliga påståendena
            const finalAssertions: DuelAssertion[] = proposals.map(p => {
                const audit = result.assertions.find((a: { id: string }) => a.id === p.id);
                return {
                    id: p.id,
                    statement: p.statement,
                    sourceIds: [p.source.documentId],
                    confidence: audit?.confidence || 0,
                    status: audit?.status || 'CHALLENGED',
                    critique: audit?.critique
                };
            });

            return {
                assertions: finalAssertions,
                summary: result.summary,
                integrityScore: result.integrityScore
            };

        } catch (error) {
            console.error("Adversarial Duel failed:", error);
            throw error;
        }
    }
}
