
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Forensisk Integritetsanalys</h3>
          <p className="text-sm text-slate-500 dark:text-gray-500">Verifiering av SHA-256 hashar för varje data-atom i ärendet.</p>
        </div>
        <button 
          onClick={() => runVerification().catch(err => console.error("Manual verification failed:", err))}
          disabled={isValidating}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          {isValidating ? <Spinner className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4" />}
          <span>Kör Verifiering</span>
        </button>
      </div>

      {verification && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
            <div className="flex items-center gap-3">
              {verification.isValid ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-xl font-bold ${verification.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {verification.isValid ? 'VALIDERAD' : 'AVVIKELSE'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Integritetsscore</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{verification.integrityScore.toFixed(1)}%</p>
          </div>

          <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Atomer</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{verification.verifiedAtoms} / {verification.totalAtoms}</p>
          </div>

          <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Verifierad Tid</p>
            <p className="text-xs font-mono text-slate-500 dark:text-gray-400 mt-2">{new Date(verification.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Data-atomer & Hash-kedja" icon={<FingerPrintIcon className="w-5 h-5" />}>
            <div className="space-y-3">
              {analysis.atoms.map((atom) => {
                const isFailed = verification?.failedAtoms.includes(atom.id);
                return (
                  <div key={atom.id} className={`p-4 rounded-xl border transition-all ${isFailed ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{atom.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isFailed ? (
                          <span className="text-[8px] font-bold bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">HASH_MISMATCH</span>
                        ) : (
                          <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">VERIFIED</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed italic mb-3">"{atom.text}"</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-gray-800">
                      <CpuChipIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-mono text-slate-500 truncate">{atom.hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Forensisk Kedja" icon={<ShieldCheckIcon className="w-5 h-5" />}>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-cyan-500/30 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#FAFAF9] dark:border-[#111111]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Källdokument</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">ID: {analysis.documents[0]?.id}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#FAFAF9] dark:border-[#111111]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Atomisering</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">{analysis.atoms.length} diskreta segment skapade</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#FAFAF9] dark:border-[#111111]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">SHA-256 Signering</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Varje atom låst med unik hash</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#FAFAF9] dark:border-[#111111]"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Integritetskontroll</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Status: {verification?.isValid ? 'GRÖN' : 'VÄNTAR'}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Forensisk Notering</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "Denna beviskedja garanterar att faktaatomer inte har manipulerats efter extraktion. Varje atom är kryptografiskt länkad till källdokumentet via SHA-256, vilket skapar en obruten forensisk kedja för juridisk prövning."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicIntegrityView;
