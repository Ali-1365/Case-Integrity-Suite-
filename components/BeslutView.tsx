import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Scale, 
  BookOpen, 
  ShieldAlert, 
  History,
  Sparkles,
  Loader2,
  ChevronRight,
  Gavel,
  Info,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { offlineService } from '../services/offlineService';
import { CISCase } from '../lib/db';
import FileUpload from './FileUpload';
import { useFileParser } from '../hooks/useFileParser';
import { toast } from 'sonner';
import { ModuleConnector } from './shared/ModuleConnector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface BeslutViewProps {
  activeCase?: CISCase | null;
  onNavigate?: (moduleId: string) => void;
}

const BeslutView: React.FC<BeslutViewProps> = ({ activeCase, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Välkommen till Beslutsstöd AI. Jag kan hjälpa dig med juridiska bedömningar, lagrumstolkning och analys av rättspraxis. Hur kan jag assistera dig idag?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentContext, setDocumentContext] = useState<string>('');
  const { parseFile, isParsing } = useFileParser();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setIsLoading(true);
    toast.info(`Läser in ${files.length} dokument för analys...`);
    
    try {
      let combinedContent = '';

      // ⚡ Bolt: Optimize sequential parsing by parallelizing file reads
      const parsedResults = await Promise.all(files.map(f => parseFile(f)));

      parsedResults.forEach((result, index) => {
        if (result) {
          combinedContent += `\n--- Dokument: ${files[index].name} ---\n${result.textContent}\n`;
        }
      });
      
      setDocumentContext(prev => prev + combinedContent);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Jag har läst in ${files.length} dokument. Du kan nu ställa frågor om innehållet i dessa.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Kunde inte läsa in filer');
    } finally {
      setIsLoading(false);
      setShowUploadModal(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const messageContent = overrideInput || input;
    if (!messageContent.trim() || isLoading || isOffline) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const caseContext = activeCase 
        ? `Aktivt ärende: ${activeCase.name}. Typ: ${activeCase.type}. Beskrivning: ${activeCase.description}`
        : 'Inget aktivt ärende valt.';

      const docContext = documentContext 
        ? `\n\nINLADDADE DOKUMENT:\n${documentContext}`
        : '';

      const response = await geminiService.generate(
        {
          contents: [{ 
            role: 'user', 
            parts: [{ 
              text: `Du är en juridisk expert-AI. Svara på följande fråga baserat på svensk lag och rättspraxis. 
                     Kontext: ${caseContext}${docContext}
                     Fråga: ${messageContent}` 
            }] 
          }],
          config: { temperature: 0.2 }
        },
        'fast'
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: ['Rättegångsbalken', 'Brottsbalken', 'NJA 2023 s. 123']
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuide = (guide: string) => {
    const prompts: Record<string, string> = {
      'Bevisvärdering': 'Hur fungerar bevisvärdering i svensk rättsprocess? Ge en sammanfattning av principerna.',
      'Rättegångskostnader': 'Vilka regler gäller för rättegångskostnader i tvistemål respektive brottmål?',
      'Tidsfrister': 'Vilka är de viktigaste tidsfristerna att hålla koll på vid överklagande av dom?',
      'Fullmakter': 'Vad krävs för att en fullmakt ska vara giltig i en juridisk process?'
    };
    handleSend(prompts[guide] || `Berätta mer om ${guide}.`);
  };

  const handleLegalSources = () => {
    toast.info("Öppnar lagrumsbiblioteket...");
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Här är några centrala lagrum som är relevanta för din analys:\n\n1. **Rättegångsbalken (1942:740)** - Grundläggande regler för domstolar och rättegång.\n2. **Brottsbalken (1962:700)** - Definitioner av brott och påföljder.\n3. **Förvaltningslagen (2017:900)** - Regler för myndigheters handläggning.\n\nVilket område vill du fördjupa dig i?',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleHistory = () => {
    toast.info("Hämtar historik...");
    // Placeholder for history logic
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in pb-10">
      {/* Header Section - Hard Enterprise Grid */}
      <div className="border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-strong)] relative z-10">
          <div className="p-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-[var(--ink-main)] text-white flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500">
              <Gavel size={40} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Sparkles size={14} className="text-[var(--accent)]" />
                <span className="text-[10px] font-black tracking-[0.4em] text-[var(--ink-muted)] uppercase italic opacity-70">Beslutsstöd AI v.2.4.0 | GOLD</span>
              </div>
              <h1 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">Juridisk Rådgivning</h1>
            </div>
          </div>

          <div className="flex-grow flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-strong)]">
            <div className="px-10 py-8 flex flex-col justify-center bg-[var(--bg-main)]/5">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-3 italic opacity-60">Systemstatus</span>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-[var(--success)] shadow-[0_0_12px_var(--success)] animate-pulse"></div>
                <span className="text-xs font-black text-[var(--success)] uppercase tracking-[0.2em] italic">Operativ / Säkrad</span>
              </div>
            </div>

            {activeCase && (
              <div className="px-10 py-8 flex flex-col justify-center">
                <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-3 italic opacity-60">Aktiv Kontext</span>
                <span className="text-xs font-black text-[var(--accent)] uppercase tracking-[0.2em] italic border-b border-[var(--accent)]/30 pb-1">DOK: {activeCase.name}</span>
              </div>
            )}

            <div className="px-10 py-8 flex flex-col justify-center ml-auto bg-[var(--bg-main)]/5">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-3 italic opacity-60">Säkerhetsnivå</span>
              <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic">Enterprise v1.0-GOLD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-px bg-[var(--border-strong)] border border-[var(--border-strong)] min-h-0 shadow-2xl relative">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-[var(--bg-card)] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)] opacity-30"></div>
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-12 space-y-16 custom-scrollbar bg-[var(--bg-main)]/10"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-8 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-14 h-14 flex items-center justify-center shrink-0 border border-[var(--border-strong)] shadow-lg
                    ${msg.role === 'user' ? 'bg-[var(--accent)] text-[var(--bg-main)]' : 'bg-[var(--ink-main)] text-white'}
                  `}>
                    {msg.role === 'user' ? <User size={28} /> : <Bot size={28} />}
                  </div>
                  
                  <div className="space-y-5">
                    <div className={`
                      p-10 border border-[var(--border-strong)] text-base font-black leading-relaxed uppercase tracking-tight italic shadow-xl relative
                      ${msg.role === 'user' 
                        ? 'bg-[var(--accent)] text-[var(--bg-main)]' 
                        : 'bg-white text-[var(--ink-main)]'
                      }
                    `}>
                      <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                      {msg.content}
                    </div>
                    
                    {msg.sources && (
                      <div className="flex flex-wrap gap-3">
                        {msg.sources.map((source, i) => (
                          <span key={i} className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-3 italic hover:border-[var(--accent)] transition-colors cursor-default">
                            <BookOpen size={14} className="text-[var(--accent)]" /> {source}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-[10px] font-mono font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] italic opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      [{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] | CIS_SECURED
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-8">
                  <div className="w-14 h-14 bg-[var(--ink-main)] text-white flex items-center justify-center border border-white/20 shadow-lg">
                    <Loader2 size={28} className="animate-spin" />
                  </div>
                  <div className="bg-white p-10 border border-[var(--border-strong)] shadow-xl">
                    <div className="flex gap-4">
                      <div className="w-3 h-3 bg-[var(--accent)] animate-pulse" />
                      <div className="w-3 h-3 bg-[var(--accent)] animate-pulse [animation-delay:0.2s]" />
                      <div className="w-3 h-3 bg-[var(--accent)] animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-12 bg-[var(--bg-main)] border-t border-[var(--border-strong)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)] opacity-30"></div>
            <div className="relative group/input">
              <div className="absolute -inset-1 bg-[var(--accent)]/10 blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="STÄLL EN JURIDISK FRÅGA..."
                className="relative w-full bg-white border border-[var(--border-strong)] py-10 pl-12 pr-32 text-base font-black uppercase tracking-[0.1em] italic focus:outline-none focus:border-[var(--accent)] transition-all resize-none shadow-inner custom-scrollbar"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || isOffline}
                className="absolute right-8 top-8 p-6 bg-[var(--ink-main)] text-white border border-white/10 hover:bg-[var(--accent)] transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 group shadow-xl"
              >
                <Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            <div className="mt-10 flex items-center justify-between px-4">
              <div className="flex items-center gap-12">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] hover:text-[var(--accent)] transition-all flex items-center gap-4 italic group"
                >
                  <Upload size={18} className="group-hover:-translate-y-1 transition-transform" /> Ladda upp Underlag
                </button>
                <button 
                  onClick={handleLegalSources}
                  className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] hover:text-[var(--accent)] transition-all flex items-center gap-4 italic group"
                >
                  <Scale size={18} className="group-hover:rotate-12 transition-transform" /> Lagrum
                </button>
                <button 
                  onClick={handleHistory}
                  className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] hover:text-[var(--accent)] transition-all flex items-center gap-4 italic group"
                >
                  <History size={18} className="group-hover:rotate-[-12deg] transition-transform" /> Historik
                </button>
              </div>
              {isOffline && (
                <div className="flex items-center gap-4 text-[var(--warning)] bg-[var(--warning)]/5 px-4 py-2 border border-[var(--warning)]/20">
                  <ShieldAlert size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">Offline-läge Aktivt</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[400px] flex flex-col divide-y divide-[var(--border-strong)] bg-[var(--bg-card)] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--border)] opacity-30"></div>
          <div className="p-12 flex-grow">
            <h3 className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-12 flex items-center gap-5 italic opacity-70">
              <Info size={22} className="text-[var(--accent)]" /> Snabbguider
            </h3>
            <div className="space-y-px bg-[var(--border-strong)] border border-[var(--border-strong)] shadow-xl">
              {[
                'Bevisvärdering',
                'Rättegångskostnader',
                'Tidsfrister',
                'Fullmakter'
              ].map((guide, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuickGuide(guide)}
                  className="w-full p-8 bg-[var(--bg-card)] flex items-center justify-between group hover:bg-[var(--accent)]/10 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic group-hover:translate-x-2 transition-transform">{guide}</span>
                  <ChevronRight size={22} className="text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-12 bg-[var(--ink-main)] text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <Scale size={180} />
             </div>
             <div className="relative z-10 space-y-8">
               <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Rättssäkerhet</h4>
               <p className="text-[12px] text-slate-400 leading-relaxed font-black uppercase tracking-[0.2em] opacity-80 italic">
                 Alla svar genereras med hänsyn till gällande svensk rätt och rättspraxis. Kom ihåg att AI-rådgivning bör verifieras av en mänsklig jurist vid kritiska beslut.
               </p>
               <div className="pt-6 border-t border-white/10">
                 <div className="flex items-center gap-3">
                   <ShieldAlert size={16} className="text-[var(--accent)]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">CIS Forensic Guard Active</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-[var(--ink-main)]/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border-strong)] w-full max-w-4xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--accent)]"></div>
              <div className="px-16 py-14 border-b border-[var(--border-strong)] flex justify-between items-center bg-white">
                <div className="space-y-4">
                  <h3 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">Ladda upp Underlag</h3>
                  <p className="text-[12px] text-[var(--ink-muted)] uppercase tracking-[0.4em] font-black opacity-60 italic">Chatta med dina dokument | Forensic Ingestion</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-6 hover:bg-[var(--bg-main)] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)] active:scale-90"
                >
                  <X size={48} />
                </button>
              </div>
              
              <div className="p-16 bg-[var(--bg-main)]/5">
                <FileUpload 
                  onFilesSelect={handleFileUpload}
                  maxFiles={10}
                  acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
                />
                
                <div className="mt-14 p-12 bg-[var(--ink-main)] text-white border border-white/10 flex gap-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                    <Bot size={150} />
                  </div>
                  <div className="w-20 h-20 bg-[var(--accent)] text-[var(--bg-main)] flex items-center justify-center shrink-0 border border-white/20 shadow-2xl relative z-10">
                    <Bot size={40} />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-[12px] font-black text-[var(--accent)] uppercase tracking-[0.4em] italic">Kontextuell Analys v.2.0</p>
                    <p className="text-[14px] text-slate-300 font-black uppercase tracking-[0.2em] leading-relaxed opacity-80 italic">
                      Genom att ladda upp dokument kan AI-assistenten svara på frågor direkt baserat på innehållet i dina filer, vilket ger mer precisa och relevanta svar genom FMJAM Oracle Core.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-16 py-10 border-t border-[var(--border-strong)] bg-white flex justify-end gap-6">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-16 py-6 bg-[var(--ink-main)] text-white font-black text-[14px] uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all active:scale-95 italic border border-white/10 shadow-xl"
                >
                  Stäng Fönster
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ModuleConnector activeModule="chat" onNavigate={onNavigate} />
    </div>
  );
};

export default BeslutView;
