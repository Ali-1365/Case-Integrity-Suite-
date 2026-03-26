
import React, { useState } from 'react';
import { agentWorkflow } from '../lib/AgentWorkflow';
import { Spinner, ShieldCheckIcon, BoltIcon, DocumentTextIcon, UserIcon, ExclamationTriangleIcon } from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';

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
      // Steg 1: Kör Advokat-agenten (om vi inte redan har en inlaga, men här kör vi en färsk för duellen)
      setLogs(prev => [...prev, "[DUEL] Initierar Advokat-agenten..."]);
      const inlaga = await agentWorkflow.runAutonomousWorkflow(caseId || 'DUEL-GEN', caseData);
      setAdvokatInlaga(inlaga);

      // Steg 2: Kör Motparts-agenten
      setLogs(prev => [...prev, "[DUEL] Initierar Motparts-agenten (Adversarial Mode)..."]);
      const svar = await agentWorkflow.modulMotpart(inlaga);
      setMotpartSvar(svar);

      setLogs(prev => [...prev, "[DUEL] Rättegångssimulering avslutad."]);

    } catch (err: any) {
      setError(err.message || "Ett fel inträffade under duellen.");
    } finally {
      console.log = originalLog;
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-full min-h-[900px] flex flex-col space-y-10 animate-in fade-in duration-700">
      
      {/* Header / Control */}
      <div className="bg-[#161616]/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-1000"></div>
        
        <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/10">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Adversarial Duel Simulator</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">Simulera en rättsprocess mot en <span className="text-red-500 font-bold">fientlig AI-motpart</span>.</p>
            </div>
        </div>
        
        <button
            onClick={runDuel}
            disabled={isSimulating}
            className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center space-x-4 shadow-2xl relative overflow-hidden group/btn ${
              isSimulating 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                : 'bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-red-500/30 border border-red-400/20 active:scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
            {isSimulating ? <Spinner className="w-6 h-6" /> : <BoltIcon className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />}
            <span>{isSimulating ? 'Simulerar Rättegång...' : 'Starta Duell'}</span>
          </button>
      </div>

      {/* Main Arena */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[700px]">
        
        {/* Advokatens Sida (Vänster) */}
        <div className={`bg-[#161616]/80 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-700 shadow-2xl flex flex-col overflow-hidden relative group/left ${
            advokatInlaga ? 'border-indigo-500/40 shadow-indigo-500/10' : 'border-white/5'
        }`}>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="px-8 py-6 bg-[#111111]/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <UserIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-black text-indigo-400 uppercase tracking-widest text-xs">Kärande (Advokat-Agent)</span>
                </div>
                {isSimulating && !advokatInlaga && <Spinner className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-grow p-10 overflow-y-auto custom-scrollbar relative z-10">
                {advokatInlaga ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-indigo-400">
                            <MarkdownRenderer content={advokatInlaga} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 group-hover/left:opacity-30 transition-opacity">
                        <div className="p-8 bg-gray-900 rounded-full border border-white/5">
                            <DocumentTextIcon className="w-20 h-20 text-gray-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Väntar på inlaga...</p>
                    </div>
                )}
            </div>
        </div>

        {/* Motpartens Sida (Höger) */}
        <div className={`bg-[#161616]/80 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-700 shadow-2xl flex flex-col overflow-hidden relative group/right ${
            motpartSvar ? 'border-red-500/40 shadow-red-500/10' : 'border-white/5'
        }`}>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl"></div>
            
            <div className="px-8 py-6 bg-[#111111]/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                        <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-black text-red-400 uppercase tracking-widest text-xs">Svarande (Motparts-Agent)</span>
                </div>
                {isSimulating && advokatInlaga && !motpartSvar && <Spinner className="w-5 h-5 text-red-500" />}
            </div>
            <div className="flex-grow p-10 overflow-y-auto custom-scrollbar relative z-10">
                {motpartSvar ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-red-300 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-red-400">
                            <MarkdownRenderer content={motpartSvar} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 group-hover/right:opacity-30 transition-opacity">
                        <div className="p-8 bg-gray-900 rounded-full border border-white/5">
                            <ExclamationTriangleIcon className="w-20 h-20 text-gray-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Väntar på svaromål...</p>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Log Console */}
      <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 h-64 overflow-hidden flex flex-col shadow-inner relative">
        <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Processloggar</span>
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-2">
            {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-700 italic font-medium tracking-wide">System redo. Initiera duell för att se processloggar.</p>
                </div>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-gray-700 font-bold shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="text-gray-400 leading-relaxed">{log.replace('[AgentWorkflow]', '').replace('[DUEL]', '').trim()}</span>
                    </div>
                ))
            )}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold mt-4 animate-bounce">
                    FEL: {error}
                </div>
            )}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
      </div>

    </div>
  );
};
