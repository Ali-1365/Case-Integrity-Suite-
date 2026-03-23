
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

    } catch (err) {
      setError((err as Error).message || "Ett fel inträffade under duellen.");
    } finally {
      console.log = originalLog;
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-full min-h-[800px] flex flex-col space-y-6">
      
      {/* Header / Control */}
      <div className="bg-[#161616] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Adversarial Duel Simulator</h2>
                <p className="text-sm text-gray-400">Simulera en rättsprocess mot en fientlig AI-motpart.</p>
            </div>
        </div>
        
        <button
            onClick={runDuel}
            disabled={isSimulating}
            className={`px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center space-x-3 ${
              isSimulating 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 border border-red-500'
            }`}
          >
            {isSimulating ? <Spinner className="w-5 h-5" /> : <BoltIcon className="w-5 h-5" />}
            <span>{isSimulating ? 'Simulerar Rättegång...' : 'Starta Duell'}</span>
          </button>
      </div>

      {/* Main Arena */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        
        {/* Advokatens Sida (Vänster) */}
        <div className={`bg-[#0a0a0a] rounded-xl border ${advokatInlaga ? 'border-indigo-500/30' : 'border-gray-800'} flex flex-col overflow-hidden transition-all duration-500`}>
            <div className="px-6 py-4 bg-[#111111] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-sm">Kärande (Advokat-Agent)</span>
                </div>
                {isSimulating && !advokatInlaga && <Spinner className="w-4 h-4 text-indigo-500" />}
            </div>
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                {advokatInlaga ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300">
                        <MarkdownRenderer content={advokatInlaga} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <DocumentTextIcon className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Väntar på inlaga...</p>
                    </div>
                )}
            </div>
        </div>

        {/* Motpartens Sida (Höger) */}
        <div className={`bg-[#0a0a0a] rounded-xl border ${motpartSvar ? 'border-red-500/30' : 'border-gray-800'} flex flex-col overflow-hidden transition-all duration-500`}>
            <div className="px-6 py-4 bg-[#111111] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-400 uppercase tracking-wider text-sm">Svarande (Motparts-Agent)</span>
                </div>
                {isSimulating && advokatInlaga && !motpartSvar && <Spinner className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                {motpartSvar ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-red-300">
                        <MarkdownRenderer content={motpartSvar} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Väntar på svaromål...</p>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Log Console */}
      <div className="bg-[#050505] border border-gray-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs custom-scrollbar">
        {(logs as { length: number }).length === 0 ? (
            <p className="text-gray-700 italic">System redo. Initiera duell för att se processloggar.</p>
        ) : (
            logs.map((log, i) => (
                <div key={i} className="mb-1 text-gray-400">
                    <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log.replace('[AgentWorkflow]', '').replace('[DUEL]', '').trim()}
                </div>
            ))
        )}
        {error && <p className="text-red-500 font-bold mt-2">FEL: {error}</p>}
      </div>

    </div>
  );
};
