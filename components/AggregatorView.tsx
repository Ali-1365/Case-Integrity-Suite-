
import React, { useState } from 'react';
import { StoredDocument } from '../types';
import { 
    Zap, 
    FileText, 
    CheckCircle, 
    AlertTriangle, 
    ArrowRight,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

interface AggregatorViewProps {
    documents: StoredDocument[];
    onAggregate: (ids: string[]) => void;
    isProcessing: boolean;
}

export const AggregatorView: React.FC<AggregatorViewProps> = ({ documents, onAggregate, isProcessing }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleRun = () => {
        if (selectedIds.length < 2) return;
        onAggregate(selectedIds);
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-10 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                    <Zap className="w-48 h-48 text-[var(--accent)]" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[var(--accent)]/10 rounded-2xl text-[var(--accent)] border border-[var(--accent)]/20 shadow-inner">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-[var(--ink-main)] tracking-tight uppercase italic">Mega-Aggregator v.7.2</h2>
                    </div>
                    <p className="text-base text-[var(--ink-muted)] leading-relaxed font-medium">
                        Slå samman flera juridiska dokument till en enhetlig bevisbild. Systemet identifierar motsägelser, 
                        gemensamma nämnare och skapar en kors-korrelerad analys av hela materialet.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black text-[var(--ink-light)] uppercase tracking-[0.25em]">Välj dokument för aggregation</h3>
                        <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/10 uppercase tracking-widest">
                            {selectedIds.length} valda
                        </span>
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-[var(--border)]">
                            {documents.length === 0 ? (
                                <div className="p-20 text-center opacity-30 italic text-[var(--ink-muted)]">
                                    Inga dokument tillgängliga i systemet.
                                </div>
                            ) : (
                                documents.filter(d => d.mimeType !== 'application/aggregate').map(doc => {
                                    const isSelected = selectedIds.includes(doc.id);
                                    return (
                                        <div 
                                            key={doc.id} 
                                            onClick={() => toggleSelection(doc.id)}
                                            className={`p-6 flex items-center justify-between cursor-pointer transition-all group ${isSelected ? 'bg-[var(--bg-main)]' : 'hover:bg-[var(--bg-main)]/50'}`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--ink-main)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{doc.name}</p>
                                                    <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest mt-1 opacity-60">
                                                        {new Date(doc.createdAt).toLocaleDateString()} • {doc.id.substring(0,8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[var(--ink-main)] p-10 rounded-3xl border border-[var(--border)] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.25em] mb-6">Aggregation Control</h4>
                            <div className="space-y-6 mb-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Min. Dokument</span>
                                    <span className="text-xs font-black text-white">2</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Korsanalys</span>
                                    <span className="text-xs font-black text-[var(--success)]">AKTIV</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Integritet</span>
                                    <span className="text-xs font-black text-[var(--success)]">SHA-256</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleRun}
                                disabled={selectedIds.length < 2 || isProcessing}
                                className="w-full bg-white text-[var(--ink-main)] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                                <span>Exekvera Aggregation</span>
                            </button>
                            
                            {selectedIds.length < 2 && (
                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest text-center mt-4">
                                    Välj minst 2 dokument för att starta
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                            <h5 className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-widest">Viktig Information</h5>
                        </div>
                        <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed font-medium italic">
                            "Mega-Aggregatorn använder avancerad NLP för att identifiera semantiska kopplingar mellan dokument. 
                            Resultatet sparas som ett nytt aggregat-dokument i din historik."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
