
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
            <div className="p-20 text-center bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                <CpuChipIcon className="w-20 h-20 text-[var(--accent)] opacity-20 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700" />
                <p className="text-xl font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Ingen audit-data tillgänglig</p>
                <p className="text-[10px] text-[var(--ink-muted)] mt-6 font-black uppercase tracking-[0.2em] italic opacity-70 max-w-md mx-auto leading-relaxed">
                    Kör om analysen i <span className="text-[var(--accent)]">GOLD-läge</span> för att generera deterministisk verifieringsdata och SHA-256 signerade atomer.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Integrity Score Card */}
                <div className="lg:col-span-4 bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]"></div>
                    <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-10 italic opacity-70 relative z-10">CIS Integrity Score</span>
                    <div className="relative flex items-center justify-center z-10">
                        <svg className="w-48 h-48 transform -rotate-90 group-hover:scale-105 transition-transform duration-1000">
                            <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[var(--bg-main)]" />
                            <circle 
                                cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                className={`${audit.integrityScore > 80 ? 'text-[var(--success)]' : audit.integrityScore > 50 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'} drop-shadow-[0_0_15px_rgba(var(--color-current),0.4)]`}
                                strokeDasharray={2 * Math.PI * 85}
                                strokeDashoffset={2 * Math.PI * 85 * (1 - audit.integrityScore / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-[var(--ink-main)] tracking-tighter italic">{audit.integrityScore}%</span>
                            <span className="text-[8px] font-black text-[var(--ink-muted)] uppercase tracking-widest mt-1 opacity-50">Verifierad</span>
                        </div>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                </div>

                {/* Integrity Details Card */}
                <div className="lg:col-span-8 bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                    <div className="flex items-center space-x-6 mb-10 relative z-10">
                        <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheckIcon className="w-8 h-8 text-[var(--accent)]" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter leading-none">Integritetskontroll</h3>
                            <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] mt-2 italic opacity-70">Forensisk Regelefterlevnad & Audit</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="p-6 bg-[var(--bg-main)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group/item">
                            <span className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] italic opacity-60 block mb-2">Algoritmisk Transparens</span>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-[var(--ink-main)] uppercase italic tracking-tight">Verifierad Nivå 4 (GOLD)</span>
                                <CheckCircleIcon className="w-5 h-5 text-[var(--success)]" />
                            </div>
                        </div>
                        <div className="p-6 bg-[var(--bg-main)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group/item">
                            <span className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] italic opacity-60 block mb-2">Immutable Log ID</span>
                            <span className="text-xs font-black text-[var(--ink-main)] uppercase italic tracking-tight font-mono">{analysis.id.substring(0,24)}...</span>
                        </div>
                        <div className="p-6 bg-[var(--bg-main)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group/item md:col-span-2">
                            <span className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] italic opacity-60 block mb-2">Verifieringstidpunkt</span>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs font-black text-[var(--ink-main)] uppercase italic tracking-tight">{new Date(audit.verifiedAt).toLocaleString('sv-SE')}</span>
                                <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest bg-[var(--success)]/10 px-3 py-1 border border-[var(--success)]/20">TIMESTAMP_LOCKED</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Decision Log */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)]"></div>
                    <div className="px-10 py-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center relative z-10">
                        <div className="flex items-center space-x-4">
                            <SparklesIcon className="w-6 h-6 text-[var(--accent)]" />
                            <h4 className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Deterministisk Beslutslogg</h4>
                        </div>
                        <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest opacity-60">v.1.0 CIS_SYNC</span>
                    </div>
                    <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/10">
                        {(audit.checks || []).map(check => (
                            <div key={check.id} className="p-10 flex items-start gap-8 hover:bg-[var(--accent)]/5 transition-all group/check relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover/check:opacity-100 transition-opacity"></div>
                                <div className={`p-3 border flex-shrink-0 mt-1 ${check.status === 'ok' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'}`}>
                                    {check.status === 'ok' ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        <AlertIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[var(--ink-main)] uppercase italic tracking-tight mb-3">{check.label}</p>
                                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-black uppercase tracking-tight italic opacity-70">{check.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Forensic Chain */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--success)]/30"></div>
                    <div className="px-10 py-8 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex justify-between items-center relative z-10">
                        <div className="flex items-center space-x-4">
                            <CodeBracketIcon className="w-6 h-6 text-[var(--success)]" />
                            <h4 className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Forensisk Kedja - Atomisering</h4>
                        </div>
                        <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest opacity-60">SHA-256 ACTIVE</span>
                    </div>
                    <div className="p-10 space-y-10 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-[var(--bg-main)]/10">
                        {(analysis.documents || []).map(doc => {
                            const docAtoms = (analysis.atoms || []).filter(a => a.documentId === doc.id);
                            return (
                                <div key={doc.id} className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-lg relative overflow-hidden group/doc">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--success)]"></div>
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)]">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] italic opacity-60">Källdokument</p>
                                                <p className="text-xs text-[var(--ink-main)] font-black uppercase tracking-tight italic mt-1">Atomisering: {docAtoms.length} segment</p>
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <p className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest italic">SHA-256 SIGNERAD</p>
                                            <p className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-widest mt-1 italic opacity-50">Forensiskt Verifierad</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 pl-8 border-l border-[var(--border-strong)]">
                                        {docAtoms.slice(0, 3).map(atom => (
                                            <div key={atom.id} className="p-8 bg-[var(--bg-card)] border border-[var(--border)] group/atom hover:border-[var(--accent)]/30 transition-all shadow-md relative">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[8px] font-black text-[var(--success)] uppercase tracking-widest italic opacity-60 group-hover/atom:opacity-100 transition-opacity">LÅST_HASH_SEQUENCE</span>
                                                    <div className="w-2 h-2 rounded-full bg-[var(--success)] opacity-30"></div>
                                                </div>
                                                <p className="text-xs text-[var(--ink-muted)] italic mb-6 font-black uppercase tracking-tight leading-relaxed opacity-80">"{atom.text}"</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
                                                    <span className="text-[8px] font-black text-[var(--ink-muted)] truncate max-w-[200px] uppercase tracking-widest font-mono opacity-40">{atom.hash}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {docAtoms.length > 3 && (
                                            <div className="text-center py-4">
                                                <p className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] italic opacity-40">... ytterligare {docAtoms.length - 3} segment SHA-256 signerade</p>
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
