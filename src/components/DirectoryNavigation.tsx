import React from 'react';
import { Sparkles, ListOrdered, Layers, Zap } from 'lucide-react';
import { useDiscovery, DIRECTORY_SECTIONS } from '../context/DiscoveryContext';
import { PageRoute } from '../types/discovery';

export const DirectoryNavigation: React.FC = () => {
  const { currentRoute, navigateTo } = useDiscovery();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* All Hub */}
        <button
          onClick={() => navigateTo('directories')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
            currentRoute === 'directories'
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
              : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Directories</span>
        </button>

        {/* 5 Sectors */}
        {DIRECTORY_SECTIONS.map((sec) => {
          const isActive = currentRoute === sec.route;
          return (
            <button
              key={sec.id}
              onClick={() => navigateTo(sec.route)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-zinc-800 text-zinc-400'}`}>
                {sec.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
