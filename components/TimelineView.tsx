
import React from 'react';
import { AnalysisResult, Fact } from '../lib/cis.types';
import { ActivityIcon } from './icons';
import { ModuleConnector } from './shared/ModuleConnector';

interface TimelineViewProps {
  analysis: AnalysisResult;
  onNavigate?: (moduleId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ analysis, onNavigate }) => {
  const sortedFacts = [...(analysis.facts || [])].sort((a, b) => {
    if (a.timestamp === 'Okänd') return 1;
    if (b.timestamp === 'Okänd') return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="space-y-16 py-12 relative max-w-6xl mx-auto pb-32">
      <div className="absolute left-[47px] top-0 bottom-0 w-1 bg-[var(--border-strong)] opacity-30 shadow-inner"></div>
      
      {sortedFacts.map((fact, index) => (
        <div key={fact.id} className="relative pl-32 group animate-in slide-in-from-left duration-1000" style={{ animationDelay: `${index * 150}ms` }}>
          <div className="absolute left-0 top-0 w-24 h-24 bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)] group-hover:border-[var(--accent)] transition-all z-10 shadow-2xl group-hover:scale-110 duration-500 group-hover:rotate-12 italic">
             <ActivityIcon className="w-12 h-12" />
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-12 hover:border-[var(--accent)]/50 transition-all shadow-2xl relative overflow-hidden group-hover:shadow-[var(--accent)]/5 duration-500">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <ActivityIcon className="w-48 h-48 text-[var(--accent)]" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12 relative z-10">
              <div className="flex items-center gap-6">
                <span className="text-[11px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-6 py-3 border border-[var(--accent)]/20 uppercase tracking-[0.4em] italic shadow-lg">
                  {fact.timestamp === 'Okänd' ? 'ODATERAD' : fact.timestamp}
                </span>
                <span className="text-[10px] font-mono font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] bg-[var(--bg-main)] px-5 py-2 border border-[var(--border)] shadow-inner opacity-80 italic">#{fact.id}</span>
              </div>
              <span className="text-[10px] font-black text-[var(--ink-muted)] bg-[var(--bg-main)] px-6 py-3 border border-[var(--border)] uppercase tracking-[0.3em] shadow-sm opacity-80 italic">
                {fact.category}
              </span>
            </div>
            
            <h4 className="text-4xl font-black text-[var(--ink-main)] mb-10 leading-none tracking-tighter uppercase italic group-hover:text-[var(--accent)] transition-colors relative z-10">
              <span className="text-[var(--ink-muted)] mr-4 opacity-50">[{fact.subject}]</span> {fact.statement}
            </h4>
            
            <div className="p-10 bg-[var(--bg-main)] border-l-4 border-[var(--accent)]/30 italic text-lg text-[var(--ink-muted)] leading-relaxed shadow-inner font-black uppercase tracking-tight relative z-10 group-hover:border-[var(--accent)] transition-all duration-500 opacity-80">
              "{fact.source?.snippet || 'Ingen text tillgänglig'}"
            </div>
            
            <div className="mt-12 pt-10 border-t border-[var(--border)] flex flex-wrap items-center gap-10 text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] relative z-10 opacity-70 italic">
              <span className="flex items-center gap-4 bg-[var(--accent)]/5 text-[var(--accent)] px-5 py-2 border border-[var(--accent)]/10 shadow-sm"><ClockIcon className="w-5 h-5" /> Verifierad Trace</span>
              <div className="w-1.5 h-1.5 bg-[var(--border)] rounded-full"></div>
              <span className="bg-[var(--bg-main)] px-5 py-2 border border-[var(--border)] shadow-sm">Dokument: {fact.source?.documentId || 'N/A'}</span>
              <div className="w-1.5 h-1.5 bg-[var(--border)] rounded-full"></div>
              <span className="bg-[var(--bg-main)] px-5 py-2 border border-[var(--border)] shadow-sm">Position: {fact.source?.location || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}

      {(sortedFacts?.length || 0) === 0 && (
        <div className="flex flex-col items-center justify-center py-60 text-[var(--ink-muted)] opacity-20">
          <div className="relative mb-10">
              <ActivityIcon className="w-32 h-32" />
              <div className="absolute inset-0 bg-[var(--accent)] blur-[5rem] opacity-30"></div>
          </div>
          <p className="text-xl font-black uppercase tracking-[0.5em] italic">Inga temporala dataatomer funna</p>
        </div>
      )}

      <ModuleConnector activeModule="timeline" onNavigate={onNavigate} />
    </div>
  );
};

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default TimelineView;
