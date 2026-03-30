import React, { useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '../icons';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose, duration = 6000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-[var(--danger)]/90',
          border: 'border-[var(--danger)]/50',
          icon: <ExclamationTriangleIcon className="h-5 w-5 text-[var(--danger)]" />,
          text: 'text-[var(--accent-foreground)]'
        };
      case 'success':
        return {
          bg: 'bg-[var(--success)]/90',
          border: 'border-[var(--success)]/50',
          icon: <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />,
          text: 'text-[var(--accent-foreground)]'
        };
      default:
        return {
          bg: 'bg-[var(--bg-nav)]/90',
          border: 'border-[var(--accent)]/50',
          icon: <InformationCircleIcon className="h-5 w-5 text-[var(--accent)]" />,
          text: 'text-[var(--accent-foreground)]'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-grow">
          <p className={`text-sm font-medium leading-relaxed ${styles.text}`}>{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full w-full overflow-hidden">
        <div 
          className="h-full bg-white/40 animate-progress-timer"
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
      <style>{`
        @keyframes progress-timer {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-timer {
          animation-name: progress-timer;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
};

export default Toast;