
import React, { useState } from 'react';
import { 
  ServerIcon, 
  DatabaseIcon, 
  CpuChipIcon, 
  BoltIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UserIcon, 
  ArrowPathIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  LawIcon,
  ActivityIcon,
  LinkIcon
} from './icons';

interface SystemArchitectureViewProps {
  analysisId: string;
  onNavigate?: (tab: string) => void;
}

export const SystemArchitectureView: React.FC<SystemArchitectureViewProps> = ({ analysisId, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'conceptual' | 'detailed'>('detailed');
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string, tabName?: string) => {
    setActiveNode(nodeId);
    if (tabName && onNavigate) {
      onNavigate(tabName);
    }
  };

  return (
    <div className="space-y-8 h-full">
      {/* Header / Control Bar */}
      <div className="bg-[#161616] p-6 rounded-xl border border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <CpuChipIcon className="w-6 h-6 text-cyan-400" />
            System Architecture v.6.3
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">FORENSIC DATA FLOW & RAG ORCHESTRATION</p>
        </div>
        
        <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setViewMode('conceptual')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'conceptual' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Konceptuell
          </button>
          <button 
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'detailed' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Detaljerad
          </button>
        </div>
      </div>

      {/* Main Architecture Canvas */}
      <div className="relative bg-[#0a0a0a] rounded-2xl border border-gray-800 p-8 min-h-[600px] overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

        {/* Architecture Flow */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 h-full">
          
          {/* COLUMN 1: INGESTION (Archive Core) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-gray-500 uppercase">Input Layer</span>
              <div className="h-px bg-gray-800 flex-grow"></div>
            </div>

            <ArchitectureNode 
              title="Archive Core" 
              subtitle="Ingestion Engine"
              icon={<DatabaseIcon className="w-6 h-6" />}
              status="OPERATIONAL"
              color="indigo"
              isActive={activeNode === 'archive'}
              onClick={() => handleNodeClick('archive')}
            >
              <div className="space-y-2 mt-4">
                <MetricRow label="Case Files" value="30x" />
                <MetricRow label="Ingestion Rate" value="100%" />
                <MetricRow label="Ground Truth" value="LOCKED" />
              </div>
              <div className="mt-4 space-y-2 pt-4 border-t border-indigo-500/20">
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Beviskedja'); }}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-3 h-3" /> Analysera Ärendearkiv
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Advokatbyrå'); }}
                  className="w-full py-2 border border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase rounded transition-colors"
                >
                  Fråga mot {analysisId}
                </button>
              </div>
            </ArchitectureNode>

            <div className="flex justify-center">
              <ArrowDown />
            </div>

            <ArchitectureNode 
              title="Forensic Parser" 
              subtitle="Data Extraction"
              icon={<DocumentTextIcon className="w-5 h-5" />}
              status="ACTIVE"
              color="gray"
              compact
              onClick={() => handleNodeClick('parser', 'Tidslinje')}
            />

            {/* Juridiska Korpusar Section */}
            <div className="mt-8 bg-[#161616] rounded-xl border border-gray-800 p-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LawIcon className="w-3 h-3 text-cyan-500" />
                Juridiska Korpusar
              </h4>
              <div className="space-y-3">
                <CorpusItem title="Socialtjänstlag" sfs="2025:400" source="SoL" />
                <CorpusItem title="Förvaltningslag" sfs="2017:900" source="FL" />
                <CorpusItem title="Barnkonventionen" sfs="2018:1197" source="BK" />
              </div>
            </div>
          </div>

          {/* COLUMN 2: PROCESSING (Oracle Core) */}
          <div className="space-y-6 mt-12 lg:mt-0">
             <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-cyan-500 uppercase">Logic Core</span>
              <div className="h-px bg-cyan-900/50 flex-grow"></div>
            </div>

            <ArchitectureNode 
              title="Oracle Core" 
              subtitle="Reasoning Engine"
              icon={<CpuChipIcon className="w-8 h-8" />}
              status="PROCESSING"
              color="cyan"
              isActive={activeNode === 'oracle'}
              onClick={() => handleNodeClick('oracle')}
              pulsing
            >
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-black/40 p-2 rounded border border-cyan-500/20 text-center">
                  <p className="text-[10px] text-cyan-500 uppercase">Logic Engine</p>
                  <p className="text-lg font-bold text-white">v7.2</p>
                </div>
                <div className="bg-black/40 p-2 rounded border border-cyan-500/20 text-center">
                  <p className="text-[10px] text-cyan-500 uppercase">RAG Index</p>
                  <p className="text-lg font-bold text-white">HYBRID</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Advokatbyrå'); }}
                  className="flex items-center justify-between text-xs bg-cyan-900/10 p-2 rounded border border-cyan-500/10 cursor-pointer hover:bg-cyan-900/20"
                >
                  <span className="text-cyan-300 flex items-center gap-2"><UserIcon className="w-3 h-3" /> Agent A: Analytiker</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <div 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Rättegångssimulator'); }}
                  className="flex items-center justify-between text-xs bg-red-900/10 p-2 rounded border border-red-500/10 cursor-pointer hover:bg-red-900/20"
                >
                  <span className="text-red-300 flex items-center gap-2"><ShieldCheckIcon className="w-3 h-3" /> Agent B: Adjudicator</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cyan-500/20">
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Oracle Command'); }}
                  className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2"
                >
                  <CogIcon className="w-3 h-3" /> Konfigurera Core
                </button>
              </div>
            </ArchitectureNode>

             <div className="flex justify-center">
              <ArrowDown />
            </div>

            <ArchitectureNode 
              title="Knowledge Graph" 
              subtitle="Semantic Linking"
              icon={<BoltIcon className="w-5 h-5" />}
              status="SYNCED"
              color="purple"
              compact
              onClick={() => handleNodeClick('graph', 'Analytics')}
            />

            {/* System Telemetry Section */}
            <div className="mt-8 bg-[#161616] rounded-xl border border-gray-800 p-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ActivityIcon className="w-3 h-3 text-purple-500" />
                System-telemetri
              </h4>
              <button 
                onClick={() => onNavigate?.('Analytics')}
                className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 border border-purple-500/20"
              >
                <BoltIcon className="w-3 h-3" /> Monitorera AI-pipeline
              </button>
            </div>
          </div>

          {/* COLUMN 3: OUTPUT (Verified) */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-emerald-500 uppercase">Output Layer</span>
              <div className="h-px bg-emerald-900/50 flex-grow"></div>
            </div>

            <ArchitectureNode 
              title="Validation Gate" 
              subtitle="Quality Control"
              icon={<ShieldCheckIcon className="w-6 h-6" />}
              status="SECURE"
              color="emerald"
              isActive={activeNode === 'validation'}
              onClick={() => handleNodeClick('validation', 'Audit Log')}
            >
               <div className="space-y-2 mt-4">
                <MetricRow label="Deterministisk Rev." value="AKTIVERAD" color="emerald" />
                <MetricRow label="Hallucination Rate" value="0.0%" color="emerald" />
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Audit Log'); }}
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheckIcon className="w-3 h-3" /> Integritetskontroll
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigate?.('Audit Log'); }}
                  className="w-full py-2 border border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-300 text-[10px] font-bold uppercase rounded transition-colors"
                >
                  Verifiera SFS 2025:400
                </button>
              </div>
            </ArchitectureNode>

            <div className="flex justify-center">
              <ArrowDown />
            </div>

            <ArchitectureNode 
              title="MEGAINLAGA" 
              subtitle="Final Artifact"
              icon={<DocumentTextIcon className="w-6 h-6" />}
              status="READY"
              color="white"
              isActive={activeNode === 'mega'}
              onClick={() => handleNodeClick('mega', 'MEGAINLAGA')}
            >
              <div className="mt-4 p-3 bg-white/5 rounded border border-white/10 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Slutrapport</p>
                <p className="text-sm font-bold text-white">GENERERAD & LÅST</p>
              </div>
            </ArchitectureNode>
          </div>

        </div>

        {/* Connecting Lines (Visual Only - Simplified) */}
        <svg className="absolute inset-0 pointer-events-none z-0 opacity-20" width="100%" height="100%">
          <path d="M300 150 L 600 150" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M600 150 L 900 150" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

      </div>
    </div>
  );
};

