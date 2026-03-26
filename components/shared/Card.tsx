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
      <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-6 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-6 w-6' }) 
            : icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 m-0 tracking-tight">{title}</h3>
      </div>
      <div className="p-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
