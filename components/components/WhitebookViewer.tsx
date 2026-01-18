
import React from 'react';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { 
  XMarkIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  ActivityIcon,
  PrinterIcon
} from './icons';

interface WhitebookViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhitebookViewer: React.FC<WhitebookViewerProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      fetch('/docs/FMJAM_WHITEBOOK_V1.md')
        .then(res => res.text())
        .then(setContent)
        .catch(() => setContent('# Fel\nKunde inte ladda vitboken.'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-3xl z-[600] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-500 outline-none">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none text-cyan-500">
              <BookOpenIcon className="w-64 h-64" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-xl">
                <BookOpenIcon className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">FMJAM VITBOK v.1.0</h2>
              <div className="flex items-center space-x-3 mt-2">
                  <span className="bg-cyan-500/10 text-cyan-500 text-[8px] font-black px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">
                      Architectural Standard
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">FAS 1-16 KOMPLETT</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            <button className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <PrinterIcon className="h-8 w-8" />
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-white selection:bg-cyan-100">
            <div className="max-w-4xl mx-auto">
                <MarkdownRenderer content={content} className="prose-slate !text-slate-900 !font-serif !max-w-none" />
            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-4">
                <ShieldCheckIcon className="h-4 w-4 text-green-500/50" />
                <span>Metodologisk Integritet: 100% | GOLD v.1.0</span>
            </div>
            <span>OFFICIAL ARCHITECTURE DOCUMENTATION</span>
        </footer>
      </div>
    </div>
  );
};

const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
  </svg>
);

export default WhitebookViewer;
