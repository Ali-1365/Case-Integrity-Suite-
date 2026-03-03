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
    <div className={`bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-800 flex items-center space-x-3 bg-[#111111]">
        <div className="text-cyan-400 flex-shrink-0">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-5 w-5' }) 
            : icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;
