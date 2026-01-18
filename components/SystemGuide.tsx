import React from 'react';
import { XMarkIcon, QuestionMarkCircleIcon, UploadIcon, DocumentTextIcon, SparklesIcon } from './icons';

interface SystemGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideStep: React.FC<{ icon: React.ReactElement, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-cyan-900/50 text-cyan-400 rounded-lg">
            {/* FIX: Cast icon to React.ReactElement<any> to allow adding className prop. */}
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-7 w-7' })}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-white">{title}</h4>
            <p className="text-gray-400">{children}</p>
        </div>
    </div>
);

const SystemGuide: React.FC<SystemGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col border border-gray-700">
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Snabbstartsguide</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        </header>
        
        <main className="p-6 flex-grow overflow-y-auto text-gray-300 space-y-6">
            <p className="text-center text-gray-400">
                Följ dessa tre steg för att få ut det mesta av analysmotorn.
            </p>

            <GuideStep icon={<UploadIcon />} title="1. Mata in data">
                Börja med att antingen <strong>ladda upp ett dokument</strong> (PDF, DOCX, TXT) eller <strong>klistra in text</strong> i mallen. Systemet kommer automatiskt att parsa innehållet och starta analyspipelinen.
            </GuideStep>

             <GuideStep icon={<DocumentTextIcon />} title="2. Granska analysen">
                När analysen är klar, klicka på dokumentet i historiklistan. Utforska flikarna för att se <strong>riskprofil</strong>, extraherade <strong>fakta</strong>, <strong>lagrumskopplingar</strong> och den tekniska <strong>FMJAM-rapporten</strong>.
            </GuideStep>

             <GuideStep icon={<SparklesIcon />} title="3. Generera AI-yttrande">
                Scrolla ner till sektionen "Generera AI-Yttrande". Välj en mall (t.ex. "FMJAM Teknisk Rapport") och en AI-modell (vi rekommenderar <strong>Djupanalys</strong> för bäst resultat). Klicka på generera för att få ett färdigt utkast.
            </GuideStep>
        </main>

        <footer className="p-4 text-center border-t border-gray-700 flex-shrink-0 bg-gray-800 rounded-b-2xl">
          <button onClick={onClose} className="text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg">
            Stäng guide
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SystemGuide;