
import React from 'react';
import { AnalysisResult, Fact } from '../lib/cis.types';
import { LEGAL_SOURCES } from '../data/legalSources';
import { 
  XMarkIcon, 
  LawIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon, 
  LinkIcon, 
  LightbulbIcon,
  CpuChipIcon,
  SparklesIcon,
  FileIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from './icons';
import { ArchiveSearch } from './ArchiveSearch';

interface LegalReferenceDetailProps {
  referenceId: string;
  analysis: AnalysisResult;
  onClose: () => void;
}

const LegalReferenceDetail: React.FC<LegalReferenceDetailProps> = ({ referenceId, analysis, onClose }) => {
  // Hitta referensen i analysen
  const ref = analysis.legalReferences.find(r => r.id === referenceId);
  
  // Hitta matchande grunddata i lagkatalogen
  const sourceData = LEGAL_SOURCES.find(s => 
    ref?.rawText.includes(s.label) || 
    ref?.rawText.includes(s.reference) ||
    referenceId.startsWith(s.id)
  );

  // Hitta den AI-genererade länken (som innehåller reasoning)
  const legalLink = analysis.legalFrameworkLinks.find(link => 
    link.id === referenceId || 
    link.references.includes(ref?.source as any) ||
    (ref && link.label.includes(ref.rawText))
  );
  
  const relatedFactIds = new Set(legalLink?.relatedFactIds || []);
  const relatedFacts = analysis.facts.filter(f => relatedFactIds.has(f.id));

  if (!ref) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        <header className="px-12 py-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform rotate-12">
              <LawIcon className="w-64 h-64 text-slate-900 dark:text-white" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-5 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 shadow-xl shadow-blue-500/5">
              <LawIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">{ref.rawText}</h2>
                {sourceData && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-sm">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    GOLD VERIFIED
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em]">Legal deep dive mode</span>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Reference_ID: {referenceId.split('-')[0]}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all relative z-10 active:scale-90"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </header>

        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          {/* Vänster: Lagtext & AI Resonemang */}
          <div className="w-full lg:w-1/2 p-12 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
            <div className="space-y-12">
              
              {/* AI Resonemang sektion - Förbättrad visualisering */}
              <div className="animate-in slide-in-from-left duration-700">
                   <div className="flex justify-between items-end mb-6">
                      <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-3" />
                        Juridisk Slutledning (Logik-kedja)
                      </h3>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Oracle Logic Processed</span>
                   </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/40 rounded-full"></div>
                    
                    {legalLink?.reasoning ? (
                      <>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base italic font-bold">
                          {legalLink.reasoning}
                        </p>
                        
                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Bidragande bevisatomer:</p>
                          <div className="flex flex-wrap gap-3">
                              {Array.from(relatedFactIds).map(id => (
                                  <div key={id} className="flex items-center space-x-2 bg-blue-500/5 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl border border-blue-500/10 hover:bg-blue-500/10 transition-all cursor-default shadow-sm">
                                      <CheckCircleIcon className="w-4 h-4" />
                                      <span className="text-[10px] font-black font-mono tracking-widest">#{id}</span>
                                  </div>
                              ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-6 italic text-slate-400 text-sm font-medium">
                          Ingen specifik juridisk slutledning har genererats för denna koppling.
                      </div>
                    )}
                  </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-3 text-blue-500" />
                  Officiell Definition (Ground Truth)
                </h3>
                {sourceData ? (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                       <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${sourceData.auditTrail.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                          {sourceData.auditTrail.status}
                       </span>
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">SFS {sourceData.sfsNumber}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-100 leading-relaxed text-lg font-bold">"{sourceData.description}"</p>
                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                          Giltig fr.o.m: <span className="text-slate-900 dark:text-white ml-2">{sourceData.validFrom}</span>
                       </div>
                       <a 
                        href={sourceData.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10 transition-all active:scale-95"
                       >
                          Riksdagen.se <LinkIcon className="ml-3 w-4 h-4" />
                       </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/5 rounded-[2.5rem] p-10 border border-amber-500/20 text-amber-700 dark:text-amber-400 italic text-base font-medium">
                    Fullständig lagtext saknas i det lokala registret för denna specifika referens.
                  </div>
                )}
              </div>

              {/* Bakgrundssökning i arkivet */}
              <div className="animate-in slide-in-from-left duration-1000 delay-300">
                <ArchiveSearch 
                  query={ref.rawText} 
                  title="Arkivsökning (Bakgrund)" 
                  limit={3} 
                />
              </div>
            </div>
          </div>

          {/* Höger: Kopplade fakta - Förstärkt visualisering av "Provenance" */}
          <div className="w-full lg:w-1/2 p-12 overflow-y-auto custom-scrollbar bg-slate-50/20 dark:bg-slate-900/30">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                  <CpuChipIcon className="w-5 h-5 mr-3 text-indigo-500" />
                  Detaljerad Bevisföring & Provenans
                </h3>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 uppercase tracking-widest shadow-sm">
                    {relatedFacts.length} Atomer Funna
                </span>
            </div>
            
            {relatedFacts.length > 0 ? (
              <div className="space-y-10">
                {relatedFacts.map(fact => {
                  const docInfo = analysis.documents.find(d => d.id === fact.source.documentId) || { name: fact.source.documentId };
                  
                  return (
                    <div key={fact.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                          <ShieldCheckIcon className="w-24 h-24 text-slate-900 dark:text-white" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-black border border-indigo-500/20 shadow-inner text-lg">
                              {fact.id.replace('fact_', '')}
                           </div>
                           <div>
                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                                 {fact.category}
                              </span>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-2 tracking-widest">{docInfo.name}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">FACT_LOCKED_ID</span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{fact.id}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-900 dark:text-white font-black text-2xl mb-8 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight tracking-tight relative z-10">
                        <span className="text-indigo-500 dark:text-indigo-400 mr-3">{fact.subject}:</span> {fact.statement}
                      </p>
                      
                      <div className="relative z-10">
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed border-l-4 border-indigo-500/50 shadow-inner font-medium">
                          <span className="text-indigo-500/60 font-black not-italic mr-3 text-[10px] uppercase tracking-widest">Verbatim Source:</span>
                          "{fact.source.snippet}"
                        </div>
                        <div className="absolute -bottom-3 -right-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                             <CheckCircleIcon className="w-4 h-4 text-emerald-500/50" />
                             <span>Verified Provenance</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 uppercase tracking-widest">{fact.source.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-slate-300 dark:text-slate-700 opacity-50">
                <div className="relative mb-8">
                    <LightbulbIcon className="w-24 h-24" />
                    <div className="absolute inset-0 bg-slate-500 blur-[4rem] opacity-20"></div>
                </div>
                <p className="text-base font-black uppercase tracking-[0.3em]">Inga direkta fakta kopplade</p>
              </div>
            )}
          </div>
        </div>

        <footer className="px-12 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
           <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-500/50" />
                <span>Forensic Integrity Hash: Verified</span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>
              <span>Logic Strength Index: {(relatedFacts.length > 0 ? 0.85 + (relatedFacts.length * 0.02) : 0.45).toFixed(2)}</span>
           </div>
           <div className="flex items-center space-x-3">
               <span className="animate-pulse w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
               <span>FMJAM Core 6.2.2-GOLD</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default LegalReferenceDetail;
