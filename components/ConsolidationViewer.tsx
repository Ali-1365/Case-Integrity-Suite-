
import React, { useState } from 'react';
import { ConsolidationResult } from '../lib/cis.types';
import RiskConflictViewer from './RiskConflictViewer';
import { 
  LawIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  ActivityIcon,
  CheckCircleIcon,
  BoltIcon,
  ExclamationTriangleIcon
} from './icons';

interface ConsolidationViewerProps {
  result: ConsolidationResult;
  onClose: () => void;
}

const ConsolidationViewer: React.FC<ConsolidationViewerProps> = ({ result, onClose }) => {
  const [activeView, setActiveView] = useState<'hierarchy' | 'risks'>('hierarchy');

  return (
    <div className="bg-gray-900/60 rounded-[3.5rem] border border-gray-800 p-10 space-y-10 animate-in slide-in-from-top-4 duration-500 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-800 pb-10">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-indigo-500/10 rounded-[1.5rem] text-indigo-400 border border-indigo-500/20 shadow-xl">
            <CpuChipIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Rättskällekonsolidering</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-3 flex items-center">
                <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
                ID: {result.consolidationId} | LOCKED_STATE_V11
            </p>
          </div>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
            <button 
                onClick={() => setActiveView('hierarchy')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'hierarchy' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Hierarki
            </button>
            <button 
                onClick={() => setActiveView('risks')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'risks' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-orange-400'}`}
            >
                {result.riskReport?.level !== 'GRÖN' && <ExclamationTriangleIcon className="w-3 h-3" />}
                Normkonflikt
            </button>
        </div>
      </div>

      {activeView === 'hierarchy' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* HIERARKI TREE */}
            <div className="md:col-span-2 space-y-6">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center ml-2">
                <ActivityIcon className="w-3 h-3 mr-2" />
                Normativ Hierarki (Lex Superior)
            </p>
            
            <div className="space-y-4 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-800/50"></div>
                
                {/* Konstitution */}
                <div className={`relative pl-14 transition-all ${result.hierarchy.constitution.length === 0 ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="absolute left-4.5 top-4 w-4 h-4 bg-gray-900 border-2 border-gray-700 rounded-full z-10"></div>
                    <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Grundlag / Konvention (Lvl 1)</span>
                    <div className="mt-3 space-y-2">
                        {result.hierarchy.constitution.length > 0 ? result.hierarchy.constitution.map(s => (
                            <div key={s.provenanceHash} className="flex justify-between items-center">
                                <p className="text-sm font-black text-white italic">{s.sourceCode} {s.sfsNumber}</p>
                                <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                            </div>
                        )) : <p className="text-xs font-bold text-gray-600 italic">Inga direkta träffar</p>}
                    </div>
                    </div>
                </div>

                {/* Lag */}
                <div className="relative pl-14">
                    <div className="absolute left-4.5 top-4 w-4 h-4 bg-cyan-500 border-4 border-gray-900 rounded-full z-10 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                    <div className="bg-cyan-950/10 p-6 rounded-3xl border border-cyan-500/20">
                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Lag (SFS) (Lvl 2)</span>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.affectedNorms.map(norm => (
                        <div key={norm} className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                            <span className="text-xs font-black text-gray-200">{norm}</span>
                            <CheckCircleIcon className="w-3 h-3 text-cyan-500" />
                        </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* Praxis */}
                <div className={`relative pl-14 transition-all ${result.hierarchy.praxis.length === 0 ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="absolute left-4.5 top-4 w-4 h-4 bg-purple-500 border-4 border-gray-900 rounded-full z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                    <div className="bg-purple-900/10 p-6 rounded-3xl border border-purple-500/20">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Praxis / Tolkning (Lvl 3)</span>
                    <div className="mt-3 space-y-2">
                        {result.hierarchy.praxis.length > 0 ? result.hierarchy.praxis.map(p => (
                        <div key={p.id} className="text-xs font-bold text-gray-300 flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                            <span>{p.reference}</span>
                            <BoltIcon className="w-4 h-4 text-purple-400" />
                        </div>
                        )) : <p className="text-xs font-bold text-gray-600 italic">Ingen matchande praxis</p>}
                    </div>
                    </div>
                </div>
            </div>
            </div>

            {/* DATA CARD */}
            <div className="bg-black/20 p-8 rounded-[3rem] border border-gray-800 flex flex-col justify-between">
            <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-6">Analys-Metaspace</p>
                <div className="space-y-6">
                    <DataStat label="Provenance Count" value={result.provenanceHashes.length} />
                    <DataStat label="Active Norms" value={result.affectedNorms.length} />
                    <DataStat label="Conflict Risk" value={result.riskReport?.level || 'GRÖN'} highlight={result.riskReport?.level !== 'GRÖN'} />
                </div>
            </div>
            <div className="pt-10 border-t border-gray-800 mt-10">
                <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Audit Compliance</p>
                    <p className="text-[10px] font-bold text-gray-400 italic leading-snug">Forensiskt konsoliderad under SFS 2025:400 v.11</p>
                </div>
            </div>
            </div>
        </div>
      ) : (
        result.riskReport && <RiskConflictViewer report={result.riskReport} />
      )}
    </div>
  );
};

const DataStat: React.FC<{ label: string, value: string | number, highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center border-b border-gray-800/50 pb-3">
        <span className="text-[10px] text-gray-500 font-bold uppercase">{label}</span>
        <span className={`text-xs font-mono font-black ${highlight ? 'text-orange-500' : 'text-cyan-500'}`}>{value}</span>
    </div>
);

export default ConsolidationViewer;
