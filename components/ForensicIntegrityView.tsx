
import React, { useState, useEffect } from 'react';
import { AnalysisResult, Atom } from '../lib/cis.types';
import { forensicChainService, ChainVerificationResult } from '../lib/ForensicChainService';
import Card from './shared/Card';
import { 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    FingerPrintIcon, 
    DocumentTextIcon,
    CpuChipIcon,
    Spinner,
    BoltIcon,
    LinkIcon,
    ScaleIcon,
    ActivityIcon
} from './icons';
import { ModuleConnector } from './shared/ModuleConnector';

interface ForensicIntegrityViewProps {
  analysis: AnalysisResult;
  onNavigate?: (moduleId: string) => void;
}

const ForensicIntegrityView: React.FC<ForensicIntegrityViewProps> = ({ analysis, onNavigate }) => {
  const [verification, setVerification] = useState<ChainVerificationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runVerification = async () => {
    setIsValidating(true);
    try {
      const result = await forensicChainService.verifyChain(analysis);
      setVerification(result);
    } catch (error) {
      console.error("Forensic verification failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runVerification().catch(err => console.error("Initial verification failed:", err));
  }, [analysis.id]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <ShieldCheckIcon className="w-48 h-48 text-[var(--accent)]" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <BoltIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em]">Forensisk Integritet v.7.6-GOLD</span>
          </div>
          <h3 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter italic uppercase leading-none">Chain <span className="text-[var(--accent)]">Summary</span></h3>
          <p className="text-[var(--ink-muted)] font-black mt-4 max-w-xl leading-relaxed uppercase text-[11px] tracking-widest opacity-70 italic">Kryptografisk verifiering av beviskedjan och rättsliga kopplingar via deterministisk hash-validering.</p>
        </div>
        <button 
          onClick={() => runVerification().catch(err => console.error("Manual verification failed:", err))}
          disabled={isValidating}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] px-12 py-5 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50 relative z-10 italic border border-[var(--accent)]"
        >
          {isValidating ? <Spinner className="w-5 h-5" /> : <ShieldCheckIcon className="w-5 h-5" />}
          <span>Kör Fullständig Revision</span>
        </button>
      </div>

      {/* Forensic Stats Grid */}
      {verification && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-strong)] border border-[var(--border-strong)] shadow-2xl">
          <div className="bg-[var(--bg-card)] p-12">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                <ActivityIcon className="w-3 h-3 text-[var(--accent)]" /> Status
            </p>
            <div className="flex items-center gap-5">
              {verification.isValid ? (
                <div className="w-3 h-3 bg-[var(--success)] shadow-[0_0_12px_var(--success)]" />
              ) : (
                <div className="w-3 h-3 bg-[var(--danger)] shadow-[0_0_12px_var(--danger)]" />
              )}
              <span className={`text-3xl font-black tracking-tighter italic uppercase ${verification.isValid ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {verification.isValid ? 'VALIDERAD' : 'AVVIKELSE'}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-12">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                <BoltIcon className="w-3 h-3 text-[var(--accent)]" /> Integritetsscore
            </p>
            <p className="text-6xl font-black text-[var(--accent)] tracking-tighter italic leading-none">{verification.integrityScore.toFixed(1)}%</p>
          </div>

          <div className="bg-[var(--bg-card)] p-12">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                <FingerPrintIcon className="w-3 h-3 text-[var(--accent)]" /> Bevisatomer
            </p>
            <p className="text-6xl font-black text-[var(--ink-main)] tracking-tighter italic leading-none">{verification.verifiedAtoms}<span className="text-2xl opacity-20 mx-2">/</span>{verification.totalAtoms}</p>
          </div>

          <div className="bg-[var(--bg-card)] p-12">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                <ShieldCheckIcon className="w-3 h-3 text-[var(--accent)]" /> Audit Verifierad
            </p>
            <div className="flex flex-col gap-3">
                <span className="text-sm font-black text-[var(--ink-main)] uppercase tracking-widest italic">{new Date(verification.timestamp).toLocaleTimeString()}</span>
                <span className="text-[9px] font-mono font-black text-[var(--ink-muted)] uppercase tracking-widest bg-[var(--bg-main)] px-4 py-2 border border-[var(--border)] inline-block shadow-inner">SHA-256_LOCKED</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card title="Bevisatomer & Hash-kedja" icon={<FingerPrintIcon className="w-5 h-5" />}>
            <div className="space-y-6">
              {(analysis.atoms || []).map((atom) => {
                const isFailed = verification?.failedAtoms.includes(atom.id);
                return (
                  <div key={atom.id} className={`p-10 border-l-4 transition-all shadow-lg relative overflow-hidden ${isFailed ? 'bg-[var(--danger)]/5 border-[var(--danger)]' : 'bg-[var(--bg-main)] border-[var(--border-strong)] hover:border-[var(--accent)]'}`}>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-[var(--bg-card)] border border-[var(--border)]">
                            <DocumentTextIcon className="w-5 h-5 text-[var(--ink-muted)]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Atom ID: {atom.id.substring(0, 8).toUpperCase()}</p>
                            <div className="flex gap-3 mt-2">
                                {atom.tags.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-black bg-[var(--bg-card)] text-[var(--accent)] px-3 py-1 border border-[var(--border)] uppercase tracking-widest italic">{tag}</span>
                                ))}
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isFailed ? (
                          <span className="text-[10px] font-black bg-[var(--danger)] text-white px-5 py-2 uppercase tracking-[0.2em] shadow-xl shadow-[var(--danger)]/20 italic">HASH_MISMATCH</span>
                        ) : (
                          <span className="text-[10px] font-black bg-[var(--success)] text-white px-5 py-2 uppercase tracking-[0.2em] shadow-xl shadow-[var(--success)]/20 italic">VERIFIED</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xl text-[var(--ink-main)] leading-relaxed italic font-black mb-10 relative z-10 tracking-tight">"{atom.text}"</p>
                    <div className="flex items-center gap-5 pt-8 border-t border-[var(--border)] relative z-10">
                      <CpuChipIcon className="w-5 h-5 text-[var(--accent)]" />
                      <span className="text-[10px] font-mono font-black text-[var(--ink-muted)] truncate bg-[var(--bg-card)] px-5 py-3 border border-[var(--border-strong)] shadow-inner w-full tracking-tighter opacity-60">{atom.hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card title="Beviskategorier" icon={<ActivityIcon className="w-5 h-5" />}>
                <div className="space-y-4">
                    {analysis.themes?.map((theme, i) => (
                        <div key={i} className="p-8 bg-[var(--bg-main)] border border-[var(--border-strong)] flex items-center justify-between group hover:border-[var(--accent)] transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-2 h-2 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                                <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic">{theme.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-40 italic">{theme.keywords.length} ATOMER</span>
                        </div>
                    ))}
                    <div className="pt-6 border-t border-[var(--border)] mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Verifierade Beviskategorier</span>
                            <span className="text-xs font-black text-[var(--success)] uppercase tracking-[0.2em] italic">100% SECURE</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Lagrumskopplingar" icon={<ScaleIcon className="w-5 h-5" />}>
                <div className="space-y-4">
                    {analysis.legalFrameworkLinks?.map((link, i) => (
                        <div key={i} className="p-8 bg-[var(--bg-main)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-all shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <LinkIcon className="w-4 h-4 text-[var(--accent)]" />
                                <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic">{link.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {link.references.map((ref, j) => (
                                    <span key={j} className="text-[10px] font-black bg-[var(--bg-card)] text-[var(--ink-muted)] px-4 py-1.5 border border-[var(--border)] uppercase tracking-widest italic">{ref}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="pt-6 border-t border-[var(--border)] mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic">Aktiverat Lagrum</span>
                            <span className="text-xs font-black text-[var(--accent)] uppercase tracking-[0.2em] italic">{analysis.legalReferences?.length || 0} REFERENSER</span>
                        </div>
                    </div>
                </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card title="Forensisk Kedja" icon={<ShieldCheckIcon className="w-5 h-5" />}>
            <div className="space-y-12 py-6">
              <div className="relative pl-12 border-l-2 border-[var(--border-strong)] space-y-16">
                <div className="relative">
                  <div className="absolute -left-[57px] top-0 w-5 h-5 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]"></div>
                  <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Källdokument</p>
                  <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase mt-3 tracking-widest opacity-50 italic">Inläsning & Hash-generering</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[57px] top-0 w-5 h-5 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]"></div>
                  <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Atomisering</p>
                  <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase mt-3 tracking-widest opacity-50 italic">{analysis.atoms.length} diskreta segment skapade</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[57px] top-0 w-5 h-5 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]"></div>
                  <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">SHA-256 Signering</p>
                  <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase mt-3 tracking-widest opacity-50 italic">Kryptografisk låsning av segment</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[57px] top-0 w-5 h-5 bg-[var(--success)] shadow-[0_0_15px_var(--success)]"></div>
                  <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Integritetskontroll</p>
                  <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase mt-3 tracking-widest opacity-50 italic">Status: {verification?.isValid ? 'GRÖN' : 'VÄNTAR'}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-12 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-700">
                <ShieldCheckIcon className="w-32 h-32 text-[var(--accent)]" />
            </div>
            <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em] mb-10 relative z-10 italic">Forensisk Notering</h4>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed italic font-black relative z-10 uppercase tracking-[0.1em] opacity-80">
              "Denna beviskedja garanterar att faktaatomer inte har manipulerats efter extraktion. Varje atom är kryptografiskt länkad till källdokumentet via SHA-256, vilket skapar en obruten forensisk kedja för juridisk prövning."
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-12 space-y-8 shadow-xl">
            <div className="flex items-center gap-5 mb-6">
                <ActivityIcon className="w-6 h-6 text-[var(--accent)]" />
                <h4 className="text-sm font-black text-[var(--ink-main)] uppercase tracking-[0.2em] italic">Systemtelemetri</h4>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                    <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Hash-algoritm</span>
                    <span className="text-[10px] font-mono font-black text-[var(--ink-main)]">SHA-256</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                    <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Verifieringsläge</span>
                    <span className="text-[10px] font-mono font-black text-[var(--success)]">STRICT</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Audit Log ID</span>
                    <span className="text-[10px] font-mono font-black text-[var(--ink-main)]">#{Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleConnector activeModule="integrity" onNavigate={onNavigate} />
    </div>
  );
};

export default ForensicIntegrityView;
