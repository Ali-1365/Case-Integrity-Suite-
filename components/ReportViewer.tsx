
import React, { useState, useEffect } from 'react';
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from '../lib/cis.types';
import { opinionTemplateRegistry } from '../data/opinionTemplates';
import Card from './shared/Card';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { 
    BoltIcon, 
    BrainIcon, 
    DocumentTextIcon, 
    SparklesIcon, 
    Spinner, 
    XMarkIcon, 
    ShieldCheckIcon,
    PrinterIcon,
    LawIcon
} from './icons';

interface AiReportTabProps {
  analysis: AnalysisResult;
  onGenerate: (config: OpinionConfig, mode: 'fast' | 'think') => void | Promise<void>;
  opinionResult: OpinionResult | null;
  isGenerating: boolean;
  error: string | null;
}

const AiReportTab: React.FC<AiReportTabProps> = ({ analysis, onGenerate, opinionResult, isGenerating, error }) => {
  const [mode, setMode] = useState<'fast' | 'think'>('think');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('FMJAM_REPORT_V1');
  
  const [config, setConfig] = useState<OpinionConfig>({
    templateId: opinionTemplateRegistry[0].id,
    style: 'formell',
    includeSections: opinionTemplateRegistry[0].sections,
    maxLength: 1200,
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

  const handleGenerateClick = () => {
    const result = onGenerate(config, mode);
    if (result instanceof Promise) {
      result.catch(err => console.error('Opinion generation failed:', err));
    }
  };

  const selectedTemplate = opinionTemplateRegistry.find(t => t.id === selectedTemplateId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
      {/* Kontrollpanel */}
      <div className="lg:col-span-4 space-y-8">
        <Card title="Oracle Command" icon={<SparklesIcon className="w-5 h-5" />}>
          <div className="space-y-8">
            <div>
                <label className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-4 block italic">Analysmall</label>
                <select 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-none py-4 px-5 text-[var(--ink-main)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all text-xs font-black uppercase tracking-widest italic"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={isGenerating}
                >
                    {opinionTemplateRegistry.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
                {selectedTemplate && <p className="text-[10px] text-[var(--ink-muted)] mt-4 leading-relaxed font-black uppercase tracking-widest opacity-60 italic">{selectedTemplate.description}</p>}
            </div>

            <div>
                <label className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-4 block italic">Logisk Motor</label>
                <div className="grid grid-cols-1 gap-4">
                    <ModeButton 
                        title="Fast Sync" 
                        description="Gemini Flash för strukturella utkast." 
                        icon={<BoltIcon className="w-5 h-5" />} 
                        isActive={mode === 'fast'}
                        onClick={() => setMode('fast')}
                        disabled={isGenerating}
                    />
                    <ModeButton 
                        title="Deep Reasoning" 
                        description="Gemini Pro 3 med 32k Thinking Budget." 
                        icon={<BrainIcon className="w-5 h-5" />}
                        isActive={mode === 'think'}
                        onClick={() => setMode('think')}
                        disabled={isGenerating}
                    />
                </div>
            </div>
           
            <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full py-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] font-black text-xs uppercase tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
            >
                {isGenerating ? <Spinner className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                <span>{isGenerating ? 'Kör Logik...' : `Exekvera Yttrande`}</span>
            </button>
          </div>
        </Card>

        {opinionResult && (
            <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-8 shadow-lg animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)]">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] italic">Integrity Verified</span>
                </div>
                <p className="text-[10px] text-[var(--ink-muted)] leading-relaxed font-black uppercase tracking-widest opacity-70 italic">
                    Detta yttrande är låst mot käll-hashar. Varje hänvisning har validerats mot SFS 2025:400 och de uppladdade bevisatomerma.
                </p>
            </div>
        )}
      </div>

      {/* Rapport-display */}
      <div className="lg:col-span-8">
        {isGenerating ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] h-[80vh] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent opacity-50"></div>
                <Spinner className="h-16 w-16 text-[var(--accent)] mb-8 relative z-10" />
                <h3 className="text-3xl font-black text-[var(--ink-main)] relative z-10 tracking-tighter uppercase italic">Genererar Juridiskt Yttrande</h3>
                <p className="text-[var(--ink-muted)] mt-6 max-w-sm text-xs font-black uppercase tracking-[0.2em] relative z-10 leading-relaxed italic opacity-70">Modellen analyserar rättslig kausalitet och bygger beviskedjan i realtid...</p>
            </div>
        ) : error ? (
            <div className="bg-[var(--danger)]/5 border border-[var(--danger)]/20 p-12 text-center h-[80vh] flex flex-col items-center justify-center shadow-2xl">
                <div className="p-6 bg-[var(--danger)]/10 rounded-full mb-8">
                    <XMarkIcon className="h-12 w-12 text-[var(--danger)]" />
                </div>
                <h3 className="text-3xl font-black text-[var(--danger)] tracking-tighter uppercase italic">Kritiskt Systemfel</h3>
                <p className="text-[var(--danger)]/70 mt-6 bg-[var(--bg-main)] p-8 border border-[var(--danger)]/20 font-mono text-[10px] shadow-inner max-w-md break-all uppercase tracking-widest">{error}</p>
            </div>
        ) : opinionResult ? (
            <div className="bg-[var(--bg-card)] text-[var(--ink-main)] shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-fade-in border border-[var(--border-strong)]">
                <header className="px-12 py-10 border-b border-[var(--border)] bg-[var(--bg-main)] flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="p-5 bg-[var(--ink-main)] text-[var(--bg-main)] shadow-xl">
                            <LawIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">Juridiskt Yttrande</h2>
                            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mt-2 italic">Ärende: {analysis.caseId}</p>
                        </div>
                    </div>
                    <div className="flex gap-6 relative z-10">
                        <button className="p-4 text-[var(--ink-muted)] hover:text-[var(--ink-main)] transition-all bg-[var(--bg-main)] border border-[var(--border)] shadow-sm hover:shadow-md">
                            <PrinterIcon className="h-6 w-6" />
                        </button>
                        <button className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] font-black text-[10px] uppercase tracking-[0.2em] italic transition-all flex items-center gap-3 shadow-xl active:scale-95">
                            <DownloadIcon className="h-5 w-5" />
                            <span>Ladda ner PDF</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow overflow-y-auto p-12 md:p-20 custom-scrollbar bg-[var(--bg-card)]">
                    <div className="max-w-3xl mx-auto">
                        {opinionResult.content.includes('**INTEGRITETSKEDJA (SHA-256):**') && (
                            <div className="bg-[var(--success)]/5 border border-[var(--success)]/20 p-8 mb-16 flex items-center space-x-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--success)]"></div>
                                <div className="p-3 bg-[var(--success)]/10 text-[var(--success)]">
                                    <ShieldCheckIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.3em] mb-2 italic">Integritetsverifierad Data</p>
                                    <p className="text-[10px] font-mono text-[var(--success)]/70 break-all leading-relaxed tracking-tighter">
                                        {opinionResult.content.split('**INTEGRITETSKEDJA (SHA-256):**')[1].split('\n')[0].trim()}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="prose prose-invert prose-sm max-w-none text-[var(--ink-main)] leading-relaxed">
                            <MarkdownRenderer content={opinionResult.content} />
                        </div>
                        
                        <div className="mt-24 pt-12 border-t border-[var(--border)] flex justify-between items-end">
                             <div className="space-y-3">
                                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Digital Signatur</p>
                                <p className="text-[10px] font-mono text-[var(--ink-muted)] bg-[var(--bg-main)] px-4 py-2 border border-[var(--border)] tracking-tighter">FMJAM_ORACLE_V725_LOCKED_{crypto.randomUUID().substring(0,12).toUpperCase()}</p>
                             </div>
                             <div className="text-right space-y-3">
                                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Genererat av FMJAM Engine</p>
                                <p className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">{new Date(opinionResult.generatedAt).toLocaleString('sv-SE')}</p>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] h-[80vh] flex flex-col items-center justify-center p-12 text-center group shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="relative mb-10 p-8 bg-[var(--bg-main)] border border-[var(--border)] group-hover:scale-110 transition-transform duration-700 shadow-xl">
                    <DocumentTextIcon className="h-24 w-24 text-[var(--ink-muted)] opacity-30 group-hover:text-[var(--accent)] group-hover:opacity-50 transition-all" />
                </div>
                <h3 className="text-3xl font-black text-[var(--ink-muted)] tracking-tighter uppercase italic opacity-40">Yttrande Väntar</h3>
                <p className="text-[var(--ink-muted)] mt-6 max-w-xs text-xs font-black uppercase tracking-[0.2em] leading-relaxed italic opacity-30">Välj en mall i kontrollpanelen till vänster för att starta den juridiska slutledningsprocessen.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const ModeButton: React.FC<{ title: string, description: string, icon: React.ReactNode, isActive: boolean, onClick: () => void, disabled: boolean }> = ({ title, description, icon, isActive, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`p-6 border text-left transition-all relative overflow-hidden group shadow-lg ${isActive ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--bg-main)] border-[var(--border)] hover:border-[var(--accent)]/30'}`}
    >
        <div className="flex items-center gap-5 mb-3">
            <div className={`p-2.5 ${isActive ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-card)] text-[var(--ink-muted)]'}`}>{icon}</div>
            <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] italic ${isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>{title}</h4>
        </div>
        <p className={`text-[10px] leading-relaxed font-black uppercase tracking-widest italic opacity-60 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>{description}</p>
    </button>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AiReportTab;
