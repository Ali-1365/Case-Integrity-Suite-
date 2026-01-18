
import React, { useState } from 'react';

interface TabsProps {
  tabs: string[];
  children: (activeTab: string) => React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      {children(activeTab)}
    </div>
  );
};

export default Tabs;
