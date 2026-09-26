import React from 'react';
import { Flame, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const TrendingPage: React.FC = () => {
  const { items, viewMode, sparksMap, navigateTo } = useDiscovery();

  // Sort strictly by heatScore + sparks velocity
  const sortedTrending = [...items].sort((a, b) => {
    const aSparks = sparksMap[a.id] ?? a.metrics.sparks;
    const bSparks = sparksMap[b.id] ?? b.metrics.sparks;
    return (b.heatScore + bSparks / 40) - (a.heatScore + aSparks / 40);
  });

  const numberOne = sortedTrending[0];
  const restTrending = sortedTrending.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Live Visual Velocity
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Heat Score ≥ 80°
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trending Discoveries
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Ranked by community spark velocity, visual inspection dwell time, and cross-category bookmark frequency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Real-time Velocity Index</span>
          </div>
        </div>
      </div>

      {/* #1 Trending Spotlight */}
      {numberOne && <FeaturedCard item={numberOne} rankBadge={1} />}

      {/* Filter Navigation */}
      <Navigation />

      {sortedTrending.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No trending content yet"
          description="Trending discoveries and products will appear here as community reads, sparks, and saves increase."
          actionLabel="Browse Community"
          onAction={() => navigateTo('community')}
          secondaryLabel="Explore Latest"
          onSecondaryAction={() => navigateTo('latest')}
        />
      ) : (
        <>
          {viewMode === 'masonry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {restTrending.map((item, idx) => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="default" rankBadge={idx + 2} />
              ))}
            </div>
          )}

          {viewMode === 'magazine' && (
            <div className="space-y-6">
              {restTrending.map((item, idx) => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" rankBadge={idx + 2} />
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-3">
              {restTrending.map((item, idx) => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="compact" rankBadge={idx + 2} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
