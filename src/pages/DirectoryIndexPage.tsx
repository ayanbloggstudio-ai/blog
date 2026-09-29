import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Scale,
  ExternalLink,
  Zap,
  Flame,
  ArrowRight,
  ListOrdered,
  Search,
  Check
} from 'lucide-react';
import { useDiscovery, DIRECTORY_SECTIONS } from '../context/DiscoveryContext';
import { DirectoryNavigation } from '../components/DirectoryNavigation';
import { DirectoryCard } from '../components/DirectoryCard';
import { EmptyState } from '../components/EmptyState';
import { DirectoryCategory } from '../types/directory';

interface DirectoryIndexPageProps {
  initialCategory?: DirectoryCategory | 'all';
}

export const DirectoryIndexPage: React.FC<DirectoryIndexPageProps> = ({ initialCategory }) => {
  const {
    directoryItems,
    curatedLists,
    openCuratedList,
    openComparison,
    compareItemIds
  } = useDiscovery();

  const [selectedCat, setSelectedCat] = useState<DirectoryCategory | 'all'>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = (directoryItems || []).filter(item => {
    if (!item) return false;
    const matchesCat = selectedCat === 'all' || item.category === selectedCat;
    const matchesSearch = !searchQuery.trim() ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bestFor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const relevantLists = (curatedLists || []).filter(list => {
    if (!list) return false;
    if (selectedCat === 'all') return true;
    return list.category === selectedCat || list.category === 'cross-discipline';
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Structured Discovery Directories
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {selectedCat === 'all' ? 'Universal Discovery Directory' : DIRECTORY_SECTIONS.find(s => s.id === selectedCat)?.name || 'Directory'}
          </h1>
          
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Clean, structured indices with contextual fit badges, quick specifications, direct official links, and side-by-side comparison.
          </p>
        </div>

        {/* Directory Search & Compare Counter */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tools, gear, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {compareItemIds.length > 0 && (
            <button
              onClick={() => openComparison(compareItemIds)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all shadow-md"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareItemIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Category Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
            selectedCat === 'all'
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
              : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Directories</span>
        </button>

        {DIRECTORY_SECTIONS.map(sec => {
          const isActive = selectedCat === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setSelectedCat(sec.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.name}</span>
            </button>
          );
        })}
      </div>

      {/* CURATED TOP 10 / TOP 20 & RECOMMENDATION LISTS */}
      {relevantLists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-400" />
                Curated Top Lists & Recommendations
              </h2>
              <p className="text-xs text-zinc-400">
                Curator-verified thematic collections with contextual fit ratings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relevantLists.map(list => (
              <div
                key={list.id}
                onClick={() => openCuratedList(list.id)}
                className="group relative bg-[#0e121a] hover:bg-[#121722] border border-zinc-800 hover:border-zinc-700 rounded-3xl overflow-hidden p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                      {list.type === 'top-10' ? 'Top 10 Index' : 'Curated Stack'}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {list.itemIds.length} Picks
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {list.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {list.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px] truncate max-w-[180px]">
                    {list.categoryName}
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View List</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STRUCTURED ITEMS GRID */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Directory Entries ({filteredItems.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Browse specs, best-for suitability, pros/cons, and official links.
            </p>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item, idx) => (
              <DirectoryCard key={item.id} item={item} rankBadge={idx + 1} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title={searchQuery ? 'No directory entries matched your search' : 'No directory items indexed yet'}
            description={searchQuery ? 'Try adjusting your keywords or clearing the category filter.' : 'Curated tools, gear, and media entries will appear here once added.'}
            actionLabel={searchQuery || selectedCat !== 'all' ? 'Reset Filters' : 'Explore Community'}
            onAction={() => {
              if (searchQuery || selectedCat !== 'all') {
                setSearchQuery('');
                setSelectedCat('all');
              } else {
                window.location.hash = '#community';
              }
            }}
          />
        )}
      </section>
    </div>
  );
};
