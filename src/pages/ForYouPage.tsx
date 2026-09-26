import React from 'react';
import { Sparkles, Zap, Sliders, RotateCcw, Plus, Check } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const ForYouPage: React.FC = () => {
  const {
    filteredItems,
    viewMode,
    selectedInterests,
    setIsInterestsManagerOpen,
    notInterestedIds,
    undoNotInterested,
    clearPersonalizationHistory,
    savedIds,
    userSparkedIds,
    viewedIds,
    boostedTags,
    navigateTo
  } = useDiscovery();

  const topHero = filteredItems[0];
  const regularFeed = filteredItems.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* For You Page Header & Taste Profile Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Personalized Visual Stream
            </span>
            <button
              onClick={() => setIsInterestsManagerOpen(true)}
              className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Taste Profile ({selectedInterests.length} topics)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            For You
          </h1>
          
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Ranked for you using your selected interests ({selectedInterests.join(', ')}), bookmarks, sparked items, and 30-second reading velocity.
          </p>
        </div>

        {/* Live Personalization Taste Capsule */}
        <div className="flex items-center gap-2 flex-wrap max-w-full min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl max-w-full min-w-0">
            {selectedInterests.map(interest => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {interest}
              </span>
            ))}
            <button
              onClick={() => setIsInterestsManagerOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
              title="Edit interests"
              aria-label="Edit topic interests"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Featured Card */}
      {topHero && <FeaturedCard item={topHero} />}

      {/* Filter Navigation Bar */}
      <Navigation />

      {/* Feed Grid */}
      {filteredItems.length > 0 ? (
        <>
          {viewMode === 'masonry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {regularFeed.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
              ))}
            </div>
          )}

          {viewMode === 'magazine' && (
            <div className="space-y-6">
              {regularFeed.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" />
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-3">
              {regularFeed.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="compact" />
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No discoveries published yet"
          description={
            notInterestedIds.length > 0
              ? 'You have hidden several discoveries. You can restore them or adjust your taste profile.'
              : 'New visual breakdowns and discoveries will appear here once published.'
          }
          actionLabel="Taste Profile"
          onAction={() => setIsInterestsManagerOpen(true)}
          secondaryLabel={notInterestedIds.length > 0 ? 'Restore Hidden' : 'Explore Community'}
          onSecondaryAction={notInterestedIds.length > 0 ? clearPersonalizationHistory : () => navigateTo('community')}
        />
      )}
    </div>
  );
};
