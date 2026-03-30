
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full min-h-[700px] animate-in fade-in duration-1000 pb-20">
      {/* Control Panel & Logs */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-[var(--bg-card)] p-10 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
            <User className="w-48 h-48 text-[var(--accent)]" />
          </div>

          <div className="flex items-center space-x-6 mb-8 relative z-10">
            <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <User className="w-10 h-10 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter leading-none">Advokat-Agent <span className="text-[var(--accent)] opacity-50 text-sm">v.4</span></h3>
              <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] mt-2 italic opacity-70">Autonom juridisk processföring</p>
            </div>
          </div>
          
          <p className="text-xs text-[var(--ink-muted)] mb-10 leading-relaxed font-black uppercase tracking-tight italic opacity-80 relative z-10">
            Aktiverar en multi-agent loop som utreder, analyserar, validerar och slutligen författar en formell sakframställan baserat på ärendets unika kontext genom deterministisk slutledning.
          </p>

          <button
            onClick={runAgent}
            disabled={isRunning}
            className={`w-full py-5 px-8 font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-4 relative z-10 active:scale-95 italic border ${
              isRunning 
                ? 'bg-[var(--bg-main)] text-[var(--ink-muted)] cursor-not-allowed border-[var(--border)]' 
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] border-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
            }`}
          >
            {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            <span>{isRunning ? 'Processar...' : 'Starta Process'}</span>
          </button>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] overflow-hidden flex flex-col h-[450px] shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)]"></div>
          <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center relative z-10">
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] italic opacity-60">Processlogg: Agent-Telemetri</span>
            {isRunning && <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></span>}
          </div>
          <div className="flex-grow overflow-y-auto p-8 font-mono text-[10px] space-y-4 custom-scrollbar relative z-10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                <Loader2 className="w-12 h-12 text-[var(--ink-muted)]" />
                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Väntar på startsekvens...</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-[var(--ink-main)] border-l border-[var(--accent)]/30 pl-5 py-3 animate-in slide-in-from-left-4 duration-500 bg-[var(--bg-main)]/30 hover:bg-[var(--accent)]/5 transition-colors">
                  <span className="text-[var(--accent)] font-black mr-4 opacity-60 italic">[{new Date().toLocaleTimeString()}]</span>
                  <span className="font-black uppercase tracking-tight italic">{log.replace('[AgentWorkflow]', '').trim()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="lg:col-span-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] h-full min-h-[700px] flex flex-col relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]/30"></div>
          <div className="px-10 py-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex items-center space-x-6 relative z-10">
            <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-inner">
              <FileText className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-black text-[var(--ink-main)] uppercase tracking-[0.3em] text-sm italic leading-none">Juridisk Sakframställan</h3>
              <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">Slutrapport | Deterministisk Rekommendation</p>
            </div>
          </div>
          
          <div className="flex-grow p-12 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/10 relative z-10">
            {error ? (
              <div className="p-12 bg-[var(--danger)]/5 border border-[var(--danger)]/20 text-[var(--danger)] animate-in zoom-in-95 duration-500">
                <h4 className="font-black mb-8 flex items-center gap-5 uppercase tracking-[0.4em] text-sm italic">
                  <ShieldCheck className="w-10 h-10" /> Processfel: Agent-Avbrott
                </h4>
                <p className="font-black uppercase tracking-tight italic leading-relaxed opacity-80">{error}</p>
              </div>
            ) : finalReport ? (
              <div className="prose prose-invert max-w-none prose-headings:text-[var(--ink-main)] prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-[var(--ink-muted)] prose-p:font-black prose-p:uppercase prose-p:tracking-tight prose-p:opacity-80 prose-strong:text-[var(--accent)] prose-strong:font-black prose-strong:italic animate-in fade-in duration-1000">
                <MarkdownRenderer content={finalReport} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000">
                <User className="w-64 h-64 text-[var(--ink-muted)] mb-10" />
                <p className="text-5xl font-black text-[var(--ink-muted)] uppercase tracking-[0.6em] italic">Advokat Standby</p>
              </div>
            )}
          </div>

          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
            <FileText className="w-[30rem] h-[30rem] text-[var(--accent)]" />
          </div>
        </div>
      </div>
    </div>

  );
};
