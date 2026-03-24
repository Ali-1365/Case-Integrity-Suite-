
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  BrainCircuit, 
  Scale, 
  BookOpen, 
  History, 
  Star,
  MoreVertical,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { offlineService } from '../services/offlineService';
import { db, CISCase } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';

import { geminiService } from '../services/geminiService';

interface BeslutViewProps {
  activeCase?: CISCase | null;
}

const BeslutView: React.FC<BeslutViewProps> = ({ activeCase }) => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [fraga, setFraga] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'ai', text: 'Välkommen till Beslutsmotorn. Jag är din juridiska AI-rådgivare. Ställ en fråga om ett pågående ärende eller ett rättsligt förhållande.', time: '14:05' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  const handleSend = async () => {
    if (!fraga.trim() || isOffline) return;
    
    const userMsg = { role: 'user', text: fraga, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, userMsg]);
    const currentFraga = fraga;
    setFraga('');
    setLoading(true);

    try {
      const context = activeCase ? `\n\nKONTEXT FÖR ÄRENDE:\nNamn: ${activeCase.name}\nTyp: ${activeCase.type}\nBeskrivning: ${activeCase.description}\nStatus: ${activeCase.status}` : '';
      
      const response = await geminiService.generate({
        contents: [{ role: 'user', parts: [{ text: `Du är en svensk juridisk expert. Svara på följande fråga kortfattat och formellt: ${currentFraga}${context}` }] }]
      }, 'think');

      const aiMsg = { 
        role: 'ai', 
        text: response || 'Kunde inte generera ett svar.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['AI-analys', 'Case Integrity Engine']
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error('AI Error:', e);
      const errorMsg = { role: 'ai', text: 'Ett fel uppstod vid kommunikation med AI-motorn.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Beslutsmotor</h1>
          <p className="text-slate-500 text-sm">Interaktiv AI-rådgivare för komplexa juridiska frågeställningar.</p>
          {activeCase && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Kontext: {activeCase.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <History size={18} /> Historik
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm">
            <Star size={18} /> Favoriter
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  }`}>
                    {msg.role === 'user' ? '👤' : <Sparkles size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                    {msg.sources && (
                      <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                        {msg.sources.map((s: string) => (
                          <span key={s} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-100">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest">{msg.time}</div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">AI-rådgivaren analyserar...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            {isOffline ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-amber-700">
                <AlertCircle size={18} />
                <span className="text-xs font-bold uppercase tracking-tight">Offline-läge: AI-rådgivaren är inaktiv</span>
              </div>
            ) : (
              <div className="relative">
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all h-20 resize-none shadow-sm"
                  placeholder="Ställ en juridisk fråga..."
                  value={fraga}
                  onChange={e => setFraga(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!fraga.trim() || loading}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Kontext & Rättskällor</h3>
            <div className="space-y-3">
              {[
                { label: 'Rättegångsbalken', id: 'RB', color: 'bg-blue-50 text-blue-700' },
                { label: 'Skadeståndslagen', id: 'SKL', color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Brottsbalken', id: 'BrB', color: 'bg-rose-50 text-rose-700' },
              ].map(source => (
                <div key={source.id} className={`p-3 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group ${source.color}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} />
                    <span className="text-xs font-bold">{source.label}</span>
                  </div>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={18} className="text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-widest">Rättslig Bedömning</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1 text-slate-400 uppercase font-bold">Sannolikhet för bifall</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[72%] rounded-full" />
                  </div>
                  <span className="text-xs font-black">72%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "Baserat på nuvarande bevisläge och praxis i NJA 2023 s. 45 bedöms utgången som övervägande positiv."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeslutView;
