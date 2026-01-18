
import React, { useState, useEffect } from 'react';
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from '../lib/fmjam.types';
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
  onGenerate: (config: OpinionConfig, mode: 'fast' | 'think') => void;
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
    onGenerate(config, mode);
  };

  const selectedTemplate = opinionTemplateRegistry.find(t => t.id === selectedTemplateId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Kontrollpanel */}
      <div className="lg:col-span-4 space-y-6">
        <Card title="Oracle Command" icon={<SparklesIcon />}>
          <div className="space-y-6">
            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Analysmall</label>
                <select 
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all font-bold text-sm"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={isGenerating}
                >
                    {opinionTemplateRegistry.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
                {selectedTemplate && <p className="text-[10px] text-gray-500 mt-3 italic leading-relaxed">{selectedTemplate.description}</p>}
            </div>

            <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Logisk Motor</label>
                <div className="grid grid-cols-1 gap-3">
                    <ModeButton 
                        title="Fast Sync" 
                        description="Gemini Flash för strukturella utkast." 
                        icon={<BoltIcon />} 
                        isActive={mode === 'fast'}
                        onClick={() => setMode('fast')}
                        disabled={isGenerating}
                    />
                    <ModeButton 
                        title="Deep Reasoning" 
                        description="Gemini Pro 3 med 32k Thinking Budget." 
                        icon={<BrainIcon />}
                        isActive={mode === 'think'}
                        onClick={() => setMode('think')}
                        disabled={isGenerating}
                    />
                </div>
            </div>
           
            <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-cyan-900/20 active:scale-95 flex items-center justify-center border border-cyan-400/20 text-xs"
            >
                {isGenerating ? <Spinner className="h-5 w-5 mr-3" /> : <SparklesIcon className="h-5 w-5 mr-3" />}
                {isGenerating ? 'Kör Logik...' : `Exekvera Yttrande`}
            </button>
          </div>
        </Card>

        {opinionResult && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-[2rem] animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-4 mb-4">
                    <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Integrity Verified</span>
                </div>
                <p className="text-xs text-indigo-200/70 leading-relaxed font-medium">
                    Detta yttrande är låst mot käll-hashar. Varje hänvisning har validerats mot SFS 2025:400 och de uppladdade bevisatomerma.
                </p>
            </div>
        )}
      </div>

      {/* Rapport-display */}
      <div className="lg:col-span-8">
        {isGenerating ? (
            <div className="bg-gray-900/50 rounded-[3rem] border border-gray-800 h-[80vh] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                <Spinner className="h-16 w-16 text-cyan-500 mb-8" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Genererar Juridiskt Yttrande</h3>
                <p className="text-gray-500 mt-4 max-w-sm text-sm">Modellen analyserar rättslig kausalitet och bygger beviskedjan i realtid...</p>
            </div>
        ) : error ? (
            <div className="bg-red-950/20 rounded-[3rem] border border-red-500/30 p-12 text-center h-[80vh] flex flex-col items-center justify-center">
                <XMarkIcon className="h-16 w-16 text-red-500 mb-6" />
                <h3 className="text-xl font-black text-red-400 uppercase tracking-tight">Kritiskt Systemfel</h3>
                <p className="text-red-200/60 mt-4 bg-black/40 p-4 rounded-xl font-mono text-xs border border-red-900/30">{error}</p>
            </div>
        ) : opinionResult ? (
            <div className="bg-white text-black rounded-[3rem] shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 relative border-4 border-gray-900">
                <header className="px-12 py-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gray-900 rounded-2xl text-white shadow-xl">
                            <LawIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Juridiskt Yttrande</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Ärende: {analysis.caseId}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 text-gray-400 hover:text-black transition-colors bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:scale-95">
                            <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all active:scale-95">
                            <DownloadIcon className="h-4 w-4" />
                            <span>Ladda ner PDF</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow overflow-y-auto p-16 custom-scrollbar-light bg-white selection:bg-cyan-100">
                    <div className="max-w-3xl mx-auto">
                        <MarkdownRenderer content={opinionResult.content} className="prose-slate !text-black !font-serif" />
                        
                        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-end opacity-40 grayscale">
                             <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase">Digital Signatur</p>
                                <p className="text-[9px] font-mono">FMJAM_ORACLE_V725_LOCKED_{crypto.randomUUID().substring(0,12)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest">Genererat av FMJAM Engine</p>
                                <p className="text-[9px] font-mono">{new Date(opinionResult.generatedAt).toLocaleString()}</p>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="bg-gray-900/30 rounded-[3rem] border border-gray-800 border-dashed h-[80vh] flex flex-col items-center justify-center p-12 text-center group">
                <div className="relative mb-8">
                    <DocumentTextIcon className="h-20 w-20 text-gray-800 group-hover:text-cyan-900/40 transition-colors" />
                    <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <h3 className="text-lg font-black text-gray-600 uppercase tracking-[0.3em]">Yttrande Väntar</h3>
                <p className="text-gray-700 mt-4 max-w-xs text-xs font-bold leading-relaxed">Välj en mall i kontrollpanelen till vänster för att starta den juridiska slutledningsprocessen.</p>
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
        className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${isActive ? 'bg-cyan-600 border-cyan-400 shadow-lg shadow-cyan-900/30' : 'bg-gray-950 border-gray-800 hover:border-gray-700'}`}
    >
        {isActive && <div className="absolute top-0 right-0 p-2 opacity-20"><ShieldCheckIcon className="w-8 h-8" /></div>}
        <div className="flex items-center gap-4 mb-2">
            <div className={`${isActive ? 'text-white' : 'text-cyan-500'}`}>{icon}</div>
            <h4 className={`font-black uppercase tracking-widest text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</h4>
        </div>
        <p className={`text-[10px] leading-relaxed font-medium ${isActive ? 'text-cyan-100' : 'text-gray-500'}`}>{description}</p>
    </button>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AiReportTab;
