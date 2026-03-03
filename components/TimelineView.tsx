
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
    <div className="space-y-8 py-8 relative">
      <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gray-800"></div>
      
      {sortedFacts.map((fact, index) => (
        <div key={fact.id} className="relative pl-14 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute left-0 top-0 w-12 h-12 bg-[#111111] border border-gray-800 rounded-xl flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors z-10 shadow-sm">
             <ActivityIcon className="w-5 h-5" />
          </div>
          
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:bg-[#161616] transition-colors shadow-sm group-hover:border-cyan-900/30">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                  {fact.timestamp === 'Okänd' ? 'ODATERAD' : fact.timestamp}
                </span>
                <span className="text-xs font-mono text-gray-500">#{fact.id}</span>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-[#0a0a0a] px-2 py-1 rounded border border-gray-800">
                {fact.category}
              </span>
            </div>
            
            <h4 className="text-base font-medium text-gray-200 mb-3 leading-relaxed">
              <span className="text-gray-400">{fact.subject}:</span> {fact.statement}
            </h4>
            
            <div className="p-3 bg-[#0a0a0a] rounded-lg border-l-2 border-gray-700 italic text-sm text-gray-400">
              "{fact.source.snippet}"
            </div>
            
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> Verifierad Trace</span>
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
