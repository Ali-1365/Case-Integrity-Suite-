import React, { useState } from 'react';
import { SparklesIcon, Spinner, TrashIcon } from './icons';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isProcessing: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !isProcessing) {
      onTextSubmit(text);
      setText(''); // Töm fältet efter inskickning för att markera action
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm transition-all duration-500 hover:border-slate-400 relative z-30 overflow-hidden group/container">
      <div className="mb-6 flex justify-between items-center relative z-10">
        <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Mata in råmaterial</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Klistra in transkriberingar eller anteckningar</p>
        </div>
        {text.length > 0 && (
            <button 
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 transition-all p-2 bg-slate-50 rounded border border-slate-100 hover:border-rose-200 active:scale-95 group/clear"
                title="Rensa text"
                disabled={isProcessing}
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        )}
      </div>
      <div className="relative group z-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="block w-full bg-slate-50 border border-slate-100 rounded-lg py-4 px-6 text-slate-900 focus:outline-none focus:border-slate-400 text-base font-sans transition-all resize-none placeholder-slate-400 leading-relaxed"
          placeholder="Klistra in texten här för analys..."
          spellCheck={false}
          autoFocus
        />
        <div className="absolute bottom-4 right-6 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
          {text.length} tecken
        </div>
      </div>
      <div className="flex flex-col space-y-4 mt-6 relative z-10">
        <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-all duration-500 flex items-center justify-center active:scale-[0.98] group/btn"
        >
            {isProcessing ? (
              <>
                <Spinner className="h-5 w-5 mr-3" />
                <span className="tracking-widest uppercase text-xs">Bearbetar...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-3" />
                <span className="tracking-widest uppercase text-xs">Starta Analys</span>
              </>
            )}
        </button>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-8 bg-slate-100"></div>
          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-80">
              {isProcessing ? 'AI-motorerna bearbetar källmaterialet' : 'Lokal analys med Gemini Pro'}
          </p>
          <div className="h-px w-8 bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;