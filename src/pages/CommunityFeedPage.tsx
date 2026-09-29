import React, { useMemo } from 'react';
import {
  Flame,
  Star,
  ThumbsUp,
  Clock,
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  X,
  Layers,
  Laptop,
  Cpu,
  RefreshCw,
  Package
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { CommunityProductCard } from '../components/community/CommunityProductCard';
import { CommunityProductDetail } from '../components/community/CommunityProductDetail';
import { EmptyState } from '../components/EmptyState';
import { DIGITAL_CATEGORIES, PHYSICAL_CATEGORIES } from '../data/communityProductsData';
import { CommunitySortFilter } from '../types/community';

export const CommunityFeedPage: React.FC = () => {
  const {
    products,
    filteredProducts,
    selectedProduct,
    setSelectedProductId,
    mainCategory,
    setMainCategory,
    subCategory,
    setSubCategory,
    searchQuery,
    setSearchQuery,
    sortFilter,
    setSortFilter
  } = useCommunity();

  // If a specific product is opened, display its dedicated detail view
  if (selectedProduct) {
    return (
      <CommunityProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  // Get active subcategories based on Digital vs Physical toggle
  const availableSubcategories = useMemo(() => {
    if (mainCategory === 'digital') return [...DIGITAL_CATEGORIES];
    if (mainCategory === 'physical') return [...PHYSICAL_CATEGORIES];
    return ['All Categories', ...DIGITAL_CATEGORIES.slice(1), ...PHYSICAL_CATEGORIES.slice(1)];
  }, [mainCategory]);

  const resetAllFilters = () => {
    setMainCategory('all');
    setSubCategory('all');
    setSearchQuery('');
    setSortFilter('trending');
  };

  const hasActiveFilters =
    mainCategory !== 'all' ||
    (subCategory !== 'all' && !subCategory.startsWith('All ')) ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c101c] via-[#090c14] to-[#06080e] border border-zinc-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Curated Discovery Platform
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
              Verified Signals
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            PRISM Community Discovery Hub
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Explore curated digital tools, software architectures, and breakthrough physical hardware.
            Ranked by authentic community saves, discussion depth, and recent activity—not vanity likes.
          </p>
        </div>

        {/* Ambient background glow accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Category Toggle: All vs Digital vs Physical */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        {/* Toggle Pill Group */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-[#0b0e18] border border-zinc-800 self-start">
          <button
            onClick={() => {
              setMainCategory('all');
              setSubCategory('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainCategory === 'all'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Products ({products.length})</span>
          </button>

          <button
            onClick={() => {
              setMainCategory('digital');
              setSubCategory('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainCategory === 'digital'
                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Digital ({products.filter((p) => p.mainCategory === 'digital').length})</span>
          </button>

          <button
            onClick={() => {
              setMainCategory('physical');
              setSubCategory('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainCategory === 'physical'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Physical ({products.filter((p) => p.mainCategory === 'physical').length})</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI tools, laptops, apps..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-[#0b0e18] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subcategory Filter Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {availableSubcategories.map((cat) => {
          const isSelected =
            (cat === 'All Categories' || cat === 'All Digital' || cat === 'All Physical')
              ? subCategory === 'all' || subCategory.startsWith('All ')
              : subCategory.toLowerCase() === cat.toLowerCase();

          return (
            <button
              key={cat}
              onClick={() => setSubCategory(cat.startsWith('All ') ? 'all' : cat)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                  : 'bg-[#0b0e18] text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Ranking & Sorting Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Trending Tab */}
          <button
            onClick={() => setSortFilter('trending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              sortFilter === 'trending'
                ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-md shadow-rose-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending Velocity</span>
          </button>

          {/* Featured Tab */}
          <button
            onClick={() => setSortFilter('featured')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              sortFilter === 'featured'
                ? 'bg-purple-500 text-white border-purple-400 font-bold shadow-md shadow-purple-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Picks</span>
          </button>

          {/* Most Liked Tab */}
          <button
            onClick={() => setSortFilter('most-liked')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              sortFilter === 'most-liked'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Most Liked</span>
          </button>

          {/* Recently Added Tab */}
          <button
            onClick={() => setSortFilter('recently-added')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              sortFilter === 'recently-added'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Added</span>
          </button>

          {/* Most Discussed Tab */}
          <button
            onClick={() => setSortFilter('most-discussed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              sortFilter === 'most-discussed'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Most Discussed</span>
          </button>
        </div>

        {/* Filter Summary & Reset Button */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0 self-start sm:self-auto">
          <span>Showing {filteredProducts.length} items</span>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 ml-2 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? SlidersHorizontal : Package}
          title={hasActiveFilters ? 'No products match your filters' : 'No products available yet'}
          description={
            hasActiveFilters
              ? 'Try clearing the search query or selecting a different category.'
              : 'Curated software, tools, and hardware products will appear here once published.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
          onAction={hasActiveFilters ? resetAllFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <CommunityProductCard
              key={product.id}
              product={product}
              onViewDetails={() => setSelectedProductId(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
