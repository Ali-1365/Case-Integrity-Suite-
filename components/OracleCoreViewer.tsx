
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
    <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      {/* NAVIGATION BAR - TOP LEFT */}
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center space-x-4 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--ink-muted)] hover:text-[var(--accent)] px-8 py-4 border border-[var(--border-strong)] transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 italic"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Hem</span>
        </button>
      </div>

      <section className="bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <SparklesIcon className="w-48 h-48 text-[var(--accent)]" />
        </div>
        
        <div className="flex items-center space-x-8 mb-12 relative z-10">
          <div className="p-5 bg-[var(--accent)]/10 border border-[var(--accent)]/30">
            <SparklesIcon className="h-12 w-12 text-[var(--accent)]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BoltIcon className="w-3 h-3 text-[var(--accent)]" />
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em]">Reasoning Engine v.7.2</span>
            </div>
            <h3 className="text-5xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter leading-none">Oracle Core Logic <span className="text-[var(--accent)] opacity-50">GOLD_EDITION</span></h3>
            <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] mt-3 italic">Active Reasoning Layer | Deterministic Inference</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="bg-[var(--bg-main)] border border-[var(--border-strong)] p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
            <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] flex items-center italic">
              <CpuChipIcon className="w-4 h-4 mr-4" />
              Inference Engine Parameters
            </h4>
            <div className="space-y-6">
              <ParamRow label="Temperature" value="0.0 (LOCKED)" />
              <ParamRow label="Thinking Budget" value="32,768 Tokens" />
              <ParamRow label="Model" value="Gemini 3 Pro Preview" />
              <ParamRow label="Context Window" value="Adaptive RAG" />
            </div>
          </div>

          <div className="bg-[var(--bg-main)] border border-[var(--border-strong)] p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--success)]"></div>
            <h4 className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.3em] flex items-center italic">
              <ShieldCheckIcon className="w-4 h-4 mr-4" />
              Safety & Compliance
            </h4>
            <div className="space-y-6">
              <ParamRow label="Legal Filter" value="SFS 2025:400" />
              <ParamRow label="Hallucination Shield" value="ACTIVE" />
              <ParamRow label="Traceability" value="100% Deterministic" />
              <ParamRow label="Audit State" value="GOLD VERIFIED" />
            </div>
          </div>
        </div>

        <div className="mt-12 p-10 bg-[var(--bg-main)] border border-[var(--border-strong)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]/30"></div>
            <p className="text-base text-[var(--ink-muted)] leading-relaxed font-black italic uppercase tracking-tight opacity-80">
              "Oracle-lagret exekverar juridisk slutledning genom att mappa extraherade bevisatomer mot det konsoliderade rättskälleindexet. Ingen interpolation tillåts utanför Ground Truth-kontexten."
            </p>
        </div>
      </section>
    </div>
  );
};

const ParamRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 group hover:border-[var(--accent)]/50 transition-colors">
    <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest italic">{label}</span>
    <span className="text-xs font-mono text-[var(--ink-main)] font-black tracking-widest italic">{value}</span>
  </div>
);

export default OracleCoreViewer;
