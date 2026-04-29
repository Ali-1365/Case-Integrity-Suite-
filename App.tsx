import React, { useState, useEffect, Suspense, lazy } from 'react';
import { offlineService } from './services/offlineService';
import { autonomousEngine } from './lib/AutonomousEngine';
import { Bot, Shield, Cpu } from 'lucide-react';

// Dynamisk import för huvudkomponenten
const DocumentManager = lazy(() => import('./components/DocumentManager'));

// ─────────────────────────────────────────────
//  AUTONOMOUS STATUS BAR
// ─────────────────────────────────────────────
const AutonomousStatusBar: React.FC = () => {
  const [status, setStatus] = useState(autonomousEngine.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = autonomousEngine.getStatus();
      setStatus(prev => {
        if (
          prev.active === newStatus.active &&
          prev.traceId === newStatus.traceId &&
          prev.mode === newStatus.mode &&
          prev.integrity === newStatus.integrity
        ) {
          return prev;
        }
        return newStatus;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status.active) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-strong)] px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
      <div className="relative">
        <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center text-[var(--accent)]">
          <Bot className="w-6 h-6 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--success)] rounded-full border-2 border-[var(--bg-card)] shadow-sm" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-widest">Autonomous Mode</span>
          <span className="text-[8px] font-bold text-[var(--success)] bg-[var(--success)]/10 px-1.5 py-0.5 rounded uppercase border border-[var(--success)]/20">Active</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase tracking-tighter opacity-60">ID: {status.traceId}</span>
          <div className="w-1 h-1 bg-[var(--border)] rounded-full" />
          <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase tracking-tighter opacity-60">Integrity: {status.integrity}</span>
        </div>
      </div>
    </div>
  );
};

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
      case 'API_KEY_MISSING': return 'API-nyckel saknas.';
      case 'QUOTA_EXCEEDED': return 'API-kvot överskriden.';
      case 'NETWORK_ERROR': return 'Nätverksfel.';
      case 'MANUAL': return 'Offline-läge.';
      default: return 'OFFLINE';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] px-4 py-2 text-center flex items-center justify-center gap-4 bg-[var(--ink-main)] text-[var(--accent-foreground)] text-[10px] font-bold uppercase tracking-widest shadow-lg">
      <span className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse shadow-[0_0_8px_var(--danger)]" />
        {getMessage()}
      </span>
      <div className="flex gap-2">
        <button 
          onClick={() => {
            import('./services/geminiService').then(m => m.geminiService.forceOnline());
            window.location.reload();
          }}
          className="bg-[var(--accent)] text-[var(--bg-main)] px-3 py-1 rounded-md hover:bg-[var(--accent-hover)] transition-all active:scale-95"
        >
          Tvinga Online
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="border border-[var(--accent-foreground)]/20 px-3 py-1 rounded-md hover:bg-[var(--accent-foreground)]/10 transition-all active:scale-95"
        >
          Uppdatera
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  BOOT SCREEN
// ─────────────────────────────────────────────
const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-center z-50 p-6">
      <div className="text-center animate-in fade-in duration-500">
        <h1 className="text-xl font-bold text-[var(--ink-main)] tracking-tight mb-2 font-serif">Case Integrity Suite</h1>
        <p className="text-[var(--ink-muted)] text-[9px] font-bold uppercase tracking-[0.3em] mb-8">System Init</p>
        
        <div className="w-48 h-1 bg-[var(--border)] rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
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
    if (booted) {
      autonomousEngine.start();
    }
  }, [booted]);

  useEffect(() => {
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const handleBoot = () => setBooted(true);

  if (!booted) return <BootScreen onComplete={handleBoot} />;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--ink-main)]">
      <OfflineBanner />
      <AutonomousStatusBar />
      <div className={isOffline ? 'pt-[34px]' : ''}>
        <Suspense fallback={
          <div className="flex flex-col h-screen items-center justify-center bg-[var(--bg-main)] space-y-12">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-[var(--border)] rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-t-2 border-[var(--accent)] rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--ink-muted)] animate-pulse">Laddar Case Integrity Suite...</p>
          </div>
        }>
          <DocumentManager onLogout={() => window.location.reload()} />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
