
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
    const cases = caseManagementService.getAllCases();
    const res = await controllerService.runFullControl(cases);
    setReport(res);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (isOpen) runAnalysis();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-3xl z-[600] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300 outline-none">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none text-red-500">
              <ShieldCheckIcon className="w-64 h-64 text-red-500" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-xl">
                <ShieldCheckIcon className="h-10 w-10 text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">FMJAM CONTROLLER</h2>
              <div className="flex items-center space-x-3 mt-2">
                  <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                      Quality Control Layer
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Deterministisk Revision Aktiverad</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-[10px] font-black uppercase text-gray-300 px-6 py-3 rounded-2xl border border-gray-700 transition-all active:scale-95"
            >
                {isAnalyzing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
                <span>Kör Re-Scan</span>
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-gray-950/20">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {report ? (
                    <>
                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Avvikelser" value={report.deviations.length} color="orange" icon={<ExclamationTriangleIcon />} />
                            <StatCard label="Inkonsekvenser" value={report.inconsistencies.length} color="red" icon={<ActivityIcon />} />
                            <StatCard label="Bias-indikatorer" value={report.biasIndicators.length} color="indigo" icon={<AdjustmentsHorizontalIcon />} />
                            <StatCard label="Integritetsfel" value={report.integrityIssues.length} color="red" icon={<CpuChipIcon />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* DEVIATIONS LIST */}
                            <section className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    Identifierade Avvikelser
                                </h3>
                                <div className="space-y-4">
                                    {report.deviations.map((d, i) => (
                                        <div key={i} className="p-5 bg-gray-950 rounded-2xl border border-gray-800 flex items-start gap-4">
                                            <div className={`p-2 rounded-xl ${d.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                <BoltIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-600 uppercase mb-1">{d.caseId} | {d.type}</p>
                                                <p className="text-sm font-bold text-gray-300 leading-snug">{d.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {report.deviations.length === 0 && <p className="text-gray-600 italic text-xs">Inga avvikelser funna i baslinjen.</p>}
                                </div>
                            </section>

                            {/* BIAS & CONSISTENCY */}
                            <section className="space-y-10">
                                <div className="bg-indigo-950/10 border border-indigo-500/20 p-8 rounded-[2.5rem] space-y-6">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                        Bias-analys (Skeivhets-indikatorer)
                                    </h3>
                                    <div className="space-y-4">
                                        {report.biasIndicators.map((b, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-black text-gray-200">{b.label}</span>
                                                    <span className="text-[10px] font-black text-indigo-400">{Math.round(b.impactScore)}% IMPACT</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${b.impactScore}%` }}></div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-medium">{b.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-red-950/10 border border-red-500/20 p-8 rounded-[2.5rem] space-y-6">
                                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-3">
                                        <ActivityIcon className="w-4 h-4" />
                                        Inkonsekvensmatris (Likabehandlingskontroll)
                                    </h3>
                                    <div className="space-y-3">
                                        {report.inconsistencies.map((inc, i) => (
                                            <div key={i} className="bg-black/20 p-4 rounded-xl border border-red-900/20">
                                                <div className="flex gap-2 mb-2">
                                                    <span className="text-[9px] font-black bg-red-500/20 text-red-500 px-2 py-0.5 rounded">CONFL: {inc.caseIds[0]}</span>
                                                    <span className="text-[9px] font-black bg-red-500/20 text-red-500 px-2 py-0.5 rounded">CONFL: {inc.caseIds[1]}</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 leading-relaxed italic">"{inc.reason}"</p>
                                            </div>
                                        ))}
                                        {report.inconsistencies.length === 0 && <p className="text-gray-600 italic text-xs">Systemet upprätthåller fullständig besluts-konsistens.</p>}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <Spinner className="w-16 h-16 text-red-500" />
                        <p className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Exekverar Systemomfattande Revision...</p>
                    </div>
                )}

            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-4">
                <CheckCircleIcon className="h-4 w-4 text-green-500/50" />
                <span>Metodologisk Revision: 100% | controller.v17.gold</span>
            </div>
            <span>OFFICIAL CONTROLLER LAYER</span>
        </footer>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, color: string, icon: React.ReactNode }> = ({ label, value, color, icon }) => {
    const colors: Record<string, string> = {
        red: 'text-red-500 border-red-500/20',
        orange: 'text-orange-500 border-orange-500/20',
        indigo: 'text-indigo-400 border-indigo-500/20'
    };
    return (
        <div className={`bg-gray-950 p-6 rounded-3xl border flex flex-col items-center shadow-inner ${colors[color] || 'border-gray-800'}`}>
            <div className="mb-4 opacity-50">{icon}</div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-4xl font-black italic tracking-tighter ${colors[color].split(' ')[0]}`}>{value}</p>
        </div>
    );
};

export default ControllerDashboard;
