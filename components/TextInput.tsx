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
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border-2 border-slate-100 dark:border-slate-800 transition-all duration-1000 hover:border-indigo-500/30 relative z-30 overflow-hidden group/container hover:shadow-[0_60px_150px_rgba(0,0,0,0.12)]">
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] group-hover/container:bg-indigo-500/10 transition-colors duration-1000"></div>
      
      <div className="mb-10 flex justify-between items-center relative z-10">
        <div>
            <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Mata in råmaterial</h3>
            <p className="text-[12px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-[0.4em] mt-4 opacity-100">Klistra in transkriberingar eller anteckningar</p>
        </div>
        {text.length > 0 && (
            <button 
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 transition-all p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 hover:border-rose-500/30 shadow-md active:scale-95 group/clear"
                title="Rensa text"
                disabled={isProcessing}
            >
                <TrashIcon className="h-6 w-6 group-hover/clear:rotate-12 transition-transform" />
            </button>
        )}
      </div>
      <div className="relative group z-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="block w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-inner py-8 px-10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 text-xl font-sans transition-all resize-none custom-scrollbar placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed"
          placeholder="Klistra in texten här för analys..."
          spellCheck={false}
          autoFocus
        />
        <div className="absolute bottom-8 right-10 text-[12px] font-mono font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.3em]">
          {text.length} tecken
        </div>
      </div>
      <div className="flex flex-col space-y-6 mt-10 relative z-10">
        <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-100 dark:disabled:from-slate-800 disabled:to-slate-100 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black py-7 px-10 rounded-[2.5rem] transition-all duration-700 flex items-center justify-center shadow-[0_30px_70px_rgba(79,70,229,0.4)] hover:shadow-[0_50px_100px_rgba(79,70,229,0.6)] active:scale-[0.98] border-2 border-indigo-400/30 group/btn"
        >
            {isProcessing ? (
              <>
                <Spinner className="h-8 w-8 mr-6" />
                <span className="tracking-[0.2em] uppercase text-base">Bearbetar stacken...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-8 w-8 mr-6 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-500" />
                <span className="tracking-[0.2em] uppercase text-base">Starta Forensisk Analys</span>
              </>
            )}
        </button>
        <div className="flex items-center justify-center gap-6">
          <div className="h-px w-16 bg-slate-100 dark:bg-slate-800"></div>
          <p className="text-[11px] text-center text-slate-400 font-black uppercase tracking-[0.4em] opacity-80">
              {isProcessing ? 'AI-motorerna bearbetar källmaterialet' : 'Lokal analys med Gemini Pro 3'}
          </p>
          <div className="h-px w-16 bg-slate-100 dark:bg-slate-800"></div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;