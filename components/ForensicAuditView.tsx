
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
            <div className="p-16 text-center bg-[var(--bg-main)] rounded-3xl border border-[var(--border)] shadow-inner">
                <CpuChipIcon className="w-16 h-16 text-[var(--border-strong)] mx-auto mb-6" />
                <p className="text-[var(--ink-muted)] font-black uppercase tracking-widest">Ingen audit-data tillgänglig</p>
                <p className="text-sm text-[var(--ink-light)] mt-4 font-medium">Kör om analysen i GOLD-läge för att generera verifieringsdata.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <span className="text-[10px] font-black text-[var(--ink-light)] uppercase tracking-[0.2em] mb-8 relative z-10">CIS Integrity Score</span>
                    <div className="relative flex items-center justify-center z-10">
                        <svg className="w-40 h-40 transform -rotate-90 group-hover:scale-105 transition-transform duration-700">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[var(--bg-main)]" />
                            <circle 
                                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                className={`${audit.integrityScore > 80 ? 'text-[var(--success)]' : audit.integrityScore > 50 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'} drop-shadow-[0_0_8px_rgba(var(--color-current),0.5)]`}
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - audit.integrityScore / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-4xl font-black text-[var(--ink-main)] tracking-tighter">{audit.integrityScore}%</span>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--ink-main)]/5 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border)] shadow-sm md:col-span-2 relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-8 relative z-10">
                        <div className="p-3 bg-[var(--accent)]/10 rounded-2xl text-[var(--accent)] border border-[var(--accent)]/10">
                            <ShieldCheckIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Integritetskontroll & Regelefterlevnad</h3>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] hover:bg-[var(--bg-card)] transition-all">
                            <span className="text-sm text-[var(--ink-muted)] font-bold uppercase tracking-widest">Algoritmisk Transparens</span>
                            <span className="text-[10px] font-black px-4 py-2 rounded-full bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 uppercase tracking-widest">
                                Verifierad Nivå 4 (GOLD)
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] hover:bg-[var(--bg-card)] transition-all">
                            <span className="text-sm text-[var(--ink-muted)] font-bold uppercase tracking-widest">Immutable Log ID</span>
                            <span className="text-xs font-black text-[var(--ink-light)] tracking-widest uppercase">{analysis.id.substring(0,18)}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] hover:bg-[var(--bg-card)] transition-all">
                            <span className="text-sm text-[var(--ink-muted)] font-bold uppercase tracking-widest">Verifieringstidpunkt</span>
                            <span className="text-xs font-black text-[var(--ink-light)] tracking-widest uppercase">{new Date(audit.verifiedAt).toLocaleString('sv-SE')}</span>
                        </div>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center">
                        <h4 className="text-xs font-black text-[var(--ink-light)] uppercase tracking-[0.2em] flex items-center">
                            <SparklesIcon className="w-5 h-5 mr-3 text-[var(--accent)]" />
                            Deterministisk Beslutslogg
                        </h4>
                        <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">v.1.0 CIS_SYNC</span>
                    </div>
                    <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-y-auto">
                        {(audit.checks || []).map(check => (
                            <div key={check.id} className="p-8 flex items-start gap-6 hover:bg-[var(--bg-main)] transition-all group">
                                <div className={`p-2 rounded-xl flex-shrink-0 mt-1 ${check.status === 'ok' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'}`}>
                                    {check.status === 'ok' ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        <AlertIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-[var(--ink-main)] font-black text-base tracking-tight">{check.label}</p>
                                    </div>
                                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed font-medium">{check.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center">
                        <h4 className="text-xs font-black text-[var(--ink-light)] uppercase tracking-[0.2em] flex items-center">
                            <CodeBracketIcon className="w-5 h-5 mr-3 text-[var(--success)]" />
                            Forensisk Kedja - Atomisering
                        </h4>
                        <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-widest">SHA-256 ACTIVE</span>
                    </div>
                    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[500px]">
                        {(analysis.documents || []).map(doc => {
                            const docAtoms = (analysis.atoms || []).filter(a => a.documentId === doc.id);
                            return (
                                <div key={doc.id} className="space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[var(--bg-card)] rounded-lg text-[var(--ink-muted)] border border-[var(--border)]">
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--ink-light)] uppercase tracking-widest">Källdokument</p>
                                                <p className="text-[10px] text-[var(--success)] font-black uppercase tracking-widest mt-1">Atomisering: {docAtoms.length} segment</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest">SHA-256 SIGNERAD</p>
                                            <p className="text-[9px] text-[var(--ink-light)] font-bold uppercase tracking-widest mt-0.5">Forensiskt Verifierad</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 pl-6 border-l-2 border-[var(--border)]">
                                        {docAtoms.slice(0, 3).map(atom => (
                                            <div key={atom.id} className="p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[9px] font-black text-[var(--success)]/60 group-hover:text-[var(--success)] transition-colors uppercase tracking-widest">LÅST_HASH</span>
                                                </div>
                                                <p className="text-xs text-[var(--ink-muted)] line-clamp-2 italic mb-4 font-medium leading-relaxed">"{atom.text}"</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
                                                    <span className="text-[8px] font-black text-[var(--ink-light)] truncate max-w-[150px] uppercase tracking-widest">{atom.hash}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {docAtoms.length > 3 && (
                                            <div className="text-center py-2">
                                                <p className="text-[10px] text-[var(--ink-light)] font-black uppercase tracking-widest">... ytterligare {docAtoms.length - 3} segment SHA-256 signerade</p>
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
