import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Filter,
  X,
  Zap,
  ArrowRight,
  Package,
  BookOpen,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { useDiscovery, PUBLIC_CATEGORIES } from '../context/DiscoveryContext';
import { useCommunity } from '../context/CommunityContext';
import { useNovels } from '../context/NovelContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { CommunityProductCard } from '../components/community/CommunityProductCard';
import { NovelCard } from '../components/novel/NovelCard';
import { EmptyState } from '../components/EmptyState';

export const SearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    selectedTag,
    setSelectedTag,
    items,
    navigateTo
  } = useDiscovery();

  const { products, setSelectedProductId } = useCommunity();
  const { novels, openNovel } = useNovels();
  const { trackSearch } = useAnalytics();

  const [activeTab, setActiveTab] = useState<'all' | 'discoveries' | 'products' | 'novels'>('all');
  const [sortOrder, setSortOrder] = useState<'relevance' | 'latest'>('relevance');

  // Query string normalized
  const query = searchQuery.toLowerCase().trim();

  // 1. Matching Discoveries
  const matchingItems = useMemo(() => {
    return (items || []).filter(item => {
      if (!item) return false;
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (selectedTag && !(item.tags || []).some(t => t && t.toLowerCase() === selectedTag.toLowerCase())) return false;
      if (!query) return true;
      return (
        (item.title || '').toLowerCase().includes(query) ||
        (item.tagline || '').toLowerCase().includes(query) ||
        (item.summary || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.tags || []).some(t => (t || '').toLowerCase().includes(query)) ||
        (item.author?.name || '').toLowerCase().includes(query) ||
        (item.quickScan?.whatItIs || '').toLowerCase().includes(query)
      );
    });
  }, [items, activeCategory, selectedTag, query]);

  // 2. Matching Community Products (Digital tools, Physical products)
  const matchingProducts = useMemo(() => {
    return (products || []).filter(prod => {
      if (!prod || prod.status === 'draft' || prod.status === 'suspended') return false;
      if (!query) return true;
      return (
        (prod.name || '').toLowerCase().includes(query) ||
        (prod.tagline || '').toLowerCase().includes(query) ||
        (prod.description || '').toLowerCase().includes(query) ||
        (prod.category || '').toLowerCase().includes(query) ||
        (prod.subCategory || '').toLowerCase().includes(query) ||
        (prod.tags || []).some(t => (t || '').toLowerCase().includes(query)) ||
        (prod.makerName || '').toLowerCase().includes(query)
      );
    });
  }, [products, query]);

  // 3. Matching Novels & Manga / Manhwa
  const matchingNovels = useMemo(() => {
    return (novels || []).filter(novel => {
      if (!novel) return false;
      if (!query) return true;
      return (
        (novel.title || '').toLowerCase().includes(query) ||
        (novel.author || '').toLowerCase().includes(query) ||
        (novel.description || '').toLowerCase().includes(query) ||
        (novel.genres || []).some(g => (g || '').toLowerCase().includes(query)) ||
        (novel.tags || []).some(t => (t || '').toLowerCase().includes(query))
      );
    });
  }, [novels, query]);

  const totalResults = matchingItems.length + matchingProducts.length + matchingNovels.length;

  // Track search term on real execution
  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        trackSearch(query, activeCategory, totalResults);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query, activeCategory, totalResults, trackSearch]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setSelectedTag(null);
    setActiveTab('all');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Header Banner */}
      <div className="rounded-3xl bg-[#0c1017] border border-zinc-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Search className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Universal Discovery Search
          </h1>
        </div>

        {/* Search Input Field */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, digital tools, web novels, manga, tech, and breakdowns..."
            className="w-full bg-zinc-900/90 text-white placeholder-zinc-500 pl-11 pr-10 py-3.5 rounded-2xl border border-zinc-750 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base shadow-inner"
            autoFocus
          />
          <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Type Scope Tabs */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-850">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-white shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            All Results ({totalResults})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products & Tools ({matchingProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('novels')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeTab === 'novels'
                ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Novels & Manga ({matchingNovels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('discoveries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeTab === 'discoveries'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Breakdowns ({matchingItems.length})</span>
          </button>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div>
          {searchQuery ? (
            <span>
              Found <strong className="text-white font-mono">{totalResults}</strong> results for &ldquo;
              <span className="text-emerald-400 font-semibold">{searchQuery}</span>&rdquo;
            </span>
          ) : (
            <span>Displaying catalog content ({totalResults} total indexed)</span>
          )}
        </div>

        {(searchQuery || activeCategory !== 'All' || selectedTag || activeTab !== 'all') && (
          <button
            onClick={resetFilters}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Results View */}
      {totalResults === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={
            searchQuery
              ? `No content matched your search for "${searchQuery}". Try different keywords or clear filters.`
              : 'No database content found across products, novels, and articles.'
          }
          actionLabel="Clear Search"
          onAction={resetFilters}
          secondaryLabel="Explore Community"
          onSecondaryAction={() => navigateTo('community')}
        />
      ) : (
        <div className="space-y-10">
          {/* Section: Community Products */}
          {(activeTab === 'all' || activeTab === 'products') && matchingProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Digital Tools & Physical Products</span>
                  <span className="text-xs font-normal text-zinc-400">({matchingProducts.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingProducts.map(product => (
                  <CommunityProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={() => {
                      setSelectedProductId(product.id);
                      navigateTo('community');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Novels & Manga */}
          {(activeTab === 'all' || activeTab === 'novels') && matchingNovels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Web Novels & Manga / Manhwa</span>
                  <span className="text-xs font-normal text-zinc-400">({matchingNovels.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {matchingNovels.map(novel => (
                  <NovelCard
                    key={novel.id}
                    novel={novel}
                    onOpen={() => {
                      openNovel(novel.id);
                      navigateTo('novels');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Visual Discoveries */}
          {(activeTab === 'all' || activeTab === 'discoveries') && matchingItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Curated Visual Breakdowns</span>
                  <span className="text-xs font-normal text-zinc-400">({matchingItems.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {matchingItems.map(item => (
                  <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
