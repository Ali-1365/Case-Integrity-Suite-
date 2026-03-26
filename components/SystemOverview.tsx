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
    <div className="space-y-20 pb-32 animate-in fade-in duration-1000">
      <PipelineStatus status={pipelineStatus} />

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <QuickAction 
            icon={<ChatIcon className="w-10 h-10" />} 
            label="Analysera Ärendearkiv" 
            sub="Välj ärende för djupanalys" 
            color="blue"
            onClick={() => onAction('arch')}
          />
          <QuickAction 
            icon={<ShieldCheckIcon className="w-10 h-10" />} 
            label="Integritetskontroll" 
            sub="Verifiera forensisk kedja" 
            color="emerald"
            onClick={() => onAction('integrity')}
          />
          <QuickAction 
            icon={<ActivityIcon className="w-10 h-10" />} 
            label="Systemtelemetri" 
            sub="Monitorera AI-noder" 
            color="indigo"
            onClick={() => onAction('monitor')}
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-[5rem] p-20 shadow-[0_60px_150px_-20px_rgba(79,70,229,0.5)] animate-in slide-in-from-bottom-24 duration-1000 flex flex-col md:flex-row justify-between items-center gap-16 relative overflow-hidden group border-2 border-white/10">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full -mr-64 -mt-64 blur-[180px] group-hover:bg-indigo-500/30 transition-colors duration-1000 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full -ml-64 -mb-64 blur-[150px] group-hover:bg-rose-500/20 transition-colors duration-1000"></div>
              
              <div className="flex items-center space-x-16 relative z-10">
                  <div className="p-10 bg-white/10 rounded-[3.5rem] backdrop-blur-3xl border-2 border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <SparklesIcon className="h-16 w-16 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.6)]" />
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-6xl font-serif font-black text-white tracking-tighter m-0 leading-none">Klar för korsanalys</h3>
                      <div className="flex items-center gap-6 mt-6">
                        <div className="h-3 w-3 rounded-full bg-indigo-400 animate-ping shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                        <p className="text-indigo-300 text-base font-black uppercase tracking-[0.5em] opacity-100">{selectedIds.length} dokument valda för Batch-validering.</p>
                      </div>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white px-20 py-8 rounded-[3rem] font-serif font-black text-3xl shadow-[0_30px_80px_-10px_rgba(99,102,241,0.7)] hover:shadow-[0_50px_100px_-10px_rgba(99,102,241,0.9)] transition-all flex items-center space-x-8 relative z-10 shrink-0 group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/30"
              >
                  <ShieldCheckIcon className="h-12 w-12 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-700" />
                  <span className="tracking-tighter">Exekvera Adversarial Duel</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-12 sticky top-44">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full py-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-6 text-sm font-black uppercase tracking-[0.4em] shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-95 group">
                <QuestionMarkCircleIcon className="h-8 w-8 text-indigo-500 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
                <span>Systemguide</span>
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
            <Card title="Forensisk Ärendehistorik" icon={<FileIcon className="w-8 h-8" />}>
                {documents.length > 0 ? (
                    <ul className="space-y-8 max-h-[90vh] overflow-y-auto pr-6 custom-scrollbar p-4">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        
                        return (
                            <li key={doc.id} className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div 
                                        className={`w-full p-14 rounded-[4rem] transition-all duration-700 flex items-center justify-between group border-2 cursor-pointer relative overflow-hidden ${isSelected ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400 shadow-2xl shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-md hover:shadow-3xl hover:-translate-y-3'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                                        )}
                                        
                                        <div className="flex items-center space-x-14 relative z-10">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-12 h-12 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-700 ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-600/50 scale-125 rotate-12' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:scale-125 hover:rotate-6'}`}
                                                >
                                                    {isSelected && <CheckCircleIcon className="w-8 h-8 text-white" />}
                                                </div>
                                            )}
                                            <div className={`p-10 rounded-[3rem] border-2 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-12 ${isAggregate ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 shadow-2xl shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-inner'}`}>
                                                {isAggregate ? <SparklesIcon className="h-14 w-14" /> : <FileIcon className="h-14 w-14" />}
                                            </div>
                                            <div className="space-y-6">
                                                <p className="font-serif font-black text-slate-900 dark:text-slate-100 truncate max-w-[250px] md:max-w-xl tracking-tighter m-0 text-4xl leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500">{doc.name}</p>
                                                <div className="flex items-center space-x-10">
                                                    <div className="flex items-center space-x-4">
                                                        <CalendarIcon className="w-6 h-6 text-slate-400 opacity-60" />
                                                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em]">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    </div>
                                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner"></div>
                                                    <div className="flex items-center space-x-4">
                                                        <FingerPrintIcon className="w-6 h-6 text-slate-400 opacity-60" />
                                                        <span className="text-[13px] font-mono font-black text-slate-400 uppercase tracking-widest">{doc.id.substring(0,12)}</span>
                                                    </div>
                                                    {isAggregate && (
                                                        <span className="bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 px-6 py-2.5 rounded-[1.25rem] border-2 border-rose-200 dark:border-rose-800 text-[12px] font-black tracking-[0.3em] uppercase shadow-lg shadow-rose-500/10">DUEL_RESULT</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-20 relative z-10">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 opacity-70">Riskfaktor</p>
                                                <div className="flex items-center justify-end space-x-8">
                                                    <span className={`text-5xl font-serif font-black tracking-tighter ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`}>
                                                        {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                                    </span>
                                                    <div className="w-4 h-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border-2 border-slate-200/50 dark:border-slate-700/50 relative">
                                                        <div 
                                                            className={`w-full transition-all duration-1000 ease-out absolute bottom-0 left-0 ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.8)]' : 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.8)]'}`}
                                                            style={{ height: `${doc.analysis?.riskProfile?.normalizedScore || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-7 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-inner group-hover:shadow-[0_20px_50px_rgba(79,70,229,0.5)] group-hover:scale-110 group-hover:rotate-12 border-2 border-slate-100 dark:border-slate-700 group-hover:border-indigo-400">
                                                <ArrowPathIcon className="h-12 w-12 text-slate-300 group-hover:text-white transition-colors duration-500" />
                                            </div>
                                        </div>
                                    </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-56 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
                        <div className="relative inline-block mb-12">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse"></div>
                            <FileIcon className="h-32 w-32 mx-auto opacity-10 relative z-10" />
                        </div>
                        <p className="text-base font-black uppercase tracking-[0.6em] opacity-40 relative z-10">Väntar på indata</p>
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
        blue: 'border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-[0_20px_60px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_90px_rgba(79,70,229,0.15)]',
        emerald: 'border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-[0_20px_60px_rgba(16,185,129,0.08)] hover:shadow-[0_40px_90px_rgba(16,185,129,0.15)]',
        indigo: 'border-rose-100 dark:border-rose-900/40 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:border-rose-500 dark:hover:border-rose-500 shadow-[0_20px_60px_rgba(244,63,94,0.08)] hover:shadow-[0_40px_90px_rgba(244,63,94,0.15)]'
    };

    const iconBg = {
        blue: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/10',
        emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10',
        indigo: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-900/10'
    };

    return (
        <div 
            onClick={onClick}
            className={`p-16 rounded-[5rem] border-2 transition-all duration-700 cursor-pointer group flex items-center space-x-14 shadow-md hover:-translate-y-4 relative overflow-hidden ${colors[color]}`}
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-current opacity-[0.05] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className={`p-10 ${iconBg[color]} rounded-[3rem] border-2 border-current/10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-inner relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {React.cloneElement(icon, { className: 'w-12 h-12 relative z-10' })}
            </div>
            <div className="space-y-4">
                <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-4xl tracking-tighter m-0 leading-none group-hover:translate-x-2 transition-transform duration-500">{label}</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.4em] opacity-90">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;