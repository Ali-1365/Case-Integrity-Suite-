
import React, { useState } from 'react';
import { ReasoningResult } from '../lib/LegalReasoningService';
import MarkdownRenderer from './shared/MarkdownRenderer';
import ConsolidationViewer from './ConsolidationViewer';
import { 
  SparklesIcon, 
  XMarkIcon, 
  ShieldCheckIcon, 
  LawIcon,
  ActivityIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon
} from './icons';

interface LegalReasoningViewerProps {
  reasoning: ReasoningResult;
  onClose: () => void;
  onViewProvenance: (queryId: string) => void;
}

const LegalReasoningViewer: React.FC<LegalReasoningViewerProps> = ({ reasoning, onClose, onViewProvenance }) => {
  const [showConsolidation, setShowConsolidation] = useState(false);

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-2xl z-[350] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300 outline-none">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <SparklesIcon className="w-64 h-64 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                <LawIcon className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Juridisk Motivering</h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                  ID: {reasoning.reasoningId} | FMJAM-1.0-GOLD
                </span>
                <span className="bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest flex items-center">
                    <CheckCircleIcon className="w-2.5 h-2.5 mr-1" /> QUALITY_OK
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <button 
                onClick={() => setShowConsolidation(!showConsolidation)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border ${showConsolidation ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'}`}
            >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>{showConsolidation ? 'Visa Fullständig Motivering' : 'Visa Konsolideringsrapport'}</span>
            </button>
            <button 
                onClick={() => onViewProvenance(reasoning.queryId)}
                className="hidden md:flex items-center space-x-2 bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-indigo-500/20"
            >
                <ActivityIcon className="h-4 w-4" />
                <span>Verifiera Beviskedja</span>
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-gray-950/20">
            <div className="max-w-4xl mx-auto">
                
                {showConsolidation && reasoning.consolidation ? (
                  <ConsolidationViewer result={reasoning.consolidation} onClose={() => setShowConsolidation(false)} />
                ) : (
                  <div className="space-y-12">
                    <div className="flex justify-center">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-3xl flex items-center space-x-6">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-black border-2 border-gray-900">1</div>
                                <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-black border-2 border-gray-900">2</div>
                                <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-[10px] font-black border-2 border-gray-900">3</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                                <p className="text-xs font-bold text-white mt-1 uppercase">Stil- och metodkalibrerad utskrift</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white text-slate-900 p-16 rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative border-t-8 border-cyan-500 font-serif">
                        <div className="absolute top-8 right-12 opacity-10">
                            <CpuChipIcon className="w-20 h-20" />
                        </div>
                        <MarkdownRenderer content={reasoning.fullMarkdown} className="prose-slate !text-slate-900 !font-serif !max-w-none prose-headings:!text-slate-900 prose-headings:!font-black prose-headings:!uppercase prose-headings:!tracking-tighter prose-p:!text-slate-800 prose-p:!leading-relaxed" />
                    </div>
                  </div>
                )}

            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-4 w-4 text-green-500/50" />
                <span>FMJAM Quality-Assured Output | Protocol Gold-1.0</span>
            </div>
            <span>System: Calibrated Reasoning Engine</span>
        </footer>
      </div>
    </div>
  );
};

export default LegalReasoningViewer;
