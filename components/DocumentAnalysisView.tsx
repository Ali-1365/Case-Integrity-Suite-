
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StoredDocument, OpinionConfig } from '../types';
import { db } from '../lib/db';
import { OpinionEngine } from '../lib/opinionEngine';
import { GeminiLlmClient } from '../services/geminiService';
import { SynthesizerEngine } from '../lib/synthesizerEngine';
import AnalysisResults from './AnalysisResults';
import { Spinner, ArrowLeftIcon } from './icons';

interface DocumentAnalysisViewProps {
  documentId: string;
  onBack: () => void;
  onDocumentUpdate: (documentId: string) => void;
  onLegalReferenceSelect: (refId: string) => void;
}

const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({ documentId, onBack, onDocumentUpdate, onLegalReferenceSelect }) => {
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
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <button 
          onClick={onBack} 
          className="flex items-center gap-3 px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--ink-main)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all group active:scale-95"
        >
          <div className="p-1.5 bg-[var(--bg-main)] rounded-lg group-hover:bg-[var(--accent)]/10 transition-all">
            <ArrowLeftIcon className="h-4 w-4"/>
          </div>
          <span>Tillbaka till ärendelistan</span>
        </button>
        
        <div className="flex items-center space-x-8 px-8 py-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[var(--ink-light)] uppercase tracking-[0.2em] mb-1">Ärende-ID</span>
            <span className="font-mono text-sm font-bold text-[var(--ink-main)] tracking-tight">{document.analysis.caseId}</span>
          </div>
          <div className="h-8 w-px bg-[var(--border)]"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[var(--ink-light)] uppercase tracking-[0.2em] mb-1">Status</span>
            <span className="text-[10px] font-bold text-[var(--success)] flex items-center gap-2 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_10px_rgba(25,135,84,0.5)]"></div>
              Slutförd
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-10">
        <div className="relative pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] rounded-full shadow-[0_0_20px_rgba(0,86,179,0.3)]"></div>
          <h2 className="text-3xl font-bold text-[var(--ink-main)] m-0 tracking-tight leading-tight">
            Analysrapport: <span className="text-[var(--accent)]">{document.name}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] shadow-sm">
              <span className="text-[8px] font-bold text-[var(--ink-light)] uppercase tracking-[0.2em]">Upprättad</span>
              <span className="text-xs font-bold text-[var(--ink-main)]">{new Date(document.createdAt).toLocaleString('sv-SE')}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] shadow-sm">
              <span className="text-[8px] font-bold text-[var(--ink-light)] uppercase tracking-[0.2em]">Typ</span>
              <span className="text-xs font-bold text-[var(--ink-main)] uppercase tracking-widest">Forensisk Utredning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden shadow-lg border border-[var(--border)]">
          <div className="h-1 bg-[var(--accent)] opacity-80" />
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

export default DocumentAnalysisView;
