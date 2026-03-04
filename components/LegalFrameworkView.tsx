
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* HEADER */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            {selectedLawId && (
                <button 
                    onClick={() => setSelectedLawId(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-all"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
            )}
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <LawIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                {activeCorpus ? activeCorpus.title : 'Juridiskt Ramverk'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
                  FMJAM GOLD v.7.3 | {legalFrameworkIndex.length} Källor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
                onClick={handlePrint}
                className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-all text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
                <PrinterIcon className="h-4 w-4" />
                <span>Skriv ut</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* BROWSE MODE */}
        {!selectedLawId ? (
            <div className="flex-grow flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950/20">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="max-w-2xl mx-auto relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Sök lagar..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredIndex.map((source) => (
                            <div 
                                key={source.id} 
                                onClick={() => setSelectedLawId(source.id)}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">SFS {source.sfsNumber || 'REGELVERK'}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{source.label}</h3>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{source.shortName}</span>
                                    <LinkIcon className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        ) : (
            /* CORPUS DETAIL MODE */
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <CpuChipIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SFS Referens</p>
                            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">{activeCorpus?.sfsNumber || 'SFS_MISSING'}</p>
                        </div>
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-950/20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Spinner className="w-10 h-10 text-blue-600" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Laddar lagtext...</p>
                        </div>
                    ) : activeCorpus ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            {activeCorpus.paragraphs.map((p) => (
                                <div key={p.id} className="relative pl-10 group">
                                    <div className="absolute left-0 top-0 w-7 h-7 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                        {p.section}§
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-blue-100 dark:hover:border-blue-900 transition-all shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {p.chapter ? `Kapitel ${p.chapter} | ` : ''}Paragraf {p.section}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{p.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center">
                            <InformationCircleIcon className="h-16 w-16 mb-4 text-slate-400" />
                            <p className="text-lg font-bold uppercase tracking-widest">Korpus saknas</p>
                        </div>
                    )}
                </main>
            </div>
        )}

        {/* FOOTER */}
        <footer className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-slate-400">
                    <ActivityIcon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">System Integrity: Verified</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">v.7.3-GOLD</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default LegalFrameworkView;
