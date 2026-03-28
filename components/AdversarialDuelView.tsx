
import React, { useState } from 'react';
import { agentWorkflow } from '../lib/AgentWorkflow';
import { Spinner, ShieldCheckIcon, BoltIcon, DocumentTextIcon, UserIcon, ExclamationTriangleIcon, SparklesIcon } from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { motion, AnimatePresence } from 'motion/react';

interface AdversarialDuelViewProps {
  caseData: string;
  caseId?: string;
}

export const AdversarialDuelView: React.FC<AdversarialDuelViewProps> = ({ caseData, caseId }) => {
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto h-full flex flex-col">
      
      {/* Header */}
      <header className="py-8 px-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-slate-400" />
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Simuleringsmotor v2.1</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Adversarial Duel
            </h1>
            <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
              Simulera rättsprocesser mot en fientlig AI-motpart för att identifiera svagheter i din argumentation.
            </p>
          </div>

          <button
            onClick={runDuel}
            disabled={isSimulating}
            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl shadow-sm flex items-center gap-2 ${
              isSimulating 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                : 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 active:scale-95'
            }`}
          >
            {isSimulating ? <Spinner className="w-3 h-3" /> : <SparklesIcon className="w-3 h-3" />}
            {isSimulating ? 'Simulerar...' : 'Starta Duell'}
          </button>
        </div>
      </header>

      {/* Main Arena */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* Advokatens Sida */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Kärande (Advokat)</span>
                </div>
                {isSimulating && !advokatInlaga && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            </div>
            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {advokatInlaga ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed"
                        >
                            <MarkdownRenderer content={advokatInlaga} />
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <DocumentTextIcon className="w-12 h-12 text-slate-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Väntar på simulering...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Motpartens Sida */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Svarande (Motpart)</span>
                </div>
                {isSimulating && advokatInlaga && !motpartSvar && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
            </div>
            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {motpartSvar ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed"
                        >
                            <MarkdownRenderer content={motpartSvar} />
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <DocumentTextIcon className="w-12 h-12 text-slate-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Väntar på motpart...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

      </div>

      {/* Log Console */}
      <div className="bg-slate-900 rounded-2xl p-6 h-48 flex flex-col shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <BoltIcon className="w-3 h-3 text-slate-500" />
                <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Systemlogg</span>
            </div>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar font-mono text-[10px]">
            {logs.length === 0 ? (
                <p className="text-slate-600 italic">Systemet är redo för rättegångssimulering.</p>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                        <span className="text-slate-700 shrink-0 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="text-slate-400">{log.replace('[AgentWorkflow]', '').replace('[DUEL]', '').trim()}</span>
                    </div>
                ))
            )}
            {error && <div className="text-rose-500 font-bold mt-2 flex items-center gap-2"><ExclamationTriangleIcon className="w-3 h-3" /> FEL: {error}</div>}
        </div>
      </div>

    </div>
  );
};

