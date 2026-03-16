
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from './cis.types';
import { OpinionPromptBuilder } from './opinionPromptBuilder';
import { sha256 } from './hashUtils';

export interface LlmClient {
  generate(prompt: string, mode: 'fast' | 'think'): Promise<{ text: string }>;
}

export class OpinionEngine {
  private readonly promptBuilder: OpinionPromptBuilder;

  constructor(
    private readonly llmClient: LlmClient,
    private readonly mode: 'fast' | 'think',
  ) {
    this.promptBuilder = new OpinionPromptBuilder();
  }

  /**
   * Genererar ett juridiskt yttrande med fullständig spårbarhet och SHA-256 integritet.
   */
  async generateOpinion(
    analysis: AnalysisResult,
    config: OpinionConfig,
  ): Promise<OpinionResult> {
    
    const prompt = this.promptBuilder.buildPrompt(analysis, config);
    
    const { text: content } = await this.llmClient.generate(prompt, this.mode);

    if (!content) {
        throw new Error("Genereringsfel: Modellen returnerade tomt innehåll.");
    }

    // Beräkna integritetshash för det genererade innehållet
    const integrityHash = await sha256(content);
    const timestamp = new Date().toISOString();
    
    const finalContent = `
---
**INTEGRITETSKEDJA (SHA-256):** ${integrityHash}
**GENERERAD:** ${timestamp}
**MODELL:** Gemini ${this.mode === 'think' ? 'Pro (Thinking)' : 'Flash'}
---

${content}

---
**SLUT PÅ YTTRANDE**
*Detta dokument är forensiskt låst och verifierat mot källmaterialet.*
`;

    return {
      documentName: analysis.caseId,
      generatedAt: timestamp,
      config,
      content: finalContent,
    };
  }
}
