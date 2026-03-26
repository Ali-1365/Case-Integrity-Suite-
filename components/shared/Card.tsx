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
    <div className={`bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden group ${className}`}>
      <div className="px-12 py-10 border-b-2 border-slate-50 dark:border-slate-800/50 flex items-center space-x-8 bg-slate-50/30 dark:bg-slate-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="p-5 bg-white dark:bg-slate-800 rounded-[1.75rem] text-indigo-600 dark:text-indigo-400 shadow-sm border-2 border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-8 w-8' }) 
            : icon}
        </div>
        <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 m-0 tracking-tighter relative z-10">{title}</h3>
      </div>
      <div className="p-12 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
