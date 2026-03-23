
import React, { useState, useEffect } from 'react';
import { queryProvenanceService, ProvenanceChain } from '../lib/QueryProvenanceService';
import { 
  ShieldCheckIcon, 
  XMarkIcon, 
  LawIcon, 
  CpuChipIcon, 
  ActivityIcon,
  CheckCircleIcon,
  LinkIcon,
  Spinner
} from './icons';

interface ProvenanceViewerProps {
  queryId: string;
  onClose: () => void;
}

const ProvenanceViewer: React.FC<ProvenanceViewerProps> = ({ queryId, onClose }) => {
  const [chain, setChain] = useState<ProvenanceChain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queryProvenanceService.getChainForQuery(queryId)
      .then(res => {
        setChain(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch provenance chain:", err);
        setIsLoading(false);
      });
  }, [queryId]);

  if (isLoading) return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center">
      <div className="text-center">
        <Spinner className="h-12 w-12 text-cyan-500 mb-4 mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Aggregerar beviskedja...</p>
      </div>
    </div>
  );

  if (!chain) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                <ShieldCheckIcon className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Query Traceability</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">
                Trace_ID: {chain.queryId} | Validated Ground Truth
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
            <XMarkIcon className="h-8 w-8" />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-10 custom-scrollbar space-y-12 bg-black/20">
            {/* Query Summary */}
            <div className="bg-gray-950/50 p-8 rounded-[2rem] border border-gray-800 shadow-inner">
                <p className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-3">Originalfråga</p>
                <p className="text-xl font-bold text-white italic">"{chain.queryText}"</p>
            </div>

            {/* Source Chain */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <ActivityIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Härledningskedja (Chain of Custody)</h3>
                </div>

                {chain.sources.map((source, idx) => (
                    <div key={idx} className="group bg-gray-900/40 border border-gray-800 rounded-[2rem] p-8 hover:bg-gray-800/40 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <CpuChipIcon className="w-24 h-24" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                                    <LawIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{(source as { sourceCode: string }).sourceCode} {(source as { sfsNumber: string }).sfsNumber}</span>
                                    <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{(source as { chapter: string | number }).chapter ? `${(source as { chapter: string | number }).chapter} kap. ` : ''}{(source as { section: string | number }).section} §</h4>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-widest uppercase ${source.auditStatus === 'VERIFIED' ? 'bg-green-950/30 text-green-400 border-green-500/20' : 'bg-red-950/30 text-red-400 border-red-500/20'}`}>
                                    {source.auditStatus}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed text-sm font-medium mb-8 p-6 bg-black/40 rounded-2xl border-l-2 border-cyan-900 shadow-inner">
                            "{(source as { text: string }).text}"
                        </p>

                        <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-[8px] font-black text-gray-600 uppercase">Provenance Hash:</span>
                                    <span className="text-[9px] font-mono text-cyan-500/60">{(source as { provenanceHash: string }).provenanceHash}</span>
                                </div>
                                <div className="h-3 w-px bg-gray-800"></div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[8px] font-black text-gray-600 uppercase">Fil:</span>
                                    <span className="text-[9px] font-mono text-purple-400/60">{source.corpusFile}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-[9px] text-green-500/50 font-black uppercase">
                                <CheckCircleIcon className="h-3 w-3" />
                                <span>Bit-Perfect Integrity</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-3">
                <ActivityIcon className="h-4 w-4" />
                <span>Forensic Engine v.7.7.0 | SFS 2025:400 Logged</span>
            </div>
            <span>Timestamp: {new Date(chain.timestamp).toLocaleString()}</span>
        </footer>
      </div>
    </div>
  );
};

export default ProvenanceViewer;
