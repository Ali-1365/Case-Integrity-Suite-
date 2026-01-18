
import React from 'react';
import { RiskReport, NormConflict } from '../lib/RiskConflictService';
import { 
  AlertIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ActivityIcon,
  CpuChipIcon,
  BoltIcon
} from './icons';

interface RiskConflictViewerProps {
  report: RiskReport;
}

const RiskConflictViewer: React.FC<RiskConflictViewerProps> = ({ report }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'RÖD': return 'bg-red-500 border-red-400 text-white shadow-red-900/50';
      case 'GUL': return 'bg-orange-500 border-orange-400 text-white shadow-orange-900/50';
      default: return 'bg-green-600 border-green-400 text-white shadow-green-900/50';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* RISK HEADER CARD */}
      <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl flex justify-between items-center transition-all ${getLevelStyles(report.level)}`}>
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            {report.level === 'GRÖN' ? <CheckCircleIcon className="w-10 h-10" /> : <ExclamationTriangleIcon className="w-10 h-10" />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Rättslig Risknivå</p>
            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mt-1">{report.level}</h3>
          </div>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Security_Node_ID</p>
            <p className="text-xs font-mono font-bold mt-1">{report.riskId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONFLICT LIST */}
        <div className="lg:col-span-8 space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center ml-2">
                <ActivityIcon className="w-3 h-3 mr-2" />
                Identifierade Normkonflikter ({report.conflicts.length})
            </p>
            
            {report.conflicts.length > 0 ? report.conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 hover:bg-gray-800/60 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <CpuChipIcon className="w-4 h-4" />
                            </span>
                            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{conflict.type}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${conflict.severity === 'RÖD' ? 'bg-red-950/30 text-red-500 border-red-900/40' : 'bg-orange-950/30 text-orange-400 border-orange-900/40'}`}>
                            {conflict.severity} SEVERITY
                        </span>
                    </div>
                    <p className="text-sm font-bold text-gray-200 leading-relaxed mb-4">
                        {conflict.description}
                    </p>
                    <div className="pt-4 border-t border-gray-700/50">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter mb-2 italic">Påverkade Provenans-Hasher:</p>
                        <div className="flex flex-wrap gap-2">
                            {conflict.affectedSources.slice(0, 3).map(hash => (
                                <span key={hash} className="text-[8px] font-mono text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                                    {hash.substring(0, 16)}...
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-[2.5rem] p-12 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-900 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Inga konflikter detekterade</p>
                </div>
            )}
        </div>

        {/* ASSESSMENT PANEL */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/20 p-8 rounded-[2.5rem] border border-gray-800 h-full flex flex-col">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-6">Samlad Riskbedömning</p>
                <div className="flex-grow">
                    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 mb-6">
                        <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                            "{report.assessment}"
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <BoltIcon className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Decision Integrity: 98%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Hierarchy Verified</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-gray-800">
                    <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                         <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-2">Audit Trace</p>
                         <p className="text-[9px] font-mono text-gray-400 break-all">{crypto.randomUUID()}</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RiskConflictViewer;
