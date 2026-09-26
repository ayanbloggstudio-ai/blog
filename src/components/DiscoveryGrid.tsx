import React, { useEffect, useRef } from 'react';
import { DiscoveryCard } from './DiscoveryCard';
import { useDiscovery } from '../context/DiscoveryContext';
import { Sparkles, Compass, RotateCcw, Loader2 } from 'lucide-react';

export const DiscoveryGrid: React.FC = () => {
  const {
    filteredItems,
    viewMode,
    isLoadingMore,
    hasMore,
    loadMoreItems,
    resetFeed,
    activeCategory,
    searchQuery,
    selectedTag
  } = useDiscovery();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreItems]);

  // Empty State Handling
  if (filteredItems.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center bg-[#0d1017] rounded-3xl border border-zinc-800/80 my-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
          <Compass className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          No visual discoveries match your filters
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          {searchQuery ? `No results for "${searchQuery}" in ` : 'No items found in '}
          <span className="text-zinc-200 font-semibold">{activeCategory}</span>
          {selectedTag ? ` with tag #${selectedTag}` : ''}.
        </p>
        <button
          onClick={resetFeed}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Grid rendering based on selected viewMode */}
      {viewMode === 'masonry' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
          ))}
        </div>
      )}

      {viewMode === 'magazine' && (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" />
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <DiscoveryCard key={item.id} item={item} layoutVariant="compact" />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger Sentinel & Loading Indicator */}
      <div ref={observerTarget} className="w-full py-8 flex flex-col items-center justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-medium shadow-lg animate-pulse">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Discovering fresh visual nodes...</span>
          </div>
        )}

        {!hasMore && filteredItems.length > 0 && (
          <div className="text-center py-4 text-xs text-zinc-400 font-mono flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-zinc-800" />
            <span>You've reached the horizon of public discoveries</span>
            <span className="w-8 h-px bg-zinc-800" />
          </div>
        )}
      </div>
    </div>
  );
};
