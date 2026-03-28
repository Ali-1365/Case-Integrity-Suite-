import React, { useState } from 'react';
import { StoredDocument, ParsedDocument, LegalCorpus } from '../types';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import Card from './shared/Card';
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  MessageSquare, 
  Activity, 
  Scale, 
  Calendar, 
  Fingerprint,
  Plus,
  ArrowRight,
  BookOpen
} from 'lucide-react';
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
    <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
      <PipelineStatus status={pipelineStatus} />

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction 
            icon={<MessageSquare />} 
            label="Analysera Ärende" 
            sub="Djupanalys av valt ärende" 
            color="blue"
            onClick={() => onAction('arch')}
          />
          <QuickAction 
            icon={<ShieldCheck />} 
            label="Integritet" 
            sub="Verifiera forensisk kedja" 
            color="emerald"
            onClick={() => onAction('integrity')}
          />
          <QuickAction 
            icon={<Activity />} 
            label="Telemetri" 
            sub="Monitorera AI-noder" 
            color="indigo"
            onClick={() => onAction('monitor')}
          />
      </div>

      {/* Duel Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-[var(--ink-main)] rounded-[3rem] p-10 animate-in slide-in-from-bottom-10 duration-1000 flex flex-col md:flex-row justify-between items-center gap-10 border border-[var(--border)] shadow-2xl relative overflow-hidden group">
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                  <Sparkles className="w-48 h-48 text-white" />
              </div>

              <div className="flex items-center space-x-8 relative z-10">
                  <div className="p-5 bg-white/10 rounded-[1.5rem] border border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white tracking-tighter font-serif italic uppercase">Klar för korsanalys</h3>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{selectedIds.length} dokument valda för Batch-validering.</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-white text-[var(--ink-main)] px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center space-x-4 shrink-0 active:scale-95 disabled:opacity-50 shadow-2xl relative z-10"
              >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Exekvera Duel</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-8 sticky top-24">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full py-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] text-[var(--ink-muted)] hover:bg-[var(--bg-main)] transition-all flex items-center justify-center space-x-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm active:scale-95 group">
                <HelpCircle className="h-5 w-5 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors" />
                <span>Systemguide</span>
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <Card title="Ärendehistorik" icon={<FileText className="w-6 h-6" />}>
                {documents.length > 0 ? (
                    <ul className="divide-y divide-[var(--border)] max-h-[75vh] overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/10 rounded-[2rem]">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        
                        return (
                            <li key={doc.id} className="animate-in fade-in duration-500">
                                    <div 
                                        className={`w-full p-8 transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden ${isSelected ? 'bg-[var(--bg-main)]' : 'bg-transparent hover:bg-[var(--bg-main)]/50'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <div className="flex items-center space-x-8 relative z-10">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]/50'}`}
                                                >
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                            )}
                                            <div className={`p-4 rounded-[1.25rem] border transition-all shadow-inner group-hover:scale-110 duration-500 ${isAggregate ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)]'}`}>
                                                {isAggregate ? <Sparkles className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-black text-[var(--ink-main)] truncate max-w-[250px] md:max-w-lg tracking-tighter m-0 text-xl leading-none group-hover:text-[var(--accent)] transition-colors font-serif italic uppercase">{doc.name}</p>
                                                <div className="flex items-center space-x-6">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4 text-[var(--ink-muted)]/40" />
                                                        <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Fingerprint className="w-4 h-4 text-[var(--ink-muted)]/40" />
                                                        <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-40 bg-[var(--bg-main)] px-2 py-0.5 rounded-lg border border-[var(--border)]">{doc.id.substring(0,8)}</span>
                                                    </div>
                                                    {isAggregate && (
                                                        <span className="bg-rose-500 text-white text-[8px] font-black tracking-[0.3em] uppercase px-2 py-0.5 rounded-full shadow-sm">DUEL</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-10 relative z-10">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2 opacity-60">Riskprofil</p>
                                                <div className="flex items-center justify-end space-x-4">
                                                    <span className={`text-2xl font-black tracking-tighter font-serif italic ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'text-rose-500' : 'text-[var(--ink-main)]'}`}>
                                                        {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                                    </span>
                                                    <div className="w-2 h-10 bg-[var(--bg-main)] rounded-full overflow-hidden relative border border-[var(--border)] shadow-inner">
                                                        <div 
                                                            className={`w-full transition-all duration-1000 absolute bottom-0 left-0 ${doc.analysis?.riskProfile?.normalizedScore > 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]'}`}
                                                            style={{ height: `${doc.analysis?.riskProfile?.normalizedScore || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl text-[var(--ink-muted)]/40 group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border border-transparent group-hover:border-[var(--border)] group-hover:translate-x-2 duration-500">
                                                <ArrowRight className="h-6 w-6" />
                                            </div>
                                        </div>

                                        {/* Decorative background element */}
                                        <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                            <FileText className="w-40 h-40" />
                                        </div>
                                    </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-32 text-[var(--ink-muted)] bg-[var(--bg-main)]/30 rounded-[3rem] border-2 border-dashed border-[var(--border)] animate-in fade-in duration-1000">
                        <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-8 mx-auto border border-[var(--border)] shadow-inner">
                            <FileText className="h-12 w-12 opacity-[0.05]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Väntar på indata</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, sub: string, color: 'blue' | 'emerald' | 'indigo', onClick?: () => void }> = ({ icon, label, sub, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-card)] transition-all cursor-pointer group flex items-center space-x-6 hover:border-[var(--accent)]/30 hover:shadow-2xl active:scale-95 relative overflow-hidden"
        >
            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                {React.cloneElement(icon, { className: 'w-24 h-24' })}
            </div>

            <div className="p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner group-hover:scale-110 group-hover:rotate-12 duration-700 relative z-10">
                {React.cloneElement(icon, { className: 'w-8 h-8' })}
            </div>
            <div className="space-y-2 relative z-10">
                <h4 className="font-black text-[var(--ink-main)] text-xl tracking-tighter m-0 leading-none font-serif italic uppercase">{label}</h4>
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-60">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;