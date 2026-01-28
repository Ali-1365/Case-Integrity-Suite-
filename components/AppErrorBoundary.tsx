
import React, { ErrorInfo, ReactNode } from 'react';
import { TriangleAlert, RefreshCw, Terminal, Copy } from 'lucide-react';
import { logError } from '../services/logger';

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * AppErrorBoundary v.7.4.0-GOLD
 * Säkrar systemet genom att fånga fatala fel i gränssnittslagret.
 */
// Fix: Use React.Component explicitly and ensure state and props are recognized by the compiler
export default class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  // Fix: Explicitly declare state type to satisfy TypeScript compiler errors on lines 23, 44, 54
  public override state: AppErrorBoundaryState;

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    // Fix: Initialize state property which was reported as missing on line 23
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
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
      // Fix: Access state property from React.Component, fixed error on line 44
      const { error, errorInfo } = this.state;
      const stack = (error?.toString() || "") + "\n" + (errorInfo?.componentStack || "");
      navigator.clipboard.writeText(stack).then(() => {
          alert("Stack trace kopierad till urklipp.");
      }).catch(err => {
          console.error('Kunde inte kopiera fel-loggen:', err);
      });
  };

  render(): ReactNode {
    // Fix: state and props exist on React.Component, fixed errors on lines 54 and 55
    const { hasError, error, errorInfo } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-900/50 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-red-900/20 p-8 border-b border-red-900/30 flex items-center gap-6">
              <div className="p-4 bg-red-900/30 rounded-2xl text-red-400 font-bold">
                <TriangleAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Kritiskt systemfel</h2>
                <p className="text-red-200/70 text-xs font-bold uppercase tracking-widest mt-2">APPLICATION_LAYER_BREACH</p>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <p className="text-slate-300 leading-relaxed text-sm font-medium">
                Systemet har pausats för att skydda dataintegriteten. Felet har loggats och kan användas för teknisk felsökning.
              </p>

              {error && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 font-mono text-[10px] text-red-300/80 overflow-hidden relative">
                   <div className="flex items-center justify-between text-slate-500 mb-4 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} />
                        <span className="uppercase font-black tracking-[0.2em]">Diagnostic Buffer</span>
                      </div>
                      <button 
                          onClick={this.handleCopyStack} 
                          className="flex items-center gap-2 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 font-bold"
                      >
                          <Copy size={12} />
                          <span>COPY_TRACE</span>
                      </button>
                   </div>
                   <div className="overflow-auto max-h-48 custom-scrollbar">
                        <p className="font-bold text-red-400 mb-3 text-xs">{error.toString()}</p>
                        {errorInfo && (
                            <pre className="opacity-60 whitespace-pre-wrap leading-relaxed">{errorInfo.componentStack}</pre>
                        )}
                   </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={this.handleReload}
                  className="flex flex-1 items-center justify-center gap-3 px-8 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl active:scale-95 border border-red-400/20"
                >
                  <RefreshCw size={16} />
                  Forcerad Omladdning
                </button>
                <button 
                  // Fix: setState is a method on React.Component, fixed error on line 109
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="px-8 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border border-slate-700 active:scale-95"
                >
                  Återställ lager
                </button>
              </div>
            </div>
            
            <div className="bg-slate-950 p-6 text-center text-slate-600 text-[9px] font-mono border-t border-slate-900 uppercase tracking-[0.4em]">
              FMJAM Oracle v.7.4.0-GOLD | Integrity: COMPROMISED_RECOVERY_MODE
            </div>
          </div>
        </div>
      );
    }

    return children || null;
  }
}
