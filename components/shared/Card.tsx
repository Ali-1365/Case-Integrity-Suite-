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
    <div className={`bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors ${className}`}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-3 bg-gray-50 dark:bg-[#161616]">
        <div className="text-blue-800 dark:text-cyan-400 flex-shrink-0">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-5 w-5' }) 
            : icon}
        </div>
        <h3 className="text-sm font-semibold text-[#1A202C] dark:text-gray-100">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;
