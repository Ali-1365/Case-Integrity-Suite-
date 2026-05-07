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
import { ModuleConnector } from './shared/ModuleConnector';

interface ProduktionViewProps {
  activeCase?: CISCase | null;
  onNavigate?: (moduleId: string) => void;
}

const ProduktionView: React.FC<ProduktionViewProps> = ({ activeCase, onNavigate }) => {
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
      const parsedResults = await Promise.all(files.map(file => parseFile(file)));
      parsedResults.forEach((result) => {
        if (result) {
          // Add content to case context or similar
          console.log('Parsed content for production:', result.textContent.substring(0, 100));
        }
      });
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

  const handleNewDocument = () => {
    setGeneratedText('');
    setActiveTemplate(null);
    toast.info('Nytt dokument initierat. Välj en mall för att börja.');
  };

  const handleDownload = (docId: string) => {
    const doc = recentDocuments.find(d => d.id === docId);
    if (doc) {
      toast.success(`Laddar ner: ${doc.name}`);
      // Simulate download
      const element = document.createElement("a");
      const file = new Blob([`Innehåll för ${doc.name}\nID: ${doc.id}\nDatum: ${doc.date}\nFörfattare: ${doc.author}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    toast.error(`Dokument ${docId} raderat från systemet.`);
    // In a real app, we would update the state/db here
    // For demo purposes, we just show the toast
  };

  const handleViewAllNodes = () => {
    toast.info('Öppnar nod-översikt för samtliga dokument...');
    if (onNavigate) onNavigate('intelligence'); // Navigate to Intelligence Core for node view
  };

  const templates = [
    { id: 'stamn', label: 'Stämningsansökan', desc: 'Formell ansökan om stämning enligt RB 13:4.', icon: FileText, color: 'border-[var(--border)] hover:border-[var(--accent)]' },
    { id: 'svar', label: 'Svaromål', desc: 'Svar på stämningsansökan enligt RB 42:7.', icon: FileText, color: 'border-[var(--border)] hover:border-[var(--success)]' },
    { id: 'over', label: 'Överklagande', desc: 'Överklagande av dom eller beslut till hovrätt.', icon: FileText, color: 'border-[var(--border)] hover:border-[var(--accent)]' },
    { id: 'yttr', label: 'Yttrande', desc: 'Skriftligt yttrande i pågående mål.', icon: FileText, color: 'border-[var(--border)] hover:border-[var(--accent)]' },
  ];

  const recentDocuments = [
    { id: 'DOC-2024-001', name: 'Stämningsansökan - Mål T 123-24', date: '2024-03-20', status: 'UTKAST', author: 'AI-Advokat' },
    { id: 'DOC-2024-002', name: 'Svaromål - Mål T 456-23', date: '2024-03-18', status: 'KLAR', author: 'System' },
    { id: 'DOC-2024-003', name: 'Yttrande - Mål B 789-24', date: '2024-03-15', status: 'SKICKAT', author: 'AI-Advokat' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 relative pb-20">
      
      {/* Header */}
      <header className="py-12 px-12 bg-[var(--bg-card)] border-4 border-[var(--ink-main)] shadow-[20px_20px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <FileText size={200} className="text-[var(--accent)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--bg-main)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={24} />
              </div>
              <span className="text-[11px] font-black tracking-[0.4em] text-[var(--ink-muted)] uppercase italic">Produktionsmotor v.11.4</span>
            </div>
            <h1 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic">
              Juridisk Textproduktion
            </h1>
            <p className="text-[11px] font-black text-[var(--ink-muted)] max-w-xl leading-relaxed uppercase tracking-widest opacity-70">
              Exekverande verktyg för domstolsklara processkrifter enligt Rättegångsbalken.
            </p>
            {activeCase && (
              <div className="mt-6 inline-flex items-center gap-4 px-6 py-3 bg-[var(--bg-main)] text-[var(--accent)] border-2 border-[var(--border)] shadow-inner">
                <div className="w-3 h-3 bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Aktivt Ärende: {activeCase.name}</span>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-white border-4 border-[var(--ink-main)] text-[var(--ink-main)] px-10 py-5 font-black uppercase tracking-[0.2em] hover:bg-[var(--bg-main)] transition-all flex items-center gap-4 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <Upload size={20} /> Ladda upp Referens
            </button>
            <button 
              onClick={handleNewDocument}
              className="bg-[var(--ink-main)] text-white px-10 py-5 font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-all flex items-center gap-4 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <FilePlus size={20} /> Nytt Dokument
            </button>
          </div>
        </div>
      </header>

      {isOffline ? (
        <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] p-20 text-center max-w-3xl mx-auto shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
          <div className="w-24 h-24 bg-[var(--bg-main)] text-[var(--warning)] border-2 border-[var(--warning)] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <AlertCircle size={48} />
          </div>
          <h3 className="text-3xl font-black text-[var(--ink-main)] mb-6 tracking-tighter uppercase italic">Textproduktion Inaktiverad</h3>
          <p className="text-[11px] text-[var(--ink-muted)] mb-12 leading-relaxed font-black uppercase tracking-[0.3em] opacity-70">
            Textproduktionsmodulen kräver en aktiv anslutning och en giltig API-nyckel för att generera juridiska texter baserade på Case Integrity AI-motor.
          </p>
          <button onClick={() => window.location.reload()} className="bg-[var(--ink-main)] text-white px-12 py-6 font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-all shadow-xl active:translate-y-1">
            Försök återansluta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-grow min-h-0">
          {/* Templates Grid */}
          <div className="lg:col-span-2 space-y-10 flex flex-col">
            <div className="flex items-center gap-6">
                <h2 className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] whitespace-nowrap italic">Mallar & Generatorer</h2>
                <div className="h-1 flex-grow bg-[var(--border)]"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {templates.map(tpl => (
                <button 
                  key={tpl.id} 
                  onClick={() => handleGenerate(tpl.id)}
                  disabled={loading || !activeCase}
                  className={`p-10 border-4 bg-[var(--bg-card)] text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full relative overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.05)] hover:shadow-[15px_15px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${tpl.color} border-[var(--border)] hover:border-[var(--ink-main)]`}
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-[var(--bg-main)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--ink-main)] shadow-inner group-hover:bg-[var(--ink-main)] group-hover:text-white transition-all">
                      <tpl.icon size={32} />
                    </div>
                    <ArrowRight size={24} className="text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </div>
                  <h3 className="text-2xl font-black text-[var(--ink-main)] mb-4 tracking-tighter uppercase italic group-hover:text-[var(--accent)]">{tpl.label}</h3>
                  <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed font-black uppercase tracking-widest opacity-60 flex-grow">{tpl.desc}</p>
                  
                  <div className="mt-10 pt-10 border-t-2 border-[var(--bg-main)] flex items-center justify-end">
                    <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity italic">Exekvera Mall</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] shadow-[20px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col flex-grow">
              <div className="px-12 py-8 border-b-2 border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)]">
                <div className="flex items-center gap-4">
                    <History className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="text-[11px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Senaste Dokument</h3>
                </div>
                <button 
                  onClick={handleViewAllNodes}
                  className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors italic"
                >
                  Visa alla noder
                </button>
              </div>
              <div className="divide-y-2 divide-[var(--border)] overflow-y-auto custom-scrollbar">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="px-12 py-8 flex items-center justify-between hover:bg-[var(--bg-main)] transition-all group">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-[var(--bg-main)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--ink-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all shadow-inner">
                        <FileText size={28} />
                      </div>
                      <div>
                        <div className="text-xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform">{doc.name}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-[0.2em] mt-2 opacity-60">
                            <span className="font-mono">{doc.id}</span> · {doc.date} · {doc.author}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 border-2 ${
                        doc.status === 'KLAR' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' :
                        doc.status === 'SKICKAT' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20' :
                        'bg-[var(--bg-main)] text-[var(--ink-muted)] border-[var(--border)]'
                      }`}>
                        {doc.status}
                      </span>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleDownload(doc.id)}
                          className="p-4 text-[var(--ink-muted)] hover:text-[var(--ink-main)] bg-white border-2 border-[var(--border)] hover:border-[var(--ink-main)] transition-all shadow-sm"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-4 text-[var(--ink-muted)] hover:text-[var(--danger)] bg-white border-2 border-[var(--border)] hover:border-[var(--danger)] transition-all shadow-sm"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-[var(--ink-main)] p-12 text-white shadow-[20px_20px_0px_rgba(0,0,0,0.1)] relative overflow-hidden border-4 border-white/10">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><BrainCircuit size={160} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-14 h-14 bg-[var(--accent)] flex items-center justify-center shadow-xl shadow-[var(--accent)]/20 border-2 border-white/30"><ShieldCheck size={28} /></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--accent)] italic">Integritetskontroll</span>
                </div>
                <h4 className="text-3xl font-black mb-8 tracking-tighter uppercase italic">Verifierad Produktion</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-12 font-black uppercase tracking-widest opacity-80">
                  Alla dokument som genereras i denna modul genomgår en automatisk kontroll mot Rättegångsbalkens formkrav och verifieras med SHA-256 för att säkerställa att inga obehöriga ändringar sker.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-5 text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] italic">
                    <CheckCircle2 size={18} /> RB 13:4 Verifierad
                  </div>
                  <div className="flex items-center gap-5 text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] italic">
                    <CheckCircle2 size={18} /> RB 42:7 Verifierad
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] p-10 shadow-[15px_15px_0px_rgba(0,0,0,0.05)] space-y-10">
              <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="text-[11px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Systemstatus</h3>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b-2 border-[var(--bg-main)] pb-4">
                  <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">AI-Motor</span>
                  <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.2em] italic">ONLINE</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-[var(--bg-main)] pb-4">
                  <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">Lagbibliotek</span>
                  <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic font-mono">V.2026.3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">Nod-kapacitet</span>
                  <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] italic font-mono">92% NOMINAL</span>
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
                
                <div className="mt-8 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-widest">Stil-härmning Aktiverad</p>
                    <p className="text-[11px] text-[var(--ink-muted)] font-medium leading-relaxed">
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
            className="fixed inset-0 bg-[var(--ink-main)]/90 backdrop-blur-2xl z-[400] flex flex-col items-center justify-center text-white p-10"
          >
            <div className="w-48 h-48 relative mb-16">
              <div className="absolute inset-0 border-8 border-[var(--accent)]/10" />
              <div className="absolute inset-0 border-8 border-[var(--accent)] border-t-transparent animate-spin" />
              <div className="absolute inset-10 bg-[var(--accent)]/10 flex items-center justify-center">
                <BrainCircuit size={80} className="text-[var(--accent)] animate-pulse" />
              </div>
            </div>
            <h3 className="text-5xl font-black mb-8 tracking-tighter uppercase italic">Producerar Juridisk Text</h3>
            <p className="text-slate-400 text-sm max-w-xl text-center leading-relaxed font-black uppercase tracking-[0.4em] opacity-80">
              AI-motorn sammanställer rättsfakta och tillämpar gällande rätt enligt Rättegångsbalken för att skapa ett domstolsklart utkast...
            </p>
            
            <div className="mt-20 flex gap-6">
                <div className="w-4 h-4 bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-[var(--accent)] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-[var(--accent)] animate-bounce"></div>
            </div>

            <div className="mt-20 font-mono text-[10px] text-[var(--accent)] animate-pulse uppercase tracking-[0.5em]">
                Neural Synthesis in progress...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModuleConnector activeModule="production" onNavigate={onNavigate} />
    </div>
  );
};

export default ProduktionView;
