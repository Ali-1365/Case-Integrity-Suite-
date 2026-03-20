
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StoredDocument, OpinionConfig } from '../types';
import { db } from '../lib/db';
import { OpinionEngine } from '../lib/opinionEngine';
import { GeminiLlmClient } from '../services/geminiService';
import { SynthesizerEngine } from '../lib/synthesizerEngine';
import AnalysisResults from './AnalysisResults';
import { Spinner, ArrowLeftIcon } from './icons';

interface AnalysisViewProps {
  documentId: string;
  onBack: () => void;
  onDocumentUpdate: (documentId: string) => void;
  onLegalReferenceSelect: (refId: string) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ documentId, onBack, onDocumentUpdate, onLegalReferenceSelect }) => {
  const [document, setDocument] = useState<StoredDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geminiClient = useMemo(() => new GeminiLlmClient(), []);
  const synthesizer = useMemo(() => new SynthesizerEngine(), []);

  useEffect(() => {
    const fetchDoc = async () => {
      const doc = await db.getDocument(documentId);
      
      if (doc) {
        setDocument(doc as StoredDocument);
      } else {
        setError("Kunde inte ladda dokumentet.");
      }
    };
    fetchDoc().catch(err => console.error('Failed to fetch document:', err));
  }, [documentId]);

  const handleGenerateOpinion = useCallback(async (config: OpinionConfig, mode: 'fast' | 'think') => {
    if (!document) return;

    setIsGenerating(true);
    setError(null);

    try {
      const opinionEngine = new OpinionEngine(geminiClient, mode);
      const result = await opinionEngine.generateOpinion(document.analysis, config);
      
      await db.saveOpinion(document.id, result);
      const updatedDoc = await db.getDocument(document.id);
      if (updatedDoc) setDocument(updatedDoc);
      onDocumentUpdate(document.id);

    } catch (e) {
      console.error("Opinion generation failed:", e);
      setError(`Generering av yttrande misslyckades. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setIsGenerating(false);
    }
  }, [document, geminiClient, onDocumentUpdate]);

  const handleGenerateSynthesis = useCallback(async (templateId: string) => {
    if (!document) return;
    setIsGeneratingSynthesis(true);

    try {
        const newSynthesis = await synthesizer.synthesize(document.analysis, templateId);
        
        const updatedAnalysis = { ...document.analysis, synthesis: newSynthesis };
        const updatedDoc = { ...document, analysis: updatedAnalysis };
        await db.addDocument(updatedDoc);
        setDocument(updatedDoc);
        onDocumentUpdate(document.id);
    } catch (e) {
        console.error("Synthesis regeneration failed:", e);
        setError("Kunde inte generera ny syntes.");
    } finally {
        setIsGeneratingSynthesis(false);
    }
  }, [document, synthesizer, onDocumentUpdate]);

  if (!document) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
            {error ? <p className="text-red-400">{error}</p> : <Spinner className="h-10 w-10 text-cyan-400" />}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black text-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all active:scale-95 w-fit uppercase tracking-widest"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-500/10 transition-all duration-500 group-hover:rotate-[-10deg]">
            <ArrowLeftIcon className="h-5 w-5"/>
          </div>
          <span>Tillbaka till ärendelistan</span>
        </button>
        
        <div className="flex items-center space-x-6 px-8 py-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-xl shadow-blue-500/5">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-[0.3em] leading-none mb-2">Ärende-ID</span>
            <span className="font-mono text-base font-black text-blue-700 dark:text-blue-300 tracking-tight">{document.analysis.caseId}</span>
          </div>
          <div className="h-10 w-px bg-blue-500/20"></div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-[0.3em] leading-none mb-2">Status</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              Slutförd
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-16">
        <div className="relative pl-10">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white m-0 tracking-tighter leading-none">
            Analysrapport: <span className="text-blue-600 dark:text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{document.name}</span>
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-3 px-5 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Upprättad</span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">{new Date(document.createdAt).toLocaleString('sv-SE')}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Typ</span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Forensisk Utredning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:shadow-blue-500/5 transition-shadow duration-1000">
          <AnalysisResults 
              analysis={document.analysis}
              onLegalReferenceSelect={onLegalReferenceSelect}
              onGenerateOpinion={handleGenerateOpinion}
              onGenerateSynthesis={handleGenerateSynthesis}
              opinionResult={document.opinion || null}
              isGeneratingOpinion={isGenerating}
              isGeneratingSynthesis={isGeneratingSynthesis}
              generationError={error}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
