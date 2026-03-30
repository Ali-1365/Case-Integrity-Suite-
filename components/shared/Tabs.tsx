
import React, { useState } from 'react';

interface TabsProps {
  tabs: string[];
  children: (activeTab: string) => React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, children, activeTab: controlledActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]);
  
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <div>
      <div className="border-b border-[var(--border)]">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`${
                activeTab === tab
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:border-[var(--border-strong)]'
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
