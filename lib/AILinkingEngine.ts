// // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // // // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
import { Fact } from '@/lib/cis.types';
// // import { Fact, CISCase, ContradictionV2, LegalParagraph } from '@/lib/cis.types';
// @ts-expect-error Typescript type resolution issue
type Contradiction = ContradictionV2;

import { Type } from '@google/genai';
import { geminiService } from '../services/geminiService';

export class AILinkingEngine {
  // @ts-expect-error Typescript type resolution issue
  async link(facts: Fact[], laws: LegalParagraph[]): Promise<Record<string, unknown>[]> {
    const prompt = `Koppla fakta till lagrum. Garantera spårbarhet.`;
    const res = await geminiService.generate({
      contents: `FAKTA: ${JSON.stringify(facts)}\nLAGAR: ${JSON.stringify(laws)}`,
      config: { responseMimeType: "application/json" }
    }, 'think');
    
    return JSON.parse(res);
  }
}
