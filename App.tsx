import React, { useState, useEffect, useCallback } from 'react';
import OfflineBanner from './components/OfflineBanner';
import { offlineService } from './services/offlineService';
import { ragService } from './lib/ragService';
import { db } from './lib/db';
import { AnalysisResult, CISCase } from './lib/cis.types';
import { StoredDocument } from './types';

// Icons
import { LogoIcon, ArrowLeftIcon, HomeIcon, MagnifyingGlassIcon, DocumentTextIcon } from './components/icons';

// Core Components
import { SystemHub } from './components/SystemHub';
import EconomicDashboard from './components/EconomicDashboard';
import { InteractiveAnalyst } from './components/InteractiveAnalyst';
import LegalTextProductionModule from './components/LegalTextProductionModule';
import OpinionGenerator from './components/OpinionGenerator';
import { AdversarialDuelView } from './components/AdversarialDuelView';
import { CaseProfiler } from './components/CaseProfiler';
import AgentWorkspace from './components/AgentWorkspace';
import { LegalPipelineView } from './components/LegalPipelineView';
import ForensicIntegrityView from './components/ForensicIntegrityView';
import AuditPanel from './components/AuditPanel';
import { AutoNotaryView } from './components/AutoNotaryView';
import SfbIntegrityPanel from './components/SfbIntegrityPanel';
import ArchiveView from './components/ArchiveView';
import LegalFrameworkView from './components/LegalFrameworkView';
import WhitebookViewer from './components/WhitebookViewer';
import { IntelligenceCore } from './components/IntelligenceCore'; // OracleCoreViewer
import SystemMonitor from './components/SystemMonitor';
import SystemInventory from './components/SystemInventory';
import { FmjamController } from './components/FmjamController';

// ─────────────────────────────────────────────
//  BOOT SCREEN
// ─────────────────────────────────────────────
const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initierar system...');

  useEffect(() => {
    let i = 0;
    const steps = [
      { p: 15, msg: 'Laddar juridiskt bibliotek...' },
      { p: 30, msg: 'Verifierar integritet...' },
      { p: 50, msg: 'Ansluter moduler...' },
      { p: 70, msg: 'Kontrollerar API-status...' },
      { p: 85, msg: 'Laddar RAG Index...' },
      { p: 100, msg: 'System redo.' },
    ];

    // Boot sequence delay: total ~2 seconds
    const timer = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setStatus(steps[i].msg);
        i++;
      } else {
        clearInterval(timer);
        onComplete();
      }
    }, 300);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
          <LogoIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Case Integrity Suite</h1>
        <p className="text-slate-400 text-sm mt-1">ENTERPRISE V1.0</p>
      </div>
      <div className="w-64">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-slate-400 text-xs text-center">{status}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TOPBAR
