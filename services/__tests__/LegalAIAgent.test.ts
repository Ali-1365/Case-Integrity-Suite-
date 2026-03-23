import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { legalAIAgent } from '../LegalAIAgent';
import { corpusService } from '../../lib/CorpusService';
import { loggingService } from '../loggingService';
import { ragService } from '../../lib/ragService';

// Mock dependencies
vi.mock('../../lib/CorpusService', () => ({
  corpusService: {
    loadMultiple: vi.fn(),
  },
}));

vi.mock('../loggingService', () => ({
  loggingService: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../lib/ragService', () => ({
  ragService: {
    initialize: vi.fn(),
    getContextForText: vi.fn(),
  },
}));

// We also need to mock legalFrameworkIndex since it provides files for corpusService
vi.mock('../../data/legalFramework', () => ({
  legalFrameworkIndex: [
    { corpusFile: 'test-corpus-1.json' },
    { corpusFile: 'test-corpus-2.json' },
  ]
}));


describe('LegalAIAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal state if needed. The legalAIAgent is a singleton exported instance.
    // To properly test the initialization behavior and the "if (this.laws.length > 0) return;" check,
    // we may need to manipulate the singleton's state or simply accept that it's empty initially.
    // We can clear the laws array via reflection/any cast just to make tests independent.
    (legalAIAgent as any).laws = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize()', () => {
    it('should successfully initialize when dependencies resolve', async () => {
      // Setup mock data
      const mockCorpora = [
        {
          title: 'Test Law 1',
          sourceCode: 'TL1',
          paragraphs: [
            { id: 'p1', chapter: 1, section: 1, text: 'Text 1' }
          ]
        }
      ];
      vi.mocked(corpusService.loadMultiple).mockResolvedValue(mockCorpora as any);
      vi.mocked(ragService.initialize).mockResolvedValue(undefined);

      await legalAIAgent.initialize();

      expect(loggingService.info).toHaveBeenCalledWith("[AGENT] Initializing Legal AI Agent...");
      expect(corpusService.loadMultiple).toHaveBeenCalledWith(['test-corpus-1.json', 'test-corpus-2.json']);
      expect(ragService.initialize).toHaveBeenCalled();

      // Checking if laws got populated
      const laws = (legalAIAgent as any).laws;
      expect(laws).toHaveLength(1);
      expect(laws[0]).toMatchObject({
        id: 'p1',
        lawTitle: 'Test Law 1',
        lawSourceCode: 'TL1',
        chapter: 1,
        section: 1,
        text: 'Text 1'
      });

      // Verify completion log
      expect(loggingService.info).toHaveBeenCalledWith(
        expect.stringContaining("[AGENT] Initialization complete. Loaded 1 paragraphs."),
        expect.any(Object)
      );
    });

    it('should handle and log errors when corpusService.loadMultiple fails', async () => {
      // Mock failure
      const testError = new Error('Failed to load corpus data');
      vi.mocked(corpusService.loadMultiple).mockRejectedValue(testError);

      // Verify it throws the error and logs it
      await expect(legalAIAgent.initialize()).rejects.toThrow('Failed to load corpus data');

      expect(loggingService.info).toHaveBeenCalledWith("[AGENT] Initializing Legal AI Agent...");
      expect(loggingService.error).toHaveBeenCalledWith("[AGENT] Initialization failed", { error: testError.message });
    });

    it('should skip initialization if already initialized (laws.length > 0)', async () => {
      (legalAIAgent as any).laws = [{ id: 'existing' }];

      await legalAIAgent.initialize();

      expect(loggingService.info).not.toHaveBeenCalled();
      expect(corpusService.loadMultiple).not.toHaveBeenCalled();
    });
  });
});
