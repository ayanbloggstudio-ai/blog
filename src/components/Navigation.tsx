import React from 'react';
import { LayoutGrid, List, Columns, Sparkles, Filter, X } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';

export const Navigation: React.FC = () => {
  const {
    activeCategory,
    activeTab,
    selectedTag,
    setSelectedTag,
    viewMode,
    setViewMode,
    filteredItems,
    searchQuery,
    setSearchQuery
  } = useDiscovery();

  // Extract top tags based on currently active category
  const availableTags = React.useMemo(() => {
    const set = new Set<string>();
    filteredItems.forEach(item => {
      item.tags.forEach(t => set.add(t));
    });
    return Array.from(set).slice(0, 8);
  }, [filteredItems]);

  return (
    <div className="w-full mb-6 space-y-4">
      {/* Active Filter Pills and View Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        
        {/* Left Side: Current State Description */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
          <span className="font-medium text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Showing:
          </span>

          <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-200 font-semibold border border-zinc-700/60">
            {activeCategory === 'All' ? 'All Curated Topics' : activeCategory}
          </span>

          <span className="text-zinc-400">•</span>

          <span className="capitalize text-zinc-300 font-medium">
            {activeTab.replace('-', ' ')} Feed
          </span>

          <span className="text-zinc-400">•</span>

          <span className="text-zinc-400 font-mono text-[11px]">
            {filteredItems.length} {filteredItems.length === 1 ? 'discovery' : 'discoveries'}
          </span>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] hover:bg-emerald-900/60 transition-colors"
            >
              #{selectedTag}
              <X className="w-3 h-3" />
            </button>
          )}

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 text-[11px] hover:bg-cyan-900/60 transition-colors"
            >
              "{searchQuery}"
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right Side: View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode('masonry')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'masonry'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Adaptive Visual Grid"
            aria-label="Masonry grid layout"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('magazine')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'magazine'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Visual Magazine Flow"
            aria-label="Magazine layout"
          >
            <Columns className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('compact')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'compact'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Compact Stream"
            aria-label="Compact list layout"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tag Pills for Quick Discovery Exploration */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold shrink-0 pr-1">
            <Filter className="w-3 h-3" />
            Tags:
          </div>
          {availableTags.map(tag => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-medium'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/60'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
