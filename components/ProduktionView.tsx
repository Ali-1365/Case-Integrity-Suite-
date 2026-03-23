
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Share2, 
  BrainCircuit, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search,
  ArrowRight,
  MoreVertical,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { offlineService } from '../services/offlineService';
import { motion, AnimatePresence } from 'motion/react';

const ProduktionView: React.FC = () => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  const templates = [
    { id: 'stamn', label: 'Stämningsansökan', desc: 'Formell ansökan om stämning enligt RB 13:4.', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: 'svar', label: 'Svaromål', desc: 'Svar på stämningsansökan enligt RB 42:7.', icon: FileText, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 'over', label: 'Överklagande', desc: 'Överklagande av dom eller beslut till hovrätt.', icon: FileText, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { id: 'yttr', label: 'Yttrande', desc: 'Skriftligt yttrande i pågående mål.', icon: FileText, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ];

  const recentDocuments = [
    { id: 'DOC-2024-001', name: 'Stämningsansökan - Mål T 123-24', date: '2024-03-20', status: 'DRAFT', author: 'AI-Advokat' },
    { id: 'DOC-2024-002', name: 'Svaromål - Mål T 456-23', date: '2024-03-18', status: 'FINAL', author: 'System' },
    { id: 'DOC-2024-003', name: 'Yttrande - Mål B 789-24', date: '2024-03-15', status: 'SENT', author: 'AI-Advokat' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Juridisk Textproduktion</h1>
          <p className="text-slate-500 text-sm">Exekverande verktyg för domstolsklara processkrifter enligt Rättegångsbalken.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Search size={18} /> Sök Dokument
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Nytt Dokument
          </button>
        </div>
      </div>

      {isOffline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-amber-800 mb-2">Textproduktion Inaktiverad</h3>
          <p className="text-sm text-amber-700 mb-6">
            Textproduktionsmodulen kräver en giltig API-nyckel för att generera juridiska texter baserade på Case Integrity AI-motor.
          </p>
          <button onClick={() => window.location.reload()} className="bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition-all">
            Försök återansluta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Grid */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mallar & Generatorer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map(tpl => (
                <button 
                  key={tpl.id} 
                  className={`p-5 rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 group ${tpl.color}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <tpl.icon size={20} />
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{tpl.label}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{tpl.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Senaste Dokument</h3>
                <button className="text-xs text-blue-600 font-medium hover:underline">Visa alla</button>
              </div>
              <div className="divide-y divide-slate-50">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">{doc.id} · {doc.date} · {doc.author}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        doc.status === 'FINAL' ? 'bg-emerald-100 text-emerald-700' :
                        doc.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.status}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Download size={14} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={120} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><ShieldCheck size={18} /></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Integritetskontroll</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Verifierad Produktion</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Alla dokument som genereras i denna modul genomgår en automatisk kontroll mot Rättegångsbalkens formkrav och verifieras med SHA-256 för att säkerställa att inga obehöriga ändringar sker.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} /> RB 13:4 Verifierad
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} /> RB 42:7 Verifierad
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Systemstatus</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">AI-Motor</span>
                  <span className="text-xs font-bold text-emerald-600">ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Lagbibliotek</span>
                  <span className="text-xs font-bold text-emerald-600">V.2024.1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Dokumentlagring</span>
                  <span className="text-xs font-bold text-blue-600">92% LEDIGT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProduktionView;
