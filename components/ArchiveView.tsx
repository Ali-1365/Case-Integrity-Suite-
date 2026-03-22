
import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { StoredDocument } from '../types';
import { 
    ArchiveBoxIcon, 
    DocumentTextIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    CalendarIcon,
    ChevronRightIcon,
    Spinner
} from './icons';

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
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {statusMessage && (
                <div className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-8 duration-300 ${
                    statusMessage.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                }`}>
                    <p className="text-xs font-black uppercase tracking-widest">{statusMessage.text}</p>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <TrashIcon className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-serif text-slate-900 dark:text-white text-center mb-2">Radera ärende?</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-500 text-center mb-8">
                            Är du säker på att du vill radera detta ärende permanent? Denna åtgärd kan inte ångras.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all"
                            >
                                Radera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-2xl font-serif font-medium text-slate-900 dark:text-white">Ärendearkiv</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Historik över alla analyserade och låsta ärenden.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Sök ärende eller ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center">
                    <Spinner className="w-12 h-12 text-cyan-500 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Laddar arkiv...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDocs.map(doc => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl text-slate-400 group-hover:text-cyan-500 transition-colors">
                                    <ArchiveBoxIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-400 transition-colors">{doc.name}</h4>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DocumentTextIcon className="w-3.5 h-3.5" />
                                            <span>{doc.textContent.length.toLocaleString()} tecken</span>
                                        </div>
                                        <div className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            ID: {doc.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(doc.id);
                                    }}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                <ChevronRightIcon className="w-6 h-6 text-slate-300 dark:text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-dashed border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-24 text-center">
                    <ArchiveBoxIcon className="w-16 h-16 text-slate-300 dark:text-gray-800 mx-auto mb-6" />
                    <h3 className="text-xl font-serif text-slate-400">Arkivet är tomt</h3>
                    <p className="text-sm text-slate-500 mt-2">Inga ärenden matchar din sökning eller har arkiverats ännu.</p>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
