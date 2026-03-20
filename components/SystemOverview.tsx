import React, { useState } from 'react';
import { StoredDocument, ParsedDocument, LegalCorpus } from '../types';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import Card from './shared/Card';
import { FileIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon, QuestionMarkCircleIcon, ChatIcon, ActivityIcon, LawIcon, CalendarIcon, FingerPrintIcon } from './icons';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <QuickAction 
            icon={<ChatIcon className="w-6 h-6" />} 
            label="Analysera Ärendearkiv" 
            sub="Välj ärende för djupanalys" 
            color="blue"
          />
          <QuickAction 
            icon={<ShieldCheckIcon className="w-6 h-6" />} 
            label="Integritetskontroll" 
            sub="Verifiera forensisk kedja" 
            color="emerald"
          />
          <QuickAction 
            icon={<ActivityIcon className="w-6 h-6" />} 
            label="Systemtelemetri" 
            sub="Monitorera AI-noder" 
            color="indigo"
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-white/10 transition-colors duration-1000"></div>
              <div className="flex items-center space-x-8 relative z-10">
                  <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <SparklesIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter m-0">Klar för korsanalys</h3>
                      <p className="text-slate-400 dark:text-blue-100 text-sm mt-2 font-bold uppercase tracking-widest opacity-80">{selectedIds.length} dokument valda för Batch-validering.</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-white text-slate-900 dark:text-blue-700 hover:bg-slate-100 disabled:bg-white/50 disabled:text-slate-400 px-12 py-5 rounded-[1.5rem] font-black text-sm shadow-2xl transition-all flex items-center space-x-4 relative z-10 shrink-0 group/btn active:scale-95"
              >
                  <ShieldCheckIcon className="h-6 w-6 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                  <span className="uppercase tracking-widest">Exekvera Adversarial Duel</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-8 sticky top-28">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span>Systemguide</span>
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <Card title="Forensisk Ärendehistorik" icon={<FileIcon className="w-5 h-5" />}>
                {documents.length > 0 ? (
                    <ul className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        
                        return (
                            <li key={doc.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div 
                                        className={`w-full p-8 rounded-[2.5rem] transition-all flex items-center justify-between group border-2 cursor-pointer ${isSelected ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-400 dark:border-blue-600 shadow-2xl shadow-blue-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <div className="flex items-center space-x-8">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/30 scale-110' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
                                                >
                                                    {isSelected && <CheckCircleIcon className="w-5 h-5 text-white" />}
                                                </div>
                                            )}
                                            <div className={`p-5 rounded-[1.5rem] border-2 transition-transform group-hover:scale-110 group-hover:rotate-3 ${isAggregate ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-inner'}`}>
                                                {isAggregate ? <SparklesIcon className="h-8 w-8" /> : <FileIcon className="h-8 w-8" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-slate-100 truncate max-w-[200px] md:max-w-md tracking-tighter m-0 text-lg leading-tight">{doc.name}</p>
                                                <div className="flex items-center space-x-5 mt-3">
                                                    <div className="flex items-center space-x-2">
                                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    </div>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                    <div className="flex items-center space-x-2">
                                                        <FingerPrintIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest">{doc.id.substring(0,8)}</span>
                                                    </div>
                                                    {isAggregate && (
                                                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800 text-[10px] font-black tracking-widest uppercase">DUEL_RESULT</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-10">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 opacity-70">Riskfaktor</p>
                                                <div className="flex items-center justify-end space-x-3">
                                                    <span className={`text-2xl font-black tracking-tighter ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'}`}>
                                                        {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                                    </span>
                                                    <div className="w-2 h-10 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`w-full transition-all duration-1000 ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                                            style={{ height: `${doc.analysis?.riskProfile?.normalizedScore || 0}%`, marginTop: `${100 - (doc.analysis?.riskProfile?.normalizedScore || 0)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-12">
                                                <ArrowPathIcon className="h-7 w-7 text-slate-300 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-32 text-slate-400">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <FileIcon className="h-20 w-20 mx-auto opacity-20 relative z-10" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">Väntar på indata</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, sub: string, color: 'blue' | 'emerald' | 'indigo' }> = ({ icon, label, sub, color }) => {
    const colors = {
        blue: 'border-blue-100 dark:border-blue-900/30 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-600 shadow-blue-500/5',
        emerald: 'border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-emerald-500/5',
        indigo: 'border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-indigo-500/5'
    };

    return (
        <div className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer group flex items-center space-x-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 ${colors[color]}`}>
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg tracking-tighter m-0 leading-tight">{label}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-[0.2em] opacity-70">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;