
import React from 'react';
import { AnalysisResult, Fact } from '../lib/fmjam.types';
import { ActivityIcon } from './icons';

interface TimelineViewProps {
  analysis: AnalysisResult;
}

const TimelineView: React.FC<TimelineViewProps> = ({ analysis }) => {
  const sortedFacts = [...analysis.facts].sort((a, b) => {
    if (a.timestamp === 'Okänd') return 1;
    if (b.timestamp === 'Okänd') return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="space-y-12 py-10 relative">
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-gray-800 to-transparent"></div>
      
      {sortedFacts.map((fact, index) => (
        <div key={fact.id} className="relative pl-16 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute left-0 top-0 w-14 h-14 bg-gray-900 border-4 border-gray-800 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-all z-10 shadow-xl">
             <ActivityIcon className="w-6 h-6" />
          </div>
          
          <div className="bg-gray-900/60 border border-gray-800 rounded-[2rem] p-8 hover:bg-gray-800/40 transition-all shadow-lg group-hover:border-cyan-900/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-cyan-500 bg-cyan-950/40 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-500/20">
                  {fact.timestamp === 'Okänd' ? 'ODATERAD' : fact.timestamp}
                </span>
                <span className="text-[10px] font-mono text-gray-600">#{fact.id}</span>
              </div>
              <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                {fact.category}
              </span>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-4 leading-tight">
              <span className="text-gray-500">{fact.subject}:</span> {fact.statement}
            </h4>
            
            <div className="p-4 bg-black/40 rounded-xl border-l-2 border-gray-700 italic text-xs text-gray-400">
              "{fact.source.snippet}"
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ClockIcon className="w-3 h-3" /> Verifierad Trace</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span>Dokument: {fact.source.documentId}</span>
            </div>
          </div>
        </div>
      ))}

      {sortedFacts.length === 0 && (
        <div className="text-center py-20 text-gray-600 italic">
          Inga temporala dataatomer kunde extraheras för tidslinjen.
        </div>
      )}
    </div>
  );
};

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default TimelineView;
