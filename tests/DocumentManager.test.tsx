import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import DocumentManager from '../components/DocumentManager'
import { db } from '../lib/db'
import { loadAllLegalCorpus } from '../lib/executionFlow'
import { useFileParser } from '../hooks/useFileParser'

// We need to provide ALL icons that might be imported from components/icons
vi.mock('../components/icons', () => {
  const icons = [
    'LogoIcon', 'LogoutIcon', 'Spinner', 'CpuChipIcon', 'ChatIcon',
    'ActivityIcon', 'CodeBracketIcon', 'ShieldCheckIcon', 'LawIcon',
    'ChartBarSquareIcon', 'AdjustmentsHorizontalIcon', 'MagnifyingGlassIcon',
    'XMarkIcon', 'BoltIcon', 'ClipboardDocumentListIcon', 'Squares2X2Icon',
    'CalendarIcon', 'SparklesIcon', 'ExclamationTriangleIcon', 'FingerPrintIcon',
    'ArchiveBoxIcon', 'UserGroupIcon', 'BanknotesIcon', 'ChevronDownIcon',
    'DocumentTextIcon', 'FileIcon', 'ArrowPathIcon', 'CheckCircleIcon',
    'QuestionMarkCircleIcon', 'UploadIcon', 'DocumentIcon', 'ArrowUpTrayIcon',
    'ServerIcon', 'CogIcon', 'KeyIcon'
  ];

  const mockedIcons: Record<string, any> = {};
  icons.forEach(name => {
    mockedIcons[name] = () => <div data-testid={`icon-${name.toLowerCase()}`}>{name}</div>;
  });

  return mockedIcons;
});

vi.mock('../lib/db', () => ({
  db: {
    getAllDocuments: vi.fn(),
    addDocument: vi.fn(),
  }
}))

vi.mock('../lib/executionFlow', () => ({
  loadAllLegalCorpus: vi.fn()
}))

vi.mock('../lib/ragService', () => ({
  ragService: {
    initialize: vi.fn(),
  }
}))

vi.mock('../hooks/useFileParser', () => ({
  useFileParser: vi.fn()
}))

vi.mock('../lib/AIOrchestrator', () => {
  class MockOrchestrator {
    runFullAnalysis = vi.fn().mockResolvedValue({
      decisionSupport: {},
      riskProfile: { normalizedScore: 10 }
    });
  }
  return {
    AIOrchestrator: MockOrchestrator
  };
})

vi.mock('../lib/CaseManagementService', () => ({
  caseManagementService: {
    getCase: vi.fn().mockResolvedValue({ id: 'case-1' }),
    createCase: vi.fn().mockResolvedValue({ id: 'case-1' }),
    updateCaseWithResult: vi.fn().mockResolvedValue(true)
  }
}))

describe('DocumentManager upload file block', () => {
  const mockParseFile = vi.fn();

  beforeEach(() => {
    vi.mocked(useFileParser).mockReturnValue({
      parseFile: mockParseFile,
      isParsing: false,
      parsingError: null
    })

    vi.mocked(db.getAllDocuments).mockResolvedValue([])
    vi.mocked(loadAllLegalCorpus).mockResolvedValue([])
    vi.mocked(db.addDocument).mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('handles file upload and triggers analysis correctly', async () => {
    const mockParsedDoc = {
      id: 'DOC-123',
      name: 'test.pdf',
      textContent: 'Test content',
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString()
    };

    mockParseFile.mockResolvedValueOnce(mockParsedDoc);

    const user = userEvent.setup();
    render(<DocumentManager onLogout={() => {}} />);

    // Wait for initial load
    await waitFor(() => {
      expect(db.getAllDocuments).toHaveBeenCalled();
    });

    // Wait for the UI to be ready, file input should be present
    await waitFor(() => {
      expect(document.querySelector('input[type="file"]')).not.toBeNull();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockParseFile).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(db.addDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.pdf',
          textContent: 'Test content'
        })
      );
    });
  });

  it('handles file upload errors gracefully', async () => {
    const error = new Error('Parsing failed');
    mockParseFile.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = userEvent.setup();
    render(<DocumentManager onLogout={() => {}} />);

    await waitFor(() => {
      expect(db.getAllDocuments).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(document.querySelector('input[type="file"]')).not.toBeNull();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockParseFile).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('File selection processing failed:', error);
      expect(db.addDocument).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
})
