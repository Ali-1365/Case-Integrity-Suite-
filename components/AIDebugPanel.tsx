
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { loggingService, LogEntry } from '../services/loggingService';
import { githubService, RepoStatus } from '../services/githubService';
import { 
  XMarkIcon, 
  CodeBracketIcon, 
  SparklesIcon, 
  Spinner, 
  PaperAirplaneIcon,
  CpuChipIcon,
  GithubIcon,
  ShieldCheckIcon,
  ActivityIcon,
  ArrowPathIcon
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
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshLogs = () => {
    const logs = loggingService.getLogs().slice(0, 5);
    setRecentLogs(logs);
  };

  useEffect(() => {
    if (isOpen) {
        githubService.getRepoStatus().then(setRepoStatus);
        refreshLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleQuery = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    const logs = loggingService.getLogs().slice(0, 5);
    const context = JSON.stringify({
        logs,
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
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-2xl z-[250] flex items-center justify-center p-4 md:p-8 outline-none animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col border border-cyan-500/20 overflow-hidden ring-1 ring-white/5 font-sans">
        
        <header className="p-10 border-b border-gray-800 flex justify-between items-center bg-gray-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <CodeBracketIcon className="w-64 h-64 text-cyan-500" />
          </div>
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <CodeBracketIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">System Architect Oracle</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mt-3">v.7.2.7-GOLD | TELEMETRY_ENABLED</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl border border-gray-800 active:scale-90 relative z-10">
            <XMarkIcon className="w-10 h-10" />
          </button>
        </header>

        <div className="px-10 py-6 bg-black/40 border-b border-gray-800 relative z-10">
            <div className="flex items-center space-x-3 text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4">
                <ActivityIcon className="w-4 h-4" />
                <span>Live System Telemetry (v.7.2)</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={async () => {
                    try {
                        const text = await navigator.clipboard.readText();
                        setPrompt(prev => prev + text);
                    } catch (err) {
                        console.error('Failed to paste:', err);
                    }
                }} className="p-2 hover:text-cyan-400 transition-colors bg-cyan-500/10 rounded-lg text-[10px] font-black uppercase">
                    Klistra in logg
                </button>
                <button onClick={refreshLogs} className="p-2 hover:text-cyan-400 transition-colors bg-cyan-500/10 rounded-lg">
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-2">
                {recentLogs.length > 0 ? recentLogs.map((log) => (
                    <div key={log.id} className={`flex flex-col font-mono p-4 bg-gray-950/50 rounded-xl border border-gray-800/50 transition-all ${expandedLogId === log.id ? 'border-cyan-500/50' : 'hover:border-cyan-500/30'}`}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`shrink-0 font-black px-1.5 rounded ${log.error ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                                    {log.mode.toUpperCase()}
                                </span>
                                <span className="text-gray-400 truncate italic opacity-60">
                                    {log.error ? `ERR: ${log.error.substring(0, 30)}...` : log.prompt.substring(0, 60) + '...'}
                                </span>
                            </div>
                            <span className="text-gray-700 font-black">{log.duration}ms</span>
                        </div>
                        {expandedLogId === log.id && (
                            <div className="mt-4 pt-4 border-t border-gray-800 text-[10px] text-gray-300 space-y-2">
                                <p><span className="font-bold text-gray-500">PROMPT:</span> {log.prompt}</p>
                                {log.error && <p><span className="font-bold text-red-500">ERROR:</span> {log.error}</p>}
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-[10px] text-gray-700 italic py-4 text-center">Inga anrop loggade i aktuell session.</p>
                )}
            </div>
        </div>

        <main className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10 bg-black/20" ref={scrollRef}>
          {response && (
            <div className="bg-gray-900/80 rounded-[2.5rem] p-10 border border-gray-800 shadow-2xl relative group animate-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <CpuChipIcon className="w-32 h-32 text-cyan-500" />
                </div>
                <div className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] mb-8 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mr-4 animate-ping"></span>
                    Oracle Architectural Analysis
                </div>
                <div className="prose prose-invert prose-lg max-w-none text-gray-100 font-mono leading-relaxed">
                  {response.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </div>
                <button onClick={copyToClipboard} className="absolute top-10 right-10 p-3 bg-cyan-900/30 rounded-xl text-[10px] font-black uppercase text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all">
                    {copied ? 'Copied to Buffer' : 'Copy Output'}
                </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative mb-8">
                    <Spinner className="w-20 h-20 text-cyan-500" />
                    <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20"></div>
                </div>
                <p className="text-xs text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">Aggregerar Systemtelemetri...</p>
            </div>
          )}
          
          {!response && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <CpuChipIcon className="w-48 h-48 text-gray-500 mb-8" />
                  <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Architect Standby</p>
              </div>
          )}
        </main>

        <footer className="p-10 border-t border-gray-800 bg-gray-950/80">
            <div className="max-w-4xl mx-auto relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                  placeholder="Ställ en teknisk fråga om systemet, koden eller de senaste loggarna..."
                  className="w-full bg-black/60 border-2 border-gray-800 rounded-[2rem] px-8 py-6 pr-20 text-lg text-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 outline-none transition-all resize-none shadow-inner placeholder-gray-700"
                  rows={3}
                />
                <button
                  onClick={handleQuery}
                  disabled={isLoading || !prompt.trim()}
                  className="absolute bottom-6 right-6 p-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white rounded-2xl shadow-2xl active:scale-95 transition-all border border-cyan-400/20"
                >
                  <PaperAirplaneIcon className="w-8 h-8" />
                </button>
            </div>
            <div className="mt-6 flex justify-center space-x-10 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                <span className="flex items-center gap-2"><ShieldCheckIcon className="w-3 h-3" /> SECURE_TRACE_ENABLED</span>
                <span className="flex items-center gap-2"><ActivityIcon className="w-3 h-3" /> LOG_LEVEL: VERBOSE</span>
                <span className="flex items-center gap-2"><CpuChipIcon className="w-3 h-3" /> COMPUTE_TIER: GOLD</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AIDebugPanel;
