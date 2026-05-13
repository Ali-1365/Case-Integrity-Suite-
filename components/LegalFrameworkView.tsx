
import React, { useState, useMemo, useEffect } from 'react';
import { legalFrameworkIndex } from '../data/legalFramework';
import { LEGAL_SOURCES } from '../data/legalSources';
import { corpusService } from '../lib/CorpusService';
import { LegalCorpus, LegalSourceCode, LegalFrameworkItem } from '../types';
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
    Spinner,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ScaleIcon,
    SparklesIcon
} from './icons';
import { praxisService, PraxisEntry } from '../lib/PraxisService';
import { ModuleConnector } from './shared/ModuleConnector';

interface LegalFrameworkViewProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (moduleId: string) => void;
}

const LegalFrameworkView: React.FC<LegalFrameworkViewProps> = ({ isOpen, onClose, onNavigate }) => {
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lag' | 'regelverk' | 'gold'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activeCorpus, setActiveCorpus] = useState<LegalCorpus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedParagraphId, setHighlightedParagraphId] = useState<string | null>(null);
  const [relevantPraxis, setRelevantPraxis] = useState<PraxisEntry[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<any[] | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const years = useMemo(() => {
    const allYears = [...legalFrameworkIndex, ...LEGAL_SOURCES]
      .map(s => s.sfsNumber?.split(':')[0])
      .filter((y): y is string => !!y);
    return Array.from(new Set(allYears)).sort((a, b) => b.localeCompare(a));
  }, []);

  const filteredIndex = useMemo(() => {
    if (selectedType === 'gold') {
        return LEGAL_SOURCES.filter(s => {
            const matchesSearch = s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 s.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 s.sfsNumber?.includes(searchQuery);
            const matchesYear = selectedYear === 'all' || s.sfsNumber?.startsWith(selectedYear);
            return matchesSearch && matchesYear;
        });
    }

    return legalFrameworkIndex.filter(s => {
        const matchesSearch = s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.sfsNumber?.includes(searchQuery);
        
        const matchesType = selectedType === 'all' || s.type === selectedType;
        const matchesYear = selectedYear === 'all' || s.sfsNumber?.startsWith(selectedYear);
        
        return matchesSearch && matchesType && matchesYear;
    });
  }, [searchQuery, selectedType, selectedYear]);

  useEffect(() => {
    if (selectedLawId) {
      const entry = legalFrameworkIndex.find(l => l.id === selectedLawId);
      if (entry) {
        setIsLoading(true);
        corpusService.loadCorpus(entry.corpusFile)
          .then(corpus => {
            setActiveCorpus(corpus);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Failed to load corpus:', err);
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

  const handleParagraphClick = async (p: any) => {
    setHighlightedParagraphId(p.id);
    const lawRef = `${activeCorpus?.shortName} ${p.section}`;
    try {
      const praxis = await praxisService.getRelevantPraxis([lawRef]);
      setRelevantPraxis(praxis);
    } catch (err) {
      console.error('Failed to fetch praxis:', err);
      setRelevantPraxis([]);
    }
  };

  const verifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-integrity');
      if (response.ok) {
        const data = await response.json();
        setIntegrityStatus(data);
      }
    } catch (error) {
      console.error('Integrity verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const isOutdated = (law: any) => {
    // Mock logic: if SFS year is before 2000, flag it as potentially outdated
    const year = parseInt(law.sfsNumber?.split(':')[0] || '2026');
    return year < 2000;
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden transition-all">
      
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                      FMJAM GOLD v.7.3 | {legalFrameworkIndex.length} Källor
                  </p>
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                    <ShieldCheckIcon className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
              </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
                onClick={() => verifyIntegrity().catch(err => console.error('Integrity verification failed:', err))}
                disabled={isVerifying}
                className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg transition-all text-xs font-bold border border-blue-200 dark:border-blue-800"
            >
                {isVerifying ? <Spinner className="h-4 w-4" /> : <ShieldCheckIcon className="h-4 w-4" />}
                <span>Verifiera Integritet</span>
            </button>
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
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-grow relative min-w-[200px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Sök ramverk..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as any)}
                        >
                            <option value="all">Alla Kategorier</option>
                            <option value="lag">Lagar</option>
                            <option value="regelverk">Regelverk</option>
                            <option value="gold">GOLD-Standard (Verifierade)</option>
                        </select>
                        <select 
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="all">Alla År</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIndex.map((source) => {
                            const isGold = 'reference' in source;
                            const label = source.label;
                            const type = isGold ? (source as LegalFrameworkItem).type : (source as any).type;
                            const sfs = source.sfsNumber || 'REGELVERK';
                            const shortName = isGold ? (source as LegalFrameworkItem).reference : (source as any).shortName;
                            const id = source.id;

                            return (
                                <div 
                                    key={id} 
                                    onClick={() => {
                                        if (isGold) {
                                            window.open((source as LegalFrameworkItem).sourceUrl, '_blank');
                                        } else {
                                            setSelectedLawId(id);
                                        }
                                    }}
                                    className={`group bg-white dark:bg-slate-900 border rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer shadow-sm flex flex-col ${isGold ? 'border-amber-100 dark:border-amber-900/30 ring-1 ring-amber-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isGold ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {type}
                                            </span>
                                            {isGold && (
                                                <SparklesIcon className="w-3 h-3 text-amber-500" />
                                            )}
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-400">SFS {sfs}</span>
                                    </div>
                                    <h3 className={`text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase italic tracking-tight mb-4 ${isGold ? 'text-amber-900 dark:text-amber-100' : ''}`}>
                                        {label}
                                    </h3>
                                    
                                    {isGold && (
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
                                            {(source as LegalFrameworkItem).description}
                                        </p>
                                    )}

                                    {!isGold && isOutdated(source) && (
                                        <div className="mb-4 flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                            Potentiellt inaktuell (Ej auditerad nyligen)
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{shortName}</span>
                                        {isGold ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-bold text-emerald-500 uppercase">Verified</span>
                                                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <LinkIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredIndex.length === 0 && (
                        <div className="py-20 text-center opacity-20 flex flex-col items-center">
                            <LawIcon className="h-16 w-16 mb-4" />
                            <p className="text-lg font-bold uppercase italic tracking-widest">Inga matchningar funna</p>
                        </div>
                    )}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {activeCorpus.paragraphs.map((p) => (
                                    <div 
                                        key={p.id} 
                                        onClick={() => handleParagraphClick(p)}
                                        className={`relative pl-10 group cursor-pointer transition-all ${highlightedParagraphId === p.id ? 'scale-[1.02]' : ''}`}
                                    >
                                        <div className={`absolute left-0 top-0 w-7 h-7 border rounded flex items-center justify-center text-[10px] font-bold transition-all ${highlightedParagraphId === p.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400'}`}>
                                            {p.section}§
                                        </div>
                                        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-6 transition-all shadow-sm ${highlightedParagraphId === p.id ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {p.chapter ? `Kapitel ${p.chapter} | ` : ''}Paragraf {p.section}
                                                </span>
                                                {highlightedParagraphId === p.id && (
                                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Markerad
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{p.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sticky top-0">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ScaleIcon className="w-4 h-4 text-blue-500" />
                                        Vägledande Praxis
                                    </h3>
                                    
                                    {relevantPraxis.length > 0 ? (
                                        <div className="space-y-4">
                                            {relevantPraxis.map(entry => (
                                                <div key={entry.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{entry.reference}</span>
                                                        <span className="text-[9px] font-mono text-slate-400">{entry.provenanceHash}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{entry.summary}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center opacity-30">
                                            <InformationCircleIcon className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Klicka på en paragraf för att se praxis</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider">System Integrity: {integrityStatus ? 'Verified' : 'Pending Check'}</span>
                </div>
                {integrityStatus && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <CheckCircleIcon className="w-3 h-3" />
                        {integrityStatus.length} Filer Validerade
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">v.7.3-GOLD</span>
            </div>
        </footer>

        <ModuleConnector activeModule="framework" onNavigate={onNavigate} />
    </div>
  );
};

export default LegalFrameworkView;
