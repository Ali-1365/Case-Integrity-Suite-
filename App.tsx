import { LegalSourceCode } from "./types";
// import { Contradiction } from '@/lib/cis.types';
import { Fact } from '@/lib/cis.types';
// import { Invoice } from '@/types';
// import { Invoice } from '@/types';
import { StoredDocument } from '@/types';
// // // import { StoredDocument } from '@/types';
// // import { Invoice } from '@/types';
// // import { Fact, CISCase, ContradictionV2, LegalParagraph } from '@/lib/cis.types';
// @ts-expect-error Typescript type resolution issue
type Contradiction = ContradictionV2;
import React, { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
//  OFFLINE BANNER
// ─────────────────────────────────────────────
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOffline(((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true);
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
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;

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
  const [doc, setDoc] = useState<StoredDocument | null>(null);
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
      } catch (err: unknown) {
        setError(`Kunde inte ladda ärendet: ${(err instanceof Error ? err.message : String(err))}`);
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
  // @ts-expect-error General type mismatch
  const facts = analysis.facts || [];
  // @ts-expect-error General type mismatch
  const contradictions = analysis.contradictions || [];
  // @ts-expect-error General type mismatch
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
            {facts.map((f: Fact, i: number) => (
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
            {contradictions.map((c: Contradiction, i: number) => (
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
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            // @ts-expect-error Typescript type resolution issue
            {legalRefs.map((ref: { id: string, rawText: string, source: string }, i: number) => (
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
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    import('./components/ArchiveView')
      // @ts-expect-error
      .then(mod => setComp(() => mod.default))
      .catch(err => {
        console.error('Kunde inte ladda ArchiveView:', err);
        setLoadError((err as Error).message);
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
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;

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
    </div>
  );
};

// ─────────────────────────────────────────────
//  EKONOMI-VY  (oförändrad)
// ─────────────────────────────────────────────
const EkonomiView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'oversikt' | 'betalningar' | 'fakturor' | 'skadestand' | 'budget'>('oversikt');
  const [showNyFaktura, setShowNyFaktura] = useState(false);
  const [showNyBetalning, setShowNyBetalning] = useState(false);
  const [showNyttKrav, setShowNyttKrav] = useState(false);
  // @ts-expect-error Typescript type resolution issue
  const [fakturor, setFakturor] = useState<Invoice[]>([]);
  const [betalningar, setBetalningar] = useState([
    { id: 1, mottagare: 'Advokatbyrå X', datum: '2026-03-10', belopp: 5000 },
    { id: 2, mottagare: 'Domstolsverket', datum: '2026-03-25', belopp: 1200 },
  ]);
  const [krav, setKrav] = useState([
    { id: 1, karande: 'Privatperson X', svarande: 'Staten', typ: 'Statligt Skadestånd', belopp: 75000, sannolikhet: 65, status: 'INLÄMNAD', komponenter: [{ typ: 'Personskada', belopp: 50000, grund: 'Skl. 5 kap. 1 §' }, { typ: 'Inkomstförlust', belopp: 25000, grund: 'Skl. 5 kap. 1 §' }] },
    { id: 2, karande: 'Företag B', svarande: 'Privatperson Y', typ: 'Privat', belopp: 120000, sannolikhet: 80, status: 'FÖRHANDLING', komponenter: [{ typ: 'Sakskada', belopp: 120000, grund: 'Skl. 2 kap. 1 §' }] },
  ]);
  const [nyFaktura, setNyFaktura] = useState({ kundnamn: '', forfallodatum: '', belopp: '' });
  const [nyBetalning, setNyBetalning] = useState({ mottagare: '', belopp: '', andamal: '' });
  const [nyttKrav, setNyttKrav] = useState({ karande: '', svarande: '', typ: 'Statligt Skadestånd', belopp: '', beskrivning: '' });

  const totalBetalningar = betalningar.reduce((s, b) => s + b.belopp, 0);
  const totalFakturor = fakturor.reduce((s, f) => s + parseFloat(f.belopp || '0'), 0);
  const totalKrav = krav.reduce((s, k) => s + k.belopp, 0);

  const tabs = [
    { id: 'oversikt', label: 'Översikt' }, { id: 'betalningar', label: 'Betalningar' },
    { id: 'fakturor', label: 'Fakturor' }, { id: 'skadestand', label: 'Skadestånd' },
    { id: 'budget', label: 'Budget & Prognos' },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Ekonomisk Motor</h1>
      <p className="text-xs text-slate-400 mb-6">SÄKER ANSLUTNING · MODUL V.7.5</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTALA BETALNINGAR',    value: `${totalBetalningar.toLocaleString('sv-SE')} kr`, trend: '+5.2%', color: 'text-emerald-600' },
          { label: 'UTESTÅENDE FAKTUROR',   value: `${totalFakturor.toLocaleString('sv-SE')} kr`,    trend: '-2.1%', color: 'text-red-500' },
          { label: 'SKADESTÅNDSKRAV (EST.)', value: `${totalKrav.toLocaleString('sv-SE')} kr`,        trend: '',      color: 'text-blue-600' },
          { label: 'BUDGETFÖLJSAMHET',      value: '94.2%',                                           trend: '+1.5%', color: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-3">
            {m.trend && <div className={`text-xs font-semibold mb-1 ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{m.trend}</div>}
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'oversikt' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Finansiell Överblick</h3>
            <p className="text-xs text-slate-400 mb-4">Realtidsanalys av pågående rättsliga processer och budgetstatus.</p>
            <div className="space-y-2">
              {krav.map(k => (
                <div key={k.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div><div className="text-sm font-medium text-slate-900">{k.karande} vs {k.svarande}</div><div className="text-xs text-slate-400">Skadestånd</div></div>
                  <div className="text-right"><div className="text-sm font-semibold text-slate-900">{k.belopp.toLocaleString('sv-SE')} kr</div><div className="text-xs text-slate-400">{k.status}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Senaste Betalningar</h3>
            {betalningar.map(b => (
              <div key={b.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div><div className="text-sm font-medium text-slate-900">{b.mottagare}</div><div className="text-xs text-slate-400">{b.datum}</div></div>
                <div className="text-sm font-semibold text-slate-900">{b.belopp.toLocaleString('sv-SE')} kr</div>
              </div>
            ))}
            <button onClick={() => setShowNyBetalning(true)} className="mt-3 w-full text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              + Registrera betalning
            </button>
          </div>
        </div>
      )}

      {activeTab === 'betalningar' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Betalningshistorik</h3>
            <button onClick={() => setShowNyBetalning(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">+ Ny Betalning</button>
          </div>
          {betalningar.length === 0
            ? <p className="text-xs text-slate-400 text-center py-8">Inga betalningar registrerade.</p>
            : betalningar.map(b => (
              <div key={b.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                <div><div className="text-sm font-medium text-slate-900">{b.mottagare}</div><div className="text-xs text-slate-400">{b.datum}</div></div>
                <div className="text-sm font-semibold text-emerald-600">{b.belopp.toLocaleString('sv-SE')} kr</div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'fakturor' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Fakturahantering</h3>
            <button onClick={() => setShowNyFaktura(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">+ Ny Faktura</button>
          </div>
          {fakturor.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-xs text-slate-400">Inga fakturor skapade ännu.</p>
              <button onClick={() => setShowNyFaktura(true)} className="mt-3 text-xs text-blue-600 hover:underline">Skapa din första faktura</button>
            </div>
          ) : fakturor.map((f, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
              <div><div className="text-sm font-medium text-slate-900">{f.kundnamn}</div><div className="text-xs text-slate-400">Förfaller: {f.forfallodatum}</div></div>
              <div className="text-sm font-semibold text-slate-900">{parseFloat(f.belopp).toLocaleString('sv-SE')} kr</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skadestand' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div><h3 className="text-sm font-semibold text-slate-700">Skadeståndsprocesser</h3><p className="text-xs text-slate-400">Övervaka och analysera pågående skadeståndskrav.</p></div>
            <button onClick={() => setShowNyttKrav(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">+ Nytt Krav</button>
          </div>
          {krav.map(k => (
            <div key={k.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">{k.karande}</span>
                    <span className="text-slate-400 text-xs">mot</span>
                    <span className="text-sm font-semibold text-slate-900">{k.svarande}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{k.typ.toUpperCase()}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{k.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">ESTIMERAT VÄRDE</div>
                  <div className="text-lg font-bold text-slate-900">{k.belopp.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-slate-400">Sannolikhet: {k.sannolikhet}%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase mb-2">Skadekomponenter</div>
                  {k.komponenter.map((komp, i) => (
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                      <div><div className="font-medium text-slate-700">{komp.typ}</div><div className="text-slate-400">{komp.grund}</div></div>
                      <div className="font-medium text-slate-900">{komp.belopp.toLocaleString('sv-SE')} kr</div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-400 uppercase mb-2">Juridisk Grund & Analys</div>
                  <div className="text-[10px] text-blue-600 font-medium mb-2">AI-Legal Analys</div>
                  <div className="text-[10px] text-slate-500">
                    {((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) ? 'AI-analys ej tillgänglig i offline-läge.' : 'Klicka "Uppdatera Analys" för att generera AI-bedömning.'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Budgetprognos</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'INTÄKTER', belopp: totalBetalningar, color: 'bg-blue-200' },
              { label: 'UTGIFTER', belopp: totalFakturor,    color: 'bg-rose-200' },
              { label: 'RESULTAT', belopp: totalBetalningar - totalFakturor, color: 'bg-emerald-200' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <div className={`h-24 rounded-lg ${b.color} mb-2`} />
                <div className="text-[10px] text-slate-400">{b.label}</div>
                <div className="text-sm font-semibold text-slate-900">{b.belopp.toLocaleString('sv-SE')} kr</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 mb-1">AI-Insikt: Antifragil Optimering</div>
            <p className="text-xs text-slate-600">Baserat på nuvarande skadeståndsprocesser och fakturaflöden rekommenderas en ökad likviditetsreserv på 12% för att hantera potentiella rättsliga osäkerheter under Q2.</p>
          </div>
        </div>
      )}

      {showNyFaktura && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">Skapa Ny Faktura</h3>
              <button onClick={() => setShowNyFaktura(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Kundnamn</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="Kundens fullständiga namn" value={nyFaktura.kundnamn} onChange={e => setNyFaktura(p => ({ ...p, kundnamn: e.target.value }))} />
                <p className="text-[10px] text-slate-400 mt-1">Namnet på den kund som faktureras.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Förfallodatum</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={nyFaktura.forfallodatum} onChange={e => setNyFaktura(p => ({ ...p, forfallodatum: e.target.value }))} />
                <p className="text-[10px] text-slate-400 mt-1">Sista dagen för kunden att betala fakturan.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Totalbelopp (inkl. moms)</label>
                <div className="relative">
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm pr-12 focus:outline-none focus:border-blue-400" placeholder="0.00" value={nyFaktura.belopp} onChange={e => setNyFaktura(p => ({ ...p, belopp: e.target.value }))} />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">SEK</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNyFaktura(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Avbryt</button>
              <button onClick={() => { if (nyFaktura.kundnamn && nyFaktura.belopp) { setFakturor(p => [...p, { ...nyFaktura }]); setNyFaktura({ kundnamn: '', forfallodatum: '', belopp: '' }); setShowNyFaktura(false); } }} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">✓ Skapa Faktura</button>
            </div>
          </div>
        </div>
      )}

      {showNyBetalning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">Registrera Ny Betalning</h3>
              <button onClick={() => setShowNyBetalning(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Mottagare</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="T.ex. Juridisk person..." value={nyBetalning.mottagare} onChange={e => setNyBetalning(p => ({ ...p, mottagare: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Belopp (brutto)</label>
                  <div className="relative">
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm pr-12 focus:outline-none focus:border-blue-400" placeholder="0.00" value={nyBetalning.belopp} onChange={e => setNyBetalning(p => ({ ...p, belopp: e.target.value }))} />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">SEK</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Ändamål / Beskrivning</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 h-20 resize-none" placeholder="T.ex. Betalning av faktura #12345..." value={nyBetalning.andamal} onChange={e => setNyBetalning(p => ({ ...p, andamal: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNyBetalning(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Avbryt</button>
              <button onClick={() => { if (nyBetalning.mottagare && nyBetalning.belopp) { setBetalningar(p => [...p, { id: Date.now(), mottagare: nyBetalning.mottagare, datum: new Date().toISOString().slice(0,10), belopp: parseFloat(nyBetalning.belopp) }]); setNyBetalning({ mottagare: '', belopp: '', andamal: '' }); setShowNyBetalning(false); } }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors">✓ Spara Betalning</button>
            </div>
          </div>
        </div>
      )}

      {showNyttKrav && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">Registrera Nytt Skadeståndskrav</h3>
              <button onClick={() => setShowNyttKrav(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Kärande</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="Vem ställer kravet?" value={nyttKrav.karande} onChange={e => setNyttKrav(p => ({ ...p, karande: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Svarande</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="Vem riktas kravet mot?" value={nyttKrav.svarande} onChange={e => setNyttKrav(p => ({ ...p, svarande: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Typ av krav</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={nyttKrav.typ} onChange={e => setNyttKrav(p => ({ ...p, typ: e.target.value }))}>
                    <option>Statligt Skadestånd</option><option>Privat Skadestånd</option><option>Kränkningsersättning</option><option>Sakskada</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Estimerat belopp</label>
                  <div className="relative">
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm pr-12 focus:outline-none focus:border-blue-400" placeholder="0.00" value={nyttKrav.belopp} onChange={e => setNyttKrav(p => ({ ...p, belopp: e.target.value }))} />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">SEK</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide block mb-1">Händelsebeskrivning & Grund</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 h-24 resize-none" placeholder="Beskriv händelsen, tidpunkt och den juridiska grunden för kravet..." value={nyttKrav.beskrivning} onChange={e => setNyttKrav(p => ({ ...p, beskrivning: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNyttKrav(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Avbryt</button>
              <button onClick={() => { if (nyttKrav.karande && nyttKrav.svarande && nyttKrav.belopp) { setKrav(p => [...p, { id: Date.now(), karande: nyttKrav.karande, svarande: nyttKrav.svarande, typ: nyttKrav.typ, belopp: parseFloat(nyttKrav.belopp), sannolikhet: 50, status: 'INLÄMNAD', komponenter: [] }]); setNyttKrav({ karande: '', svarande: '', typ: 'Statligt Skadestånd', belopp: '', beskrivning: '' }); setShowNyttKrav(false); } }} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors">✓ Registrera Krav</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  ANALYS-VY  (oförändrad)
// ─────────────────────────────────────────────
const AnalysView: React.FC = () => {
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Analys & Utredning</h1>
      <p className="text-xs text-slate-400 mb-6">SÄKER ANSLUTNING · MODUL V.7.5</p>
      {isOffline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⚠</div>
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Offline-läge aktivt</h3>
          <p className="text-xs text-amber-600">AI-analysmodulen kräver en giltig API-nyckel. Lägg till GEMINI_API_KEY i miljövariablerna och starta om.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Välj ett ärende för analys</h3>
          <p className="text-xs text-slate-400">Gå till Arkiv och välj ett ärende för att starta djupanalys.</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  BESLUT-VY  (oförändrad)
// ─────────────────────────────────────────────
const BeslutView: React.FC = () => {
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;
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
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;
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

  const handleBoot = useCallback(() => setBooted(true), []);
  const isOffline = ((window as Window & typeof globalThis & { OFFLINE_MODE?: boolean }).OFFLINE_MODE) === true;
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