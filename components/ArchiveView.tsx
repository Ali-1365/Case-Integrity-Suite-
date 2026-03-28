
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
                <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-[1.5rem] border shadow-2xl animate-in slide-in-from-right-10 duration-700 backdrop-blur-md ${
                    statusMessage.type === 'success' ? 'bg-white/90 text-emerald-600 border-emerald-100' : 'bg-white/90 text-rose-600 border-rose-100'
                }`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${statusMessage.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {statusMessage.text}
                    </p>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--ink-main)]/60 backdrop-blur-xl p-6 animate-in fade-in duration-700">
                    <div className="bg-[var(--bg-main)] rounded-[3rem] p-12 max-w-md w-full border border-[var(--border)] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-8 mx-auto border border-rose-100 shadow-inner">
                            <Trash2 className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--ink-main)] text-center mb-4 tracking-tighter font-serif italic uppercase">Radera ärende?</h3>
                        <p className="text-sm text-[var(--ink-muted)] text-center mb-10 leading-relaxed font-medium">
                            Är du säker på att du vill radera detta ärende permanent? Denna åtgärd kan inte ångras.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="py-4 bg-[var(--bg-card)] text-[var(--ink-muted)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--bg-main)] transition-all border border-[var(--border)] active:scale-95 shadow-sm"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95"
                            >
                                Radera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter font-serif italic uppercase">Ärendearkiv</h3>
                    <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-[0.3em] opacity-70">Historik över alla analyserade ärenden.</p>
                </div>
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Sök ärende..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] py-4 pl-14 pr-6 text-sm focus:border-[var(--accent)] outline-none transition-all shadow-sm placeholder-[var(--ink-muted)]/40 font-medium"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-[var(--bg-card)]/30 rounded-[3rem] border-2 border-dashed border-[var(--border)]">
                    <Loader2 className="w-12 h-12 text-[var(--accent)] mb-6 animate-spin" />
                    <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Laddar arkiv...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredDocs.map(doc => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/30 transition-all cursor-pointer group flex items-center justify-between shadow-sm hover:shadow-xl active:scale-[0.99] relative overflow-hidden"
                        >
                            {/* Decorative background element */}
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                <Archive className="w-40 h-40" />
                            </div>

                            <div className="flex items-center gap-8 relative z-10">
                                <div className="p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner group-hover:scale-110 duration-500">
                                    <Archive className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-[var(--ink-main)] tracking-tighter leading-none font-serif italic uppercase">{doc.name}</h4>
                                    <div className="flex items-center gap-6 text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[var(--accent)]/60" />
                                            <span>{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[var(--accent)]/60" />
                                            <span>{doc.textContent.length.toLocaleString()} tecken</span>
                                        </div>
                                        <span className="font-mono opacity-40 bg-[var(--bg-main)] px-2 py-0.5 rounded-lg border border-[var(--border)]">ID: {doc.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 relative z-10">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(doc.id);
                                    }}
                                    className="p-4 text-[var(--ink-muted)] hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100 active:scale-90"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                                <div className="p-4 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] group-hover:border-[var(--accent)]/20 shadow-sm group-hover:translate-x-2 duration-500">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--bg-card)]/30 border-2 border-dashed border-[var(--border)] rounded-[3rem] py-32 text-center animate-in fade-in duration-1000">
                    <div className="w-24 h-24 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-8 mx-auto border border-[var(--border)] shadow-inner">
                        <Archive className="w-12 h-12 text-[var(--ink-muted)]/20" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--ink-muted)] mb-3 tracking-tighter font-serif italic uppercase">Arkivet är tomt</h3>
                    <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] opacity-40">Inga ärenden matchar din sökning.</p>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
