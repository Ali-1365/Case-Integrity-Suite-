
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
      <div className="flex justify-center items-center h-96">
        <div className="text-center space-y-8">
            {error ? (
              <div className="p-10 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/30 rounded-[3rem] shadow-2xl shadow-rose-500/10">
                <p className="text-rose-600 dark:text-rose-400 font-serif font-bold text-2xl">{error}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse rounded-full" />
                <Spinner className="h-20 w-20 text-indigo-500 relative z-10" />
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-8 px-12 py-6 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-serif font-bold text-2xl rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-[0_30px_80px_rgba(79,70,229,0.15)] transition-all active:scale-95 w-fit tracking-tighter"
        >
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl group-hover:bg-indigo-500/10 transition-all duration-700 group-hover:rotate-[-12deg] shadow-inner">
            <ArrowLeftIcon className="h-8 w-8"/>
          </div>
          <span>Tillbaka till ärendelistan</span>
        </button>
        
        <div className="flex items-center space-x-12 px-16 py-8 bg-indigo-50/40 dark:bg-indigo-900/10 rounded-[3.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.1)] backdrop-blur-sm">
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.4em] leading-none mb-4">Ärende-ID</span>
            <span className="font-mono text-2xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">{document.analysis.caseId}</span>
          </div>
          <div className="h-16 w-px bg-indigo-200 dark:bg-indigo-800"></div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.4em] leading-none mb-4">Status</span>
            <span className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-4 tracking-tighter">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,1)]"></div>
              Slutförd
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-24">
        <div className="relative pl-20">
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-indigo-600 via-purple-600 to-rose-600 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)]"></div>
          <h2 className="text-7xl font-serif font-bold text-slate-900 dark:text-white m-0 tracking-tighter leading-[1.1]">
            Analysrapport: <span className="text-indigo-600 dark:text-indigo-400 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">{document.name}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-8 mt-12">
            <div className="flex items-center gap-5 px-10 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Upprättad</span>
              <span className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300">{new Date(document.createdAt).toLocaleString('sv-SE')}</span>
            </div>
            <div className="flex items-center gap-5 px-10 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Typ</span>
              <span className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 tracking-tighter">Forensisk Utredning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[5rem] border-2 border-slate-100 dark:border-slate-800 shadow-[0_60px_150px_-30px_rgba(0,0,0,0.12)] dark:shadow-none overflow-hidden hover:shadow-[0_80px_200px_-40px_rgba(79,70,229,0.1)] transition-all duration-1000 relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-40" />
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
