
import React, { useState, useEffect } from 'react';
import { loggingService } from '../services/loggingService';
import { useLogging } from '../hooks/useLogging';
import { XMarkIcon, CodeBracketIcon, TrashIcon } from './icons';

interface ErrorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogDetail: React.FC<{ label: string; content: string | null; }> = ({ label, content }) => {
    if (!content) return null;
    return (
        <details className="mt-2 text-left">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-white">{label}</summary>
            <pre className="mt-1 p-2 bg-gray-900 rounded-md text-xs text-gray-300 whitespace-pre-wrap break-all">{content}</pre>
        </details>
    );
};


const ErrorDashboard: React.FC<ErrorDashboardProps> = ({ isOpen, onClose }) => {
  const { logs, clearLogs } = useLogging(100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-700">
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <CodeBracketIcon className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Systemlogg</h2>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={clearLogs} className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300">
                <TrashIcon className="h-4 w-4" />
                <span>Rensa loggar</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
          </div>
        </header>

        <main className="p-6 flex-grow overflow-y-auto">
            {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                    <p>Inga loggar tillgängliga än.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map(log => {
                        const isError = log.level === 'ERROR';
                        const isWarn = log.level === 'WARN';
                        const borderColor = isError ? 'border-red-700/50' : isWarn ? 'border-amber-700/50' : 'border-gray-700';
                        const bgColor = isError ? 'bg-red-900/20' : isWarn ? 'bg-amber-900/20' : 'bg-gray-900/50';

                        return (
                            <div key={log.id} className={`p-4 border ${borderColor} ${bgColor} rounded-lg`}>
                                <div className="flex justify-between items-start text-sm">
                                    <div>
                                        <span className={`font-bold ${isError ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-green-400'}`}>{log.level}</span>
                                        <span className="text-gray-400 mx-2">|</span>
                                        <span className="font-mono bg-gray-700 px-2 py-0.5 rounded text-xs text-white">{log.mode}</span>
                                        <span className="text-gray-400 mx-2">|</span>
                                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('sv-SE')}</span>
                                    </div>
                                    <div className="text-gray-400">{log.duration ? `${log.duration}ms` : ''}</div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-200">{log.message}</p>
                                    {log.details && (
                                        <LogDetail label="Visa detaljer" content={JSON.stringify(log.details, null, 2)} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ErrorDashboard;
