
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
                <div className={`fixed top-10 right-10 z-[100] px-6 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-right-10 duration-700 backdrop-blur-md ${
                    statusMessage.type === 'success' ? 'bg-white/90 text-[var(--success)] border-[var(--success)]/20' : 'bg-white/90 text-[var(--danger)] border-[var(--danger)]/20'
                }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${statusMessage.type === 'success' ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--danger)]'}`} />
                        {statusMessage.text}
                    </p>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--ink-main)]/40 backdrop-blur-sm p-6 animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] rounded-2xl p-10 max-w-md w-full border border-[var(--border)] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-[var(--danger)]/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-[var(--danger)]/10">
                            <Trash2 className="w-8 h-8 text-[var(--danger)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--ink-main)] text-center mb-2 tracking-tight uppercase">Radera ärende?</h3>
                        <p className="text-sm text-[var(--ink-muted)] text-center mb-8 leading-relaxed font-medium">
                            Är du säker på att du vill radera detta ärende permanent? Denna åtgärd kan inte ångras.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="btn btn-secondary"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="btn bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                            >
                                Radera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[var(--ink-main)] tracking-tight uppercase">Ärendearkiv</h3>
                    <p className="text-[10px] text-[var(--ink-muted)] uppercase font-bold tracking-widest opacity-70">Historik över alla analyserade ärenden.</p>
                </div>
                <div className="relative w-full md:w-[360px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Sök ärende..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field pl-11"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-[var(--bg-card)]/30 rounded-2xl border-2 border-dashed border-[var(--border)]">
                    <Loader2 className="w-10 h-10 text-[var(--accent)] mb-4 animate-spin" />
                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest">Laddar arkiv...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDocs.map(doc => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--accent)]/30 transition-all cursor-pointer group flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.99] relative overflow-hidden"
                        >
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all shadow-inner group-hover:scale-105 duration-500">
                                    <Archive className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-[var(--ink-main)] tracking-tight leading-none uppercase">{doc.name}</h4>
                                    <div className="flex items-center gap-5 text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]/60" />
                                            <span>{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-[var(--accent)]/60" />
                                            <span>{doc.textContent.length.toLocaleString()} tecken</span>
                                        </div>
                                        <span className="font-mono opacity-60 bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--border)]">ID: {doc.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-1.5 opacity-60">Riskprofil</p>
                                        <div className="flex items-center justify-end space-x-3">
                                            <span className={`text-xl font-bold tracking-tight ${
                                                (doc.analysis?.riskProfile?.normalizedScore || 0) > 70 ? 'text-[var(--danger)]' : 
                                                (doc.analysis?.riskProfile?.normalizedScore || 0) > 40 ? 'text-[var(--warning)]' : 
                                                'text-[var(--success)]'
                                            }`}>
                                                {doc.analysis?.riskProfile?.normalizedScore || 0}%
                                            </span>
                                            <div className="w-1.5 h-8 bg-[var(--bg-main)] rounded-full overflow-hidden relative border border-[var(--border)] shadow-inner">
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
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(doc.id);
                                        }}
                                        className="p-3 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-all hover:bg-[var(--danger)]/5 rounded-lg border border-transparent hover:border-[var(--danger)]/10 active:scale-90"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="p-3 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all bg-[var(--bg-main)] rounded-lg border border-[var(--border)] group-hover:border-[var(--accent)]/20 shadow-sm group-hover:translate-x-1 duration-500">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--bg-card)]/30 border-2 border-dashed border-[var(--border)] rounded-2xl py-24 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-6 mx-auto border border-[var(--border)] shadow-inner">
                        <Archive className="w-10 h-10 text-[var(--ink-muted)]/20" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--ink-muted)] mb-2 tracking-tight uppercase">Arkivet är tomt</h3>
                    <p className="text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest opacity-40">Inga ärenden matchar din sökning.</p>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
