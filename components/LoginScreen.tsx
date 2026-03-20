
import React from 'react';
import { LogoIcon, ShieldCheckIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-12 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
          
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="p-5 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-600/30 mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <LogoIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 uppercase italic">
              Case Integrity Suite
            </h1>
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
              <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Enterprise Edition v1.0</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center space-y-3 mb-10">
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
                Välkommen till den säkra portalen för <span className="text-slate-900 dark:text-white font-bold">juridisk analys</span> och <span className="text-slate-900 dark:text-white font-bold">forensisk bevisvärdering</span>.
              </p>
            </div>

            <button
              onClick={onLogin}
              className="group relative w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black py-5 px-8 rounded-2xl transition-all duration-500 shadow-2xl shadow-slate-900/20 dark:shadow-blue-900/30 flex items-center justify-center space-x-4 overflow-hidden uppercase tracking-[0.2em] text-xs active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative">Auktorisera Session</span>
              <ShieldCheckIcon className="h-5 w-5 relative group-hover:scale-110 transition-transform" />
            </button>

            <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center space-y-6">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black text-center leading-loose max-w-xs">
                  Säkerhetsmeddelande: Endast för auktoriserad personal. All aktivitet loggas i enlighet med gällande sekretesslagstiftning.
                </p>
                <div className="flex items-center space-x-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
          &copy; 2026 Forensic Intelligence Systems AB. Alla rättigheter förbehållna.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
