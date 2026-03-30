
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
              <div className="p-10 bg-[var(--bg-card)] border-2 border-[var(--danger)]/30 rounded-none shadow-2xl shadow-[var(--danger)]/10">
                <p className="text-[var(--danger)] font-mono font-bold text-2xl uppercase tracking-tighter">{error}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--accent)]/10 blur-[60px] animate-pulse" />
                <Spinner className="h-20 w-20 text-[var(--accent)] relative z-10" />
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section - Hard Enterprise Grid */}
      <div className="mb-8 border border-[var(--border-strong)] bg-[var(--bg-card)]">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-strong)]">
          {/* Back Button */}
          <button 
            onClick={onBack} 
            className="flex items-center gap-4 px-8 py-6 text-[var(--ink-main)] hover:bg-[var(--accent)] hover:text-white transition-all group active:bg-[var(--accent)]/90"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-xs font-black uppercase tracking-[0.2em]">System / Arkiv</span>
          </button>
          
          {/* Case Info */}
          <div className="flex-grow flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-strong)]">
            <div className="px-8 py-6 flex flex-col justify-center">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Ärende-ID</span>
              <span className="font-mono text-lg font-bold text-[var(--ink-main)] tracking-tighter">#{document.analysis.caseId}</span>
            </div>
            
            <div className="px-8 py-6 flex flex-col justify-center">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Status</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--success)] shadow-[0_0_8px_var(--success)]"></div>
                <span className="text-xs font-black text-[var(--success)] uppercase tracking-[0.2em]">Verifierad / Slutförd</span>
              </div>
            </div>

            <div className="px-8 py-6 flex flex-col justify-center ml-auto">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Säkerhetsnivå</span>
              <span className="text-xs font-black text-[var(--accent)] uppercase tracking-[0.2em]">Enterprise v1.0</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-12">
        {/* Title & Metadata */}
        <div className="border-l-4 border-[var(--accent)] pl-8 py-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-[var(--accent)]"></div>
            <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em]">Analysrapport</span>
          </div>
          <h2 className="text-4xl font-black text-[var(--ink-main)] m-0 tracking-tighter leading-none uppercase italic">
            {document.name}
          </h2>
          
          <div className="flex flex-wrap items-center gap-8 mt-8">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Upprättad</span>
              <span className="font-mono text-xs font-bold text-[var(--ink-main)]">{new Date(document.createdAt).toLocaleString('sv-SE')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Typ</span>
              <span className="font-mono text-xs font-bold text-[var(--ink-main)] uppercase tracking-widest">Forensisk Utredning</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Integritet</span>
              <span className="font-mono text-xs font-bold text-[var(--success)] uppercase tracking-widest">100% Validerad</span>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl">
          <div className="h-1.5 bg-[var(--accent)]" />
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
