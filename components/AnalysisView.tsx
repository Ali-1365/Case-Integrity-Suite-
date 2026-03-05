
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
    fetchDoc();
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
    <div>
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mr-4">
            <ArrowLeftIcon className="h-5 w-5"/>
            <span>Tillbaka till listan</span>
        </button>
      </div>
      
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
          Analys av: <span className="font-mono text-cyan-400">{document.analysis.caseId}</span>
        </h2>
        
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
  );
};

export default AnalysisView;
