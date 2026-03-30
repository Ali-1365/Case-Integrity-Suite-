
import React, { useState } from 'react';
import { agentWorkflow } from '../lib/AgentWorkflow';
import { Spinner, ShieldCheckIcon, BoltIcon, DocumentTextIcon, UserIcon, ExclamationTriangleIcon, SparklesIcon } from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleConnector } from './shared/ModuleConnector';

interface AdversarialDuelViewProps {
  caseData: string;
  caseId?: string;
  onNavigate?: (moduleId: string) => void;
}

export const AdversarialDuelView: React.FC<AdversarialDuelViewProps> = ({ caseData, caseId, onNavigate }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [advokatInlaga, setAdvokatInlaga] = useState<string | null>(null);
  const [motpartSvar, setMotpartSvar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runDuel = async () => {
    setIsSimulating(true);
    setAdvokatInlaga(null);
    setMotpartSvar(null);
    setError(null);
    setLogs([]);

    const originalLog = console.log;
    console.log = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('[AgentWorkflow]')) {
        setLogs(prev => [...prev, msg]);
      }
      originalLog(...args);
    };

    try {
      setLogs(prev => [...prev, "[DUEL] Initierar Advokat-agenten..."]);
      const inlaga = await agentWorkflow.runAutonomousWorkflow(caseId || 'DUEL-GEN', caseData);
      setAdvokatInlaga(inlaga);

      setLogs(prev => [...prev, "[DUEL] Initierar Motparts-agenten..."]);
      const svar = await agentWorkflow.modulMotpart(inlaga);
      setMotpartSvar(svar);

      setLogs(prev => [...prev, "[DUEL] Rättegångssimulering avslutad."]);
    } catch (err: any) {
      setError(err.message || "Ett fel inträffade.");
    } finally {
      console.log = originalLog;
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col pb-20">
      
      {/* Header */}
      <header className="p-12 bg-[var(--bg-card)] border border-[var(--border-strong)] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <SparklesIcon className="w-48 h-48 text-[var(--accent)]" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[10px] font-black tracking-[0.4em] text-[var(--ink-muted)] uppercase italic">Simuleringsmotor v.2.1-GOLD</span>
            </div>
            <h1 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">
              Adversarial <span className="text-[var(--accent)]">Duel</span>
            </h1>
            <p className="text-[11px] text-[var(--ink-muted)] max-w-2xl font-black uppercase tracking-widest italic leading-relaxed opacity-70">
              Simulera rättsprocesser mot en fientlig AI-motpart för att identifiera svagheter i din argumentation genom deterministisk rättegångssimulering.
            </p>
          </div>

          <button
            onClick={runDuel}
            disabled={isSimulating}
            className={`px-12 py-5 text-xs font-black uppercase tracking-[0.3em] transition-all italic border shadow-2xl active:scale-95 flex items-center gap-4 ${
              isSimulating 
                ? 'bg-[var(--bg-main)] text-[var(--ink-muted)] border-[var(--border)] cursor-not-allowed' 
                : 'bg-[var(--accent)] text-[var(--bg-main)] border-[var(--accent)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isSimulating ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
            <span>{isSimulating ? 'Simulerar...' : 'Starta Duell'}</span>
          </button>
        </div>
      </header>

      {/* Main Arena */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-0">
        
        {/* Advokatens Sida */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] flex flex-col relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
            <div className="px-10 py-6 border-b border-[var(--border-strong)] bg-[var(--bg-main)] flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)]">
                        <UserIcon className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                        <span className="font-black text-[var(--ink-main)] uppercase tracking-[0.2em] text-[11px] italic block">Kärande</span>
                        <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic opacity-60">Advokat-Agent</span>
                    </div>
                </div>
                {isSimulating && !advokatInlaga && <div className="w-3 h-3 bg-[var(--accent)] shadow-[0_0_12px_var(--accent)] animate-pulse" />}
            </div>
            <div className="flex-grow p-12 overflow-y-auto custom-scrollbar bg-[var(--bg-card)]">
                <AnimatePresence mode="wait">
                    {advokatInlaga ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-invert prose-sm max-w-none text-[var(--ink-main)] leading-relaxed italic font-black uppercase tracking-tight"
                        >
                            <MarkdownRenderer content={advokatInlaga} />
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                            <DocumentTextIcon className="w-24 h-24 text-[var(--ink-muted)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Väntar på simulering...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Motpartens Sida */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] flex flex-col relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--danger)]"></div>
            <div className="px-10 py-6 border-b border-[var(--border-strong)] bg-[var(--bg-main)] flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)]">
                        <UserIcon className="w-5 h-5 text-[var(--danger)]" />
                    </div>
                    <div>
                        <span className="font-black text-[var(--ink-main)] uppercase tracking-[0.2em] text-[11px] italic block">Svarande</span>
                        <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic opacity-60">Motpart-Agent</span>
                    </div>
                </div>
                {isSimulating && advokatInlaga && !motpartSvar && <div className="w-3 h-3 bg-[var(--danger)] shadow-[0_0_12px_var(--danger)] animate-pulse" />}
            </div>
            <div className="flex-grow p-12 overflow-y-auto custom-scrollbar bg-[var(--bg-card)]">
                <AnimatePresence mode="wait">
                    {motpartSvar ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-invert prose-sm max-w-none text-[var(--ink-main)] leading-relaxed italic font-black uppercase tracking-tight"
                        >
                            <MarkdownRenderer content={motpartSvar} />
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                            <DocumentTextIcon className="w-24 h-24 text-[var(--ink-muted)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Väntar på motpart...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

      </div>

      {/* Log Console */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 h-64 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border-strong)]"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
                <BoltIcon className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] text-[10px] italic">Systemlogg: Rättegångssimulering</span>
            </div>
            <div className="flex gap-3">
                <div className="w-2 h-2 bg-[var(--border)] shadow-inner"></div>
                <div className="w-2 h-2 bg-[var(--border)] shadow-inner"></div>
                <div className="w-2 h-2 bg-[var(--border)] shadow-inner"></div>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar font-mono text-[10px] relative z-10 pr-6">
            {logs.length === 0 ? (
                <p className="text-[var(--ink-muted)] italic opacity-40 uppercase tracking-[0.2em] font-black">Systemet är redo för rättegångssimulering.</p>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="flex gap-8 border-l-2 border-[var(--border)] pl-5 py-2 hover:bg-[var(--accent)]/5 transition-colors">
                        <span className="text-[var(--accent)] shrink-0 font-black">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="text-[var(--ink-main)] uppercase tracking-tighter font-black">{log.replace('[AgentWorkflow]', '').replace('[DUEL]', '').trim()}</span>
                    </div>
                ))
            )}
            {error && <div className="text-[var(--danger)] font-black mt-4 flex items-center gap-4 uppercase tracking-[0.2em] italic bg-[var(--danger)]/5 p-4 border border-[var(--danger)]/20 shadow-xl shadow-[var(--danger)]/10"><ExclamationTriangleIcon className="w-5 h-5" /> FEL: {error}</div>}
        </div>
      </div>

      <ModuleConnector activeModule="duel" onNavigate={onNavigate} />
    </div>

  );
};

