import React, { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
//  OFFLINE BANNER
// ─────────────────────────────────────────────
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState((window as any).OFFLINE_MODE === true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOffline((window as any).OFFLINE_MODE === true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#f59e0b', color: '#000', padding: '6px 16px',
      fontSize: '13px', fontWeight: 500, textAlign: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    }}>
      <span>⚠</span>
      <span>OFFLINE-LÄGE — API-kvot slut eller nyckel saknas. AI-funktioner inaktiverade. Lokala funktioner fungerar normalt.</span>
    </div>
  );
};

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

// ─────────────────────────────────────────────
//  BESLUT-VY  (oförändrad)
// ─────────────────────────────────────────────
const BeslutView: React.FC = () => {
  const isOffline = (window as any).OFFLINE_MODE === true;
  const [fraga, setFraga] = useState('');
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Beslutsmotor</h1>
      <p className="text-xs text-slate-400 mb-6">Interaktiv AI-rådgivare för komplexa juridiska frågeställningar</p>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:border-blue-400" placeholder="Ställ din juridiska fråga här..." value={fraga} onChange={e => setFraga(e.target.value)} disabled={isOffline} />
        <button disabled={isOffline || !fraga.trim()} className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isOffline ? '⚠ Kräver API — offline-läge aktivt' : 'Analysera fråga'}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  PRODUKTION-VY  (oförändrad)
// ─────────────────────────────────────────────
const ProduktionView: React.FC = () => {
  const isOffline = (window as any).OFFLINE_MODE === true;
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Juridisk Textproduktion</h1>
      <p className="text-xs text-slate-400 mb-6">Exekverande verktyg för domstolsklara processkrifter enligt RB</p>
      {isOffline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⚠</div>
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Offline-läge aktivt</h3>
          <p className="text-xs text-amber-600">Textproduktionsmodulen kräver en giltig API-nyckel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['Stämningsansökan', 'Svaromål', 'Överklagande', 'Yttrande'].map(dok => (
            <button key={dok} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="text-sm font-semibold text-slate-900 mb-1">{dok}</div>
              <div className="text-xs text-slate-400">Generera {dok.toLowerCase()} med AI-stöd</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  HUVUD-APP
//  Enda ändring vs original: selectedDocId + arkiv-logik
// ─────────────────────────────────────────────
const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('hubb');
  const [hubOpen, setHubOpen] = useState(false);
  // NY: håller id för valt dokument från arkivet
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

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
      <TopBar
        activeTab={activeTab}
        onTabChange={handleTabChange}  
        onHubOpen={() => setHubOpen(true)}
      />

      <main className={topOffset}>
        {activeTab === 'hubb' && <HubbView onModuleOpen={(mod) => {
          if (mod === 'ekonomi')    { handleTabChange('ekonomi'); }
          else if (mod === 'analys')     { handleTabChange('analys'); }
          else if (mod === 'arkiv')      { handleTabChange('arkiv'); }
          else if (mod === 'beslut')     { handleTabChange('beslut'); }
          else if (mod === 'produktion') { handleTabChange('produktion'); }
        }} />}
        {activeTab === 'analys'     && <AnalysView />}
        {activeTab === 'ekonomi'    && <EkonomiView />}
        {activeTab === 'beslut'     && <BeslutView />}
        {activeTab === 'produktion' && <ProduktionView />}

        {/* NY: Arkiv visar lista ELLER detaljvy beroende på selectedDocId */}
        {activeTab === 'arkiv' && (
          selectedDocId
            ? <DocumentDetailView documentId={selectedDocId} onBack={() => setSelectedDocId(null)} />
            : <ArkivWrapper onDocumentSelect={handleDocumentSelect} />
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
