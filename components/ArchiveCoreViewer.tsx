
import React from 'react';
import { 
  CpuChipIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  HomeIcon,
  ActivityIcon,
  LawIcon,
  databaseIcon as DatabaseIcon
} from './icons';

interface ArchiveCoreViewerProps {
  onBack: () => void;
}

const ArchiveCoreViewer: React.FC<ArchiveCoreViewerProps> = ({ onBack }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* NAVIGATION BAR - TOP LEFT */}
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-2xl border border-gray-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Hem</span>
        </button>
      </div>

      <section className="bg-gray-950/60 p-10 rounded-[3rem] border border-gray-800 shadow-inner">
        <div className="flex items-center space-x-6 mb-10">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <DatabaseIcon className="h-10 w-10 text-purple-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Archive Core Ingestion</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-3">Ärendespecifik Ground Truth-hantering v.5.4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] space-y-6">
            <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest flex items-center">
              <ActivityIcon className="w-4 h-4 mr-3" />
              Ingestion Pipeline Status
            </h4>
            <div className="space-y-4">
              <ParamRow label="Active Workers" value="4 (OPTIMAL)" />
              <ParamRow label="Queue Depth" value="0 Items" />
              <ParamRow label="Throughput" value="1.2 MB/s" />
              <ParamRow label="Integrity Check" value="SHA-256" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] space-y-6">
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-3" />
              Storage Compliance
            </h4>
            <div className="space-y-4">
              <ParamRow label="Encryption" value="AES-256-GCM" />
              <ParamRow label="Data Residency" value="Local (IndexedDB)" />
              <ParamRow label="Retention Policy" value="Case-Locked" />
              <ParamRow label="Audit State" value="VERIFIED" />
            </div>
          </div>
        </div>

        <div className="mt-10 p-8 bg-purple-500/5 border border-purple-500/10 rounded-[2.5rem]">
            <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
              "Archive Core ansvarar för att transformera rådata till strukturerade bevisatomer. Varje atom tidsstämplas och signeras innan den görs tillgänglig för Oracle-lagret."
            </p>
        </div>
      </section>
    </div>
  );
};

const ParamRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</span>
    <span className="text-xs font-mono text-gray-300 font-black tracking-tight">{value}</span>
  </div>
);

export default ArchiveCoreViewer;
