import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardiserad behållare för UI-element med ikonstöd.
 */
const Card: React.FC<CardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`card overflow-hidden !p-0 ${className}`}>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<{className?: string}>, { className: 'h-5 w-5' })
            : icon}
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
