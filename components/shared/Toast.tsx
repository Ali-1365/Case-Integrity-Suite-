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
          bg: 'bg-red-950/90',
          border: 'border-red-500/50',
          icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />,
          text: 'text-red-200'
        };
      case 'success':
        return {
          bg: 'bg-green-950/90',
          border: 'border-green-500/50',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
          text: 'text-green-200'
        };
      default:
        return {
          bg: 'bg-blue-950/90',
          border: 'border-blue-500/50',
          icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
          text: 'text-blue-200'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-grow">
          <p className={`text-sm font-medium leading-relaxed ${(styles as { text: string }).text}`}>{message}</p>
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