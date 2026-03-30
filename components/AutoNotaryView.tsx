
import React, { useState, useEffect } from 'react';
import { autoNotary, NotaryEvent } from '../lib/AutoNotaryService';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ActivityIcon,
  ScaleIcon,
  CodeBracketIcon,
  FingerPrintIcon
} from './icons';
import { ModuleConnector } from './shared/ModuleConnector';

interface AutoNotaryViewProps {
  onNavigate?: (moduleId: string) => void;
}

export const AutoNotaryView: React.FC<AutoNotaryViewProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<NotaryEvent[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleEvent = (e: CustomEvent<NotaryEvent>) => {
      setEvents(prev => [e.detail, ...prev].slice(0, 100)); // Keep last 100
    };

    window.addEventListener('fmjam-notary-event', handleEvent as EventListener);
    return () => window.removeEventListener('fmjam-notary-event', handleEvent as EventListener);
  }, []);

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.module === filter);
  const modules = Array.from(new Set(events.map(e => e.module)));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[var(--bg-card)] p-10 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <ScaleIcon className="w-48 h-48 text-[var(--accent)]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ActivityIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Processnotarie v.4.2-GOLD</span>
          </div>
          <h3 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter italic uppercase">Auto Notary</h3>
          <p className="text-[var(--ink-muted)] font-bold mt-2 max-w-xl leading-relaxed uppercase text-[11px] tracking-widest">Automatiserad juridisk protokollföring och tidsstämpling.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="bg-[var(--bg-main)] border border-[var(--border)] px-6 py-4">
            <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-1">System Status</p>
            <p className="text-xs font-black text-[var(--success)] uppercase tracking-widest italic">AKTIV_LOGGNING</p>
          </div>
          <div className="bg-[var(--bg-main)] border border-[var(--border)] px-6 py-4">
            <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-1">Totala Noteringar</p>
            <p className="text-xs font-black text-[var(--accent)] uppercase tracking-widest italic">{events.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Filter Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 shadow-xl">
            <h4 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 italic">Filtrera Moduler</h4>
            <div className="space-y-3">
              <button
                onClick={() => setFilter('ALL')}
                className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === 'ALL' 
                  ? 'bg-[var(--ink-main)] text-white border-[var(--ink-main)] shadow-lg' 
                  : 'bg-[var(--bg-main)] text-[var(--ink-muted)] border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                Alla Moduler
              </button>
              {modules.map(m => (
                <button
                  key={m}
                  onClick={() => setFilter(m)}
                  className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border ${
                    filter === m 
                    ? 'bg-[var(--ink-main)] text-white border-[var(--ink-main)] shadow-lg' 
                    : 'bg-[var(--bg-main)] text-[var(--ink-muted)] border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setEvents([])}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] p-6 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest hover:text-[var(--danger)] transition-colors flex items-center justify-center gap-3 group"
          >
            <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Rensa Logg
          </button>
        </div>

        {/* Log View */}
        <div className="lg:col-span-9">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden">
            <div className="bg-[var(--bg-main)] border-b border-[var(--border-strong)] p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <CodeBracketIcon className="w-5 h-5 text-[var(--accent)]" />
                    <h4 className="text-sm font-black text-[var(--ink-main)] uppercase tracking-widest italic">Live Notary Stream</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--success)] animate-pulse rounded-full"></span>
                    <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Ansluten till Oracle Core</span>
                </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto font-mono text-[11px] p-6 space-y-2 custom-scrollbar">
              {filteredEvents.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 bg-[var(--bg-main)] border border-[var(--border)] mx-auto flex items-center justify-center opacity-20">
                        <FingerPrintIcon className="w-6 h-6 text-[var(--ink-muted)]" />
                    </div>
                    <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Väntar på systemhändelser...</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="flex flex-col gap-2 p-6 border-b border-[var(--border)] hover:bg-[var(--bg-main)] transition-colors group relative">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-6 items-center">
                            <span className="text-[var(--ink-muted)] font-bold group-hover:text-[var(--ink-main)] transition-colors">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                            <span className="font-black text-[var(--accent)] uppercase tracking-tighter">[{event.module}]</span>
                            <span className="text-[var(--ink-main)] font-bold uppercase tracking-widest italic">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {event.duration && (
                                <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" /> {event.duration.toFixed(2)}ms
                                </span>
                            )}
                            <span className={`text-[9px] font-black border px-3 py-0.5 ${
                                event.status === 'SUCCESS' ? 'text-[var(--success)] border-[var(--success)]/30' :
                                event.status === 'FAILURE' ? 'text-[var(--danger)] border-[var(--danger)]/30' :
                                'text-[var(--warning)] border-[var(--warning)]/30'
                            }`}>
                                {event.status}
                            </span>
                        </div>
                    </div>
                    
                    {event.data && (
                        <div className="mt-4 p-4 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-inner overflow-x-auto">
                            <pre className="text-[10px] text-[var(--ink-muted)] leading-relaxed">
                                {JSON.stringify(event.data, null, 2)}
                            </pre>
                        </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="bg-[var(--bg-main)] border-t border-[var(--border-strong)] p-4 flex justify-between items-center">
                <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Visar {filteredEvents.length} senaste händelser</p>
                <div className="flex gap-4">
                    <button className="text-[9px] font-black text-[var(--ink-muted)] hover:text-[var(--accent)] uppercase tracking-widest transition-colors">Exportera Logg</button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleConnector activeModule="notary" onNavigate={onNavigate} />
    </div>
  );
};

