import React, { useState, useMemo } from 'react';
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
  Zap,
  FolderOpen,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Archive,
  Search
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
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filter, setFilter] = useState('');

    const filteredDocs = useMemo(() => {
        return documents.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()));
    }, [documents, filter]);

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      <PipelineStatus status={pipelineStatus} />

      {/* MODERN QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernQuickAction 
            icon={<MessageSquare />} 
            label="Analysera Ärende" 
            sub="Djupanalys av valt ärende" 
            onClick={() => onAction('arch')}
            color="accent"
          />
          <ModernQuickAction 
            icon={<ShieldCheck />} 
            label="Integritet" 
            sub="Verifiera forensisk kedja" 
            onClick={() => onAction('integrity')}
            color="success"
          />
          <ModernQuickAction 
            icon={<Activity />} 
            label="Telemetri" 
            sub="Monitorera AI-noder" 
            onClick={() => onAction('monitor')}
            color="warning"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* MODERN FILE EXPLORER SIDEBAR */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-xl space-y-8 sticky top-28">
             <div className="space-y-2">
                <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] opacity-60">Inmatning</h3>
                <div className="space-y-4">
                    <FileUpload onFilesSelect={onFilesSelect} isParsing={isProcessing} parsingError={parsingError} />
                    <TextInput onTextSubmit={onTextSubmit} isProcessing={isProcessing} />
                </div>
             </div>

             <div className="h-px bg-[var(--border)] opacity-30"></div>

             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] opacity-60">Systemverktyg</h3>
                <div className="grid grid-cols-1 gap-2">
                    <SidebarButton icon={<BookOpen />} label="Juridiskt Ramverk" onClick={() => onAction('framework')} />
                    <SidebarButton icon={<Archive />} label="Ärendearkiv" onClick={() => onAction('arch')} />
                    <SidebarButton icon={<HelpCircle />} label="Systemguide" onClick={() => setGuideOpen(true)} />
                </div>
             </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* Mega-Aggregator Initiation Bar */}
            {selectedIds.length >= 2 && (
                <div className="bg-[var(--ink-main)] p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group animate-in slide-in-from-top-4 duration-700">
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
                        className="bg-white text-[var(--ink-main)] px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-white transition-all flex items-center space-x-3 shrink-0 active:scale-95 disabled:opacity-50 shadow-xl relative z-10 group/btn"
                    >
                        {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />}
                        <span>Exekvera Aggregation</span>
                    </button>
                </div>
            )}

            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-[var(--border-strong)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-main)]/50">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-[var(--ink-main)] uppercase tracking-tight italic">Ärendehistorik <span className="text-[var(--ink-muted)] opacity-40 ml-2">[{documents.length}]</span></h3>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-muted)] opacity-40" />
                            <input 
                                type="text" 
                                placeholder="Sök dokument..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] py-2 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex items-center bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-strong)] shadow-inner">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[var(--accent)] shadow-md' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[var(--accent)] shadow-md' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}><LayoutGrid className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    {filteredDocs.length > 0 ? (
                        <div className={viewMode === 'list' ? "divide-y divide-[var(--border-strong)]/50" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"}>
                            {filteredDocs.map(doc => (
                                <DocumentItem 
                                    key={doc.id} 
                                    doc={doc} 
                                    isSelected={selectedIds.includes(doc.id)} 
                                    onSelect={onSelectDocument} 
                                    onToggleSelection={toggleSelection}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 text-[var(--ink-muted)] bg-[var(--bg-main)]/30 border-2 border-dashed border-[var(--border-strong)] rounded-xl m-4 animate-fade-in">
                            <div className="w-20 h-20 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 mx-auto border border-[var(--border-strong)] shadow-inner">
                                <FileText className="h-8 w-8 opacity-[0.05]" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Inga dokument matchar sökningen</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      <SystemGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

const ModernQuickAction: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, sub: string, onClick?: () => void, color: string }> = ({ icon, label, sub, onClick, color }) => {
    return (
        <button 
            onClick={onClick}
            className="p-8 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl transition-all cursor-pointer group flex items-center space-x-6 hover:bg-[var(--bg-main)] active:scale-[0.98] relative overflow-hidden shadow-xl text-left"
        >
            <div className={`p-4 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner group-hover:scale-110 duration-500 relative z-10`}>
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div className="space-y-1 relative z-10">
                <h4 className="font-black text-[var(--ink-main)] text-lg tracking-tight m-0 leading-none uppercase italic group-hover:text-[var(--accent)] transition-colors">{label}</h4>
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest opacity-60">{sub}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                {React.cloneElement(icon, { className: 'w-24 h-24' })}
            </div>
        </button>
    );
};

const SidebarButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 group rounded-xl"
    >
        <div className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg group-hover:border-[var(--accent)]/30 transition-all">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-3.5 h-3.5' }) : icon}
        </div>
        <span>{label}</span>
    </button>
);

const DocumentItem: React.FC<{ doc: StoredDocument, isSelected: boolean, onSelect: (id: string) => void, onToggleSelection: (id: string, e: React.MouseEvent) => void, viewMode: 'list' | 'grid' }> = ({ doc, isSelected, onSelect, onToggleSelection, viewMode }) => {
    const isAggregate = doc.mimeType === 'application/aggregate';
    const riskScore = doc.analysis?.riskProfile?.normalizedScore || 0;
    const riskColor = riskScore > 70 ? 'text-[var(--danger)]' : riskScore > 40 ? 'text-[var(--warning)]' : 'text-[var(--success)]';
    const riskBg = riskScore > 70 ? 'bg-[var(--danger)]' : riskScore > 40 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]';

    if (viewMode === 'grid') {
        return (
            <div 
                onClick={() => onSelect(doc.id)}
                className={`p-6 rounded-xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full ${isSelected ? 'bg-[var(--bg-main)] border-[var(--accent)] shadow-lg' : 'bg-[var(--bg-card)] border-[var(--border-strong)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-main)]/50'}`}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl border transition-all shadow-inner ${isAggregate ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)]'}`}>
                        {isAggregate ? <Sparkles className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    {!isAggregate && (
                        <div 
                            onClick={(e) => onToggleSelection(doc.id, e)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-main)] border-[var(--border-strong)] hover:border-[var(--accent)]'}`}
                        >
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                    )}
                </div>
                <div className="space-y-2 flex-grow">
                    <h4 className="font-black text-[var(--ink-main)] text-sm uppercase tracking-tight leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">{doc.name}</h4>
                    <div className="flex items-center gap-3 opacity-60">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--border-strong)]/50 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[7px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-60">Riskprofil</p>
                        <p className={`text-xl font-mono font-black tracking-tighter ${riskColor}`}>{riskScore}%</p>
                    </div>
                    <div className="w-1.5 h-10 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-strong)] shadow-inner">
                        <div className={`w-full absolute bottom-0 left-0 transition-all duration-1000 ${riskBg}`} style={{ height: `${riskScore}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`w-full p-5 transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden border-l-4 ${isSelected ? 'bg-[var(--bg-main)] border-[var(--accent)]' : 'bg-transparent hover:bg-[var(--bg-main)]/50 border-transparent'}`}
            onClick={() => onSelect(doc.id)}
        >
            <div className="flex items-center space-x-6 relative z-10">
                {!isAggregate && (
                    <div 
                        onClick={(e) => onToggleSelection(doc.id, e)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border-strong)] hover:border-[var(--accent)]/50'}`}
                    >
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                )}
                <div className={`p-3 rounded-xl border transition-all shadow-inner group-hover:scale-110 duration-500 ${isAggregate ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)]'}`}>
                    {isAggregate ? <Sparkles className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                    <p className="font-black text-[var(--ink-main)] truncate max-w-[200px] md:max-w-md tracking-tight m-0 text-base leading-none group-hover:text-[var(--accent)] transition-colors uppercase italic">{doc.name}</p>
                    <div className="flex items-center space-x-4 opacity-60">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Fingerprint className="w-3 h-3" />
                            <span className="text-[8px] font-mono font-black uppercase tracking-widest">{doc.id.substring(0,8)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-8 relative z-10">
                <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-1 opacity-60">Riskprofil</p>
                    <div className="flex items-center justify-end space-x-3">
                        <span className={`text-2xl font-mono font-black tracking-tighter ${riskColor}`}>
                            {riskScore}%
                        </span>
                        <div className="w-2 h-8 bg-[var(--bg-main)] rounded-full overflow-hidden relative border border-[var(--border-strong)] shadow-inner">
                            <div 
                                className={`w-full transition-all duration-1000 absolute bottom-0 left-0 ${riskBg}`}
                                style={{ height: `${riskScore}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="p-3 text-[var(--ink-muted)]/40 group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border border-transparent group-hover:border-[var(--border-strong)] group-hover:translate-x-2 duration-500 rounded-xl">
                    <ArrowRight className="h-5 w-5" />
                </div>
            </div>
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