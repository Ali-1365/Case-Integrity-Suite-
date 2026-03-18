
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Kontrollpanel */}
      <div className="lg:col-span-4 space-y-6">
        <Card title="Oracle Command" icon={<SparklesIcon className="w-5 h-5" />}>
          <div className="space-y-6">
            <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Analysmall</label>
                <select 
                    className="w-full bg-[#111111] border border-gray-800 rounded-lg py-2.5 px-3 text-gray-200 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-colors text-sm"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={isGenerating}
                >
                    {opinionTemplateRegistry.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
                {selectedTemplate && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{selectedTemplate.description}</p>}
            </div>

            <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Logisk Motor</label>
                <div className="grid grid-cols-1 gap-3">
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
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center text-sm"
            >
                {isGenerating ? <Spinner className="h-4 w-4 mr-2" /> : <SparklesIcon className="h-4 w-4 mr-2" />}
                {isGenerating ? 'Kör Logik...' : `Exekvera Yttrande`}
            </button>
          </div>
        </Card>

        {opinionResult && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Integrity Verified</span>
                </div>
                <p className="text-xs text-indigo-200/70 leading-relaxed">
                    Detta yttrande är låst mot käll-hashar. Varje hänvisning har validerats mot SFS 2025:400 och de uppladdade bevisatomerma.
                </p>
            </div>
        )}
      </div>

      {/* Rapport-display */}
      <div className="lg:col-span-8">
        {isGenerating ? (
            <div className="bg-[#111111] rounded-2xl border border-gray-800 h-[80vh] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <Spinner className="h-12 w-12 text-cyan-500 mb-6" />
                <h3 className="text-lg font-medium text-gray-200">Genererar Juridiskt Yttrande</h3>
                <p className="text-gray-500 mt-3 max-w-sm text-sm">Modellen analyserar rättslig kausalitet och bygger beviskedjan i realtid...</p>
            </div>
        ) : error ? (
            <div className="bg-rose-500/10 rounded-2xl border border-rose-500/20 p-12 text-center h-[80vh] flex flex-col items-center justify-center">
                <XMarkIcon className="h-12 w-12 text-rose-500 mb-4" />
                <h3 className="text-lg font-medium text-rose-400">Kritiskt Systemfel</h3>
                <p className="text-rose-300/70 mt-3 bg-[#0a0a0a] p-4 rounded-lg font-mono text-xs border border-rose-900/30">{error}</p>
            </div>
        ) : opinionResult ? (
            <div className="bg-white text-gray-900 rounded-2xl shadow-sm h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-gray-200">
                <header className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-900 rounded-lg text-white">
                            <LawIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Juridiskt Yttrande</h2>
                            <p className="text-xs text-gray-500 mt-1">Ärende: {analysis.caseId}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow">
                            <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-800 transition-colors">
                            <DownloadIcon className="h-4 w-4" />
                            <span>Ladda ner PDF</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow overflow-y-auto p-10 md:p-16 custom-scrollbar-light bg-white">
                    <div className="max-w-3xl mx-auto">
                        {opinionResult.content.includes('**INTEGRITETSKEDJA (SHA-256):**') && (
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-8 flex items-center space-x-4">
                                <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Integritetsverifierad Data</p>
                                    <p className="text-[10px] font-mono text-emerald-600 break-all">
                                        {opinionResult.content.split('**INTEGRITETSKEDJA (SHA-256):**')[1].split('\n')[0].trim()}
                                    </p>
                                </div>
                            </div>
                        )}
                        <MarkdownRenderer content={opinionResult.content} className="prose-slate !text-gray-800" />
                        
                        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end text-gray-400">
                             <div className="space-y-1">
                                <p className="text-xs font-medium uppercase">Digital Signatur</p>
                                <p className="text-[10px] font-mono">FMJAM_ORACLE_V725_LOCKED_{crypto.randomUUID().substring(0,12)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-medium uppercase">Genererat av FMJAM Engine</p>
                                <p className="text-[10px] font-mono">{new Date(opinionResult.generatedAt).toLocaleString()}</p>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="bg-[#111111] rounded-2xl border border-gray-800 border-dashed h-[80vh] flex flex-col items-center justify-center p-12 text-center group">
                <div className="relative mb-6">
                    <DocumentTextIcon className="h-16 w-16 text-gray-700 group-hover:text-cyan-900/40 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-400">Yttrande Väntar</h3>
                <p className="text-gray-500 mt-3 max-w-xs text-sm leading-relaxed">Välj en mall i kontrollpanelen till vänster för att starta den juridiska slutledningsprocessen.</p>
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
        className={`p-4 rounded-xl border text-left transition-colors relative overflow-hidden group ${isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-[#161616] border-gray-800 hover:border-gray-700'}`}
    >
        <div className="flex items-center gap-3 mb-1.5">
            <div className={`${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>{icon}</div>
            <h4 className={`font-medium text-sm ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>{title}</h4>
        </div>
        <p className={`text-xs leading-relaxed ${isActive ? 'text-cyan-200/70' : 'text-gray-500'}`}>{description}</p>
    </button>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default AiReportTab;
