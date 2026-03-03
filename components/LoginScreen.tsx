
import React from 'react';
import { LogoIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="text-center p-10 bg-[#111111] border border-gray-800 rounded-2xl shadow-sm max-w-md w-full">
        <div className="p-4 bg-cyan-500/10 rounded-2xl inline-block mb-6 border border-cyan-500/20">
            <LogoIcon className="h-12 w-12 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-100 mb-2">
          FMJAM GOLD
        </h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Säker inloggning till Forensic Master Juridisk Analysmotor.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
        >
          Auktorisera Session
        </button>
        <p className="text-xs text-gray-600 mt-8">
          Endast för auktoriserad personal. All aktivitet loggas.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
