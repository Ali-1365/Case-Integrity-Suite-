
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
        <div className="space-y-20 animate-in fade-in duration-1000 relative pb-32">
            {statusMessage && (
                <div className={`fixed top-20 right-20 z-50 px-12 py-6 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-2 animate-in slide-in-from-right-20 duration-1000 backdrop-blur-2xl ${
                    statusMessage.type === 'success' ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/40' : 'bg-rose-600/95 text-white border-rose-400 shadow-rose-500/40'
                }`}>
                    <p className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-6">
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        {statusMessage.text}
                    </p>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-12 animate-in fade-in duration-1000">
                    <div className="bg-white dark:bg-slate-900 rounded-[6rem] p-20 max-w-2xl w-full border-2 border-slate-100 dark:border-slate-800 shadow-[0_80px_200px_-30px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 opacity-90" />
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/15 rounded-full blur-[100px] group-hover:bg-rose-500/25 transition-colors duration-1000" />
                        
                        <div className="w-28 h-28 bg-rose-500/10 rounded-[3rem] flex items-center justify-center mb-12 mx-auto border-2 border-rose-500/30 shadow-inner relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                            <TrashIcon className="w-14 h-14 text-rose-500 animate-bounce" />
                        </div>
                        <h3 className="text-5xl font-serif font-black text-slate-900 dark:text-white text-center mb-8 tracking-tighter relative z-10 leading-none">Radera ärende?</h3>
                        <p className="text-2xl text-slate-500 dark:text-slate-400 text-center mb-16 leading-relaxed font-medium relative z-10 px-8">
                            Är du säker på att du vill radera detta ärende permanent? Denna åtgärd kan inte ångras och all forensisk data försvinner.
                        </p>
                        <div className="grid grid-cols-2 gap-10 relative z-10">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="py-7 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[3rem] text-[13px] font-black uppercase tracking-[0.4em] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border-2 border-slate-100 dark:border-slate-700 active:scale-95 shadow-md hover:shadow-2xl"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="py-7 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-[3rem] text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_30px_70px_-10px_rgba(225,29,72,0.6)] hover:shadow-[0_50px_100px_-10px_rgba(225,29,72,0.8)] transition-all active:scale-95 border-2 border-rose-400/40"
                            >
                                Radera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                <div className="space-y-4">
                    <h3 className="text-6xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Ärendearkiv</h3>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-16 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <p className="text-[13px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-[0.5em] opacity-100">Historik över alla analyserade och låsta ärenden.</p>
                    </div>
                </div>
                <div className="relative w-full lg:w-[600px] group">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-[4rem] blur-3xl group-focus-within:bg-indigo-500/20 transition-all duration-1000" />
                    <MagnifyingGlassIcon className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 group-focus-within:text-indigo-500 group-focus-within:scale-125 transition-all duration-700" />
                    <input 
                        type="text"
                        placeholder="Sök ärende eller ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[4rem] py-8 pl-24 pr-12 text-2xl focus:ring-12 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-md hover:shadow-3xl placeholder-slate-400 relative z-10 font-serif tracking-tight"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-indigo-500/40 blur-[80px] rounded-full animate-pulse"></div>
                        <div className="p-12 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-indigo-100 dark:border-indigo-900 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative z-10">
                            <Spinner className="w-24 h-24 text-indigo-500" />
                        </div>
                    </div>
                    <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.8em] animate-pulse">Laddar arkiv...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-10">
                    {filteredDocs.map(doc => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[5rem] p-12 hover:border-indigo-500/60 transition-all cursor-pointer group flex items-center justify-between shadow-md hover:shadow-[0_60px_150px_-30px_rgba(0,0,0,0.15)] hover:-translate-y-4 duration-1000 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_25px_rgba(99,102,241,0.7)]" />
                            
                            <div className="flex items-center gap-12 relative z-10">
                                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-500/15 transition-all duration-1000 border-2 border-slate-50 dark:border-slate-700 group-hover:border-indigo-500/30 shadow-inner group-hover:scale-125 group-hover:rotate-12">
                                    <ArchiveBoxIcon className="w-14 h-14" />
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-4xl font-serif font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500 tracking-tighter leading-none">{doc.name}</h4>
                                    <div className="flex flex-wrap items-center gap-10 text-[13px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] opacity-90">
                                        <div className="flex items-center gap-4">
                                            <CalendarIcon className="w-6 h-6 text-indigo-500/70" />
                                            <span>{new Date(doc.createdAt).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner" />
                                        <div className="flex items-center gap-4">
                                            <DocumentTextIcon className="w-6 h-6 text-indigo-500/70" />
                                            <span>{doc.textContent.length.toLocaleString()} tecken</span>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4">
                                            <span className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-mono tracking-widest shadow-sm">ID: {doc.id.substring(0, 12)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 relative z-10">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(doc.id);
                                    }}
                                    className="p-6 text-slate-400 hover:text-rose-500 hover:bg-rose-500/15 rounded-[2rem] transition-all border-2 border-transparent hover:border-rose-500/30 active:scale-90 hover:shadow-2xl group/del"
                                >
                                    <TrashIcon className="w-8 h-8 group-hover/del:rotate-12 transition-transform" />
                                </button>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-400 transition-all duration-1000 shadow-inner group-hover:shadow-[0_30px_70px_rgba(79,70,229,0.5)] group-hover:scale-110 group-hover:rotate-12">
                                    <ChevronRightIcon className="w-10 h-10 group-hover:translate-x-2 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 border-8 border-dashed border-slate-100 dark:border-slate-800 rounded-[6rem] p-64 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="relative z-10">
                        <div className="relative inline-block mb-16">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
                            <ArchiveBoxIcon className="w-44 h-44 text-slate-200 dark:text-slate-800 mx-auto transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12 group-hover:text-indigo-200 dark:group-hover:text-indigo-900" />
                        </div>
                        <h3 className="text-6xl font-serif font-black text-slate-400 dark:text-slate-600 mb-8 tracking-tighter leading-none">Arkivet är tomt</h3>
                        <p className="text-2xl text-slate-500 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium opacity-60">Inga ärenden matchar din sökning eller har arkiverats ännu. Starta en analys för att börja bygga ditt arkiv.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
