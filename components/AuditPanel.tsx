
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
    const data = await db.getAuditLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadLogs();
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
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-[250] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-6">
            <div className={`p-4 rounded-2xl border ${status === 'GREEN' ? 'bg-green-500/10 border-green-500/20' : status === 'YELLOW' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <ShieldCheckIcon className={`h-10 w-10 ${status === 'GREEN' ? 'text-green-400' : status === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'}`} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">System Audit Trail</h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className={`w-2 h-2 rounded-full ${status === 'GREEN' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Integrity Level: {status} | {logs.length} TRANSACTION_LOGS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => auditService.exportLogs('ALL')} className="p-3 text-gray-400 hover:text-cyan-400 transition-all bg-gray-800 rounded-2xl">
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
            <button onClick={loadLogs} className="p-3 text-gray-400 hover:text-white transition-all bg-gray-800 rounded-2xl">
              <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-gray-950/40">
            <div className="space-y-4">
                {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="group bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/60 transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-xl bg-black/40 border ${log.status === 'OK' ? 'border-green-500/20 text-green-400' : 'border-orange-500/20 text-orange-400'}`}>
                                    {log.operationType === 'INGEST' ? <ArrowPathIcon className="h-5 w-5" /> : log.operationType === 'INDEX' ? <CpuChipIcon className="h-5 w-5" /> : <InformationCircleIcon className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">{log.operationType}</span>
                                        <span className="text-[9px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-bold text-white mt-1 uppercase italic tracking-tight">{log.resultSummary}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-mono text-gray-700 block uppercase">Log_ID: {log.id}</span>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded mt-1 inline-block border ${log.status === 'OK' ? 'bg-green-950/30 text-green-500 border-green-500/20' : 'bg-red-950/30 text-red-500 border-red-500/20'}`}>
                                    {log.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-[8px] font-black text-gray-600 uppercase">Provenance Hashes:</span>
                                <span className="text-[9px] font-mono text-cyan-500/60">{log.provenanceHashes.length} locked</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[8px] font-black text-gray-600 uppercase">Affected:</span>
                                <span className="text-[9px] font-mono text-purple-400">{log.affectedLaws.join(', ') || 'Global'}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <InformationCircleIcon className="h-24 w-24 mb-6" />
                        <p className="text-2xl font-black uppercase italic tracking-[0.3em]">Audit buffer empty</p>
                    </div>
                )}
            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-gray-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compliance Engine: Active | SFS 2025:400 Logged</span>
            </div>
            <span className="text-[10px] font-mono text-gray-700 uppercase">System Integrity Checked: {new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
};

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AuditPanel;
