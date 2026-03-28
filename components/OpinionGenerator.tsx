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

interface OpinionGeneratorProps {
  analysis: AnalysisResult;
  onComplete?: () => void;
}

type Mode = 'fast' | 'think';

const OpinionGenerator: React.FC<OpinionGeneratorProps> = ({ analysis, onComplete }) => {
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
            return <hr key={`hr-${index}`} className="border-[var(--border)] my-8" />;
        }
        if (line.includes('**INTEGRITETSKEDJA (SHA-256):**')) {
            return (
                <div key={`integrity-${index}`} className="bg-emerald-50 border border-emerald-100 p-6 rounded-[1.5rem] mb-8 flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Integritetsverifierad</p>
                        <p className="text-xs font-mono text-slate-500 break-all">{line.split(': ')[1]}</p>
                    </div>
                </div>
            );
        }
        if (line.startsWith('### ')) {
          return <h3 key={`h3-${index}`} className="text-xl font-black text-[var(--ink-main)] mt-10 mb-4 tracking-tight">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={`h2-${index}`} className="text-2xl font-black text-[var(--ink-main)] mt-12 mb-6 border-b border-[var(--border)] pb-2 tracking-tight">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('- ')) {
            return <li key={`li-${index}`} className="ml-8 list-disc text-[var(--ink-main)] text-base font-medium mb-2">{line.replace('- ', '')}</li>
        }
        return <p key={`p-${index}`} className="mb-6 text-[var(--ink-main)] text-base leading-relaxed font-medium">{line}</p>;
      })
      .reduce((acc: React.ReactElement[], el) => {
        if (el.type === 'li' && acc.length > 0 && acc[acc.length-1].type === 'ul') {
            const lastUl = acc[acc.length-1];
            const children = React.Children.toArray((lastUl.props as any).children);
            const newUl = React.cloneElement(lastUl, {}, [...children, el]);
            acc[acc.length-1] = newUl;
            return acc;
        } else if (el.type === 'li') {
            return [...acc, <ul key={`ul-${el.key}`} className="mb-6 space-y-2">{el}</ul>];
        }
        return [...acc, el];
      }, [] as React.ReactElement[]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-12">
      <header className="py-10 px-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <FileSearch size={200} className="text-[var(--accent)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--ink-muted)] uppercase">AI-Expert v6.0</span>
            </div>
            <h1 className="text-4xl font-black text-[var(--ink-main)] tracking-tight">
              Generera Juridiskt Yttrande
            </h1>
            <p className="text-sm font-medium text-[var(--ink-muted)] max-w-xl leading-relaxed">
              Skapa domstolsklara yttranden med 8-stegs bevisvärdering och SHA-256 integritetssäkring.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="space-y-4">
                <label htmlFor="template-select" className="flex items-center gap-2 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">
                    <FileText size={14} className="text-[var(--accent)]" /> Mall för yttrande
                </label>
                <div className="relative">
                  <select 
                      id="template-select"
                      className="block w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-[var(--ink-main)] focus:outline-none focus:border-[var(--accent)] text-xs font-black uppercase tracking-widest transition-all appearance-none"
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      disabled={isGenerating}
                  >
                      {opinionTemplateRegistry.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none" size={16} />
                </div>
                {selectedTemplate && (
                  <div className="flex gap-3 p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                    <Info size={16} className="text-[var(--accent)] shrink-0" />
                    <p className="text-[10px] text-[var(--ink-muted)] font-bold leading-relaxed">{selectedTemplate.description}</p>
                  </div>
                )}
            </div>

            <div className="space-y-4">
                <p className="block text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">AI-Modell</p>
                <div className="space-y-3">
                    <ModeButton 
                      title="Snabb" 
                      description="Gemini Flash för snabba svar." 
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
            
            <div className="space-y-4">
              <label htmlFor="custom-formatting" className="block text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">
                  Instruktioner (valfritt)
              </label>
              <textarea
                  id="custom-formatting"
                  rows={4}
                  className="block w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-[var(--ink-main)] focus:outline-none focus:border-[var(--accent)] text-sm font-medium transition-all resize-none shadow-inner"
                  placeholder="T.ex. 'Använd punktlistor', 'fetmarkera lagrum'..."
                  value={config.customFormatting}
                  onChange={(e) => setConfig(prev => ({...prev, customFormatting: e.target.value}))}
                  disabled={isGenerating}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-[var(--ink-main)] hover:bg-[var(--accent)] disabled:bg-[var(--bg-main)] disabled:text-[var(--ink-muted)] text-white font-black py-5 px-6 rounded-[1.5rem] transition-all duration-300 flex items-center justify-center text-xs uppercase tracking-widest shadow-xl shadow-[var(--ink-main)]/10 active:scale-95"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <Sparkles className="h-5 w-5 mr-3" />}
              {isGenerating ? 'Genererar...' : 'Generera Yttrande'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {opinionResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-sm overflow-hidden"
              >
                <div className="px-10 py-6 border-b border-[var(--bg-main)] flex justify-between items-center bg-[var(--bg-main)]/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[var(--ink-muted)]" />
                    <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.2em]">Genererat Dokument</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                      <CheckCircle2 size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verifierad</span>
                    </div>
                  </div>
                </div>
                <div className="p-12 bg-white min-h-[500px]">
                   <div className="font-serif text-[var(--ink-main)] leading-relaxed">
                    {renderMarkdown(opinionResult.content)}
                   </div>
                </div>
                <div className="p-10 border-t border-[var(--border)] bg-[var(--bg-main)]/30 flex justify-end gap-4">
                  <button className="px-8 py-4 bg-white border border-[var(--border)] text-[var(--ink-main)] rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all flex items-center gap-3 active:scale-95">
                    <Download size={18} /> Ladda ner
                  </button>
                  <button 
                    onClick={onComplete}
                    className="px-8 py-4 bg-[var(--ink-main)] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all active:scale-95"
                  >
                    Stäng
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] border-4 border-dashed border-[var(--border)] rounded-[3rem] flex flex-col items-center justify-center text-center p-16 space-y-6 bg-[var(--bg-card)]/50">
                <div className="w-24 h-24 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center text-[var(--ink-muted)] shadow-inner">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[var(--ink-main)] tracking-tight uppercase">Inget yttrande genererat</h3>
                  <p className="text-sm text-[var(--ink-muted)] font-medium max-w-xs mx-auto leading-relaxed">
                    Konfigurera inställningarna till vänster och klicka på "Generera Yttrande" för att starta processen.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
          className={`w-full p-6 border rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-5 ${
            isActive 
              ? 'border-[var(--ink-main)] bg-[var(--ink-main)] text-white shadow-xl shadow-[var(--ink-main)]/10' 
              : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--ink-muted)] hover:border-[var(--accent)]/50'
          }`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-white text-[var(--ink-muted)] border border-[var(--border)]'}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
            </div>
            <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-[var(--ink-main)]'}`}>{title}</h4>
                <p className={`text-[10px] font-medium leading-tight mt-1 ${isActive ? 'text-slate-400' : 'text-[var(--ink-muted)]'}`}>{description}</p>
            </div>
        </button>
    )
}

export default OpinionGenerator;
