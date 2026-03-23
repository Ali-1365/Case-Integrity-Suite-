
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
  CpuChipIcon
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
      setLogs(data);
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden font-sans transition-all">
      
      <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-4">
            <div className={`p-2.5 rounded-xl border ${status === 'GREEN' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : status === 'YELLOW' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'}`}>
                <ShieldCheckIcon className={`h-6 w-6 ${status === 'GREEN' ? 'text-emerald-600 dark:text-emerald-400' : status === 'YELLOW' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">System Audit Trail</h2>
              <div className="flex items-center mt-1.5 space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'GREEN' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Integritet: {status} | {logs.length} LOGGAR</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => auditService.exportLogs('ALL')} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button onClick={() => loadLogs().catch(err => console.error("Manual loadLogs failed:", err))} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
            <div className="space-y-3">
                {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all relative overflow-hidden shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border ${log.status === 'OK' ? 'border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400'}`}>
                                    {log.operationType === 'INGEST' ? <ArrowPathIcon className="h-4 w-4" /> : log.operationType === 'INDEX' ? <CpuChipIcon className="h-4 w-4" /> : <InformationCircleIcon className="h-4 w-4" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{log.operationType}</span>
                                        <span className="text-[9px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{log.resultSummary}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-mono text-slate-400 block uppercase opacity-50">ID: {log.id.substring(0, 8)}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block border ${log.status === 'OK' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'}`}>
                                    {log.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-3">
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Hashes:</span>
                                <span className="text-[9px] font-mono text-blue-500/60">{log.provenanceHashes.length} låsta</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Omfattning:</span>
                                <span className="text-[9px] font-mono text-purple-400 truncate max-w-[200px]">{log.affectedLaws.join(', ') || 'Global'}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <InformationCircleIcon className="h-16 w-16 mb-4" />
                        <p className="text-lg font-bold uppercase italic tracking-widest">Audit buffer empty</p>
                    </div>
                )}
            </div>
        </main>
        
        <footer className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-slate-400">
                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Compliance: Aktiv | SFS 2025:400</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase opacity-50">{new Date().toLocaleTimeString()}</span>
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
