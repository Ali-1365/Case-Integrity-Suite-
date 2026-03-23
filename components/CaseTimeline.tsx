
import React from 'react';
import { JournalEntry } from '../lib/JournalService';
import { 
  ActivityIcon, 
  ShieldCheckIcon, 
  CpuChipIcon,
  CheckCircleIcon,
  BoltIcon
} from './icons';

interface CaseTimelineProps {
  entries: JournalEntry[];
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ entries }) => {
  return (
    <div className="space-y-8 py-10 relative">
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-gray-800 to-transparent"></div>
      
      {entries.map((entry, index) => (
        <div key={entry.entryId} className="relative pl-16 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute left-0 top-0 w-14 h-14 bg-gray-900 border-4 border-gray-800 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-all z-10 shadow-xl">
             {index === 0 ? <BoltIcon className="w-6 h-6" /> : <ActivityIcon className="w-6 h-6" />}
          </div>
          
          <div className="bg-gray-900/60 border border-gray-800 rounded-[2rem] p-8 hover:bg-gray-800/40 transition-all shadow-lg group-hover:border-cyan-900/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-cyan-500 bg-cyan-950/40 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-500/20">
                  {new Date(entry.timestamp).toLocaleTimeString('sv-SE')}
                </span>
                <span className="text-[10px] font-mono text-gray-600">#{entry.entryId}</span>
              </div>
              <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                ACTOR: {entry.actor}
              </span>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-4 leading-tight uppercase italic tracking-tighter">
              {entry.event.replace(/_/g, ' ')}
            </h4>
            
            <div className="p-4 bg-black/40 rounded-xl border-l-2 border-gray-700 italic text-xs text-gray-400 leading-relaxed">
              "{(entry as { details?: unknown }).details}"
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-3 h-3 text-green-500/50" /> Logged & Signed</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span>Hashes: {(entry as { provenanceHash: string }).(provenanceHashes as { length: number }).length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaseTimeline;
