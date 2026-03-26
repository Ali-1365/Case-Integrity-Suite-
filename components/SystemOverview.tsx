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
  onAction: (action: string) => void;
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
  onAction,
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
            onClick={() => onAction('arch')}
          />
          <QuickAction 
            icon={<ShieldCheckIcon className="w-6 h-6" />} 
            label="Integritetskontroll" 
            sub="Verifiera forensisk kedja" 
            color="emerald"
            onClick={() => onAction('integrity')}
          />
          <QuickAction 
            icon={<ActivityIcon className="w-6 h-6" />} 
            label="Systemtelemetri" 
            sub="Monitorera AI-noder" 
            color="indigo"
            onClick={() => onAction('monitor')}
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[4rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-12 duration-700 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[120px] group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
              <div className="flex items-center space-x-10 relative z-10">
                  <div className="p-7 bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <SparklesIcon className="h-12 w-12 text-indigo-400" />
                  </div>
                  <div>
                      <h3 className="text-4xl font-serif font-bold text-white tracking-tight m-0">Klar för korsanalys</h3>
                      <p className="text-indigo-300 text-sm mt-3 font-black uppercase tracking-[0.3em] opacity-80">{selectedIds.length} dokument valda för Batch-validering.</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-14 py-6 rounded-[2rem] font-serif font-bold text-xl shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.7)] transition-all flex items-center space-x-5 relative z-10 shrink-0 group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <ShieldCheckIcon className="h-8 w-8 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                  <span className="tracking-tight">Exekvera Adversarial Duel</span>
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
                                        className={`w-full p-10 rounded-[3rem] transition-all flex items-center justify-between group border-2 cursor-pointer ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-400 dark:border-indigo-600 shadow-2xl shadow-indigo-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-2xl hover:-translate-y-2'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <div className="flex items-center space-x-10">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/30 scale-110' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
                                                >
                                                    {isSelected && <CheckCircleIcon className="w-6 h-6 text-white" />}
                                                </div>
                                            )}
                                            <div className={`p-6 rounded-[2rem] border-2 transition-transform group-hover:scale-110 group-hover:rotate-6 ${isAggregate ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-inner'}`}>
                                                {isAggregate ? <SparklesIcon className="h-10 w-10" /> : <FileIcon className="h-10 w-10" />}
                                            </div>
                                            <div>
                                                <p className="font-serif font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] md:max-w-md tracking-tight m-0 text-2xl leading-tight">{doc.name}</p>
                                                <div className="flex items-center space-x-6 mt-4">
                                                    <div className="flex items-center space-x-2.5">
                                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    </div>
                                                    <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                    <div className="flex items-center space-x-2.5">
                                                        <FingerPrintIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest">{doc.id.substring(0,8)}</span>
                                                    </div>
                                                    {isAggregate && (
                                                        <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-[10px] font-black tracking-widest uppercase">DUEL_RESULT</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-12">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 opacity-70">Riskfaktor</p>
                                                <div className="flex items-center justify-end space-x-4">
                                                    <span className={`text-3xl font-serif font-bold tracking-tight ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                        {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                                    </span>
                                                    <div className="w-2.5 h-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`w-full transition-all duration-1000 ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]'}`}
                                                            style={{ height: `${doc.analysis?.riskProfile?.normalizedScore || 0}%`, marginTop: `${100 - (doc.analysis?.riskProfile?.normalizedScore || 0)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-12">
                                                <ArrowPathIcon className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors" />
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

const QuickAction: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, sub: string, color: 'blue' | 'emerald' | 'indigo', onClick?: () => void }> = ({ icon, label, sub, color, onClick }) => {
    const colors = {
        blue: 'border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-indigo-500/5',
        emerald: 'border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-emerald-500/5',
        indigo: 'border-rose-100 dark:border-rose-900/30 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:border-rose-400 dark:hover:border-rose-600 shadow-rose-500/5'
    };

    return (
        <div 
            onClick={onClick}
            className={`p-12 rounded-[3.5rem] border-2 transition-all cursor-pointer group flex items-center space-x-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 ${colors[color]}`}
        >
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                {React.cloneElement(icon, { className: 'w-8 h-8' })}
            </div>
            <div>
                <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-2xl tracking-tight m-0 leading-tight">{label}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-black uppercase tracking-[0.25em] opacity-70">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;