// ─────────────────────────────────────────────
const TopBar: React.FC<{
  activeView: string;
  isOffline: boolean;
  onNavigate: (view: string) => void;
}> = ({ activeView, isOffline, onNavigate }) => {
  const isHubb = activeView === 'hubb';

  const getViewName = (view: string) => {
    const map: Record<string, string> = {
      'hubb': 'System Hub', 'ekonomi': 'Ekonomisk Motor', 'chat': 'Beslutsmotor (Chat)',
      'production': 'Juridisk Textproduktion', 'opinion': 'AI-Expert (Yttranden)',
      'duel': 'Adversarial Duel', 'profiler': 'Case Profiler', 'agent': 'Analys & Utredning',
      'pipeline': 'Legal Pipeline', 'integrity': 'Forensisk Integritet', 'audit': 'Audit & Compliance',
      'notary': 'Processnotarie', 'sfb': 'SFB Integritet', 'archive': 'Archive Core',
      'framework': 'Juridiskt Ramverk', 'whitebook': 'Vitbok', 'oracle': 'Oracle Core',
      'monitor': 'System Monitor', 'inventory': 'System Inventory', 'controller': 'Kontrollpanel'
    };
    return map[view] || view;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center px-4"
      style={{ top: isOffline ? '34px' : '0' }}>

      {!isHubb ? (
        <button onClick={() => onNavigate('hubb')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mr-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold hidden sm:block">Tillbaka till Hubb</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">Case Integrity Suite</div>
            <div className="text-[10px] text-slate-400 leading-none mt-1">ENTERPRISE V8.0</div>
          </div>
        </div>
      )}

      {/* Breadcrumb / Active Module Indicator */}
      <div className="flex-1 flex items-center">
        {!isHubb && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{getViewName(activeView)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${isOffline ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOffline ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
//  REQUIRE ANALYSIS WRAPPER
// ─────────────────────────────────────────────
const RequireAnalysis: React.FC<{ analysis: AnalysisResult | null; children: (analysis: AnalysisResult) => React.ReactNode }> = ({ analysis, children }) => {
  if (!analysis) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col items-center justify-center h-[60vh]">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-100 dark:border-blue-800">
            <DocumentTextIcon className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Inget ärende valt</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
          Välj ett ärende från Arkivet för att starta analys i denna modul.
        </p>
      </div>
    );
  }
  return <>{children(analysis)}</>;
};

// ─────────────────────────────────────────────
//  HUVUD-APP
// ─────────────────────────────────────────────
const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [activeView, setActiveView] = useState<string>('hubb');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [activeCaseData, setActiveCaseData] = useState<CISCase | null>(null);

  // Sync offline state
  useEffect(() => {
    const unsubscribe = offlineService.subscribe((offline) => setIsOffline(offline));
    return unsubscribe;
  }, []);

  const handleBootComplete = async () => {
    await ragService.initialize();
    setBooted(true);
  };

  // Load document/case when selectedDocumentId or selectedCaseId changes
  useEffect(() => {
    const loadSelection = async () => {
      if (selectedDocumentId) {
        const doc = await db.getDocument(selectedDocumentId);
        if (doc && doc.analysis) {
          setCurrentAnalysis(doc.analysis);
          setSelectedCaseId(doc.analysis.caseId);
        }
      } else {
        setCurrentAnalysis(null);
      }

      if (selectedCaseId) {
        const cisCase = await db.getCase(selectedCaseId);
        if (cisCase) {
          setActiveCaseData(cisCase);
        }
      } else {
        setActiveCaseData(null);
      }
    };
    loadSelection();
  }, [selectedDocumentId, selectedCaseId]);

  const handleNavigate = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  const handleArchiveSelect = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setActiveView('agent');
  }, []);

  if (!booted) return <BootScreen onComplete={handleBootComplete} />;

  const topOffset = isOffline ? 'mt-[88px]' : 'mt-14';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <OfflineBanner />
      <TopBar activeView={activeView} isOffline={isOffline} onNavigate={handleNavigate} />

      <main className={`${topOffset} p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500`}>
        {/* MAIN HUB */}
        {activeView === 'hubb' && <SystemHub onNavigate={handleNavigate} />}

        {/* EXPERTIS */}
        {activeView === 'ekonomi' && <EconomicDashboard />}
        {activeView === 'chat' && <RequireAnalysis analysis={currentAnalysis}>{a => <InteractiveAnalyst analysis={a} />}</RequireAnalysis>}
        {activeView === 'production' && <LegalTextProductionModule />}
        {activeView === 'opinion' && <RequireAnalysis analysis={currentAnalysis}>{a => <OpinionGenerator analysis={a} onComplete={() => handleNavigate('hubb')} />}</RequireAnalysis>}
        {activeView === 'duel' && <RequireAnalysis analysis={currentAnalysis}>{a => <AdversarialDuelView caseData={JSON.stringify(a)} caseId={a.caseId} />}</RequireAnalysis>}

        {/* ANALYS */}
        {activeView === 'profiler' && (
           activeCaseData ? <CaseProfiler caseData={activeCaseData} /> :
           <div className="p-6 text-center text-slate-500">Inget ärende (CISCase) valt i databasen för Profiler.</div>
        )}
        {activeView === 'agent' && <AgentWorkspace isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'pipeline' && <RequireAnalysis analysis={currentAnalysis}>{a => <LegalPipelineView analysis={a} />}</RequireAnalysis>}

        {/* INTEGRITET */}
        {activeView === 'integrity' && <RequireAnalysis analysis={currentAnalysis}>{a => <ForensicIntegrityView analysis={a} />}</RequireAnalysis>}
        {activeView === 'audit' && <AuditPanel isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'notary' && <AutoNotaryView />}
        {activeView === 'sfb' && <SfbIntegrityPanel isOpen={true} onClose={() => handleNavigate('hubb')} />}

        {/* SYSTEM */}
        {activeView === 'archive' && <ArchiveView onSelect={handleArchiveSelect} />}
        {activeView === 'framework' && <LegalFrameworkView isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'whitebook' && <WhitebookViewer isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'oracle' && <RequireAnalysis analysis={currentAnalysis}>{a => <IntelligenceCore analysis={a} />}</RequireAnalysis>}
        {activeView === 'monitor' && <SystemMonitor isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'inventory' && <SystemInventory isOpen={true} onClose={() => handleNavigate('hubb')} />}
        {activeView === 'controller' && <RequireAnalysis analysis={currentAnalysis}>{a => <FmjamController analysis={a} />}</RequireAnalysis>}
      </main>
    </div>
  );
};

export default App;
