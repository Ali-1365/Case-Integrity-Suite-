import { OversightBodyClassification } from './fmjam.types';
import { CASE_TYPE_REGISTRY } from '../data/caseTypeRegistry';

export class TriggerEngine {
  
  constructor() {
    // Mock mode - no API key required
  }

  async classify(text: string): Promise<{ oversight: OversightBodyClassification[], caseTypes: string[] }> {
    // Mock implementation for offline/test environment
    return {
        oversight: [
            { body: 'Ingen', relevance: 'ingen', reason: 'Simulerad analys (Mock-läge aktiverat)' }
        ],
        caseTypes: ['Utredning', 'Beslut']
    };
  }
}
