import React, { useState, useEffect } from 'react';
import { OpinionConfig, OpinionResult } from '../types';
import { AnalysisResult } from '../lib/fmjam.types';
import { opinionTemplateRegistry } from '../data/opinionTemplates';
import Card from './shared/Card';
import { BoltIcon, BrainIcon, DocumentTextIcon, SparklesIcon, Spinner } from './icons';

interface OpinionGeneratorProps {
  analysis: AnalysisResult;
  onGenerate: (config: OpinionConfig, mode: 'fast' | 'think') => void;
  opinionResult: OpinionResult | null;
  isGenerating: boolean;
}

type Mode = 'fast' | 'think';

const OpinionGenerator: React.FC<OpinionGeneratorProps> = ({ analysis, onGenerate, opinionResult, isGenerating }) => {
  const [mode, setMode] = useState<Mode>('think');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('FMJAM_REPORT_V1');
  
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

  const handleGenerateClick = () => {
    onGenerate(config, mode);
  };

  const selectedTemplate = opinionTemplateRegistry.find(t => t.id === selectedTemplateId);
  
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={`h3-${index}`} className="text-xl font-semibold text-cyan-300 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={`h2-${index}`} className="text-2xl font-bold text-cyan-400 mt-8 mb-3 border-b border-gray-700 pb-1">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('- ')) {
            return <li key={`li-${index}`} className="ml-6 list-disc text-gray-300">{line.replace('- ', '')}</li>
        }
        return <p key={`p-${index}`} className="mb-4 text-gray-300 leading-relaxed">{line}</p>;
      })
      .reduce((acc: React.ReactElement[], el) => {
        if (el.type === 'li' && acc.length > 0 && acc[acc.length-1].type === 'ul') {
            const lastUl = acc[acc.length-1];
            const children = React.Children.toArray((lastUl.props as any).children);
            const newUl = React.cloneElement(lastUl, {}, [...children, el]);
            acc[acc.length-1] = newUl;
            return acc;
        } else if (el.type === 'li') {
            return [...acc, <ul key={`ul-${el.key}`} className="mb-4 space-y-1">{el}</ul>];
        }
        return [...acc, el];
      }, [] as React.ReactElement[]);
  };

  return (
    <div className="space-y-6">
      <Card title="2. Generera AI-Yttrande (v.6.0)" icon={<SparklesIcon />}>
        <div className="space-y-6">
            <div>
                <label htmlFor="template-select" className="block text-sm font-medium text-gray-300 mb-2">
                    Välj mall för yttrande
                </label>
                <select 
                    id="template-select"
                    className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={isGenerating}
                >
                    {opinionTemplateRegistry.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
                {selectedTemplate && <p className="text-xs text-gray-400 mt-2">{selectedTemplate.description}</p>}
            </div>

            <div>
                <p className="block text-sm font-medium text-gray-300 mb-2">Välj AI-modell</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModeButton 
                    title="Snabb" 
                    description="Använder Gemini Flash för snabba svar. Bäst för översikter." 
                    icon={<BoltIcon />} 
                    isActive={mode === 'fast'}
                    onClick={() => setMode('fast')}
                    disabled={isGenerating}
                    />
                    <ModeButton 
                    title="Djupanalys" 
                    description="Använder Gemini Pro med 'thinking mode' för komplexa resonemang." 
                    icon={<BrainIcon />}
                    isActive={mode === 'think'}
                    onClick={() => setMode('think')}
                    disabled={isGenerating}
                    />
                </div>
            </div>
           
           <div>
            <label htmlFor="custom-formatting" className="block text-sm font-medium text-gray-300 mb-2">
                Fria formateringsinstruktioner (valfritt)
            </label>
            <textarea
                id="custom-formatting"
                rows={3}
                className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="T.ex. 'Använd punktlistor för bedömningen', 'fetmarkera alla lagrum', etc."
                value={config.customFormatting}
                onChange={(e) => setConfig(prev => ({...prev, customFormatting: e.target.value}))}
                disabled={isGenerating}
            />
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isGenerating ? <Spinner className="h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
            {isGenerating ? 'Genererar...' : `Generera "${selectedTemplate?.name || ''}"`}
          </button>
        </div>
      </Card>
      {opinionResult && (
        <Card title="Genererat Yttrande" icon={<DocumentTextIcon />}>
          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-cyan-400 max-w-none bg-gray-900 p-4 rounded-lg">
             {renderMarkdown(opinionResult.content)}
          </div>
        </Card>
      )}
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
    const activeClasses = 'border-cyan-500 bg-cyan-900/30 ring-2 ring-cyan-500';
    const inactiveClasses = 'border-gray-700 hover:border-cyan-600 hover:bg-gray-700/50';
    return (
        <button 
          onClick={onClick}
          disabled={disabled}
          className={`p-4 border rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? activeClasses : inactiveClasses}`}
        >
            <div className="flex items-center mb-2">
                <div className="mr-3 text-cyan-400">{icon}</div>
                <h4 className="font-semibold text-white">{title}</h4>
            </div>
            <p className="text-sm text-gray-400">{description}</p>
        </button>
    )
}

export default OpinionGenerator;