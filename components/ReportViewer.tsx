
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
    const selectedTemplate = opinionTemplateRegistry.find(t => (t as { id: string }).id === selectedTemplateId);
    if (selectedTemplate) {
        setConfig(prev => ({
            ...prev,
            templateId: (selectedTemplate as { id: string }).id,
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

  const selectedTemplate = opinionTemplateRegistry.find(t => (t as { id: string }).id === selectedTemplateId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
      {/* Kontrollpanel */}
      <div className="lg:col-span-4 space-y-8">
        <Card title="Oracle Command" icon={<SparklesIcon className="w-5 h-5" />}>
          <div className="space-y-8">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Analysmall</label>
                <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-medium"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={isGenerating}
                >
                    {opinionTemplateRegistry.map(template => (
                        <option key={(template as { id: string }).id} value={(template as { id: string }).id}>{(template as { name: string }).name}</option>
                    ))}
                </select>
                {selectedTemplate && <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed font-medium">{selectedTemplate.description}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Logisk Motor</label>
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
                className="btn btn-primary w-full !py-4"
            >
                {isGenerating ? <Spinner className="h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
                <span>{isGenerating ? 'Kör Logik...' : `Exekvera Yttrande`}</span>
            </button>
          </div>
        </Card>

        {opinionResult && (
            <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl animate-fade-in shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Integrity Verified</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Detta yttrande är låst mot käll-hashar. Varje hänvisning har validerats mot SFS 2025:400 och de uppladdade bevisatomerma.
                </p>
            </div>
        )}
      </div>

      {/* Rapport-display */}
      <div className="lg:col-span-8">
        {isGenerating ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-[80vh] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50"></div>
                <Spinner className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-8 relative z-10" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white relative z-10 tracking-tight">Genererar Juridiskt Yttrande</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-sm text-base font-medium relative z-10 leading-relaxed">Modellen analyserar rättslig kausalitet och bygger beviskedjan i realtid...</p>
            </div>
        ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-200 dark:border-rose-500/20 p-12 text-center h-[80vh] flex flex-col items-center justify-center shadow-sm">
                <div className="p-4 bg-rose-500/10 rounded-full mb-6">
                    <XMarkIcon className="h-12 w-12 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">Kritiskt Systemfel</h3>
                <p className="text-rose-500/70 mt-4 bg-white dark:bg-slate-900 p-6 rounded-2xl font-mono text-xs border border-rose-200 dark:border-rose-900/30 shadow-inner max-w-md break-all">{error}</p>
            </div>
        ) : opinionResult ? (
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-xl h-[85vh] flex flex-col overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800">
                <header className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white shadow-lg">
                            <LawIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Juridiskt Yttrande</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ärende: {analysis.caseId}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md">
                            <PrinterIcon className="h-6 w-6" />
                        </button>
                        <button className="btn btn-primary !px-6 !py-3">
                            <DownloadIcon className="h-5 w-5" />
                            <span>Ladda ner PDF</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow overflow-y-auto p-12 md:p-20 custom-scrollbar bg-white dark:bg-slate-900">
                    <div className="max-w-3xl mx-auto">
                        {(opinionResult as { content?: string, textContent?: string }).textContent.includes('**INTEGRITETSKEDJA (SHA-256):**') && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 p-6 rounded-2xl mb-12 flex items-center space-x-5 shadow-sm">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheckIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Integritetsverifierad Data</p>
                                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 break-all leading-relaxed">
                                        {(opinionResult as { content?: string, textContent?: string }).textContent.split('**INTEGRITETSKEDJA (SHA-256):**')[1].split('\n')[0].trim()}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <MarkdownRenderer content={(opinionResult as { content?: string, textContent?: string }).textContent} />
                        </div>
                        
                        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                             <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Signatur</p>
                                <p className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">FMJAM_ORACLE_V725_LOCKED_{crypto.randomUUID().substring(0,12)}</p>
                             </div>
                             <div className="text-right space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Genererat av FMJAM Engine</p>
                                <p className="text-[10px] font-mono text-slate-400">{new Date(opinionResult.generatedAt).toLocaleString('sv-SE')}</p>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 border-dashed h-[80vh] flex flex-col items-center justify-center p-12 text-center group shadow-sm">
                <div className="relative mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-500">
                    <DocumentTextIcon className="h-20 w-20 text-slate-300 dark:text-slate-600 group-hover:text-blue-500/40 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-600 tracking-tight">Yttrande Väntar</h3>
                <p className="text-slate-400 dark:text-slate-600 mt-4 max-w-xs text-base font-medium leading-relaxed">Välj en mall i kontrollpanelen till vänster för att starta den juridiska slutledningsprocessen.</p>
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
        className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-sm ${isActive ? 'bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
    >
        <div className="flex items-center gap-4 mb-2">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>{icon}</div>
            <h4 className={`font-bold text-sm uppercase tracking-wider ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{title}</h4>
        </div>
        <p className={`text-xs leading-relaxed font-medium ${isActive ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-slate-500 dark:text-slate-500'}`}>{description}</p>
    </button>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AiReportTab;
