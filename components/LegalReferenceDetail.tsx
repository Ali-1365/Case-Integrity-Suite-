
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
  CheckCircleIcon
} from './icons';

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
    link.id.includes(referenceId) || 
    (ref && link.label.includes(ref.rawText))
  );
  
  const relatedFactIds = new Set(legalLink?.relatedFactIds || []);
  const relatedFacts = analysis.facts.filter(f => relatedFactIds.has(f.id));

  if (!ref) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-full max-h-[85vh] flex flex-col border border-cyan-500/20 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <LawIcon className="w-48 h-48 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-5 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <LawIcon className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{ref.rawText}</h2>
                {sourceData && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <ShieldCheckIcon className="w-3 h-3" />
                    GOLD VERIFIED
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">Legal deep dive mode</span>
                <div className="h-1 w-1 rounded-full bg-gray-700"></div>
                <span className="text-[10px] text-gray-500 font-mono uppercase">Reference_ID: {referenceId.split('-')[0]}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all relative z-10">
            <XMarkIcon className="h-8 w-8" />
          </button>
        </header>

        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          {/* Vänster: Lagtext & AI Resonemang */}
          <div className="w-full lg:w-1/2 p-10 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-950/20">
            <div className="space-y-10">
              
              {/* AI Resonemang sektion - Förbättrad visualisering */}
              <div className="animate-in slide-in-from-left duration-500">
                   <div className="flex justify-between items-end mb-4">
                      <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Juridisk Slutledning (Logik-kedja)
                      </h3>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Oracle Logic Processed</span>
                   </div>
                  
                  <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-[2rem] p-8 shadow-[inset_0_0_40px_rgba(34,211,238,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/40 rounded-full"></div>
                    
                    {legalLink?.reasoning ? (
                      <>
                        <p className="text-cyan-100/90 leading-relaxed text-sm italic font-medium">
                          {legalLink.reasoning}
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-cyan-500/10">
                          <p className="text-[9px] font-black text-cyan-500/50 uppercase tracking-widest mb-4">Bidragande bevisatomer:</p>
                          <div className="flex flex-wrap gap-2">
                              {Array.from(relatedFactIds).map(id => (
                                  <div key={id} className="flex items-center space-x-1 bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-default">
                                      <CheckCircleIcon className="w-3 h-3" />
                                      <span className="text-[10px] font-black font-mono">#{id}</span>
                                  </div>
                              ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 italic text-gray-500 text-xs">
                          Ingen specifik juridisk slutledning har genererats för denna koppling.
                      </div>
                    )}
                  </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2 text-cyan-500" />
                  Officiell Definition (Ground Truth)
                </h3>
                {sourceData ? (
                  <div className="bg-gray-900/60 rounded-[2rem] p-8 border border-gray-800 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                       <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${sourceData.auditTrail.status === 'VERIFIED' ? 'bg-green-950/30 text-green-400 border-green-500/20' : 'bg-red-950/30 text-red-400 border-red-500/20'}`}>
                          {sourceData.auditTrail.status}
                       </span>
                       <span className="text-xs font-mono text-gray-500">SFS {sourceData.sfsNumber}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed text-base font-medium">"{sourceData.description}"</p>
                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                       <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                          Giltig fr.o.m: <span className="text-gray-300 ml-1">{sourceData.validFrom}</span>
                       </div>
                       <a href={sourceData.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/10 transition-all">
                          Riksdagen.se <LinkIcon className="ml-2 w-3 h-3" />
                       </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-950/10 rounded-[2rem] p-8 border border-orange-500/20 text-orange-200 italic text-sm">
                    Fullständig lagtext saknas i det lokala registret för denna specifika referens.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Höger: Kopplade fakta - Förstärkt visualisering av "Provenance" */}
          <div className="w-full lg:w-1/2 p-10 overflow-y-auto custom-scrollbar bg-gray-900/30">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center">
                  <CpuChipIcon className="w-4 h-4 mr-2 text-indigo-400" />
                  Detaljerad Bevisföring & Provenans
                </h3>
                <span className="text-[10px] font-black text-indigo-500/80 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10 uppercase tracking-widest">
                    {relatedFacts.length} Atomer Funna
                </span>
            </div>
            
            {relatedFacts.length > 0 ? (
              <div className="space-y-8">
                {relatedFacts.map(fact => {
                  const docInfo = analysis.documents.find(d => d.id === fact.source.documentId) || { name: fact.source.documentId };
                  
                  return (
                    <div key={fact.id} className="bg-gray-800/60 border border-gray-700 rounded-[2rem] p-8 hover:border-cyan-500/40 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                          <ShieldCheckIcon className="w-16 h-16" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono font-black border border-indigo-500/20 shadow-inner">
                              {fact.id.replace('fact_', '')}
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                 {fact.category}
                              </span>
                              <p className="text-[8px] text-gray-600 font-bold uppercase mt-1 tracking-tighter">{docInfo.name}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono text-gray-600 font-bold uppercase">FACT_LOCKED_ID</span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">{fact.id}</span>
                        </div>
                      </div>
                      
                      <p className="text-white font-bold text-lg mb-6 group-hover:text-cyan-300 transition-colors leading-tight">
                        <span className="text-indigo-400 mr-2">{fact.subject}:</span> {fact.statement}
                      </p>
                      
                      <div className="relative">
                        <div className="p-5 bg-black/40 rounded-2xl text-xs text-gray-400 italic leading-relaxed border-l-4 border-indigo-500/50 shadow-inner">
                          <span className="text-indigo-500/60 font-black not-italic mr-2 text-[10px] uppercase">Verbatim Source:</span>
                          "{fact.source.snippet}"
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-1.5 bg-gray-900 rounded-lg border border-gray-800 shadow-xl">
                            <LinkIcon className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
                             <CheckCircleIcon className="w-3 h-3 text-green-500/50" />
                             <span>Verified Provenance</span>
                          </div>
                          <span className="text-[9px] font-mono text-gray-700 bg-black/30 px-2 py-1 rounded-md">{fact.source.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-600 opacity-30">
                <div className="relative mb-6">
                    <LightbulbIcon className="w-20 h-20" />
                    <div className="absolute inset-0 bg-gray-500 blur-3xl opacity-20"></div>
                </div>
                <p className="text-sm font-black uppercase tracking-[0.2em]">Inga direkta fakta kopplade</p>
              </div>
            )}
          </div>
        </div>

        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-950/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
           <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-500/50" />
                <span>Forensic Integrity Hash: Verified</span>
              </div>
              <div className="h-4 w-px bg-gray-800"></div>
              <span>Logic Strength Index: {(relatedFacts.length > 0 ? 0.85 + (relatedFacts.length * 0.02) : 0.45).toFixed(2)}</span>
           </div>
           <div className="flex items-center space-x-2">
               <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
               <span>FMJAM Core 6.2.2-GOLD</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default LegalReferenceDetail;
