
import React, { useState, useEffect } from 'react';
import { autoNotary, NotaryEvent } from '../lib/AutoNotaryService';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from './icons';

export const AutoNotaryView: React.FC = () => {
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
    <div className="h-full flex flex-col bg-[#0a0a0a] text-gray-300 font-mono text-xs">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111111]">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold uppercase tracking-wider text-cyan-400">Intern Processnotarie</h3>
        </div>
        <div className="flex gap-2">
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#161616] border border-gray-800 rounded px-2 py-1 text-[10px] uppercase text-gray-300 focus:outline-none focus:border-cyan-500/50"
            >
                <option value="ALL">Alla Moduler</option>
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={() => setEvents([])} className="p-1 hover:text-white text-gray-500 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {(filteredEvents as { length: number }).length === 0 ? (
          <div className="text-center py-10 opacity-30 italic text-gray-500">
            Inväntar processdata...
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={(event as { id: string }).id} className="relative pl-4 border-l border-gray-800 hover:border-cyan-500/50 transition-colors group">
              <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${
                event.status === 'SUCCESS' ? 'bg-emerald-500' :
                event.status === 'FAILURE' ? 'bg-rose-500' :
                event.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span className="text-[9px] uppercase tracking-widest text-gray-600">{event.module}</span>
              </div>
              
              <div className="font-medium text-gray-200 mb-1">
                {event.action}
              </div>
              
              {event.data && (
                <pre className="text-[10px] text-gray-400 bg-[#111111] p-2.5 rounded-lg border border-gray-800 overflow-x-auto">
                  {(JSON as { str: string }).stringify(event.data, null, 2)}
                </pre>
              )}

              {event.duration && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
                  <ClockIcon className="h-3 w-3" />
                  <span>{event.duration.toFixed(2)}ms</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
