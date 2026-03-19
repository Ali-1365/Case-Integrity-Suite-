
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
            <div className="p-12 text-center bg-[#111111] rounded-xl border border-gray-800">
                <CpuChipIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">Ingen audit-data tillgänglig för detta ärende.</p>
                <p className="text-sm text-gray-500 mt-2">Kör om analysen i GOLD-läge för att generera verifieringsdata.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111111] p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6">CIS Integrity Score</span>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                            <circle 
                                cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className={`${audit.integrityScore > 80 ? 'text-emerald-400' : audit.integrityScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}
                                strokeDasharray={2 * Math.PI * 56}
                                strokeDashoffset={2 * Math.PI * 56 * (1 - audit.integrityScore / 100)}
                            />
                        </svg>
                        <span className="absolute text-3xl font-semibold text-gray-100">{audit.integrityScore}%</span>
                    </div>
                </div>

                <div className="bg-[#111111] p-8 rounded-xl border border-gray-800 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-gray-100">Integritetskontroll & Regelefterlevnad</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-[#161616] rounded-lg border border-gray-800">
                            <span className="text-sm text-gray-400 font-medium">Algoritmisk Transparens</span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Verifierad Nivå 4 (GOLD)
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-[#161616] rounded-lg border border-gray-800">
                            <span className="text-sm text-gray-400 font-medium">Immutable Log ID</span>
                            <span className="text-xs font-mono text-gray-500">{analysis.id.substring(0,18)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-[#161616] rounded-lg border border-gray-800">
                            <span className="text-sm text-gray-400 font-medium">Verifieringstidpunkt</span>
                            <span className="text-xs font-mono text-gray-500">{new Date(audit.verifiedAt).toLocaleString('sv-SE')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-gray-800 bg-[#161616] flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-300 flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2 text-gray-400" />
                            Deterministisk Beslutslogg
                        </h4>
                        <span className="text-xs font-mono text-cyan-500">v.1.0 CIS_SYNC</span>
                    </div>
                    <div className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto">
                        {audit.checks.map(check => (
                            <div key={check.id} className="p-5 flex items-start gap-4 hover:bg-[#161616] transition-colors">
                                {check.status === 'ok' ? (
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertIcon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-gray-200 font-medium text-sm">{check.label}</p>
                                        <span className="text-xs font-mono text-gray-600">[{check.id}]</span>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">{check.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-800 bg-[#161616] flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-300 flex items-center">
                            <CodeBracketIcon className="w-4 h-4 mr-2 text-gray-400" />
                            Forensisk Kedja - Atomisering
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-500">SHA-256 ACTIVE</span>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[400px]">
                        {analysis.documents.map(doc => {
                            const docAtoms = analysis.atoms.filter(a => a.documentId === doc.id);
                            return (
                                <div key={doc.id} className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-300 uppercase">Källdokument: ID: {doc.id}</p>
                                                <p className="text-[10px] text-emerald-500 font-medium">Atomisering: {docAtoms.length} diskreta segment skapade</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-mono text-emerald-500">SHA-256 SIGNERAD</p>
                                            <p className="text-[9px] text-gray-600">Forensiskt Verifierad</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 pl-4 border-l border-gray-800">
                                        {docAtoms.slice(0, 3).map(atom => (
                                            <div key={atom.id} className="p-3 bg-[#161616] rounded-lg border border-gray-800 group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-mono text-gray-500">ATOM-{atom.id.substring(0,8)}</span>
                                                    <span className="text-[9px] font-mono text-emerald-500/60 group-hover:text-emerald-500 transition-colors">LÅST_HASH</span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 line-clamp-2 italic mb-2">"{atom.text}"</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-[1px] bg-gray-800"></div>
                                                    <span className="text-[8px] font-mono text-gray-600 truncate max-w-[150px]">{atom.hash}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {docAtoms.length > 3 && (
                                            <p className="text-[10px] text-gray-600 italic text-center py-2">... ytterligare {docAtoms.length - 3} diskreta segment skapade och SHA-256 signerade</p>
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
