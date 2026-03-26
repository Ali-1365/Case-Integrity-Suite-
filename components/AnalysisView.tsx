
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
      <div className="mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-10">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-6 px-10 py-5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-serif font-bold text-xl rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all active:scale-95 w-fit tracking-tight"
        >
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-500/10 transition-all duration-500 group-hover:rotate-[-10deg] shadow-inner">
            <ArrowLeftIcon className="h-6 w-6"/>
          </div>
          <span>Tillbaka till ärendelistan</span>
        </button>
        
        <div className="flex items-center space-x-10 px-12 py-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-500/5">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.3em] leading-none mb-3">Ärende-ID</span>
            <span className="font-mono text-xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">{document.analysis.caseId}</span>
          </div>
          <div className="h-12 w-px bg-indigo-200 dark:bg-indigo-800"></div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.3em] leading-none mb-3">Status</span>
            <span className="text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-3 tracking-tight">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
              Slutförd
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-20">
        <div className="relative pl-14">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-600 via-purple-600 to-rose-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
          <h2 className="text-6xl font-serif font-bold text-slate-900 dark:text-white m-0 tracking-tight leading-tight">
            Analysrapport: <span className="text-indigo-600 dark:text-indigo-400 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">{document.name}</span>
          </h2>
          <div className="flex items-center gap-6 mt-10">
            <div className="flex items-center gap-4 px-8 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Upprättad</span>
              <span className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">{new Date(document.createdAt).toLocaleString('sv-SE')}</span>
            </div>
            <div className="flex items-center gap-4 px-8 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Typ</span>
              <span className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300 tracking-tight">Forensisk Utredning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden hover:shadow-indigo-500/5 transition-all duration-1000">
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
