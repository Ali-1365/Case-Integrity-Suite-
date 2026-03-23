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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-blue-500/30 relative z-30">
      <div className="mb-5 flex justify-between items-center">
        <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Mata in råmaterial</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Klistra in transkriberingar eller anteckningar</p>
        </div>
        {(text as { length: number }).length > 0 && (
            <button 
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 transition-all p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500/30"
                title="Rensa text"
                disabled={isProcessing}
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        )}
      </div>
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="block w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner py-4 px-5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm font-sans transition-all resize-none custom-scrollbar placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed"
          placeholder="Klistra in texten här för analys..."
          spellCheck={false}
          autoFocus
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {(text as { length: number }).length} tecken
        </div>
      </div>
      <div className="flex flex-col space-y-3 mt-6">
        <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-[0.98] border border-blue-400/30 group"
        >
            {isProcessing ? (
              <>
                <Spinner className="h-5 w-5 mr-3" />
                <span className="tracking-wide">Bearbetar stacken...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-3 group-hover:animate-pulse" />
                <span className="tracking-wide">Starta Forensisk Analys</span>
              </>
            )}
        </button>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
              {isProcessing ? 'AI-motorerna bearbetar källmaterialet' : 'Lokal analys med Gemini Pro 3'}
          </p>
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;