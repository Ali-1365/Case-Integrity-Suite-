
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Fingerprint } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-sans transition-colors duration-500">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-[var(--accent)]"></div>

          <div className="text-center mb-12 relative">
            <div className="inline-flex p-5 bg-[var(--bg-main)] rounded-[2rem] border border-[var(--border)] mb-8 shadow-inner transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <ShieldCheck className="w-12 h-12 text-[var(--accent)]" />
            </div>
            <h1 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter mb-2 font-serif italic uppercase">Case Integrity</h1>
            <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.4em]">Forensisk Juridisk AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-4">Identifiering</label>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)] group-focus-within/input:text-[var(--accent)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tjanstemail@domstol.se"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-[var(--ink-main)] placeholder:text-[var(--ink-muted)]/30 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-4">Säkerhetskod</label>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)] group-focus-within/input:text-[var(--accent)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-[var(--ink-main)] placeholder:text-[var(--ink-muted)]/30 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--ink-main)] text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-all shadow-xl shadow-[var(--ink-main)]/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Auktorisera Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest leading-loose max-w-xs mx-auto">
              Säkerhetsmeddelande: Endast för auktoriserad personal. All aktivitet loggas i enlighet med gällande sekretesslagstiftning.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-8 opacity-40">
           <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3 h-3 text-[var(--ink-muted)]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">AES-256</span>
           </div>
           <div className="flex items-center space-x-2">
              <Fingerprint className="w-3 h-3 text-[var(--ink-muted)]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">Biometrisk Redo</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
