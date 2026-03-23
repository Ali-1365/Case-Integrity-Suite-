
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { TriangleAlert, RefreshCw, Terminal, Copy, ShieldAlert } from 'lucide-react';
import { logError } from '../services/logger';
import { isAppError, ErrorCode } from '../lib/errors';

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copySuccess: boolean;
}

/**
 * AppErrorBoundary v.7.4.0-GOLD
 * Säkrar systemet genom att fånga fatala fel i gränssnittslagret.
 */
export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState;

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copySuccess: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError("Kritiskt fel fångat i AppErrorBoundary", error, errorInfo);
    // Fix: Property 'setState' exists on React.Component, fixed error on line 36
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };
  
  handleCopyStack = () => {
      const { error, errorInfo } = this.state;
      const stack = (error?.toString() || "") + "\n" + (errorInfo?.componentStack || "");
      navigator.clipboard.writeText(stack).then(() => {
          this.setState({ copySuccess: true });
          setTimeout(() => this.setState({ copySuccess: false }), 3000);
      }).catch(err => {
          console.error('Kunde inte kopiera fel-loggen:', err);
      });
  };

  render(): ReactNode {
    // Fix: state and props exist on React.Component, fixed errors on lines 54 and 55
    const { hasError, error, errorInfo } = this.state;
    const { children } = this.props;

      if (hasError) {
        const isAppErr = isAppError(error);
        const errorCode = isAppErr ? error.code : 'UNKNOWN_FATAL';
        const isAuthError = isAppErr && error.code === ErrorCode.AUTH_ERROR;

        return (
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-gray-200">
            <div className="max-w-2xl w-full bg-[#111111] border border-rose-900/30 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-rose-500/5 p-6 border-b border-rose-900/20 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isAuthError ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {isAuthError ? <ShieldAlert size={24} /> : <TriangleAlert size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">
                    {isAuthError ? 'Behörighetsfel' : 'Kritiskt systemfel'}
                  </h2>
                  <p className="text-rose-400/70 text-xs font-medium uppercase tracking-wider mt-1">
                    {errorCode}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-gray-400 leading-relaxed text-sm">
                  {isAuthError 
                    ? 'Din session har gått ut eller så saknar du behörighet för denna åtgärd. Vänligen logga in igen.'
                    : 'Systemet har pausats för att skydda dataintegriteten. Felet har loggats och kan användas för teknisk felsökning.'}
                </p>

                {error && (
                  <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 p-5 font-mono text-xs text-rose-300/80 overflow-hidden relative">
                     <div className="flex items-center justify-between text-gray-500 mb-3 border-b border-gray-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} />
                          <span className="uppercase font-medium tracking-wider text-[10px]">Diagnostic Buffer</span>
                        </div>
                        <button 
                            onClick={this.handleCopyStack} 
                            className={`flex items-center gap-1.5 transition-colors px-2 py-1 rounded border ${
                                this.state.copySuccess ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'hover:text-gray-300 hover:bg-[#161616] border-transparent hover:border-gray-700'
                            }`}
                        >
                            <Copy size={12} />
                            <span className="text-[10px]">{this.state.copySuccess ? 'COPIED' : 'COPY_TRACE'}</span>
                        </button>
                     </div>
                     <div className="overflow-auto max-h-48 custom-scrollbar">
                          <p className="font-medium text-rose-400 mb-2">{error.toString()}</p>
                          {isAppErr && error.details && (
                            <pre className="text-amber-400/60 mb-2 text-[10px]">DETAILS: {JSON.stringify(error.details, null, 2)}</pre>
                          )}
                          {errorInfo && (
                              <pre className="opacity-60 whitespace-pre-wrap leading-relaxed text-[10px]">{errorInfo.componentStack}</pre>
                          )}
                     </div>
                  </div>
                )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={this.handleReload}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                  <RefreshCw size={16} />
                  Forcerad Omladdning
                </button>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="px-6 py-3 bg-[#161616] hover:bg-gray-800 text-gray-300 rounded-xl font-medium text-sm transition-colors border border-gray-800"
                >
                  Återställ lager
                </button>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] p-4 text-center text-gray-600 text-[10px] font-mono border-t border-gray-800 uppercase tracking-widest">
              FMJAM Oracle v.7.4.0-GOLD | Integrity: COMPROMISED_RECOVERY_MODE
            </div>
          </div>
        </div>
      );
    }

    return children || null;
  }
}
