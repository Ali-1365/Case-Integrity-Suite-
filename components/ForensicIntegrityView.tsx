
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
    Spinner
} from './icons';

interface ForensicIntegrityViewProps {
  analysis: AnalysisResult;
}

const ForensicIntegrityView: React.FC<ForensicIntegrityViewProps> = ({ analysis }) => {
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Forensisk Integritetsanalys</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Verifiering av SHA-256 hashar för varje data-atom i ärendet.</p>
        </div>
        <button 
          onClick={() => runVerification().catch(err => console.error("Manual verification failed:", err))}
          disabled={isValidating}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
        >
          {isValidating ? <Spinner className="w-5 h-5" /> : <ShieldCheckIcon className="w-5 h-5" />}
          <span>Kör Verifiering</span>
        </button>
      </div>

      {verification && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Status</p>
            <div className="flex items-center gap-4">
              {verification.isValid ? (
                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
              ) : (
                <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
              )}
              <span className={`text-2xl font-black tracking-tight ${verification.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {verification.isValid ? 'VALIDERAD' : 'AVVIKELSE'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Integritetsscore</p>
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter italic">{verification.integrityScore.toFixed(1)}%</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Atomer</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{verification.verifiedAtoms} / {verification.totalAtoms}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verifierad Tid</p>
            <p className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 inline-block">{new Date(verification.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card title="Data-atomer & Hash-kedja" icon={<FingerPrintIcon className="w-5 h-5" />}>
            <div className="space-y-4">
              {analysis.atoms.map((atom) => {
                const isFailed = verification?.failedAtoms.includes(atom.id);
                return (
                  <div key={atom.id} className={`p-8 rounded-[2rem] border transition-all shadow-sm ${isFailed ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-blue-500/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        {isFailed ? (
                          <span className="text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">HASH_MISMATCH</span>
                        ) : (
                          <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">VERIFIED</span>
                        )}
                      </div>
                    </div>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium mb-6">"{atom.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <CpuChipIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-mono font-black text-slate-500 truncate bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-inner w-full">{atom.hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-10">
          <Card title="Forensisk Kedja" icon={<ShieldCheckIcon className="w-5 h-5" />}>
            <div className="space-y-8">
              <div className="relative pl-8 border-l-4 border-blue-500/20 space-y-10">
                <div className="relative">
                  <div className="absolute -left-[42px] top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/20"></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">Källdokument</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[42px] top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/20"></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">Atomisering</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">{analysis.atoms.length} diskreta segment skapade</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[42px] top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/20"></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">SHA-256 Signering</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Varje atom låst med unik hash</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[42px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-emerald-500/20"></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">Integritetskontroll</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Status: {verification?.isValid ? 'GRÖN' : 'VÄNTAR'}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                <ShieldCheckIcon className="w-32 h-32 text-white" />
            </div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-6 relative z-10">Forensisk Notering</h4>
            <p className="text-sm text-slate-400 leading-relaxed italic font-medium relative z-10">
              "Denna beviskedja garanterar att faktaatomer inte har manipulerats efter extraktion. Varje atom är kryptografiskt länkad till källdokumentet via SHA-256, vilket skapar en obruten forensisk kedja för juridisk prövning."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicIntegrityView;
