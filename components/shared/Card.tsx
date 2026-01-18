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
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 shadow-xl overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-gray-800 flex items-center space-x-3 bg-gray-900/30">
        <div className="text-cyan-400 flex-shrink-0">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-6 w-6' }) 
            : icon}
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
