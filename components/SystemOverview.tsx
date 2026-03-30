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
  BookOpen,
  Zap
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
    <div className="space-y-12 pb-20 animate-fade-in">
      <PipelineStatus status={pipelineStatus} />

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-[var(--border-strong)]">
          <QuickAction 
            icon={<MessageSquare />} 
            label="Analysera Ärende" 
            sub="Djupanalys av valt ärende" 
            onClick={() => onAction('arch')}
          />
          <QuickAction 
            icon={<ShieldCheck />} 
            label="Integritet" 
            sub="Verifiera forensisk kedja" 
            onClick={() => onAction('integrity')}
          />
          <QuickAction 
            icon={<Activity />} 
            label="Telemetri" 
            sub="Monitorera AI-noder" 
            onClick={() => onAction('monitor')}
          />
      </div>

      {/* Mega-Aggregator Initiation Bar */}
      {selectedIds.length >= 2 && (
          <div className="bg-[var(--ink-main)] p-8 flex flex-col md:flex-row justify-between items-center gap-8 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group animate-in slide-in-from-top-4 duration-700">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-48 w-48 text-[var(--accent)]" />
              </div>
              <div className="flex items-center space-x-6 relative z-10">
                  <div className="p-4 bg-[var(--bg-main)]/10 border border-[var(--bg-main)]/10 shadow-inner group-hover:scale-105 transition-all duration-500">
                      <Sparkles className="h-8 w-8 text-[var(--accent)]" />
                  </div>
                  <div className="space-y-1">
                      <h3 className="text-xl font-black text-[var(--accent-foreground)] tracking-tight uppercase italic">Mega-Aggregator v.7.2</h3>
                      <p className="text-[var(--accent-foreground)]/60 text-[10px] font-mono uppercase tracking-[0.2em]">{selectedIds.length} DOKUMENT VALDA FÖR KORS-KORRELERING</p>
                  </div>
              </div>
              <button 
                  onClick={() => onAggregateSelected(selectedIds)}
                  disabled={isProcessing}
                  className="bg-[var(--bg-card)] text-[var(--ink-main)] px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all flex items-center space-x-3 shrink-0 active:scale-95 disabled:opacity-50 shadow-xl relative z-10 group/btn"
              >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />}
                  <span>Exekvera Aggregation</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-4 sticky top-24">
             <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
             <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
             <button onClick={() => setGuideOpen(true)} className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--ink-muted)] hover:bg-[var(--bg-main)] transition-all flex items-center justify-center space-x-2.5 text-[9px] font-bold uppercase tracking-widest shadow-sm active:scale-95 group">
                <HelpCircle className="h-3.5 w-3.5 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors" />
                <span>Systemguide</span>
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <Card title="Ärendehistorik" icon={<FileText className="w-4 h-4" />}>
                {documents.length > 0 ? (
                    <ul className="divide-y divide-[var(--border-strong)] max-h-[75vh] overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/10">
                    {documents.map(doc => {
                        const isSelected = selectedIds.includes(doc.id);
                        const isAggregate = doc.mimeType === 'application/aggregate';
                        const riskScore = doc.analysis?.riskProfile?.normalizedScore || 0;
                        const riskColor = riskScore > 70 ? 'text-[var(--danger)]' : riskScore > 40 ? 'text-[var(--warning)]' : 'text-[var(--success)]';
                        const riskBg = riskScore > 70 ? 'bg-[var(--danger)]' : riskScore > 40 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]';
                        
                        return (
                            <li key={doc.id} className="animate-fade-in">
                                    <div 
                                        className={`w-full p-5 transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden border-l-2 ${isSelected ? 'bg-[var(--bg-main)] border-[var(--accent)]' : 'bg-transparent hover:bg-[var(--bg-main)]/50 border-transparent'}`}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <div className="flex items-center space-x-5 relative z-10">
                                            {!isAggregate && (
                                                <div 
                                                    onClick={(e) => toggleSelection(doc.id, e)}
                                                    className={`w-4 h-4 border flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border-strong)] hover:border-[var(--accent)]/50'}`}
                                                >
                                                    {isSelected && <CheckCircle className="w-3 h-3 text-[var(--accent-foreground)]" />}
                                                </div>
                                            )}
                                            <div className={`p-2.5 border transition-all shadow-inner group-hover:scale-105 duration-500 ${isAggregate ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)]'}`}>
                                                {isAggregate ? <Sparkles className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-[var(--ink-main)] truncate max-w-[200px] md:max-w-md tracking-tight m-0 text-base leading-none group-hover:text-[var(--accent)] transition-colors uppercase">{doc.name}</p>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-1.5">
                                                        <Calendar className="w-3 h-3 text-[var(--ink-muted)]/40" />
                                                        <span className="text-[8px] font-mono font-bold text-[var(--ink-muted)] uppercase tracking-widest opacity-60">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5">
                                                        <Fingerprint className="w-3 h-3 text-[var(--ink-muted)]/40" />
                                                        <span className="text-[8px] font-mono text-[var(--ink-muted)] uppercase tracking-widest opacity-40 bg-[var(--bg-main)] px-1.5 py-0.5 border border-[var(--border-strong)]">{doc.id.substring(0,8)}</span>
                                                    </div>
                                                    {isAggregate && (
                                                        <span className="bg-[var(--accent)] text-[var(--accent-foreground)] text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 shadow-sm">DUEL</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6 relative z-10">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[8px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-1 opacity-60">Riskprofil</p>
                                                <div className="flex items-center justify-end space-x-2.5">
                                                    <span className={`text-lg font-mono font-bold tracking-tight ${riskColor}`}>
                                                        {riskScore}%
                                                    </span>
                                                    <div className="w-1.5 h-7 bg-[var(--bg-main)] overflow-hidden relative border border-[var(--border-strong)] shadow-inner">
                                                        <div 
                                                            className={`w-full transition-all duration-1000 absolute bottom-0 left-0 ${riskBg}`}
                                                            style={{ height: `${riskScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2.5 text-[var(--ink-muted)]/40 group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border border-transparent group-hover:border-[var(--border-strong)] group-hover:translate-x-1 duration-500">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                            </li>
                        );
                    })}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-[var(--ink-muted)] bg-[var(--bg-main)]/30 border-2 border-dashed border-[var(--border-strong)] animate-fade-in">
                        <div className="w-14 h-14 bg-[var(--bg-card)] flex items-center justify-center mb-4 mx-auto border border-[var(--border-strong)] shadow-inner">
                            <FileText className="h-6 w-6 opacity-[0.05]" />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Väntar på indata</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="p-6 border-r border-b border-[var(--border-strong)] bg-[var(--bg-card)] transition-all cursor-pointer group flex items-center space-x-5 hover:bg-[var(--bg-main)] active:scale-95 relative overflow-hidden"
        >
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                {React.cloneElement(icon, { className: 'w-24 h-24' })}
            </div>
            <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner group-hover:scale-105 transition-all duration-500 relative z-10">
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <div className="space-y-1 relative z-10">
                <h4 className="font-black text-[var(--ink-main)] text-base tracking-tight m-0 leading-none uppercase italic">{label}</h4>
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest opacity-60">{sub}</p>
            </div>
        </div>
    );
};

export default SystemOverview;