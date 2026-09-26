import React from 'react';
import { Film, Sparkles, Zap, Clapperboard, Video } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const MoviesCategoryPage: React.FC = () => {
  const { items, viewMode, setSelectedTag, selectedTag, navigateTo } = useDiscovery();

  const movieItems = (items || []).filter(i => i && i.category === 'Movies & TV');
  const featuredItem = movieItems.find(i => i.featured) || movieItems[0];
  const feedItems = featuredItem ? movieItems.filter(i => i && i.id !== featuredItem.id) : movieItems;

  const subTopics = [
    'Cinematography',
    'Severance',
    'Dune',
    'Greig Fraser',
    'IMAX',
    'Christopher Nolan'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1208] via-[#120e06] to-[#07090e] border border-amber-900/50 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Film className="w-3.5 h-3.5" />
            Curated Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Movies & TV
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Shot-by-shot frame composition, infrared large-format sensor hacks, 65mm analogue black-and-white chemistry, and psychological lighting masterclasses.
          </p>

          {/* Sub-facets chips */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {subTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTag(selectedTag === topic ? null : topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === topic
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Spotlight */}
      {featuredItem && <FeaturedCard item={featuredItem} />}

      {/* Filter Navigation */}
      <Navigation />

      {/* Category Discovery Grid */}
      {movieItems.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No movies & TV articles published yet"
          description="Cinematography masterclasses, lighting breakdowns, and director analyses will appear here."
          actionLabel="Explore Community"
          onAction={() => navigateTo('community')}
        />
      ) : (
        <>
          {viewMode === 'masonry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {feedItems.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="default" />
              ))}
            </div>
          )}

          {viewMode === 'magazine' && (
            <div className="space-y-6">
              {feedItems.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" />
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-3">
              {feedItems.map(item => (
                <DiscoveryCard key={item.id} item={item} layoutVariant="compact" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
