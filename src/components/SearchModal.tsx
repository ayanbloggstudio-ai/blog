import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight, CornerDownLeft, Zap, Package, BookOpen } from 'lucide-react';
import { useDiscovery, PUBLIC_CATEGORIES } from '../context/DiscoveryContext';
import { useCommunity } from '../context/CommunityContext';
import { useNovels } from '../context/NovelContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { CategoryType, PageRoute } from '../types/discovery';
import { SafeImage } from './SafeImage';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    items,
    navigateTo,
    activeCategory,
    setActiveCategory
  } = useDiscovery();

  const { products, setSelectedProductId } = useCommunity();
  const { novels, openNovel } = useNovels();
  const { trackSearch } = useAnalytics();

  const [localInput, setLocalInput] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setLocalInput(searchQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen, searchQuery]);

  if (!isSearchOpen) return null;

  const quickPopularQueries = [
    'Radiance', 'Photonics', 'Cyberdeck', 'Solo Leveling', 'Severance', 'Dune', 'Agentic', 'IMAX'
  ];

  const searchResults = (items || []).filter(item => {
    if (!item) return false;
    if (!localInput.trim()) return false;
    const q = localInput.toLowerCase().trim();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.tags || []).some(t => (t || '').toLowerCase().includes(q)) ||
      (item.quickScan?.whatItIs || '').toLowerCase().includes(q)
    );
  }).slice(0, 4);

  const matchingProducts = (products || []).filter(prod => {
    if (!prod || prod.status === 'draft' || prod.status === 'suspended') return false;
    if (!localInput.trim()) return false;
    const q = localInput.toLowerCase().trim();
    return (
      (prod.name || '').toLowerCase().includes(q) ||
      (prod.tagline || '').toLowerCase().includes(q) ||
      (prod.category || '').toLowerCase().includes(q) ||
      (prod.subCategory || '').toLowerCase().includes(q)
    );
  }).slice(0, 3);

  const matchingNovels = (novels || []).filter(novel => {
    if (!novel) return false;
    if (!localInput.trim()) return false;
    const q = localInput.toLowerCase().trim();
    return (
      (novel.title || '').toLowerCase().includes(q) ||
      (novel.author || '').toLowerCase().includes(q) ||
      (novel.genres || []).some(g => (g || '').toLowerCase().includes(q))
    );
  }).slice(0, 3);

  const totalModalMatches = searchResults.length + matchingProducts.length + matchingNovels.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) {
      trackSearch(localInput.trim(), activeCategory, totalModalMatches);
    }
    setSearchQuery(localInput);
    setIsSearchOpen(false);
    navigateTo('search');
  };

  const handleSelectResult = (item: any) => {
    if (localInput.trim()) {
      trackSearch(localInput.trim(), item.category, totalModalMatches);
    }
    setIsSearchOpen(false);
    navigateTo('detail', item.id);
  };

  const handleSelectProduct = (prod: any) => {
    setSelectedProductId(prod.id);
    setIsSearchOpen(false);
    navigateTo('community');
  };

  const handleSelectNovel = (novel: any) => {
    openNovel(novel.id);
    setIsSearchOpen(false);
    navigateTo('novels');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#0c1017] border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <form onSubmit={handleSubmit} className="relative flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-2.5 sm:mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Search breakdowns, tools, manhwa..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-400 focus:outline-none pr-2"
          />
          {localInput && (
            <button
              type="button"
              onClick={() => setLocalInput('')}
              className="p-1.5 text-zinc-400 hover:text-white mr-1.5 touch-manipulation"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 sm:py-1 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-2.5 shrink-0 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close search"
          >
            <span className="hidden sm:inline">ESC</span>
            <span className="sm:hidden flex items-center gap-1"><X className="w-3.5 h-3.5" /> Close</span>
          </button>
        </form>

        {/* Category quick filters */}
        <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-850/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1 shrink-0">
            Scope:
          </span>
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'All'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
            }`}
          >
            All
          </button>
          {PUBLIC_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Search Results / Quick Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {localInput.trim() ? (
            totalModalMatches > 0 ? (
              <div className="space-y-4">
                {/* Products */}
                {matchingProducts.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold px-1 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>Products ({matchingProducts.length})</span>
                    </div>
                    {matchingProducts.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SafeImage
                            src={prod.images?.[0] || prod.heroImage}
                            alt={prod.name}
                            fallbackType="product"
                            fallbackTitle={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-950 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">
                              {prod.subCategory || prod.category}
                            </span>
                            <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 truncate">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate">
                              {prod.tagline}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Novels & Manga */}
                {matchingNovels.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold px-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Web Novels & Manga ({matchingNovels.length})</span>
                    </div>
                    {matchingNovels.map(novel => (
                      <div
                        key={novel.id}
                        onClick={() => handleSelectNovel(novel)}
                        className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SafeImage
                            src={novel.coverImage}
                            alt={novel.title}
                            fallbackType="novel"
                            fallbackTitle={novel.title}
                            className="w-10 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">
                              {novel.type === 'novel' ? 'Web Novel' : 'Manga'} • by {novel.author}
                            </span>
                            <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 truncate">
                              {novel.title}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate">
                              {novel.genres.slice(0, 3).join(', ')}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Discoveries */}
                {searchResults.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold px-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Discoveries ({searchResults.length})</span>
                    </div>
                    {searchResults.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SafeImage
                            src={item.coverImage}
                            alt={item.title}
                            fallbackType="article"
                            fallbackTitle={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                                {item.category}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5" />
                                {item.scanTime}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate">
                              {item.quickScan.whatItIs}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Open Full Universal Search for "{localInput}" ({totalModalMatches})</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <Search className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-zinc-200">No results found for &ldquo;{localInput}&rdquo;</p>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  No matching products, novels, or articles. Press enter to open full search or try another keyword.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                  Trending Curation Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPopularQueries.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setLocalInput(q);
                        setSearchQuery(q);
                        setIsSearchOpen(false);
                        navigateTo('search');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 text-xs border border-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Tip: Use <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">⌘K</kbd> to launch search anywhere.</span>
                <span>ESC to close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
