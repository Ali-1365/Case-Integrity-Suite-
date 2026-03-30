import React, { useState, useEffect } from 'react';
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from '../lib/cis.types';
import { opinionTemplateRegistry } from '../data/opinionTemplates';
import { 
  Zap, 
  Brain, 
  FileText, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  X, 
  ChevronDown,
  Info,
  CheckCircle2,
  FileSearch,
  Download
} from 'lucide-react';
import { OpinionEngine } from '../lib/opinionEngine';
import { GeminiLlmClient } from '../services/geminiService';
import { db } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleConnector } from './shared/ModuleConnector';

interface OpinionGeneratorProps {
  analysis: AnalysisResult;
  onComplete?: () => void;
  onNavigate?: (moduleId: string) => void;
}

type Mode = 'fast' | 'think';

const OpinionGenerator: React.FC<OpinionGeneratorProps> = ({ analysis, onComplete, onNavigate }) => {
  const [mode, setMode] = useState<Mode>('think');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('FMJAM_REPORT_V1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [opinionResult, setOpinionResult] = useState<OpinionResult | null>(null);
  
  const [config, setConfig] = useState<OpinionConfig>({
    templateId: opinionTemplateRegistry[0].id,
    style: 'formell',
    includeSections: opinionTemplateRegistry[0].sections,
    maxLength: 800,
    customFormatting: '',
  });

  useEffect(() => {
    const selectedTemplate = opinionTemplateRegistry.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
        setConfig(prev => ({
            ...prev,
            templateId: selectedTemplate.id,
            includeSections: selectedTemplate.sections
        }));
    }
  }, [selectedTemplateId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const engine = new OpinionEngine(new GeminiLlmClient(), mode);
      const result = await engine.generateOpinion(analysis, config);
      setOpinionResult(result);
      
      if (analysis.documents && analysis.documents[0]) {
        await db.saveOpinion(analysis.documents[0].id, result);
      }
    } catch (error) {
      console.error("Opinion generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = opinionTemplateRegistry.find(t => t.id === selectedTemplateId);
  
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        if (line.startsWith('---')) {
            return <hr key={`hr-${index}`} className="border-[var(--border-strong)] my-10 opacity-30" />;
        }
        if (line.includes('**INTEGRITETSKEDJA (SHA-256):**')) {
            return (
                <div key={`integrity-${index}`} className="bg-[var(--success)]/5 border border-[var(--success)]/20 p-8 mb-10 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--success)]"></div>
                    <ShieldCheck className="w-10 h-10 text-[var(--success)] opacity-40 group-hover:opacity-100 transition-opacity" />
                    <div>
                        <p className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.3em] italic">Integritetsverifierad</p>
                        <p className="text-[10px] font-mono text-[var(--ink-muted)] break-all mt-1 opacity-60">{line.split(': ')[1]}</p>
                    </div>
                </div>
            );
        }
        if (line.startsWith('### ')) {
          return <h3 key={`h3-${index}`} className="text-2xl font-black text-[var(--ink-main)] mt-12 mb-6 tracking-tighter uppercase italic leading-none">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={`h2-${index}`} className="text-3xl font-black text-[var(--ink-main)] mt-16 mb-8 border-b border-[var(--border-strong)] pb-4 tracking-tighter uppercase italic leading-none">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('- ')) {
            return <li key={`li-${index}`} className="ml-10 list-disc text-[var(--ink-main)] text-base font-black uppercase tracking-tight mb-3 italic opacity-80">{line.replace('- ', '')}</li>
        }
        return <p key={`p-${index}`} className="mb-8 text-[var(--ink-main)] text-base leading-relaxed font-black uppercase tracking-tight italic opacity-70">{line}</p>;
      })
      .reduce((acc: React.ReactElement[], el) => {
        if (el.type === 'li' && acc.length > 0 && acc[acc.length-1].type === 'ul') {
            const lastUl = acc[acc.length-1];
            const children = React.Children.toArray((lastUl.props as any).children);
            const newUl = React.cloneElement(lastUl, {}, [...children, el]);
            acc[acc.length-1] = newUl;
            return acc;
        } else if (el.type === 'li') {
            return [...acc, <ul key={`ul-${el.key}`} className="mb-8 space-y-3">{el}</ul>];
        }
        return [...acc, el];
      }, [] as React.ReactElement[]);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 max-w-6xl mx-auto pb-20">
      <header className="py-12 px-12 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <FileSearch size={250} className="text-[var(--accent)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-inner">
                <Sparkles size={24} />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] text-[var(--ink-muted)] uppercase italic opacity-70">AI-Expert v6.0 | Deterministisk Produktion</span>
            </div>
            <h1 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">
              Generera Juridiskt Yttrande
            </h1>
            <p className="text-xs font-black text-[var(--ink-muted)] max-w-2xl leading-relaxed uppercase tracking-tight italic opacity-60">
              Skapa domstolsklara yttranden med 8-stegs bevisvärdering, SHA-256 integritetssäkring och deterministisk lagrumstolkning genom CIS Intelligence Core.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)]"></div>
            
            <div className="space-y-6">
                <label htmlFor="template-select" className="flex items-center gap-3 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic opacity-70">
                    <FileText size={16} className="text-[var(--accent)]" /> Mall för yttrande
                </label>
                <div className="relative">
                  <select 
                      id="template-select"
                      className="block w-full bg-[var(--bg-main)] border border-[var(--border-strong)] py-5 px-6 text-[var(--ink-main)] focus:outline-none focus:border-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] transition-all appearance-none italic"
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      disabled={isGenerating}
                  >
                      {opinionTemplateRegistry.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none opacity-50" size={18} />
                </div>
                {selectedTemplate && (
                  <div className="flex gap-4 p-6 bg-[var(--bg-main)] border border-[var(--border)] shadow-inner">
                    <Info size={18} className="text-[var(--accent)] shrink-0 opacity-50" />
                    <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-tight italic leading-relaxed opacity-70">{selectedTemplate.description}</p>
                  </div>
                )}
            </div>

            <div className="space-y-6">
                <p className="block text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic opacity-70">AI-Modell & Processläge</p>
                <div className="space-y-4">
                    <ModeButton 
                      title="Snabb" 
                      description="Gemini Flash för omedelbara utkast." 
                      icon={<Zap />} 
                      isActive={mode === 'fast'}
                      onClick={() => setMode('fast')}
                      disabled={isGenerating}
                    />
                    <ModeButton 
                      title="Djupanalys" 
                      description="Gemini Pro med thinking mode." 
                      icon={<Brain />}
                      isActive={mode === 'think'}
                      onClick={() => setMode('think')}
                      disabled={isGenerating}
                    />
                </div>
            </div>
            
            <div className="space-y-6">
              <label htmlFor="custom-formatting" className="block text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic opacity-70">
                  Särskilda Instruktioner
              </label>
              <textarea
                  id="custom-formatting"
                  rows={4}
                  className="block w-full bg-[var(--bg-main)] border border-[var(--border-strong)] py-6 px-6 text-[var(--ink-main)] focus:outline-none focus:border-[var(--accent)] text-xs font-black uppercase tracking-tight italic transition-all resize-none shadow-inner"
                  placeholder="T.ex. 'Använd punktlistor', 'fetmarkera lagrum'..."
                  value={config.customFormatting}
                  onChange={(e) => setConfig(prev => ({...prev, customFormatting: e.target.value}))}
                  disabled={isGenerating}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-6 px-8 font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-4 relative z-10 active:scale-95 italic border ${
                isGenerating 
                  ? 'bg-[var(--bg-main)] text-[var(--ink-muted)] cursor-not-allowed border-[var(--border)]' 
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] border-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
              }`}
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              <span>{isGenerating ? 'Genererar...' : 'Generera Yttrande'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {opinionResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col h-full min-h-[700px] group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]"></div>
                <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)]/50 relative z-10">
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-[var(--accent)]" />
                    <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Genererat Dokument | SHA-256 LÅST</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
                      <CheckCircle2 size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest italic">Verifierad</span>
                    </div>
                  </div>
                </div>
                <div className="p-16 bg-[var(--bg-main)]/10 flex-grow overflow-y-auto custom-scrollbar relative z-10">
                   <div className="prose prose-invert max-w-none prose-headings:text-[var(--ink-main)] prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-[var(--ink-muted)] prose-p:font-black prose-p:uppercase prose-p:tracking-tight prose-p:opacity-80 prose-strong:text-[var(--accent)] prose-strong:font-black prose-strong:italic">
                    {renderMarkdown(opinionResult.content)}
                   </div>
                </div>
                <div className="p-10 border-t border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-end gap-6 relative z-10">
                  <button className="px-10 py-5 bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--ink-main)] font-black text-[10px] uppercase tracking-[0.3em] hover:border-[var(--accent)] transition-all flex items-center gap-4 active:scale-95 italic">
                    <Download size={20} /> Ladda ner
                  </button>
                  <button 
                    onClick={onComplete}
                    className="px-10 py-5 bg-[var(--ink-main)] text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all active:scale-95 italic border border-white/10"
                  >
                    Stäng
                  </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
                  <FileText className="w-[30rem] h-[30rem] text-[var(--accent)]" />
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[700px] border border-[var(--border-strong)] flex flex-col items-center justify-center text-center p-20 space-y-10 bg-[var(--bg-card)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)] opacity-30"></div>
                <div className="w-32 h-32 bg-[var(--bg-main)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--ink-muted)] shadow-inner group-hover:scale-110 transition-transform duration-1000">
                  <FileText className="w-16 h-16 opacity-20" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic opacity-20 group-hover:opacity-40 transition-opacity">Inget yttrande genererat</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed italic opacity-30 group-hover:opacity-50 transition-opacity">
                    Konfigurera inställningarna till vänster och klicka på "Generera Yttrande" för att starta den deterministiska processen.
                  </p>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-[0.01] pointer-events-none">
                  <FileText className="w-[40rem] h-[40rem] text-[var(--accent)]" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ModuleConnector activeModule="opinion" onNavigate={onNavigate} />
    </div>
  );
};

interface ModeButtonProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
}

const ModeButton: React.FC<ModeButtonProps> = ({ title, description, icon, isActive, onClick, disabled }) => {
    return (
        <button 
          onClick={onClick}
          disabled={disabled}
          className={`w-full p-8 border transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-6 relative overflow-hidden group/btn ${
            isActive 
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
              : 'border-[var(--border-strong)] bg-[var(--bg-main)]/50 hover:border-[var(--accent)]/50'
          }`}
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <div className={`w-14 h-14 border flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[var(--accent)] text-[var(--bg-main)] border-[var(--accent)] shadow-lg' : 'bg-[var(--bg-card)] text-[var(--ink-muted)] border-[var(--border-strong)] group-hover/btn:border-[var(--accent)]/30'}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
            </div>
            <div>
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] italic ${isActive ? 'text-[var(--ink-main)]' : 'text-[var(--ink-muted)]'}`}>{title}</h4>
                <p className={`text-[9px] font-black uppercase tracking-tight leading-tight mt-2 italic opacity-60 ${isActive ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-muted)]'}`}>{description}</p>
            </div>
        </button>
    )
}


export default OpinionGenerator;
