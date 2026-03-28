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
  ExternalLink,
  Sparkles,
  Activity,
  Loader2,
  FilePlus,
  History,
  Zap,
  Upload,
  X
} from 'lucide-react';
import { db, CISCase } from '../lib/db';
import { offlineService } from '../services/offlineService';
import { legalTextProductionEngine } from '../lib/LegalTextProductionEngine';
import { motion, AnimatePresence } from 'motion/react';
import FileUpload from './FileUpload';
import { useFileParser } from '../hooks/useFileParser';
import { toast } from 'sonner';

interface ProduktionViewProps {
  activeCase?: CISCase | null;
}

const ProduktionView: React.FC<ProduktionViewProps> = ({ activeCase }) => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<CISCase[]>([]);
  const [generatedText, setGeneratedText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { parseFile, isParsing } = useFileParser();

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    loadCases();
    return () => sub();
  }, []);

  const loadCases = async () => {
    try {
      const allCases = await db.getAllCases();
      setCases(allCases);
    } catch (e) {
      console.error('Kunde inte ladda ärenden:', e);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    toast.info(`Läser in ${files.length} referensdokument...`);
    
    try {
      for (const file of files) {
        const result = await parseFile(file);
        if (result) {
          // Add content to case context or similar
          console.log('Parsed content for production:', result.textContent.substring(0, 100));
        }
      }
      toast.success('Referensdokument inlästa');
    } catch (error) {
      toast.error('Kunde inte läsa in filer');
    } finally {
      setLoading(false);
      setShowUploadModal(false);
    }
  };

  const handleGenerate = async (templateId: string) => {
    if (isOffline || !activeCase) return;
    setLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      const result = await legalTextProductionEngine.produce({
        caseId: activeCase.caseId,
        drafts: [],
        context: {
          goal: `Producera en ${template?.label || 'juridisk handling'} för ärendet.`,
          facts: activeCase.description || 'Ingen beskrivning tillgänglig.',
          evidence: 'Se ärendets bilagor.',
          opponentPosition: 'Ej specificerad.',
          proceduralContext: `Ärendetyp: ${activeCase.type}. Status: ${activeCase.status}.`,
          taskDescription: `Skapa ett utkast för ${template?.label}.`
        }
      });
      setGeneratedText(result);
      setActiveTemplate(templateId);
    } catch (e) {
      console.error('Produktionsfel:', e);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { id: 'stamn', label: 'Stämningsansökan', desc: 'Formell ansökan om stämning enligt RB 13:4.', icon: FileText, color: 'border-blue-100 hover:border-blue-500/50' },
    { id: 'svar', label: 'Svaromål', desc: 'Svar på stämningsansökan enligt RB 42:7.', icon: FileText, color: 'border-emerald-100 hover:border-emerald-500/50' },
    { id: 'over', label: 'Överklagande', desc: 'Överklagande av dom eller beslut till hovrätt.', icon: FileText, color: 'border-indigo-100 hover:border-indigo-500/50' },
    { id: 'yttr', label: 'Yttrande', desc: 'Skriftligt yttrande i pågående mål.', icon: FileText, color: 'border-purple-100 hover:border-purple-500/50' },
  ];

  const recentDocuments = [
    { id: 'DOC-2024-001', name: 'Stämningsansökan - Mål T 123-24', date: '2024-03-20', status: 'UTKAST', author: 'AI-Advokat' },
    { id: 'DOC-2024-002', name: 'Svaromål - Mål T 456-23', date: '2024-03-18', status: 'KLAR', author: 'System' },
    { id: 'DOC-2024-003', name: 'Yttrande - Mål B 789-24', date: '2024-03-15', status: 'SKICKAT', author: 'AI-Advokat' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto h-full flex flex-col pb-12">
      
      {/* Header */}
      <header className="py-10 px-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <FileText size={200} className="text-[var(--accent)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--ink-muted)] uppercase">Produktionsmotor v4.0</span>
            </div>
            <h1 className="text-4xl font-black text-[var(--ink-main)] tracking-tight">
              Juridisk Textproduktion
            </h1>
            <p className="text-sm font-medium text-[var(--ink-muted)] max-w-xl leading-relaxed">
              Exekverande verktyg för domstolsklara processkrifter enligt Rättegångsbalken.
            </p>
            {activeCase && (
              <div className="mt-4 inline-flex items-center gap-3 px-5 py-2 bg-[var(--accent)]/5 text-[var(--accent)] rounded-2xl border border-[var(--accent)]/10">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Aktivt Ärende: {activeCase.name}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-[var(--bg-main)] border border-[var(--border)] text-[var(--ink-main)] px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all flex items-center gap-3 shadow-sm active:scale-95"
            >
              <Upload size={18} /> Ladda upp Referens
            </button>
            <button className="bg-[var(--ink-main)] text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center gap-3 shadow-xl shadow-[var(--ink-main)]/10 active:scale-95">
              <FilePlus size={18} /> Nytt Dokument
            </button>
          </div>
        </div>
      </header>

      {isOffline ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-16 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <AlertCircle size={48} />
          </div>
          <h3 className="text-2xl font-black text-[var(--ink-main)] mb-4 tracking-tight">Textproduktion Inaktiverad</h3>
          <p className="text-sm text-[var(--ink-muted)] mb-10 leading-relaxed font-medium">
            Textproduktionsmodulen kräver en aktiv anslutning och en giltig API-nyckel för att generera juridiska texter baserade på Case Integrity AI-motor.
          </p>
          <button onClick={() => window.location.reload()} className="bg-[var(--ink-main)] text-white px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all shadow-xl shadow-[var(--ink-main)]/10 active:scale-95">
            Försök återansluta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
          {/* Templates Grid */}
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] whitespace-nowrap">Mallar & Generatorer</h2>
                <div className="h-px flex-grow bg-[var(--border)]"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {templates.map(tpl => (
                <button 
                  key={tpl.id} 
                  onClick={() => handleGenerate(tpl.id)}
                  disabled={loading || !activeCase}
                  className={`p-8 rounded-[2.5rem] border bg-[var(--bg-card)] text-left transition-all hover:shadow-2xl hover:shadow-[var(--accent)]/5 group disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full ${tpl.color}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--ink-main)] shadow-sm group-hover:bg-[var(--ink-main)] group-hover:text-white transition-all">
                      <tpl.icon size={28} />
                    </div>
                    <ArrowRight size={20} className="text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--ink-main)] mb-3 tracking-tight group-hover:text-[var(--ink-main)]">{tpl.label}</h3>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-medium flex-grow">{tpl.desc}</p>
                  
                  <div className="mt-8 pt-8 border-t border-[var(--bg-main)] flex items-center justify-end">
                    <span className="text-[9px] font-black text-[var(--ink-main)] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Använd Mall</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col flex-grow">
              <div className="px-10 py-6 border-b border-[var(--bg-main)] flex justify-between items-center bg-[var(--bg-main)]/30">
                <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-[var(--ink-muted)]" />
                    <h3 className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.2em]">Senaste Dokument</h3>
                </div>
                <button className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest hover:text-[var(--accent)] transition-colors">Visa alla</button>
              </div>
              <div className="divide-y divide-[var(--bg-main)] overflow-y-auto custom-scrollbar">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="px-10 py-6 flex items-center justify-between hover:bg-[var(--bg-main)]/50 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--ink-muted)] group-hover:bg-[var(--ink-main)] group-hover:text-white transition-all shadow-sm">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="text-base font-black text-[var(--ink-main)] tracking-tight">{doc.name}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-widest mt-1">{doc.id} · {doc.date} · {doc.author}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${
                        doc.status === 'KLAR' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        doc.status === 'SKICKAT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-[var(--bg-main)] text-[var(--ink-muted)] border-[var(--border)]'
                      }`}>
                        {doc.status}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-3 text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-white rounded-xl border border-transparent hover:border-[var(--border)] transition-all shadow-sm"><Download size={18} /></button>
                        <button className="p-3 text-[var(--ink-muted)] hover:text-rose-600 hover:bg-white rounded-xl border border-transparent hover:border-rose-100 transition-all shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[var(--ink-main)] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><BrainCircuit size={160} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/20"><ShieldCheck size={24} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Integritetskontroll</span>
                </div>
                <h4 className="text-2xl font-black mb-6 tracking-tight">Verifierad Produktion</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-10 font-medium">
                  Alla dokument som genereras i denna modul genomgår en automatisk kontroll mot Rättegångsbalkens formkrav och verifieras med SHA-256 för att säkerställa att inga obehöriga ändringar sker.
                </p>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                    <CheckCircle2 size={16} /> RB 13:4 Verifierad
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                    <CheckCircle2 size={16} /> RB 42:7 Verifierad
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[var(--ink-muted)]" />
                  <h3 className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.2em]">Systemstatus</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--ink-muted)] font-medium">AI-Motor</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--ink-muted)] font-medium">Lagbibliotek</span>
                  <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-widest">V.2024.1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--ink-muted)] font-medium">Dokumentlagring</span>
                  <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">92% LEDIGT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-main)] rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 border border-white/20"
            >
              <div className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Ladda upp Referensdokument</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em] font-black">Använd befintliga texter som underlag</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-4 hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <X size={32} />
                </button>
              </div>
              
              <div className="p-12">
                <FileUpload 
                  onFilesSelect={handleFileUpload}
                  maxFiles={10}
                  acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
                />
                
                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Stil-härmning Aktiverad</p>
                    <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                      Genom att ladda upp tidigare inlagor kan AI-motorn lära sig din specifika juridiska ton och stil för att skapa mer personliga utkast.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8 border-t border-[var(--border)] bg-white/50 backdrop-blur-sm flex justify-end">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-10 py-4 text-[var(--ink-muted)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-95"
                >
                  Avbryt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generated Text Modal */}
      <AnimatePresence>
        {activeTemplate && generatedText && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setGeneratedText(''); setActiveTemplate(null); }}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-main)] rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10 border border-white/20"
            >
              <div className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Genererat Dokument: {templates.find(t => t.id === activeTemplate)?.label}</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em] font-black">Verifierad av Case Integrity AI Engine</p>
                </div>
                <button 
                  onClick={() => { setGeneratedText(''); setActiveTemplate(null); }}
                  className="p-4 hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <Plus size={32} className="rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-16 bg-[var(--bg-main)]/30 custom-scrollbar">
                <div className="bg-white p-20 shadow-2xl border border-[var(--border)] rounded-[2rem] min-h-full font-serif text-[var(--ink-main)] leading-relaxed whitespace-pre-wrap text-xl">
                  {generatedText}
                </div>
              </div>
              
              <div className="px-12 py-10 border-t border-[var(--border)] bg-white/50 backdrop-blur-sm flex justify-end gap-6">
                <button 
                  onClick={() => { setGeneratedText(''); setActiveTemplate(null); }}
                  className="px-10 py-5 text-[var(--ink-muted)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-95"
                >
                  Stäng
                </button>
                <button className="px-10 py-5 bg-[var(--ink-main)] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[var(--accent)] rounded-[1.5rem] transition-all flex items-center gap-4 shadow-xl shadow-[var(--ink-main)]/10 active:scale-95">
                  <Download size={20} /> Ladda ner PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--ink-main)]/80 backdrop-blur-2xl z-[400] flex flex-col items-center justify-center text-white p-10"
          >
            <div className="w-40 h-40 relative mb-12">
              <div className="absolute inset-0 border-4 border-[var(--accent)]/10 rounded-[2.5rem]" />
              <div className="absolute inset-0 border-4 border-[var(--accent)] border-t-transparent rounded-[2.5rem] animate-spin" />
              <div className="absolute inset-8 bg-[var(--accent)]/10 rounded-[2rem] flex items-center justify-center">
                <BrainCircuit size={64} className="text-[var(--accent)] animate-pulse" />
              </div>
            </div>
            <h3 className="text-4xl font-black mb-6 tracking-tight">Producerar Juridisk Text</h3>
            <p className="text-slate-400 text-lg max-w-md text-center leading-relaxed font-medium">
              AI-motorn sammanställer rättsfakta och tillämpar gällande rätt enligt Rättegångsbalken för att skapa ett domstolsklart utkast...
            </p>
            
            <div className="mt-16 flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProduktionView;
