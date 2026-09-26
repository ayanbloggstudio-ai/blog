import React from 'react';
import { Clock, Calendar, Zap, Sparkles } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const LatestPage: React.FC = () => {
  const { items, viewMode, navigateTo } = useDiscovery();

  // Sort strictly chronological
  const sortedLatest = [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Group items by relative date
  const todayItems = sortedLatest.slice(0, 4);
  const earlierItems = sortedLatest.slice(4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Chronological Stream
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Live Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Latest Drops
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Real-time feed of newly ingested neural graphics, hardware mod breakdowns, cinematography dissections, and webtoon studies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Timeline Sync: Realtime</span>
        </div>
      </div>

      {/* Filter Navigation */}
      <Navigation />

      {sortedLatest.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No content published yet"
          description="Newly published visual breakdowns, technical analyses, and stories will appear here chronologically."
          actionLabel="Explore Community"
          onAction={() => navigateTo('community')}
          secondaryLabel="View Web Novels"
          onSecondaryAction={() => navigateTo('novels')}
        />
      ) : (
        <>
          {/* Section: Today's Visual Drops */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                Today's Fresh Releases
              </h2>
              <span className="text-xs text-zinc-400 font-mono">({todayItems.length} discoveries)</span>
            </div>

            {viewMode === 'masonry' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {todayItems.map(item => (
                  <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
                ))}
              </div>
            )}

            {viewMode === 'magazine' && (
              <div className="space-y-6">
                {todayItems.map(item => (
                  <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" />
                ))}
              </div>
            )}

            {viewMode === 'compact' && (
              <div className="space-y-3">
                {todayItems.map(item => (
                  <DiscoveryCard key={item.id} item={item} layoutVariant="compact" />
                ))}
              </div>
            )}
          </div>

          {/* Section: Earlier Drops */}
          {earlierItems.length > 0 && (
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Earlier This Week
                </h2>
                <span className="text-xs text-zinc-400 font-mono">({earlierItems.length} discoveries)</span>
              </div>

              {viewMode === 'masonry' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {earlierItems.map(item => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
                  ))}
                </div>
              )}

              {viewMode === 'magazine' && (
                <div className="space-y-6">
                  {earlierItems.map(item => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" />
                  ))}
                </div>
              )}

              {viewMode === 'compact' && (
                <div className="space-y-3">
                  {earlierItems.map(item => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="compact" />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
