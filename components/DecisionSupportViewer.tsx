
import React, { useState } from 'react';
import { DecisionSupportResult } from '../lib/cis.types';
import MarkdownRenderer from './shared/MarkdownRenderer';
import ProportionalityViewer from './ProportionalityViewer';
import ActionRecommendationViewer from './ActionRecommendationViewer';
import { 
  ShieldCheckIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ActivityIcon,
  CpuChipIcon,
  BoltIcon,
  LawIcon,
  AdjustmentsHorizontalIcon,
  CodeBracketIcon,
  SparklesIcon
} from './icons';

interface DecisionSupportViewerProps {
  result: DecisionSupportResult;
  onClose: () => void;
  onViewDetails: (type: 'reasoning' | 'consolidation' | 'risk' | 'provenance' | 'proportionality' | 'actions') => void;
}

const DecisionSupportViewer: React.FC<DecisionSupportViewerProps> = ({ result, onClose, onViewDetails }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'justice' | 'actions'>('report');
  const [showRawJson, setShowRawJson] = useState(false);

  const getDecisionStyles = (proposal: string) => {
    switch (proposal) {
      case 'JA': return 'bg-green-600 border-green-400 text-white shadow-green-900/50';
      case 'NEJ': return 'bg-red-600 border-red-400 text-white shadow-red-900/50';
      default: return 'bg-orange-600 border-orange-400 text-white shadow-orange-900/50';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-2xl z-[400] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300 outline-none">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <BoltIcon className="w-64 h-64 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-xl">
                <ShieldCheckIcon className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Automatiserat Beslutsstöd</h2>
              <div className="flex items-center space-x-3 mt-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 mr-1 animate-pulse"></span>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">ID: {result.decisionId} | FMJAM GOLD STANDARD</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-gray-800 shadow-inner mr-4">
                <TabBtn active={activeTab === 'report'} onClick={() => setActiveTab('report')} label="Rapport" />
                <TabBtn active={activeTab === 'justice'} onClick={() => setActiveTab('justice')} label="Rättssäkerhet" color="emerald" warn={result.proportionality?.level !== 'GRÖN'} />
                <TabBtn active={activeTab === 'actions'} onClick={() => setActiveTab('actions')} label="Åtgärder" color="indigo" count={result.actions?.recommendations.length} />
            </div>
            <button 
                onClick={() => setShowRawJson(!showRawJson)}
                className="p-3 text-gray-500 hover:text-cyan-400 transition-all bg-gray-800 rounded-2xl border border-gray-700"
            >
                <CodeBracketIcon className="h-6 w-6" />
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-gray-950/20">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {activeTab === 'report' && (
                    <>
                        <div className={`p-10 rounded-[3rem] border-4 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 transition-all ${getDecisionStyles(result.proposal)}`}>
                            <div className="flex items-center space-x-8">
                                <div className="p-6 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/30">
                                    {result.proposal === 'JA' ? <CheckCircleIcon className="w-16 h-16" /> : result.proposal === 'NEJ' ? <XMarkIcon className="w-16 h-16" /> : <ExclamationTriangleIcon className="w-16 h-16" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.5em] opacity-80">Rekommenderat Beslut</p>
                                    <h3 className="text-7xl font-black italic tracking-tighter uppercase leading-none mt-2">{result.proposal}</h3>
                                </div>
                            </div>
                            <div className="bg-black/20 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm max-w-md">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-70">Beslutsmotivering</p>
                                <p className="text-sm font-bold leading-relaxed">{result.summary}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-8">
                                {showRawJson ? (
                                    <div className="bg-black p-10 rounded-[3rem] border border-cyan-500/30 font-mono text-[11px] text-cyan-400 overflow-x-auto h-full shadow-inner">
                                        <pre>{JSON.stringify(result.machineReadable, null, 2)}</pre>
                                    </div>
                                ) : (
                                    <div className="bg-white text-slate-900 p-16 rounded-[4rem] shadow-2xl relative border-t-8 border-cyan-500 font-serif min-h-[600px]">
                                        <MarkdownRenderer content={result.fullMarkdown} className="prose-slate !text-slate-900 !font-serif !max-w-none" />
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-gray-800/40 p-8 rounded-[2.5rem] border border-gray-700 space-y-8">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center">
                                        <ActivityIcon className="w-4 h-4 mr-2" />
                                        Härledda Underlag
                                    </p>
                                    <NavButton icon={<LawIcon />} label="Juridisk Motivering" onClick={() => onViewDetails('reasoning')} />
                                    <NavButton icon={<AdjustmentsHorizontalIcon />} label="Konsolidering" onClick={() => onViewDetails('consolidation')} />
                                    <NavButton icon={<ExclamationTriangleIcon />} label="Riskanalys" onClick={() => onViewDetails('risk')} />
                                    <NavButton icon={<ActivityIcon />} label="Beviskedja" onClick={() => onViewDetails('provenance')} />
                                </div>
                                <div className="bg-indigo-500/5 p-8 rounded-[2.5rem] border border-indigo-500/20">
                                    <div className="flex items-start space-x-4">
                                        <SparklesIcon className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight mb-2">Åtgärdsanalys</p>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                Systemet har identifierat <span className="text-indigo-400 font-bold">{result.actions?.recommendations.length}</span> åtgärder för att stärka rättssäkerheten i ärendet.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'justice' && result.proportionality && <ProportionalityViewer report={result.proportionality} />}
                
                {activeTab === 'actions' && result.actions && <ActionRecommendationViewer report={result.actions} />}

            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-4">
                <CheckCircleIcon className="h-4 w-4 text-green-500/50" />
                <span>Decision Integrity: 100% (Bit-Perfect) | SFS 2025:400 v.14</span>
            </div>
            <span>FMJAM STRATEGY LAYER ACTIVE</span>
        </footer>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, label: string, color?: 'emerald' | 'indigo', warn?: boolean, count?: number }> = ({ active, onClick, label, color, warn, count }) => {
    const activeColors = {
        emerald: 'bg-emerald-600 text-white',
        indigo: 'bg-indigo-600 text-white',
        default: 'bg-gray-800 text-white'
    };
    const hoverColors = {
        emerald: 'text-gray-500 hover:text-emerald-400',
        indigo: 'text-gray-500 hover:text-indigo-400',
        default: 'text-gray-500 hover:text-gray-300'
    };
    const activeClass = active ? (activeColors[color as keyof typeof activeColors] || activeColors.default) : (hoverColors[color as keyof typeof hoverColors] || hoverColors.default);
    
    return (
        <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeClass}`}>
            {warn && <ExclamationTriangleIcon className="w-3 h-3" />}
            <span>{label}</span>
            {count !== undefined && <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-[8px]">{count}</span>}
        </button>
    );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-gray-900/60 rounded-2xl border border-gray-700 hover:border-cyan-500/40 hover:bg-gray-800 transition-all group"
    >
        <div className="flex items-center space-x-4">
            <div className="text-gray-500 group-hover:text-cyan-400 transition-colors">{icon}</div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-tight">{label}</span>
        </div>
        <BoltIcon className="w-4 h-4 text-gray-700 group-hover:text-cyan-500 transition-colors" />
    </button>
);

export default DecisionSupportViewer;
