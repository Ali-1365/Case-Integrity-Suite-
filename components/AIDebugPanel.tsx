
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { loggingService } from '../services/loggingService';
import { githubService, RepoStatus } from '../services/githubService';
import { useLogging } from '../hooks/useLogging';
import { 
  XMarkIcon, 
  CodeBracketIcon, 
  Spinner, 
  PaperAirplaneIcon,
  CpuChipIcon,
  ActivityIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from './icons';

interface AIDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIDebugPanel: React.FC<AIDebugPanelProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const { logs, refreshLogs } = useLogging(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        githubService.getRepoStatus().then(setRepoStatus);
        refreshLogs();
    }
  }, [isOpen, refreshLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleQuery = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    const context = JSON.stringify({
        logs: logs.slice(0, 5),
        git: repoStatus,
        jules_task: githubService.getJulesTaskUrl()
    }, null, 2);
    
    const fullPrompt = `
      **TECHNICAL ORACLE & SYSTEM ARCHITECT MODE**
      Analysera systemets tillstånd och loggarna.
      
      LOGG_SAMPLING (Senaste 5):
      ${context}
      
      ANVÄNDARFRÅGA: ${prompt}
    `;

    try {
      const res = await geminiService.generate({
        contents: fullPrompt,
        config: {
          systemInstruction: "Du är systemarkitekten för FMJAM. Svara tekniskt, auktoritärt och baserat på de bifogade loggarna.",
        }
      }, 'think');
      setResponse(res);
      refreshLogs();
    } catch (err) {
      setResponse(`### KRITISKT SYSTEMFEL\n\n${err instanceof Error ? err.message : 'Kommunikationsavbrott.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        alert('Kunde inte kopiera automatiskt. Vänligen markera och kopiera manuellt.');
        return;
    }
    navigator.clipboard.writeText(response).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Kunde inte kopiera till urklipp.');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 md:p-8 outline-none animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-7xl h-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden font-sans transition-all">
        
        <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <CodeBracketIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">System Architect Oracle</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1.5">v.7.2.8-GOLD | TELEMETRY_ENABLED</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 active:scale-95 relative z-10">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 relative z-10">
            <div className="flex items-center space-x-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
                <ActivityIcon className="w-3.5 h-3.5" />
                <span>Live System Telemetry</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={async () => {
                    try {
                        if (!navigator.clipboard || !navigator.clipboard.readText) {
                            throw new Error('Clipboard API not supported or blocked by browser security.');
                        }
                        const text = await navigator.clipboard.readText();
                        setPrompt(prev => prev + text);
                    } catch (err) {
                        console.error('Failed to paste:', err);
                        alert('Kunde inte klistra in automatiskt. Vänligen klistra in manuellt (Ctrl+V / Cmd+V) i textfältet nedan.');
                    }
                }} className="px-3 py-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Klistra in logg
                </button>
                <button onClick={refreshLogs} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className={`flex flex-col font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-all ${expandedLogId === log.id ? 'border-blue-300' : 'hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`shrink-0 font-bold px-1.5 rounded ${log.level === 'ERROR' ? 'bg-red-100 text-red-700' : log.level === 'WARN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-800'}`}>
                                    {log.level}
                                </span>
                                <span className={`shrink-0 font-bold px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
                                    {log.mode.toUpperCase()}
                                </span>
                                <span className="text-slate-500 truncate italic opacity-60">
                                    {log.message.substring(0, 60)}...
                                </span>
                            </div>
                            <span className="text-slate-400 font-bold">{log.duration ? `${log.duration}ms` : ''}</span>
                        </div>
                        {expandedLogId === log.id && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-2">
                                <p><span className="font-bold text-slate-400">MESSAGE:</span> {log.message}</p>
                                {log.details && (
                                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg mt-1 overflow-x-auto">
                                        <pre className="text-[9px]">{JSON.stringify(log.details, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-[10px] text-slate-400 italic py-4 text-center">Inga anrop loggade.</p>
                )}
            </div>
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10 bg-white dark:bg-slate-900" ref={scrollRef}>
          {response && (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative group animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-3 animate-pulse"></span>
                    Oracle Architectural Analysis
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                  {response.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </div>
                <button onClick={copyToClipboard} className="absolute top-8 right-8 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    {copied ? 'Kopierat' : 'Kopiera'}
                </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
                <Spinner className="w-12 h-12 text-blue-600 mb-4" />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest animate-pulse">Aggregerar Systemtelemetri...</p>
            </div>
          )}
          
          {!response && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <CpuChipIcon className="w-32 h-32 text-slate-400 mb-6" />
                  <p className="text-xl font-bold uppercase tracking-widest italic">Architect Standby</p>
              </div>
          )}
        </main>

        <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                  placeholder="Ställ en teknisk fråga..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 pr-16 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none shadow-inner placeholder-slate-400"
                  rows={2}
                />
                <button
                  onClick={handleQuery}
                  disabled={isLoading || !prompt.trim()}
                  className="absolute bottom-4 right-4 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4 flex justify-center space-x-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-3 h-3" /> SECURE_TRACE</span>
                <span className="flex items-center gap-1.5"><ActivityIcon className="w-3 h-3" /> VERBOSE</span>
                <span className="flex items-center gap-1.5"><CpuChipIcon className="w-3 h-3" /> GOLD_TIER</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AIDebugPanel;
