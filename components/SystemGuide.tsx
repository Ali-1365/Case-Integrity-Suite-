import React from 'react';
import { XMarkIcon, QuestionMarkCircleIcon, UploadIcon, DocumentTextIcon, SparklesIcon } from './icons';

interface SystemGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideStep: React.FC<{ icon: React.ReactElement, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md group">
        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
            {React.cloneElement(icon as React.ReactElement<{className?: string}>, { className: 'h-8 w-8' })}
        </div>
        <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h4>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{children}</p>
        </div>
    </div>
);

const SystemGuide: React.FC<SystemGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-3xl h-auto max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <QuestionMarkCircleIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Systemguide</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lär dig navigera i plattformen</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </header>
        
        <main className="p-8 flex-grow overflow-y-auto space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Välkommen till System Hub</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
                    Följ dessa tre steg för att maximera din effektivitet i analysmotorn.
                </p>
            </div>

            <div className="grid gap-6">
                <GuideStep icon={<UploadIcon />} title="1. Datainmatning & Parsing">
                    Börja med att antingen <strong>ladda upp ett dokument</strong> (PDF, DOCX, TXT) eller <strong>klistra in text</strong>. Systemet parsar automatiskt innehållet och startar analyspipelinen omedelbart.
                </GuideStep>

                <GuideStep icon={<DocumentTextIcon />} title="2. Analysgranskning">
                    När analysen är klar, klicka på dokumentet i listan. Utforska flikarna för att se <strong>riskprofil</strong>, extraherade <strong>fakta</strong>, <strong>lagrumskopplingar</strong> och den tekniska <strong>FMJAM-rapporten</strong>.
                </GuideStep>

                <GuideStep icon={<SparklesIcon />} title="3. AI-Assisterad Produktion">
                    Använd sektionen "Generera AI-Yttrande" för att skapa utkast. Välj en mall och en AI-modell (vi rekommenderar <strong>Djupanalys</strong> för bäst resultat) för att få ett färdigt juridiskt utkast.
                </GuideStep>
            </div>
        </main>

        <footer className="px-8 py-6 text-center border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto min-w-[200px] text-sm bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest"
          >
            Kom igång nu
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SystemGuide;