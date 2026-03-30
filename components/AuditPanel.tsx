
import React, { useState, useEffect } from 'react';
import { db, AuditLogEntry } from '../lib/db';
import { auditService } from '../lib/AuditService';
import { 
  ShieldCheckIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  BoltIcon,
  ActivityIcon,
  ScaleIcon,
  FingerPrintIcon
} from './icons';

interface AuditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuditPanel: React.FC<AuditPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAuditLogs();
      setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs().catch(err => console.error("Initial loadLogs failed:", err));
    }
  }, [isOpen]);

  const getSystemStatus = () => {
    if (logs.length === 0) return 'UNKNOWN';
    const recent = logs.slice(0, 5);
    if (recent.some(l => l.status === 'ERROR')) return 'RED';
    if (recent.some(l => l.status === 'WARN')) return 'YELLOW';
    return 'GREEN';
  };

  const status = getSystemStatus();

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] overflow-hidden font-sans transition-all border-l border-[var(--border-strong)] shadow-2xl">
      
      <header className="px-10 py-8 flex justify-between items-center border-b border-[var(--border-strong)] bg-[var(--bg-card)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <ShieldCheckIcon className="w-32 h-32 text-[var(--accent)]" />
          </div>
          <div className="flex items-center space-x-6 relative z-10">
            <div className={`p-4 border ${status === 'GREEN' ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : status === 'YELLOW' ? 'bg-[var(--warning)]/10 border-[var(--warning)]/30' : 'bg-[var(--danger)]/10 border-[var(--danger)]/30'}`}>
                <ShieldCheckIcon className={`h-8 w-8 ${status === 'GREEN' ? 'text-[var(--success)]' : status === 'YELLOW' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BoltIcon className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Audit Engine v.2.1-GOLD</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--ink-main)] tracking-tighter italic uppercase leading-none">System Audit Trail</h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className={`w-2 h-2 rounded-full ${status === 'GREEN' ? 'bg-[var(--success)] shadow-[0_0_8px_var(--success)]' : 'bg-[var(--danger)] shadow-[0_0_8px_var(--danger)]'} animate-pulse`}></span>
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest italic">Integritet: {status} | {logs.length} LOGGAR</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <button onClick={() => auditService.exportLogs('ALL')} className="p-3 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border border-[var(--border)] group">
              <ArrowDownTrayIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => loadLogs().catch(err => console.error("Manual loadLogs failed:", err))} className="p-3 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border border-[var(--border)] group">
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
            <button onClick={onClose} className="p-3 text-[var(--ink-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-main)] transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-10 space-y-6 custom-scrollbar bg-[var(--bg-main)]">
            <div className="grid grid-cols-1 gap-4">
                {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="group bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 hover:border-[var(--accent)] transition-all relative overflow-hidden shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-6">
                                <div className={`p-3 border ${log.status === 'OK' ? 'bg-[var(--success)]/5 border-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warning)]/5 border-[var(--warning)]/20 text-[var(--warning)]'}`}>
                                    {log.operationType === 'INGEST' ? <ArrowPathIcon className="h-5 w-5" /> : log.operationType === 'INDEX' ? <CpuChipIcon className="h-5 w-5" /> : <InformationCircleIcon className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-4 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] italic">{log.operationType}</span>
                                        <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    </div>
                                    <p className="text-sm font-black text-[var(--ink-main)] uppercase tracking-widest italic">{log.resultSummary}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-mono font-bold text-[var(--ink-muted)] block uppercase opacity-40 mb-2">ID: {log.id.substring(0, 8)}</span>
                                <span className={`text-[9px] font-black px-3 py-1 border uppercase tracking-widest italic ${log.status === 'OK' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30' : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30'}`}>
                                    {log.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-[var(--border)] flex flex-wrap gap-8">
                            <div className="flex items-center space-x-3">
                                <FingerPrintIcon className="w-3 h-3 text-[var(--accent)]" />
                                <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Hashes:</span>
                                <span className="text-[10px] font-mono font-bold text-[var(--ink-main)]">{log.provenanceHashes.length} kryptografiskt låsta</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ScaleIcon className="w-3 h-3 text-[var(--accent)]" />
                                <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Omfattning:</span>
                                <span className="text-[10px] font-mono font-bold text-[var(--ink-main)] truncate max-w-[300px] italic">{log.affectedLaws.join(', ') || 'Global System Core'}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-32 text-center flex flex-col items-center space-y-6 opacity-20">
                        <div className="w-20 h-20 bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                            <InformationCircleIcon className="h-10 w-10 text-[var(--ink-muted)]" />
                        </div>
                        <p className="text-xl font-black uppercase italic tracking-[0.3em] text-[var(--ink-muted)]">Audit buffer empty</p>
                    </div>
                )}
            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-[var(--border-strong)] bg-[var(--bg-card)] flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
                <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] italic">Compliance: Aktiv | SFS 2025:400 | GDPR_SECURE</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)] uppercase opacity-50">{new Date().toLocaleTimeString()}</span>
        </footer>
    </div>
  );
};

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AuditPanel;
