import React, { useState } from 'react';
import { StoredDocument, ParsedDocument } from '../types';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import Card from './shared/Card';
import { FileIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon, QuestionMarkCircleIcon, ChatIcon, ActivityIcon } from './icons';
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
}

const SystemOverview: React.FC<SystemOverviewProps> = ({
  pipelineStatus,
  documents,
  onFilesSelect,
  onTextSubmit,
  onSelectDocument,
  onAggregateSelected,
  isProcessing,
  parsingError
}) => {
    const [isGuideOpen, setGuideOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <PipelineStatus status={pipelineStatus} />

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction 
            icon={<ChatIcon />} 
            label="Analysera Ärendearkiv" 
            sub="Fråga mot Habibpoor 01-05" 
            color="red"
          />
          <QuickAction 
            icon={<ShieldCheckIcon />} 
            label="Integritetskontroll" 
            sub="Verifiera SFS 2025:400" 
            color="cyan"
          />
          <QuickAction 
            icon={<ActivityIcon />} 
            label="System-telemetri" 
            sub="Monitorera AI-pipeline" 
            color="indigo"
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-[2.5rem] p-8 animate-in slide-in-from-top-4 duration-500 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                  <SparklesIcon className="w-24 h-24 text-cyan-400" />
              </div>
              <div className="flex items-center space-x-6 relative z-10">
                  <div className="p-4 bg-cyan-500/20 rounded-2xl animate-pulse border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <SparklesIcon className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Klar för kors-analys</h3>
                      <p className="text-sm text-cyan-200/60 mt-1">{selectedIds.length} dokument valda för Batch-validering.</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center space-x-4 border border-cyan-400/20 relative z-10"
              >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Exekvera Adversarial Duel</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-6 sticky top-28">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full bg-gray-900 hover:bg-gray-800 text-gray-400 font-black uppercase tracking-widest py-4 px-4 rounded-2xl transition-all flex items-center justify-center border border-gray-800 text-[10px]">
                <QuestionMarkCircleIcon className="h-5 w-5 mr-3" />
                System Guide
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-10">
            <Card title="Forensisk Ärendehistorik" icon={<FileIcon />}>
                {documents.length > 0 ? (
                    <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        
                        return (
                            <li key={doc.id} className="relative">
                                <div 
                                    className={`w-full p-6 rounded-[2rem] transition-all flex items-center justify-between group border cursor-pointer ${isSelected ? 'bg-cyan-950/20 border-cyan-500/50 shadow-xl' : 'bg-gray-900/60 border-gray-800 hover:border-cyan-500/40'}`}
                                    onClick={() => onSelectDocument(doc.id)}
                                >
                                    <div className="flex items-center space-x-6">
                                        {!isAggregate && (
                                            <div 
                                                onClick={(e) => toggleSelection(doc.id, e)}
                                                className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-black/40 border-gray-700 hover:border-cyan-500'}`}
                                            >
                                                {isSelected && <CheckCircleIcon className="w-4 h-4 text-black font-black" />}
                                            </div>
                                        )}
                                        <div className={`p-4 rounded-2xl border ${isAggregate ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-black/40 border-gray-800 text-gray-600'}`}>
                                            {isAggregate ? <SparklesIcon className="h-8 w-8" /> : <FileIcon className="h-8 w-8" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-white truncate max-w-[200px] md:max-w-md tracking-tight uppercase italic">{doc.name}</p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">LOCKED: {new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                <div className="h-1 w-1 rounded-full bg-gray-800"></div>
                                                <span className="text-[9px] font-mono text-gray-600 uppercase">SHA256: {doc.id.substring(0,8)}</span>
                                                {isAggregate && (
                                                    <span className="bg-purple-900/40 text-purple-400 px-3 py-0.5 rounded-full border border-purple-700/50 text-[9px] font-black tracking-widest">DUEL_RESULT</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Risk Factor</p>
                                            <p className={`text-sm font-black ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-red-500' : 'text-cyan-500'}`}>
                                                {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                            </p>
                                        </div>
                                        <ArrowPathIcon className="h-6 w-6 text-gray-700 group-hover:text-cyan-400 transition-all group-hover:rotate-180 duration-700" />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-32 text-gray-700">
                        <div className="relative inline-block mb-8">
                            <FileIcon className="h-20 w-20 mx-auto opacity-10" />
                            <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-5"></div>
                        </div>
                        <p className="text-xl font-black uppercase tracking-[0.3em] opacity-30">Väntar på indata</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactElement, label: string, sub: string, color: 'red' | 'cyan' | 'indigo' }> = ({ icon, label, sub, color }) => {
    const colors = {
        red: 'border-red-900/30 bg-red-950/10 text-red-500 group-hover:border-red-500/50',
        cyan: 'border-cyan-900/30 bg-cyan-950/10 text-cyan-500 group-hover:border-cyan-500/50',
        indigo: 'border-indigo-900/30 bg-indigo-950/10 text-indigo-500 group-hover:border-indigo-500/50'
    };

    return (
        <div className={`p-6 rounded-[2rem] border transition-all cursor-pointer group flex items-center space-x-5 shadow-inner ${colors[color]}`}>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                {/* FIX: Cast icon to React.ReactElement<any> to allow adding className prop. */}
                {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
            </div>
            <div>
                <h4 className="font-black text-white uppercase italic tracking-tighter text-sm">{label}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;