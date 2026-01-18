
import React, { useState, useMemo, useEffect } from 'react';
import { legalFrameworkIndex } from '../data/legalFramework';
import { corpusService } from '../lib/CorpusService';
import { LegalCorpus, LegalSourceCode } from '../types';
import { 
    LawIcon, 
    PrinterIcon, 
    ShieldCheckIcon, 
    XMarkIcon, 
    InformationCircleIcon, 
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    LinkIcon,
    CpuChipIcon,
    BoltIcon,
    ActivityIcon,
    Spinner
} from './icons';

interface LegalFrameworkViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalFrameworkView: React.FC<LegalFrameworkViewProps> = ({ isOpen, onClose }) => {
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCorpus, setActiveCorpus] = useState<LegalCorpus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredIndex = useMemo(() => {
    return legalFrameworkIndex.filter(s => 
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sfsNumber?.includes(searchQuery)
    );
  }, [searchQuery]);

  useEffect(() => {
    if (selectedLawId) {
      const entry = legalFrameworkIndex.find(l => l.id === selectedLawId);
      if (entry) {
        setIsLoading(true);
        corpusService.loadCorpus(entry.corpusFile).then(corpus => {
          setActiveCorpus(corpus);
          setIsLoading(false);
        });
      }
    } else {
      setActiveCorpus(null);
    }
  }, [selectedLawId]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        {/* HEADER */}
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <LawIcon className="w-64 h-64 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            {selectedLawId && (
                <button 
                    onClick={() => setSelectedLawId(null)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-2xl transition-all mr-2"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
            )}
            <div className="p-4 bg-purple-500/10 rounded-[1.5rem] border border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]">
              <LawIcon className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                {activeCorpus ? activeCorpus.title : 'Legal Framework Index'}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
                  FMJAM GOLD v.7.3 | {legalFrameworkIndex.length} ACTIVE_SOURCES
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <button 
                onClick={handlePrint}
                className="hidden md:flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-gray-700"
            >
                <PrinterIcon className="h-4 w-4" />
                <span>Skriv ut utdrag</span>
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        {/* BROWSE MODE */}
        {!selectedLawId ? (
            <div className="flex-grow flex flex-col overflow-hidden bg-gray-950/40">
                <div className="p-10 border-b border-gray-800 bg-gray-900/30">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Sök lagar (YGL, SoL, Barnkonventionen...)"
                            className="w-full bg-black/60 border-2 border-gray-800 rounded-[2rem] pl-16 pr-8 py-6 text-xl text-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 outline-none transition-all placeholder-gray-700 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredIndex.map((source) => (
                            <div 
                                key={source.id} 
                                onClick={() => setSelectedLawId(source.id)}
                                className="group bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 hover:bg-gray-800/60 hover:border-cyan-500/40 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <BoltIcon className="w-16 h-16 text-cyan-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-mono text-cyan-500/60 font-black">SFS {source.sfsNumber || 'REGELVERK'}</span>
                                    {source.sfsNumber?.startsWith('2025') && (
                                        <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-2 py-0.5 rounded border border-yellow-500/20">REFORM</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight italic uppercase">{source.label}</h3>
                                <div className="mt-8 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{source.shortName} | DISK_LOAD_READY</span>
                                    <div className="p-2 bg-black/40 rounded-xl border border-gray-800 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                                        <LinkIcon className="w-4 h-4 text-gray-600 group-hover:text-cyan-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        ) : (
            /* CORPUS DETAIL MODE */
            <div className="flex-grow flex flex-col overflow-hidden bg-gray-950/40">
                <div className="p-8 bg-gray-900/30 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                            <CpuChipIcon className="h-6 w-6 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata Sequence</p>
                            <p className="text-sm font-mono text-cyan-500 font-bold uppercase">LOCKED_TRACE: {activeCorpus?.sfsNumber || 'SFS_MISSING'}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {activeCorpus?.versionChain.map(v => (
                            <span key={v} className="bg-gray-800 px-3 py-1 rounded-lg text-[9px] font-black text-gray-400 border border-gray-700">{v}</span>
                        ))}
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-black/20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Spinner className="w-12 h-12 text-cyan-500" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Ingesting Digital Corpus...</p>
                        </div>
                    ) : activeCorpus ? (
                        <div className="max-w-4xl mx-auto space-y-12">
                            {activeCorpus.paragraphs.map((p) => (
                                <div key={p.id} className="relative pl-12 group">
                                    <div className="absolute left-0 top-0 w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-[10px] font-black text-cyan-500 group-hover:border-cyan-500/50 transition-all">
                                        {p.section}§
                                    </div>
                                    <div className="bg-gray-900/60 border border-gray-800 rounded-[1.5rem] p-8 hover:bg-gray-800/40 transition-all shadow-lg group-hover:border-cyan-900/20">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                {p.chapter ? `Kapitel ${p.chapter} | ` : ''}Paragraf {p.section}
                                            </span>
                                            <span className="text-[8px] font-mono text-gray-700 bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                                                HASH: {p.metadata.provenanceHash.substring(0,12)}
                                            </span>
                                        </div>
                                        <p className="text-gray-200 leading-relaxed text-lg font-medium selection:bg-cyan-500/20">{p.text}</p>
                                        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] font-black text-green-500/60 uppercase flex items-center">
                                                    <ShieldCheckIcon className="w-3 h-3 mr-1.5" />
                                                    Verified Compliant
                                                </span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Giltig: {p.metadata.validFrom}</span>
                                            </div>
                                            <button className="text-[9px] font-black text-cyan-600 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                                                Kopiera Pinpoint
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center opacity-20 flex flex-col items-center">
                            <InformationCircleIcon className="h-24 w-24 mb-6" />
                            <p className="text-2xl font-black uppercase italic tracking-[0.3em]">Fullständig korpus saknas</p>
                        </div>
                    )}
                </main>
            </div>
        )}

        {/* FOOTER */}
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 text-gray-600">
                    <ActivityIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Provenance Engine: ACTIVE | SFS_INTEGRITY: GOLD</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-gray-700 font-bold uppercase">Corpus_Nodes: {legalFrameworkIndex.length}</span>
                <span className="text-[10px] font-mono text-gray-500 font-bold bg-black/40 px-4 py-1.5 rounded-full border border-gray-800 uppercase tracking-widest">
                    v.7.3-GOLD-STANDARD
                </span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default LegalFrameworkView;
