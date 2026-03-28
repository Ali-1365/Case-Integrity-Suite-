import React from 'react';
import { XMarkIcon, QuestionMarkCircleIcon, UploadIcon, DocumentTextIcon, SparklesIcon } from './icons';
import { motion, AnimatePresence } from 'motion/react';

interface SystemGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideStep: React.FC<{ icon: React.ReactElement, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-6 p-6 rounded-2xl bg-white border border-slate-100 transition-all hover:border-slate-200 hover:shadow-sm group">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-6 w-6' })}
        </div>
        <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h4>
            <div className="text-sm text-slate-500 leading-relaxed font-medium">{children}</div>
        </div>
    </div>
);

const SystemGuide: React.FC<SystemGuideProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#F9F8F6] rounded-3xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col border border-white/20 overflow-hidden relative z-10"
          >
            <header className="px-8 py-6 flex justify-between items-center border-b border-slate-200/50 flex-shrink-0 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Systemguide</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lär dig navigera i Case Integrity Suite</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </header>
            
            <main className="p-10 flex-grow overflow-y-auto space-y-10 custom-scrollbar">
                <div className="text-center space-y-3">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Välkommen till framtidens juridik</h3>
                    <p className="text-base text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                        Följ dessa tre steg för att maximera din effektivitet och precision i varje ärende.
                    </p>
                </div>

                <div className="grid gap-6">
                    <GuideStep icon={<UploadIcon />} title="1. Datainmatning & Parsing">
                        Börja med att antingen <strong>ladda upp ett dokument</strong> eller <strong>klistra in text</strong>. Systemet parsar automatiskt innehållet och identifierar nyckeldata.
                    </GuideStep>

                    <GuideStep icon={<DocumentTextIcon />} title="2. Analysgranskning">
                        När analysen är klar, klicka på dokumentet i listan. Utforska flikarna för att se <strong>riskprofil</strong>, <strong>lagrumskopplingar</strong> och <strong>bevisvärdering</strong>.
                    </GuideStep>

                    <GuideStep icon={<SparklesIcon />} title="3. AI-Assisterad Produktion">
                        Använd sektionen "Generera AI-Yttrande" för att skapa utkast. Välj en mall och en AI-modell för att få ett färdigt juridiskt utkast baserat på din analys.
                    </GuideStep>
                </div>
            </main>

            <footer className="px-10 py-8 text-center border-t border-slate-200/50 flex-shrink-0 bg-white/50 backdrop-blur-sm">
              <button 
                onClick={onClose} 
                className="w-full sm:w-auto min-w-[200px] text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95"
              >
                Kom igång nu
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SystemGuide;
