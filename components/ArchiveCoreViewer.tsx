
import React from 'react';
import { 
  databaseIcon as DatabaseIcon, 
  HomeIcon, 
  CheckCircleIcon, 
  FileIcon,
  ActivityIcon,
  ShieldCheckIcon,
  BoltIcon
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
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Case Archive Core</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-3">Ground Truth Ingestion Layer</p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center ml-2">
            <ActivityIcon className="w-4 h-4 mr-3" />
            Ingestade handlingar (Ärendekomplex)
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="bg-gray-900 border border-gray-800 p-6 rounded-[1.5rem] flex items-center justify-between hover:bg-gray-800/40 transition-all group">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-black/40 rounded-xl text-gray-600 group-hover:text-purple-400 border border-gray-800">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">DOKUMENT-0{num}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">LOCKED_HASH: SHA256_{Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[9px] font-black bg-green-950/30 text-green-500 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">
                    INGESTED
                  </span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ArchiveStat label="Totala Atomer" value="482" />
          <ArchiveStat label="Vektoriserat" value="100%" />
          <ArchiveStat label="Korsreferenser" value="14" />
        </div>
      </section>
    </div>
  );
};

const ArchiveStat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-black/20 p-8 rounded-3xl border border-gray-800 flex flex-col items-center shadow-inner">
    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">{label}</span>
    <span className="text-3xl font-black text-purple-400 italic tracking-tighter">{value}</span>
  </div>
);

export default ArchiveCoreViewer;
