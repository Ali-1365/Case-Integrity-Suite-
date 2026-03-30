
import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { StoredDocument } from '../types';
import { 
    Archive, 
    FileText, 
    Trash2, 
    Search,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';

interface ArchiveViewProps {
    onSelect: (id: string) => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ onSelect }) => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            try {
                const allDocs = await db.getAllDocuments();
                setDocuments(allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to load archived documents:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDocs().catch(err => console.error("Unhandled error in loadDocs:", err));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await db.deleteDocument(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
            setStatusMessage({ text: "Ärendet raderat permanent.", type: 'success' });
        } catch (error) {
            console.error(`Failed to delete document ${id}:`, error);
            setStatusMessage({ text: "Kunde inte radera ärendet.", type: 'error' });
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-1000 relative pb-20">
            {statusMessage && (
                <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-none border-2 shadow-2xl animate-in slide-in-from-right-10 duration-700 backdrop-blur-md ${
                    statusMessage.type === 'success' ? 'bg-[var(--bg-card)]/90 text-[var(--success)] border-[var(--success)]' : 'bg-[var(--bg-card)]/90 text-[var(--danger)] border-[var(--danger)]'
                }`}>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 italic">
                        <span className={`w-3 h-3 rounded-none ${statusMessage.type === 'success' ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--danger)]'}`} />
                        {statusMessage.text}
                    </p>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--ink-main)]/60 backdrop-blur-md p-6 animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] rounded-none p-12 max-w-md w-full border-4 border-[var(--ink-main)] shadow-[20px_20px_0px_rgba(0,0,0,0.1)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[var(--danger)]/10 rounded-none flex items-center justify-center mb-8 mx-auto border-2 border-[var(--danger)]">
                            <Trash2 className="w-10 h-10 text-[var(--danger)]" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--ink-main)] text-center mb-4 tracking-tight uppercase italic">Destruera Ärende?</h3>
                        <p className="text-xs text-[var(--ink-muted)] text-center mb-10 leading-relaxed font-black uppercase tracking-widest opacity-70">
                            VARNING: Denna åtgärd raderar all forensisk data permanent från systemets lokala noder.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-6 py-4 border-2 border-[var(--border)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] transition-all"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="px-6 py-4 bg-[var(--danger)] text-[var(--accent-foreground)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--danger)]/90 transition-all shadow-lg"
                            >
                                Bekräfta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b-4 border-[var(--ink-main)] pb-10">
                <div className="space-y-2">
                    <h3 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Ärendearkiv <span className="text-[var(--accent)] opacity-30">v.9.0</span></h3>
                    <div className="flex items-center gap-4">
                        <p className="text-[11px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] opacity-70">Centralt valv för krypterade juridiska utredningar.</p>
                        <div className="h-px w-20 bg-[var(--border)]" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[var(--success)] animate-pulse" />
                            <span className="text-[9px] font-mono font-black text-[var(--success)] uppercase">Vault Secure</span>
                        </div>
                    </div>
                </div>
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="SÖK I VALVET..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border-2 border-[var(--border)] px-14 py-5 font-mono text-sm font-black focus:outline-none focus:border-[var(--ink-main)] transition-all placeholder:opacity-30 uppercase tracking-widest"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-[var(--bg-card)] border-4 border-dashed border-[var(--border)]">
                    <Loader2 className="w-12 h-12 text-[var(--accent)] mb-6 animate-spin" />
                    <p className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] animate-pulse">Dekrypterar arkivnoder...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="border-x-2 border-t-2 border-[var(--border)] divide-y-2 divide-[var(--border)]">
                    <div className="grid grid-cols-12 gap-4 p-6 bg-[var(--bg-main)] border-b-2 border-[var(--ink-main)]">
                        <div className="col-span-1 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Node</div>
                        <div className="col-span-5 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Ärendebeteckning</div>
                        <div className="col-span-2 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic text-center">Integritet</div>
                        <div className="col-span-2 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic text-center">Risk</div>
                        <div className="col-span-2 text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic text-right">Åtgärder</div>
                    </div>
                    {filteredDocs.map((doc, idx) => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="grid grid-cols-12 gap-4 p-8 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] transition-all cursor-pointer group items-center relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="col-span-1 font-mono text-[11px] font-black text-[var(--ink-muted)] opacity-40">
                                0{idx + 1}
                            </div>
                            
                            <div className="col-span-5 flex items-center gap-6">
                                <div className="p-4 bg-[var(--bg-main)] border-2 border-[var(--border)] text-[var(--ink-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all shadow-inner">
                                    <Archive className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-[var(--ink-main)] tracking-tight uppercase italic group-hover:translate-x-1 transition-transform duration-500">{doc.name}</h4>
                                    <div className="flex items-center gap-5 text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                                            <span>{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                                            <span>{doc.textContent.length.toLocaleString()} BYTES</span>
                                        </div>
                                        <span className="font-mono opacity-60 bg-[var(--bg-main)] px-2 py-0.5 border border-[var(--border)]">HEX:{doc.id.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 flex flex-col items-center gap-2">
                                <div className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-50">Integritet</div>
                                <div className="px-3 py-1 bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-[10px] font-black uppercase tracking-widest">Verifierad</div>
                            </div>

                            <div className="col-span-2 flex flex-col items-center gap-2">
                                <div className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-50">Riskprofil</div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black font-mono ${
                                        (doc.analysis?.riskProfile?.normalizedScore || 0) > 70 ? 'text-[var(--danger)]' : 
                                        (doc.analysis?.riskProfile?.normalizedScore || 0) > 40 ? 'text-[var(--warning)]' : 
                                        'text-[var(--success)]'
                                    }`}>
                                        {(doc.analysis?.riskProfile?.normalizedScore || 0).toString().padStart(2, '0')}%
                                    </span>
                                    <div className="w-1.5 h-6 bg-[var(--bg-main)] border border-[var(--border)] overflow-hidden relative">
                                        <div 
                                            className={`w-full transition-all duration-1000 absolute bottom-0 left-0 ${
                                                (doc.analysis?.riskProfile?.normalizedScore || 0) > 70 ? 'bg-[var(--danger)]' : 
                                                (doc.analysis?.riskProfile?.normalizedScore || 0) > 40 ? 'bg-[var(--warning)]' : 
                                                'bg-[var(--success)]'
                                            }`}
                                            style={{ height: `${doc.analysis?.riskProfile?.normalizedScore || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center justify-end gap-4">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(doc.id);
                                    }}
                                    className="p-4 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-all hover:bg-[var(--danger)]/5 border-2 border-transparent hover:border-[var(--danger)]/20 active:scale-90"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="p-4 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] border-2 border-[var(--border)] group-hover:border-[var(--accent)]/40 shadow-sm group-hover:translate-x-2 duration-500">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--bg-card)] border-4 border-dashed border-[var(--border)] py-32 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-[var(--bg-main)] border-2 border-[var(--border)] flex items-center justify-center mb-8 mx-auto shadow-inner">
                        <Archive className="w-12 h-12 text-[var(--ink-muted)]/20" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--ink-muted)] mb-4 tracking-tighter uppercase italic">Valvet är tomt</h3>
                    <p className="text-[11px] text-[var(--ink-muted)] font-black uppercase tracking-[0.4em] opacity-40">Inga matchande ärendekoder hittades i systemet.</p>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
