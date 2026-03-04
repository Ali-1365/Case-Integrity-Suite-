import React, { useState } from 'react';
import { StoredDocument, ParsedDocument, LegalCorpus } from '../types';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import Card from './shared/Card';
import { FileIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon, QuestionMarkCircleIcon, ChatIcon, ActivityIcon, LawIcon } from './icons';
import SystemGuide from './SystemGuide';
import PipelineStatus, { PipelineStatusState } from './PipelineStatus';

interface SystemOverviewProps {
  pipelineStatus: PipelineStatusState;
  documents: StoredDocument[];
  onFilesSelect: (files: File[]) => void;
  onTextSubmit: (text: string) => void;
  onSelectDocument: (id: string) => void;
  onAggregateSelected: (ids: string[]) => void;
  isProcessing: boolean;
  parsingError: string | null;
  legalCorpus: LegalCorpus[];
}

const SystemOverview: React.FC<SystemOverviewProps> = ({
  pipelineStatus,
  documents,
  onFilesSelect,
  onTextSubmit,
  onSelectDocument,
  onAggregateSelected,
  isProcessing,
  parsingError,
  legalCorpus
}) => {
    const [isGuideOpen, setGuideOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <PipelineStatus status={pipelineStatus} />

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction 
            icon={<ChatIcon className="w-5 h-5" />} 
            label="Analysera Ärendearkiv" 
            sub="Fråga mot Habibpoor 01-05" 
            color="rose"
          />
          <QuickAction 
            icon={<ShieldCheckIcon className="w-5 h-5" />} 
            label="Integritetskontroll" 
            sub="Verifiera SFS 2025:400" 
            color="cyan"
          />
          <QuickAction 
            icon={<ActivityIcon className="w-5 h-5" />} 
            label="System-telemetri" 
            sub="Monitorera AI-pipeline" 
            color="indigo"
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2 duration-300 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="flex items-center space-x-4 relative z-10">
                  <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <SparklesIcon className="h-6 w-6 text-blue-800" />
                  </div>
                  <div>
                      <h3 className="text-lg font-medium text-[#1A202C] tracking-tight">Klar för kors-analys</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{selectedIds.length} dokument valda för Batch-validering.</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-blue-800 hover:bg-blue-900 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-md transition-colors flex items-center space-x-2 relative z-10"
              >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Exekvera Adversarial Duel</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-6 sticky top-24">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center border border-gray-200 text-sm">
                <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                System Guide
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <Card title="Forensisk Ärendehistorik" icon={<FileIcon className="w-5 h-5" />}>
                {documents.length > 0 ? (
                    <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        
                        return (
                            <li key={doc.id} className="relative">
                                    <div 
                                        className={`w-full p-4 rounded-xl transition-colors flex items-center justify-between group border cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'}`}
                                                >
                                                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            )}
                                            <div className={`p-2.5 rounded-lg border ${isAggregate ? 'bg-purple-100 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                {isAggregate ? <SparklesIcon className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#1A202C] truncate max-w-[200px] md:max-w-md tracking-tight">{doc.name}</p>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <span className="text-xs text-gray-500">LOCKED: {new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                                    <span className="text-xs font-mono text-gray-500">SHA256: {doc.id.substring(0,8)}</span>
                                                    {isAggregate && (
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200 text-[10px] font-medium">DUEL_RESULT</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-medium text-gray-500 uppercase">Risk Factor</p>
                                                <p className={`text-sm font-semibold ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-red-600' : 'text-blue-800'}`}>
                                                    {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                                </p>
                                            </div>
                                            <ArrowPathIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                        </div>
                                    </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-24 text-gray-500">
                        <div className="relative inline-block mb-6">
                            <FileIcon className="h-16 w-16 mx-auto opacity-20" />
                        </div>
                        <p className="text-sm font-medium opacity-60">Väntar på indata</p>
                    </div>
                )}
            </Card>

            <Card title="Juridiska Korpusar" icon={<LawIcon className="w-5 h-5" />}>
                {legalCorpus.length > 0 ? (
                    <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {legalCorpus.map((corpus, index) => (
                            <li key={index} className="w-full p-4 rounded-xl transition-colors flex items-center justify-between group border bg-white border-gray-200 hover:border-blue-300">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 rounded-lg border bg-gray-50 border-gray-200 text-gray-600">
                                        <LawIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#1A202C] truncate max-w-[200px] md:max-w-md tracking-tight">{corpus.title}</p>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className="text-xs text-gray-500">SFS: {corpus.sfsNumber}</span>
                                            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                            <span className="text-xs font-mono text-gray-500">KÄLLA: {corpus.sourceCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-24 text-gray-500">
                        <div className="relative inline-block mb-6">
                            <LawIcon className="h-16 w-16 mx-auto opacity-20" />
                        </div>
                        <p className="text-sm font-medium opacity-60">Inga juridiska korpusar laddade</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactElement, label: string, sub: string, color: 'rose' | 'cyan' | 'indigo' }> = ({ icon, label, sub, color }) => {
    const colors = {
        rose: 'border-rose-500/20 bg-rose-500/5 text-rose-400 hover:border-rose-500/40',
        cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:border-cyan-500/40',
        indigo: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:border-indigo-500/40'
    };

    return (
        <div className={`p-5 rounded-xl border transition-colors cursor-pointer group flex items-center space-x-4 ${colors[color]}`}>
            <div className="p-3 bg-[#161616] rounded-lg border border-gray-800 group-hover:scale-105 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="font-medium text-gray-200 text-sm">{label}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;