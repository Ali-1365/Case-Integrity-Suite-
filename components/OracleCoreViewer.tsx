
import React from 'react';
import { 
  CpuChipIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  HomeIcon,
  ActivityIcon,
  LawIcon
} from './icons';

interface OracleCoreViewerProps {
  onBack: () => void;
}

const OracleCoreViewer: React.FC<OracleCoreViewerProps> = ({ onBack }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* NAVIGATION BAR - TOP LEFT */}
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-2xl border border-gray-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Hem</span>
        </button>
      </div>

      <section className="bg-gray-950/60 p-10 rounded-[3rem] border border-gray-800 shadow-inner">
        <div className="flex items-center space-x-6 mb-10">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <SparklesIcon className="h-10 w-10 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Core Logic</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-3">Active Reasoning Layer v.7.2</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] space-y-6">
            <h4 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center">
              <CpuChipIcon className="w-4 h-4 mr-3" />
              Inference Engine Parameters
            </h4>
            <div className="space-y-4">
              <ParamRow label="Temperature" value="0.0 (LOCKED)" />
              <ParamRow label="Thinking Budget" value="32,768 Tokens" />
              <ParamRow label="Model" value="Gemini 3 Pro Preview" />
              <ParamRow label="Context Window" value="Adaptive RAG" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] space-y-6">
            <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-3" />
              Safety & Compliance
            </h4>
            <div className="space-y-4">
              <ParamRow label="Legal Filter" value="SFS 2025:400" />
              <ParamRow label="Hallucination Shield" value="ACTIVE" />
              <ParamRow label="Traceability" value="100% Deterministic" />
              <ParamRow label="Audit State" value="GOLD VERIFIED" />
            </div>
          </div>
        </div>

        <div className="mt-10 p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[2.5rem]">
            <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
              "Oracle-lagret exekverar juridisk slutledning genom att mappa extraherade bevisatomer mot det konsoliderade rättskälleindexet. Ingen interpolation tillåts utanför Ground Truth-kontexten."
            </p>
        </div>
      </section>
    </div>
  );
};

const ParamRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</span>
    <span className="text-xs font-mono text-gray-300 font-black tracking-tight">{value}</span>
  </div>
);

export default OracleCoreViewer;
