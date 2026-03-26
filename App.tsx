import React, { useState, useEffect, Suspense, lazy } from 'react';
import { offlineService } from './services/offlineService';

// Dynamisk import för huvudkomponenten
const DocumentManager = lazy(() => import('./components/DocumentManager'));

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
    <div className="fixed inset-0 bg-[#FDFCFB] flex flex-col items-center justify-center z-50 p-6">
      <div className="mb-12 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight mb-2">Case Integrity Suite</h1>
        <p className="text-indigo-600 text-xs font-black uppercase tracking-[0.4em]">Enterprise Edition v1.0</p>
      </div>
      
      <div className="w-full max-w-xs">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">{status}</p>
      </div>
      
      <button 
        onClick={onComplete}
        className="mt-16 text-[10px] text-slate-400 hover:text-indigo-600 uppercase tracking-[0.3em] font-black transition-all"
      >
        Hoppa över introduktion →
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
//  HUVUD-APP
// ─────────────────────────────────────────────
const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());

  useEffect(() => {
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const handleBoot = () => setBooted(true);

  if (!booted) return <BootScreen onComplete={handleBoot} />;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <OfflineBanner />
      <div className={isOffline ? 'pt-[34px]' : ''}>
        <Suspense fallback={
          <div className="flex flex-col h-screen items-center justify-center bg-[#FDFCFB] space-y-12">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-t-2 border-indigo-600 rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Laddar Case Integrity Suite...</p>
          </div>
        }>
          <DocumentManager onLogout={() => window.location.reload()} />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
