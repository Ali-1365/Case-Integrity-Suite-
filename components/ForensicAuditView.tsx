
import React from 'react';
import { AnalysisResult } from '../lib/cis.types';
import { 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    InformationCircleIcon, 
    SparklesIcon,
    CpuChipIcon,
    AlertIcon,
    CodeBracketIcon,
    DocumentTextIcon
} from './icons';

interface ForensicAuditViewProps {
    analysis: AnalysisResult;
}

const ForensicAuditView: React.FC<ForensicAuditViewProps> = ({ analysis }) => {
    const audit = analysis.audit;

    if (!audit) {
        return (
            <div className="p-16 text-center bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                <CpuChipIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                <p className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest">Ingen audit-data tillgänglig</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-4 font-medium">Kör om analysen i GOLD-läge för att generera verifieringsdata.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 relative z-10">CIS Integrity Score</span>
                    <div className="relative flex items-center justify-center z-10">
                        <svg className="w-40 h-40 transform -rotate-90 group-hover:scale-105 transition-transform duration-700">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                            <circle 
                                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                className={`${audit.integrityScore > 80 ? 'text-emerald-500' : audit.integrityScore > 50 ? 'text-amber-500' : 'text-rose-500'} drop-shadow-[0_0_8px_rgba(var(--color-current),0.5)]`}
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - audit.integrityScore / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{audit.integrityScore}%</span>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none md:col-span-2 relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-8 relative z-10">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                            <ShieldCheckIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Integritetskontroll & Regelefterlevnad</h3>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Algoritmisk Transparens</span>
                            <span className="text-[10px] font-black px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                                Verifierad Nivå 4 (GOLD)
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Immutable Log ID</span>
                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">{(analysis as { id: string }).id.substring(0,18)}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Verifieringstidpunkt</span>
                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">{new Date(audit.verifiedAt).toLocaleString('sv-SE')}</span>
                        </div>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <SparklesIcon className="w-5 h-5 mr-3 text-blue-500" />
                            Deterministisk Beslutslogg
                        </h4>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">v.1.0 CIS_SYNC</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                        {audit.checks.map(check => (
                            <div key={(check as { id: string }).id} className="p-8 flex items-start gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                                <div className={`p-2 rounded-xl flex-shrink-0 mt-1 ${check.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {check.status === 'ok' ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        <AlertIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-slate-900 dark:text-white font-black text-base tracking-tight">{check.label}</p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[{(check as { id: string }).id}]</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{(check as { details?: unknown }).details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <CodeBracketIcon className="w-5 h-5 mr-3 text-emerald-500" />
                            Forensisk Kedja - Atomisering
                        </h4>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SHA-256 ACTIVE</span>
                    </div>
                    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[500px]">
                        {analysis.documents.map(doc => {
                            const docAtoms = analysis.atoms.filter(a => a.documentId === (doc as { id: string }).id);
                            return (
                                <div key={(doc as { id: string }).id} className="space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Källdokument: ID: {(doc as { id: string }).id}</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1">Atomisering: {(docAtoms as { length: number }).length} segment</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SHA-256 SIGNERAD</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Forensiskt Verifierad</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                                        {docAtoms.slice(0, 3).map(atom => (
                                            <div key={(atom as { id: string }).id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-blue-500/30 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ATOM-{(atom as { id: string }).id.substring(0,8)}</span>
                                                    <span className="text-[9px] font-black text-emerald-500/60 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">LÅST_HASH</span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic mb-4 font-medium leading-relaxed">"{(atom as { text: string }).text}"</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                                                    <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 truncate max-w-[150px] uppercase tracking-widest">{atom.hash}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(docAtoms as { length: number }).length > 3 && (
                                            <div className="text-center py-2">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">... ytterligare {(docAtoms as { length: number }).length - 3} segment SHA-256 signerade</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForensicAuditView;
