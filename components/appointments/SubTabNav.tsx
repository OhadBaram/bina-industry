import React from 'react';

interface SubTabNavProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const SubTabNav: React.FC<SubTabNavProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40'
                : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
