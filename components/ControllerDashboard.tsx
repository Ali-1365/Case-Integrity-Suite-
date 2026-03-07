import React, { useState, useEffect } from 'react';
import { controllerService, ControllerReport } from '../lib/ControllerService';
import { caseManagementService } from '../lib/CaseManagementService';
import { 
  ShieldCheckIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  ActivityIcon,
  CpuChipIcon,
  BoltIcon,
  ChartBarSquareIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  Spinner,
  CheckCircleIcon
} from './icons';

interface ControllerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ControllerDashboard: React.FC<ControllerDashboardProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<ControllerReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const cases = await caseManagementService.getAllCases();
    const res = await controllerService.runFullControl(cases);
    setReport(res);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (isOpen) runAnalysis();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[600] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-200 outline-none">
      <div className="bg-[#111111] rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-gray-800 overflow-hidden">
        
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-800 bg-[#161616] relative overflow-hidden">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <ShieldCheckIcon className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-100 tracking-tight">FMJAM Controller</h2>
              <div className="flex items-center space-x-3 mt-1">
                  <span className="bg-rose-500/10 text-rose-400 text-xs font-medium px-2 py-0.5 rounded border border-rose-500/20">
                      Quality Control Layer
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Deterministisk Revision Aktiverad</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-200 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
            >
                {isAnalyzing ? <Spinner className="h-4 w-4 text-gray-400" /> : <ArrowPathIcon className="h-4 w-4 text-gray-400" />}
                <span>Kör Re-Scan</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {report ? (
                    <>
                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard label="Avvikelser" value={report.deviations.length} color="amber" icon={<ExclamationTriangleIcon className="w-6 h-6 text-amber-500/70" />} />
                            <StatCard label="Inkonsekvenser" value={report.inconsistencies.length} color="rose" icon={<ActivityIcon className="w-6 h-6 text-rose-500/70" />} />
                            <StatCard label="Bias-indikatorer" value={report.biasIndicators.length} color="indigo" icon={<AdjustmentsHorizontalIcon className="w-6 h-6 text-indigo-500/70" />} />
                            <StatCard label="Integritetsfel" value={report.integrityIssues.length} color="rose" icon={<CpuChipIcon className="w-6 h-6 text-rose-500/70" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* DEVIATIONS LIST */}
                            <section className="bg-[#161616] border border-gray-800 rounded-xl p-6 space-y-6">
                                <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                                    Identifierade Avvikelser
                                </h3>
                                <div className="space-y-3">
                                    {report.deviations.map((d, i) => (
                                        <div key={i} className="p-4 bg-[#111111] rounded-lg border border-gray-800 flex items-start gap-3">
                                            <div className={`p-1.5 rounded-md ${d.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                <BoltIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">{d.caseId} | {d.type}</p>
                                                <p className="text-sm text-gray-300 leading-snug">{d.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {report.deviations.length === 0 && <p className="text-gray-500 text-sm">Inga avvikelser funna i baslinjen.</p>}
                                </div>
                            </section>

                            {/* BIAS & CONSISTENCY */}
                            <section className="space-y-8">
                                <div className="bg-[#161616] border border-gray-800 p-6 rounded-xl space-y-6">
                                    <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                        <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-400" />
                                        Bias-analys (Skeivhets-indikatorer)
                                    </h3>
                                    <div className="space-y-4">
                                        {report.biasIndicators.map((b, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-sm font-medium text-gray-300">{b.label}</span>
                                                    <span className="text-xs font-medium text-indigo-400">{Math.round(b.impactScore)}% IMPACT</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${b.impactScore}%` }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500">{b.description}</p>
                                            </div>
                                        ))}
                                        {report.biasIndicators.length === 0 && <p className="text-gray-500 text-sm">Inga bias-indikatorer funna.</p>}
                                    </div>
                                </div>

                                <div className="bg-[#161616] border border-gray-800 p-6 rounded-xl space-y-6">
                                    <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                        <ActivityIcon className="w-4 h-4 text-rose-400" />
                                        Inkonsekvensmatris (Likabehandlingskontroll)
                                    </h3>
                                    <div className="space-y-3">
                                        {report.inconsistencies.map((inc, i) => (
                                            <div key={i} className="bg-[#111111] p-4 rounded-lg border border-gray-800">
                                                <div className="flex gap-2 mb-2">
                                                    <span className="text-xs font-medium bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">CONFL: {inc.caseIds[0]}</span>
                                                    <span className="text-xs font-medium bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">CONFL: {inc.caseIds[1]}</span>
                                                </div>
                                                <p className="text-sm text-gray-300">{inc.reason}</p>
                                            </div>
                                        ))}
                                        {report.inconsistencies.length === 0 && <p className="text-gray-500 text-sm">Inga inkonsekvenser funna.</p>}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
                        <Spinner className="w-8 h-8 text-gray-600" />
                        <p className="text-sm font-medium">Initierar deterministisk kontroll...</p>
                    </div>
                )}
            </div>
        </main>
        
        <footer className="px-8 py-4 border-t border-gray-800 bg-[#161616] flex justify-between items-center text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-500/70" />
                <span>Metodologisk Revision: 100% | controller.v17.gold</span>
            </div>
            <span>OFFICIAL CONTROLLER LAYER</span>
        </footer>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, color: 'amber' | 'rose' | 'indigo', icon: React.ReactNode }> = ({ label, value, color, icon }) => {
    const colors = {
        amber: 'text-amber-400',
        rose: 'text-rose-400',
        indigo: 'text-indigo-400'
    };

    return (
        <div className="bg-[#161616] border border-gray-800 p-5 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className={`text-2xl font-semibold ${colors[color]}`}>{value}</p>
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
                {icon}
            </div>
        </div>
    );
};

export default ControllerDashboard;
