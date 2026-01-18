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
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 transition-all hover:border-gray-600 relative z-30">
      <div className="mb-3 flex justify-between items-center">
        <div>
            <h3 className="text-lg font-semibold text-white">Mata in råmaterial</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Klistra in transkriberingar eller anteckningar</p>
        </div>
        {text.length > 0 && (
            <button 
                onClick={handleClear}
                className="text-gray-500 hover:text-red-400 transition-colors p-1.5 bg-gray-900 rounded-lg border border-gray-800"
                title="Rensa text"
                disabled={isProcessing}
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="block w-full bg-gray-900 border border-gray-700 rounded-xl shadow-sm py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 sm:text-sm font-sans transition-all resize-none custom-scrollbar placeholder-gray-600"
        placeholder="Klistra in texten här för analys..."
        spellCheck={false}
        autoFocus
        // Vi inaktiverar INTE fältet så användaren kan arbeta vidare med texten
      />
      <div className="flex flex-col space-y-2 mt-4">
        <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95 border border-cyan-400/30"
        >
            {isProcessing ? (
              <>
                <Spinner className="h-5 w-5 mr-3" />
                <span>Bearbetar stacken...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-3" />
                <span>Starta Forensisk Analys</span>
              </>
            )}
        </button>
        <p className="text-[9px] text-center text-gray-500 italic mt-1 uppercase tracking-tighter">
            {isProcessing ? 'AI-motorerna bearbetar källmaterialet lokalt' : 'Analysen körs lokalt i webbläsaren med Gemini Pro 3'}
        </p>
      </div>
    </div>
  );
};

export default TextInput;