
import React from 'react';
import { AnalysisResult, Fact } from '../lib/cis.types';
import { ActivityIcon } from './icons';

interface TimelineViewProps {
  analysis: AnalysisResult;
}

const TimelineView: React.FC<TimelineViewProps> = ({ analysis }) => {
  const sortedFacts = [...(analysis as { facts: unknown[] }).facts].sort((a, b) => {
    if (a.timestamp === 'Okänd') return 1;
    if (b.timestamp === 'Okänd') return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="space-y-12 py-10 relative">
      <div className="absolute left-[39px] top-0 bottom-0 w-1.5 bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner"></div>
      
      {sortedFacts.map((fact, index) => (
        <div key={(fact as { id: string }).id} className="relative pl-24 group animate-in slide-in-from-left duration-700" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute left-0 top-0 w-20 h-20 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 rounded-[2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:border-blue-500/30 transition-all z-10 shadow-2xl shadow-slate-200/50 dark:shadow-none group-hover:scale-110 duration-500 group-hover:rotate-12">
             <ActivityIcon className="w-10 h-10" />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 hover:border-blue-500/50 transition-all shadow-2xl shadow-slate-200/50 dark:shadow-none group-hover:shadow-blue-500/10 duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20 uppercase tracking-[0.3em] shadow-lg shadow-blue-500/5">
                  {fact.timestamp === 'Okänd' ? 'ODATERAD' : fact.timestamp}
                </span>
                <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner opacity-70">#{(fact as { id: string }).id}</span>
              </div>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 uppercase tracking-[0.3em] shadow-sm opacity-80">
                {fact.category}
              </span>
            </div>
            
            <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-8 leading-tight tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">
              <span className="text-slate-400 dark:text-slate-500 mr-4 italic font-medium">[{fact.subject}]</span> {fact.statement}
            </h4>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-l-8 border-blue-500/50 italic text-lg text-slate-600 dark:text-slate-400 leading-relaxed shadow-inner font-medium relative z-10 group-hover:border-blue-500 transition-all duration-500">
              "{(fact as { source: unknown }).source.snippet}"
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-8 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] relative z-10 opacity-70">
              <span className="flex items-center gap-3 bg-blue-500/5 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl border border-blue-500/10 shadow-sm"><ClockIcon className="w-5 h-5" /> Verifierad Trace</span>
              <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <span className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">Dokument: {(fact as { source: unknown }).source.documentId}</span>
              <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <span className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">Position: {(fact as { source: unknown }).source.location}</span>
            </div>
          </div>
        </div>
      ))}

      {(sortedFacts as { length: number }).length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-slate-300 dark:text-slate-700 opacity-50">
          <div className="relative mb-8">
              <ActivityIcon className="w-24 h-24" />
              <div className="absolute inset-0 bg-slate-500 blur-[4rem] opacity-20"></div>
          </div>
          <p className="text-base font-black uppercase tracking-[0.3em]">Inga temporala dataatomer funna</p>
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
