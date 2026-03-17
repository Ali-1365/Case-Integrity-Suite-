
import React from 'react';
import { LogoIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FCFCFC]">
      <div className="text-center p-12 bg-white border border-gray-200 rounded-3xl shadow-xl max-w-md w-full">
        <div className="mb-8 flex justify-center">
            <LogoIcon className="h-16 w-16 text-blue-800" />
        </div>
        <h1 className="text-3xl font-serif tracking-tight text-[#1A202C] mb-3">
          Case Integrity Suite
        </h1>
        <p className="text-sm text-gray-500 mb-10 leading-relaxed font-sans">
          Säker inloggning till den juridiska analysplattformen.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-md btn-primary clickable"
        >
          Auktorisera Session
        </button>
        <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
              Endast för auktoriserad personal. All aktivitet loggas.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
