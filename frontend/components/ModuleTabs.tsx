
import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface ModuleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const ModuleTabs: React.FC<ModuleTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-8 py-4 text-sm font-semibold whitespace-nowrap transition-all relative group ${
            activeTab === tab.id 
              ? 'text-indigo-900' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {tab.label}
          {activeTab === tab.id ? (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-900" />
          ) : (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-transparent group-hover:bg-slate-200 transition-all" />
          )}
        </button>
      ))}
    </div>
  );
};