// Sub-components for the diagram

const CorpusItem: React.FC<{ title: string, sfs: string, source: string }> = ({ title, sfs, source }) => (
  <div className="flex flex-col p-2 bg-black/40 rounded border border-white/5 hover:border-cyan-500/30 transition-colors group">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</span>
      <LinkIcon className="w-3 h-3 text-gray-600 group-hover:text-cyan-500" />
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col">
        <span className="text-[8px] text-gray-500 uppercase font-bold">SFS</span>
        <span className="text-[10px] font-mono text-cyan-500/80">{sfs}</span>
      </div>
      <div className="flex flex-col border-l border-white/10 pl-3">
        <span className="text-[8px] text-gray-500 uppercase font-bold">Källa</span>
        <span className="text-[10px] font-mono text-white/70">{source}</span>
      </div>
    </div>
  </div>
);

const ArchitectureNode: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: string;
  color: 'indigo' | 'cyan' | 'emerald' | 'purple' | 'gray' | 'white';
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  compact?: boolean;
  pulsing?: boolean;
}> = ({ title, subtitle, icon, status, color, isActive, onClick, children, compact, pulsing }) => {
  
  const colors = {
    indigo: 'border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/60',
    cyan: 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/60',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
    purple: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60',
    gray: 'border-gray-700 bg-gray-800/50 hover:border-gray-600',
    white: 'border-white/20 bg-white/5 hover:border-white/40'
  };

  const textColors = {
    indigo: 'text-indigo-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400',
    white: 'text-white'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm
        ${colors[color]}
        ${isActive ? 'ring-2 ring-offset-2 ring-offset-black ring-opacity-50 ' + (color === 'cyan' ? 'ring-cyan-500' : 'ring-gray-500') : ''}
        ${compact ? 'p-4' : 'p-6'}
      `}
    >
      {pulsing && (
        <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500 blur-[50px] opacity-10 animate-pulse`}></div>
      )}
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${textColors[color]}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold ${compact ? 'text-sm' : 'text-lg'} text-white`}>{title}</h3>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{subtitle}</p>
          </div>
        </div>
        {!compact && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'OPERATIONAL' || status === 'READY' || status === 'SECURE' || status === 'SYNCED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
            <span className="text-[9px] font-bold text-gray-400">{status}</span>
          </div>
        )}
      </div>

      {children && (
        <div className="relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const MetricRow: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = 'gray' }) => (
  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`font-mono font-bold text-${color}-400`}>{value}</span>
  </div>
);

const ArrowDown = () => (
  <svg className="w-6 h-6 text-gray-700 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);
