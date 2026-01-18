
import React from 'react';
import { ProportionalityReport, JusticeFinding } from '../lib/ProportionalityJusticeService';
import { 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  BoltIcon,
  ActivityIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  AlertIcon
} from './icons';

interface ProportionalityViewerProps {
  report: ProportionalityReport;
}

const ProportionalityViewer: React.FC<ProportionalityViewerProps> = ({ report }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'RÖD': return 'bg-red-500 border-red-400 text-white shadow-red-900/50';
      case 'GUL': return 'bg-orange-500 border-orange-400 text-white shadow-orange-900/50';
      default: return 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-emerald-400';
      case 'WARN': return 'text-orange-400';
      default: return 'text-red-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER CARD */}
      <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl flex justify-between items-center transition-all ${getLevelStyles(report.level)}`}>
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <ShieldCheckIcon className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Proportionalitet & Rättssäkerhet</p>
            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mt-1">STATUS: {report.level}</h3>
          </div>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Justice_Audit_ID</p>
            <p className="text-xs font-mono font-bold mt-1">{report.proportionalityId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 5-STEP CHECKLIST */}
        <div className="lg:col-span-8 space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center ml-2">
                <ActivityIcon className="w-3 h-3 mr-2" />
                Deterministisk 5-stegsprövning
            </p>
            
            <div className="grid grid-cols-1 gap-4">
                {report.findings.map((finding, idx) => (
                    <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 hover:bg-gray-800/60 transition-all flex items-start gap-6 group">
                        <div className={`mt-1 flex-shrink-0 ${getStatusColor(finding.status)}`}>
                            {finding.status === 'PASS' ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationTriangleIcon className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Steg {idx + 1}: {finding.step}</p>
                            <p className="text-sm font-bold text-gray-200 leading-relaxed italic">
                                "{finding.finding}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SUMMARY & SCORE */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/20 p-8 rounded-[2.5rem] border border-gray-800 flex flex-col">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-6">Rättssäkerhets-Score</p>
                
                <div className="flex justify-center mb-8">
                    <div className="relative flex items-center justify-center w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                            <circle 
                                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className={`${report.legalCertaintyScore > 80 ? 'text-emerald-500' : 'text-orange-500'}`}
                                strokeDasharray={2 * Math.PI * 58}
                                strokeDashoffset={2 * Math.PI * 58 * (1 - report.legalCertaintyScore / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-3xl font-black text-white">{report.legalCertaintyScore}%</span>
                    </div>
                </div>

                <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 mb-6">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Sammanfattning</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                        "{report.summary}"
                    </p>
                </div>

                <div className="p-5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2 flex items-center">
                        <BoltIcon className="w-3 h-3 mr-1" /> Rekommenderad Åtgärd
                    </p>
                    <p className="text-xs text-cyan-100 font-bold uppercase tracking-tight">
                        {report.recommendation}
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProportionalityViewer;
