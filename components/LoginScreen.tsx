
import React from 'react';
import { LogoIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full">
        <LogoIcon className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Juridisk Analysmotor
        </h1>
        <p className="text-gray-400 mb-8">
          Logga in för att hantera och analysera dina juridiska dokument.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Logga in
        </button>
        <p className="text-xs text-gray-500 mt-6">
          Detta är en simulerad inloggning. All data hanteras lokalt i din webbläsare.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
