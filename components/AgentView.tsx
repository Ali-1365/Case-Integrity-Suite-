
import React, { useState } from 'react';
import { agentWorkflow, FaktamasterState } from '../lib/AgentWorkflow';
import { Spinner, ShieldCheckIcon, BoltIcon, DocumentTextIcon, UserIcon } from './icons';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
      {/* Control Panel & Logs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#161616] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <UserIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">Advokat-Agent</h3>
              <p className="text-xs text-gray-500">Autonom juridisk processföring</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Aktiverar en multi-agent loop som utreder, analyserar, validerar och slutligen författar en formell sakframställan.
          </p>

          <button
            onClick={runAgent}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
              isRunning 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
            }`}
          >
            {isRunning ? <Spinner className="w-4 h-4" /> : <BoltIcon className="w-4 h-4" />}
            <span>{isRunning ? 'Processar...' : 'Starta Process'}</span>
          </button>
        </div>

        <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-gray-800 bg-[#111111] flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">Processlogg</span>
            {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
          </div>
          <div className="flex-grow overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <p className="text-gray-600 italic text-center mt-10">Väntar på start...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-400 border-l-2 border-indigo-500/30 pl-3 py-1 animate-in slide-in-from-left-2 duration-300">
                  <span className="text-indigo-400 font-bold mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log.replace('[AgentWorkflow]', '').trim()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="lg:col-span-8">
        <div className="bg-[#161616] rounded-xl border border-gray-800 h-full min-h-[600px] flex flex-col relative overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-[#111111] flex items-center space-x-3">
            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-200">Juridisk Sakframställan</h3>
          </div>
          
          <div className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
            {error ? (
              <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-xl text-red-400">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" /> Processfel
                </h4>
                <p>{error}</p>
              </div>
            ) : finalReport ? (
              <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400">
                <MarkdownRenderer content={finalReport} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <UserIcon className="w-24 h-24 text-gray-500 mb-4" />
                <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Advokat Standby</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
