import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Zap, Scale, ShieldCheck, FileSearch } from 'lucide-react';
import { offlineService } from './services/offlineService';

// Dynamisk import för huvudvyer
const EkonomiView = lazy(() => import('./components/EkonomiView'));
const AnalysView = lazy(() => import('./components/AnalysView'));
const BeslutView = lazy(() => import('./components/BeslutView'));
const ProduktionView = lazy(() => import('./components/ProduktionView'));

// ─────────────────────────────────────────────
//  OFFLINE BANNER
// ─────────────────────────────────────────────
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [reason, setReason] = useState(offlineService.getReason());

  useEffect(() => {
    return offlineService.subscribe((offline, r) => {
      setIsOffline(offline);
      setReason(r);
    });
  }, []);

  if (!isOffline) return null;

  const getMessage = () => {
    switch (reason) {
      case 'API_KEY_MISSING': return 'API-nyckel saknas. AI-funktioner inaktiverade.';
      case 'QUOTA_EXCEEDED': return 'API-kvot överskriden. Försöker återansluta automatiskt...';
      case 'NETWORK_ERROR': return 'Nätverksfel vid anslutning till AI-motor.';
      case 'MANUAL': return 'Systemet är i manuellt offline-läge.';
      default: return 'OFFLINE-LÄGE — Systemet körs lokalt.';
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: reason === 'QUOTA_EXCEEDED' ? '#3b82f6' : '#f59e0b', 
      color: '#fff', padding: '6px 16px',
      fontSize: '13px', fontWeight: 500, textAlign: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <span>{reason === 'QUOTA_EXCEEDED' ? 'ℹ' : '⚠'}</span>
      <span>{getMessage()}</span>
      <button 
        onClick={() => window.location.reload()}
        className="bg-white text-black px-3 py-1 rounded text-xs font-bold hover:bg-slate-100 transition-colors"
      >
        Uppdatera
      </button>
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
    const steps = [
      { p: 15, msg: 'Laddar juridiskt bibliotek...' },
      { p: 30, msg: 'Verifierar integritet...' },
      { p: 50, msg: 'Ansluter moduler...' },
      { p: 70, msg: 'Kontrollerar API-status...' },
      { p: 85, msg: 'Förbereder arbetsyta...' },
      { p: 100, msg: 'System redo.' },
    ];
    let i = 0;
    const timer = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setStatus(steps[i].msg);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
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
      
      {/* Säkerhetsknapp om laddningen tar för lång tid */}
      <button 
        onClick={onComplete}
        className="mt-12 text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
      >
        Hoppa över introduktion →
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TOPBAR
// ─────────────────────────────────────────────
type NavTab = 'hubb' | 'analys' | 'ekonomi' | 'beslut' | 'produktion' | 'arkiv';

const TopBar: React.FC<{
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onHubOpen: () => void;
}> = ({ activeTab, onTabChange, onHubOpen }) => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());

  useEffect(() => {
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'hubb',       label: 'Hubb' },
    { id: 'analys',     label: 'Analys' },
    { id: 'ekonomi',    label: 'Ekonomi' },
    { id: 'beslut',     label: 'Beslut' },
    { id: 'produktion', label: 'Produktion' },
    { id: 'arkiv',      label: 'Arkiv' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center px-4"
      style={{ top: isOffline ? '34px' : '0' }}>
      <button onClick={onHubOpen} className="flex items-center gap-2 mr-6">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-slate-900 leading-none">Case Integrity Suite</div>
          <div className="text-[10px] text-slate-400 leading-none mt-0.5">ENTERPRISE V1.0</div>
        </div>
      </button>

      <nav className="flex items-center gap-1 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <span className={`hidden sm:inline font-medium ${isOffline ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOffline ? 'OFFLINE' : 'SYSTEMHÄLSA'}
          </span>
          {!isOffline && <span className="text-slate-400">0/15 RPM</span>}
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
//  NY: DOKUMENT-DETALJVY
//  Visas när ett ärende klickas i arkivet
// ─────────────────────────────────────────────
const DocumentDetailView: React.FC<{
  documentId: string;
  onBack: () => void;
}> = ({ documentId, onBack }) => {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { db } = await import('./lib/db');
        const found = await db.getDocument(documentId);
        if (found) setDoc(found);
        else setError('Ärendet hittades inte i databasen.');
      } catch (e: any) {
        setError(`Kunde inte ladda ärendet: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Laddar ärende...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          ← Tillbaka till arkivet
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-red-700 mb-2">Kunde inte ladda ärendet</p>
          <p className="text-xs text-red-500">{error}</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
            Tillbaka
          </button>
        </div>
      </div>
    );
  }

  const analysis = doc.analysis || {};
  const facts = analysis.facts || [];
  const contradictions = analysis.contradictions || [];
  const legalRefs = analysis.legalReferences || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          ← Tillbaka
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 truncate">{doc.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400 font-mono">ID: {doc.id}</span>
            <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString('sv-SE')}</span>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Faktaatomer',   value: facts.length,          color: 'text-blue-600' },
          { label: 'Motsägelser',   value: contradictions.length, color: contradictions.length > 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Lagkopplingar', value: legalRefs.length,      color: 'text-indigo-600' },
          { label: 'Tecken',        value: (doc.textContent?.length || 0).toLocaleString('sv-SE'), color: 'text-slate-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Faktaatomer */}
      {facts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Faktaatomer ({facts.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {facts.map((f: any, i: number) => (
              <div key={f.id || i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{f.id || `FACT-${i}`}</span>
                  {f.category && (
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">{f.category}</span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{f.statement}</p>
                {f.source?.location && (
                  <p className="text-[10px] text-slate-400 mt-1">Källa: {f.source.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motsägelser */}
      {contradictions.length > 0 && (
        <div className="bg-white border border-red-100 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Motsägelser ({contradictions.length})
          </h3>
          <div className="space-y-2">
            {contradictions.map((c: any, i: number) => (
              <div key={c.id || i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    c.severity === 'hög' ? 'bg-red-200 text-red-800'
                    : c.severity === 'medel' ? 'bg-amber-200 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                  }`}>{c.severity?.toUpperCase() || 'OKÄND'}</span>
                  <span className="text-[9px] text-slate-400">{c.type}</span>
                </div>
                <p className="text-xs text-slate-700">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lagkopplingar */}
      {legalRefs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Lagkopplingar ({legalRefs.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {legalRefs.map((ref: any, i: number) => (
              <span key={ref.id || i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg font-mono">
                {ref.rawText || ref.source || ref.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dokumenttext */}
      {doc.textContent && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            Dokumenttext (utdrag)
          </h3>
          <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {doc.textContent.substring(0, 1500)}{doc.textContent.length > 1500 ? '\n...' : ''}
          </pre>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  NY: ARKIV-WRAPPER
//  Laddar den riktiga ArchiveView dynamiskt och
//  kopplar onSelect → handleDocumentSelect
// ─────────────────────────────────────────────
const ArkivWrapper: React.FC<{ onDocumentSelect: (id: string) => void }> = ({ onDocumentSelect }) => {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    import('./components/ArchiveView')
      .then(mod => setComp(() => mod.default))
      .catch(err => {
        console.error('Kunde inte ladda ArchiveView:', err);
        setLoadError(err.message);
      });
  }, []);

  if (loadError) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800">ArchiveView kunde inte laddas</p>
          <p className="text-xs text-amber-600 mt-1">{loadError}</p>
          <p className="text-xs text-amber-500 mt-2">
            Kontrollera att <code>components/ArchiveView.tsx</code> finns och att <code>lib/db.ts</code> fungerar.
          </p>
        </div>
      </div>
    );
  }

  if (!Comp) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Forensisk Ärendehistorik</h1>
      <p className="text-xs text-slate-400 mb-6">Alla ärenden med SHA-256 verifiering</p>
      {/* onSelect är exakt det prop-namn ArchiveView.tsx förväntar sig */}
      <Comp onSelect={onDocumentSelect} />
    </div>
  );
};

// ─────────────────────────────────────────────
//  HUBB-VY  (oförändrad)
// ─────────────────────────────────────────────
const HubbView: React.FC<{ onModuleOpen: (mod: string) => void }> = ({ onModuleOpen }) => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());

  useEffect(() => {
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const modules = [
    { id: 'ekonomi',    label: 'Ekonomisk Motor',          desc: 'Hantera betalningar, fakturor och skadeståndskrav med AI-precision.',  color: 'bg-emerald-50 border-emerald-200', tag: 'EXPERTIS',   tagColor: 'bg-emerald-100 text-emerald-700', requiresApi: false },
    { id: 'beslut',     label: 'Beslutsmotor',             desc: 'Interaktiv AI-rådgivare för komplexa juridiska frågeställningar.',      color: 'bg-blue-50 border-blue-200',       tag: 'EXPERTIS',   tagColor: 'bg-blue-100 text-blue-700',       requiresApi: true  },
    { id: 'produktion', label: 'Juridisk Textproduktion',  desc: 'Exekverande verktyg för domstolsklara processkrifter enligt RB.',       color: 'bg-indigo-50 border-indigo-200',   tag: 'EXPERTIS',   tagColor: 'bg-indigo-100 text-indigo-700',   requiresApi: true  },
    { id: 'analys',     label: 'Analys & Utredning',       desc: 'Djupgående analys av bevisatomer och rättsliga förhållanden.',          color: 'bg-purple-50 border-purple-200',   tag: 'ANALYS',     tagColor: 'bg-purple-100 text-purple-700',   requiresApi: true  },
    { id: 'arkiv',      label: 'Archive Core',             desc: 'Utforska det historiska arkivet och lagrade rättskällor.',              color: 'bg-slate-50 border-slate-200',     tag: 'SYSTEM',     tagColor: 'bg-slate-100 text-slate-700',     requiresApi: false },
    { id: 'integritet', label: 'Forensisk Integritet',     desc: 'Verifiera dataatomer och integritetskedjor (SHA-256).',                 color: 'bg-teal-50 border-teal-200',       tag: 'INTEGRITET', tagColor: 'bg-teal-100 text-teal-700',       requiresApi: false },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <span>⊞</span><span>Hem</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-sm">⊞</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Systemöversikt</h1>
        </div>
        <p className="text-slate-500 text-sm">Välkommen till Case Integrity Suite. Här kan du hantera ärenden, utföra analyser och övervaka systemets integritet.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Systemstatus:</div>
            <div className="text-sm font-semibold text-slate-900">Intelligenskärna v.7.2.2-GOLD</div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isOffline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {isOffline ? 'OFFLINE-LÄGE' : 'INTEGRITET VERIFIERAD'}
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            {['SYSTEMNAV','MONITOR','INVENTERING','BESLUTSMOTOR','PRODUKTION','ANALYS','ORACLE','KONTROLL','NOTARIE','LOGG','JURIDIK','SFB','ARKIV'].map(s => (
              <span key={s}>{s} •</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {['NORMALISERING','INTEGRITET','INDATA','FÖR-ANALYS','AI-ANALYS','KORS-KORRELERING','SYNTES','RESULTAT','SÄKERHET'].map(step => (
            <div key={step} className="border border-slate-200 rounded-lg px-3 py-2 text-center">
              <div className="text-[10px] font-semibold text-slate-600">{step}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">VÄNTAR</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '💬', title: 'Analysera Ärendearkiv', sub: 'VÄLJ ÄRENDE FÖR DJUPANALYS', id: 'analys' },
          { icon: '🛡',  title: 'Integritetskontroll',  sub: 'VERIFIERA FORENSISK KEDJA',  id: 'integritet' },
          { icon: '📈', title: 'Systemtelemetri',        sub: 'MONITORERA AI-NODER',         id: 'monitor' },
        ].map(item => (
          <button key={item.id} onClick={() => onModuleOpen(item.id)}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Moduler</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => {
          const disabled = isOffline && mod.requiresApi;
          return (
            <button key={mod.id} onClick={() => !disabled && onModuleOpen(mod.id)} disabled={disabled}
              className={`border rounded-xl p-4 text-left transition-all ${mod.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mod.tagColor}`}>{mod.tag}</span>
                {disabled
                  ? <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Kräver API</span>
                  : <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">● ACTIVE</span>
                }
              </div>
              <div className="text-base font-semibold text-slate-900 mb-1">{mod.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{mod.desc}</div>
            </button>
          );
        })}
      </div>

      {/* NY: Sammankopplade Arbetsflöden */}
      <div className="mt-12 mb-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Sammankopplade Arbetsflöden
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => onModuleOpen('ekonomi')}
            className="group relative bg-white border border-slate-200 rounded-3xl p-6 text-left hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={64} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Skadestånd & Arkiv</h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Aktiv länkning</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Koppla skadeståndsanspråk direkt till rättsliga ärenden i arkivet för automatiserad bevisanalys.</p>
          </button>

          <button 
            onClick={() => onModuleOpen('analys')}
            className="group relative bg-white border border-slate-200 rounded-3xl p-6 text-left hover:border-emerald-400 hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={64} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <FileSearch size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Analys & Beslut</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Integrerad AI</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Kör djupanalys på arkiverade dokument och generera omedelbara beslutsförslag baserat på praxis.</p>
          </button>
        </div>
      </div>
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
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());

  useEffect(() => {
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const handleBoot = useCallback(() => setBooted(true), []);
  const topOffset = isOffline ? 'mt-[88px]' : 'mt-14';

  // NY: byt flik och rensa valt dokument
  const handleTabChange = useCallback((tab: NavTab) => {
    setSelectedDocId(null);
    setActiveTab(tab);
  }, []);

  // NY: öppna detaljvy för ett ärende
  const handleDocumentSelect = useCallback((id: string) => {
    setSelectedDocId(id);
    setActiveTab('arkiv');
  }, []);

  if (!booted) return <BootScreen onComplete={handleBoot} />;

  return (
    <div className="min-h-screen bg-slate-50">
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
        
        <Suspense fallback={<div className="p-12 text-center text-slate-400">Laddar modul...</div>}>
          {activeTab === 'analys'     && <AnalysView />}
          {activeTab === 'ekonomi'    && <EkonomiView />}
          {activeTab === 'beslut'     && <BeslutView />}
          {activeTab === 'produktion' && <ProduktionView />}
        </Suspense>

        {/* NY: Arkiv visar lista ELLER detaljvy beroende på selectedDocId */}
        {activeTab === 'arkiv' && (
          selectedDocId
            ? <DocumentDetailView documentId={selectedDocId} onBack={() => setSelectedDocId(null)} />
            : <ArkivWrapper onDocumentSelect={handleDocumentSelect} />
        )}
      </main>

      {/* System Control Hub Modal  (oförändrad) */}
      {hubOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setHubOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <span className="text-white text-sm">⊞</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">System Control Hub</h2>
                  <p className="text-[10px] text-slate-400">SÄKER ANSLUTNING · MODUL V.7.5</p>
                </div>
              </div>
              <button onClick={() => setHubOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">×</button>
            </div>
            <div className="p-5">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 mb-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><span className="text-white text-xs">⊞</span></div>
                  <span className="text-[10px] text-blue-600 font-semibold">SYSTEM HUB V8.0</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{isOffline ? 'Offline' : 'Operativ'}</h3>
                <p className="text-xs text-slate-500 mb-3">Centraliserad orkestrering av forensiska moduler, AI-experter och juridiska exekveringsmotorer.</p>
                <div className="flex gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isOffline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {isOffline ? 'Offline-läge' : 'Operativ & Säkrad'}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">🛡 FMJAM-LOCKED</div>
                </div>
              </div>
              {[
                { label: 'EXPERTIS', items: [
                  { id: 'ekonomi',    name: 'Ekonomisk Motor',         desc: 'Hantera betalningar, fakturor och skadeståndskrav.', requiresApi: false },
                  { id: 'beslut',     name: 'Beslutsmotor',            desc: 'Interaktiv AI-rådgivare för juridiska frågor.',       requiresApi: true  },
                  { id: 'produktion', name: 'Juridisk Textproduktion', desc: 'Processkrifter enligt RB.',                            requiresApi: true  },
                ]},
                { label: 'ANALYS', items: [
                  { id: 'analys', name: 'Analys & Utredning', desc: 'Djupgående analys av bevisatomer.',  requiresApi: true  },
                  { id: 'arkiv',  name: 'Archive Core',       desc: 'Historiskt arkiv och rättskällor.',  requiresApi: false },
                ]},
              ].map(grupp => (
                <div key={grupp.label} className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-semibold text-slate-400 tracking-widest">{grupp.label}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {grupp.items.map(mod => {
                      const disabled = isOffline && mod.requiresApi;
                      return (
                        <button key={mod.id} disabled={disabled}
                          onClick={() => { handleTabChange(mod.id as NavTab); setHubOpen(false); }}
                          className={`border rounded-xl p-3 text-left transition-all ${disabled ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">{disabled ? 'OFFLINE' : '● ACTIVE'}</span>
                            <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{grupp.label}</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 mb-1">{mod.name}</div>
                          <div className="text-[10px] text-slate-400 leading-relaxed">{mod.desc}</div>
                          {!disabled && <div className="mt-2 text-[10px] text-blue-500 font-medium">ÖPPNA MODUL +</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-500">📈</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">SYSTEM HEALTH & TELEMETRY</div>
                    <div className="text-[10px] text-slate-400">REALTIDSÖVERVAKNING AV ALLA NODER</div>
                  </div>
                  <div className="ml-auto flex gap-4 text-center">
                    {[{ label: 'CPU', val: '12%', color: 'text-slate-700' }, { label: 'RAM', val: '1.4GB', color: 'text-blue-600' }, { label: 'LATENCY', val: '24ms', color: 'text-slate-700' }].map(m => (
                      <div key={m.label}><div className={`text-xs font-bold ${m.color}`}>{m.val}</div><div className="text-[9px] text-slate-400">{m.label}</div></div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <div className="text-slate-500 font-medium mb-1">● SENASTE AUDIT-HÄNDELSER</div>
                    {[['14:07', 'SHA-256 Verifiering OK'], ['14:02', 'RB-Pipeline Steg 8 Slutfört'], ['13:58', 'Integritetskontroll Atom-442']].map(([tid, msg]) => (
                      <div key={tid} className="flex gap-2 text-slate-400 py-0.5"><span className="text-slate-500">{tid}</span><span>● {msg}</span></div>
                    ))}
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium mb-1">● AI-EXPERT STATUS</div>
                    {[['ADVOKAT-AGENT', 'IDLE', 'text-slate-400'], ['OPINION-EXPERT', 'READY', 'text-emerald-600'], ['ADJUDICATOR', 'STANDBY', 'text-amber-500']].map(([name, status, color]) => (
                      <div key={name} className="flex justify-between text-slate-400 py-0.5"><span>{name}</span><span className={`font-semibold ${color}`}>{status}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;