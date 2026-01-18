
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from './fmjam.types';
import { OpinionPromptBuilder } from './opinionPromptBuilder';

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
   * Genererar ett juridiskt yttrande med fullständig spårbarhet.
   */
  async generateOpinion(
    analysis: AnalysisResult,
    config: OpinionConfig,
  ): Promise<OpinionResult> {
    
    // Vi injicerar de tyngsta provenance-header-metadata här
    const prompt = this.promptBuilder.buildPrompt(analysis, config);
    
    // Kör generering med vald modell-logik
    const { text: content } = await this.llmClient.generate(prompt, this.mode);

    if (!content) {
        throw new Error("Genereringsfel: Modellen returnerade tomt innehåll.");
    }

    return {
      documentName: analysis.caseId,
      generatedAt: new Date().toISOString(),
      config,
      content,
    };
  }
}
