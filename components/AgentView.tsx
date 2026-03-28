
import React, { useState } from 'react';
import { agentWorkflow, FaktamasterState } from '../lib/AgentWorkflow';
import { 
  Loader2, 
  ShieldCheck, 
  Zap, 
  FileText, 
  User 
} from 'lucide-react';
import MarkdownRenderer from './shared/MarkdownRenderer';

interface AgentViewProps {
  caseData: string;
  caseId?: string;
}

export const AgentView: React.FC<AgentViewProps> = ({ caseData, caseId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAgent = async () => {
    setIsRunning(true);
    setLogs([]);
    setFinalReport(null);
    setError(null);

    // Override console.log to capture agent steps
    const originalLog = console.log;
    console.log = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('[AgentWorkflow]')) {
        setLogs(prev => [...prev, msg]);
      }
      originalLog(...args);
    };

    try {
      const report = await agentWorkflow.runAutonomousWorkflow(caseId || 'AUTO-GEN', caseData);
      setFinalReport(report);
    } catch (err: any) {
      setError(err.message || "Ett okänt fel inträffade under agentkörningen.");
    } finally {
      console.log = originalLog; // Restore console.log
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full min-h-[700px] animate-in fade-in duration-1000">
      {/* Control Panel & Logs */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border)] shadow-2xl relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <User className="w-32 h-32" />
          </div>

          <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className="p-4 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] shadow-inner group-hover:scale-110 transition-transform duration-500">
              <User className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--ink-main)] font-serif italic uppercase tracking-tighter">Advokat-Agent</h3>
              <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-70">Autonom juridisk processföring</p>
            </div>
          </div>
          
          <p className="text-sm text-[var(--ink-muted)] mb-8 leading-relaxed font-medium relative z-10">
            Aktiverar en multi-agent loop som utreder, analyserar, validerar och slutligen författar en formell sakframställan baserat på ärendets unika kontext.
          </p>

          <button
            onClick={runAgent}
            disabled={isRunning}
            className={`w-full py-5 px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3 relative z-10 active:scale-95 ${
              isRunning 
                ? 'bg-[var(--bg-main)] text-[var(--ink-muted)] cursor-not-allowed border border-[var(--border)]' 
                : 'bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white shadow-xl shadow-[var(--accent)]/20'
            }`}
          >
            {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            <span>{isRunning ? 'Processar...' : 'Starta Process'}</span>
          </button>
        </div>

        <div className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)] overflow-hidden flex flex-col h-[450px] shadow-inner relative group">
          <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center relative z-10">
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] opacity-70">Processlogg</span>
            {isRunning && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></span>}
          </div>
          <div className="flex-grow overflow-y-auto p-8 font-mono text-[11px] space-y-4 custom-scrollbar relative z-10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Loader2 className="w-10 h-10 text-[var(--ink-muted)] mb-4" />
                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Väntar på start...</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-[var(--ink-muted)] border-l-2 border-[var(--accent)]/30 pl-5 py-2 animate-in slide-in-from-left-4 duration-500 bg-[var(--bg-main)]/30 rounded-r-xl">
                  <span className="text-[var(--accent)] font-black mr-3 opacity-60">[{new Date().toLocaleTimeString()}]</span>
                  <span className="font-medium">{log.replace('[AgentWorkflow]', '').trim()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="lg:col-span-8">
        <div className="bg-[var(--bg-card)] rounded-[3.5rem] border border-[var(--border)] h-full min-h-[700px] flex flex-col relative overflow-hidden shadow-2xl group">
          <div className="px-10 py-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex items-center space-x-5 relative z-10">
            <div className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] shadow-inner">
              <FileText className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-black text-[var(--ink-main)] uppercase tracking-[0.3em] text-sm font-serif italic">Juridisk Sakframställan</h3>
              <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-60">Slutrapport och rekommendationer</p>
            </div>
          </div>
          
          <div className="flex-grow p-12 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/10 relative z-10">
            {error ? (
              <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] text-rose-600 animate-in zoom-in-95 duration-500">
                <h4 className="font-black mb-6 flex items-center gap-4 uppercase tracking-[0.3em] text-sm font-serif italic">
                  <ShieldCheck className="w-8 h-8" /> Processfel
                </h4>
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            ) : finalReport ? (
              <div className="prose prose-slate max-w-none prose-headings:text-[var(--ink-main)] prose-headings:font-serif prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-[var(--ink-muted)] prose-p:font-medium prose-strong:text-[var(--ink-main)] prose-strong:font-black prose-a:text-[var(--accent)] animate-in fade-in duration-1000">
                <MarkdownRenderer content={finalReport} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-1000">
                <User className="w-48 h-48 text-[var(--ink-muted)] mb-8" />
                <p className="text-4xl font-black text-[var(--ink-muted)] uppercase tracking-[0.5em] font-serif italic">Advokat Standby</p>
              </div>
            )}
          </div>

          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
            <FileText className="w-96 h-96" />
          </div>
        </div>
      </div>
    </div>
  );
};
