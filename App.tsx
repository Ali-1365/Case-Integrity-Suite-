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
      <button 
        onClick={() => window.location.reload()}
        className="border border-[var(--accent-foreground)]/20 px-3 py-1 rounded-md hover:bg-[var(--accent-foreground)]/10 transition-all active:scale-95"
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
    return offlineService.subscribe((offline) => {
      setIsOffline(offline);
    });
  }, []);

  const handleBoot = () => setBooted(true);

  if (!booted) return <BootScreen onComplete={handleBoot} />;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--ink-main)]">
      <OfflineBanner />
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
