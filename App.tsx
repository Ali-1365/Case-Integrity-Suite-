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
    <div className={`fixed top-0 left-0 right-0 z-[9999] px-6 py-3 text-center flex items-center justify-center gap-4 shadow-2xl backdrop-blur-md border-b transition-all duration-500 ${
      reason === 'QUOTA_EXCEEDED' 
        ? 'bg-blue-600/90 border-blue-400/30 text-white' 
        : 'bg-amber-500/90 border-amber-300/30 text-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner ${
          reason === 'QUOTA_EXCEEDED' ? 'bg-blue-700/50' : 'bg-amber-600/50'
        }`}>
          {reason === 'QUOTA_EXCEEDED' ? 'ℹ' : '⚠'}
        </div>
        <span className="text-sm font-bold tracking-tight">{getMessage()}</span>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-white/20 hover:bg-white/40 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/30 backdrop-blur-sm"
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
    <div className="fixed inset-0 bg-[#FDFCFB] flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
      {/* Dekorativa bakgrundselement */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-100/50 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="relative mb-16 text-center animate-in fade-in zoom-in duration-1000">
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-4 border-white/20">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="animate-pulse">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="text-6xl font-serif font-bold text-slate-900 tracking-tighter mb-4">Case Integrity Suite</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-indigo-200" />
          <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.5em]">Enterprise Edition v1.0</p>
          <div className="h-px w-8 bg-indigo-200" />
        </div>
      </div>
      
      <div className="w-full max-w-sm relative">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest animate-pulse">{status}</p>
          <p className="text-indigo-600 text-[11px] font-mono font-bold">{progress}%</p>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="mt-20 px-8 py-3 rounded-2xl text-[11px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 uppercase tracking-[0.3em] font-black transition-all active:scale-95"
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
