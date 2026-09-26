import React from 'react';
import { Palette, Sparkles, Zap, Scroll, Brush } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const AnimeCategoryPage: React.FC = () => {
  const { items, viewMode, setSelectedTag, selectedTag, navigateTo } = useDiscovery();

  const animeItems = (items || []).filter(i => i && i.category === 'Manhwa & Anime');
  const featuredItem = animeItems.find(i => i.featured) || animeItems[0];
  const feedItems = featuredItem ? animeItems.filter(i => i && i.id !== featuredItem.id) : animeItems;

  const subTopics = [
    'Solo Leveling',
    'Webtoon Art',
    'Sakuga',
    'MAPPA',
    'Frieren',
    'ORV'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c0c16] via-[#140810] to-[#07090e] border border-rose-900/50 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
            <Palette className="w-3.5 h-3.5" />
            Curated Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Manhwa & Anime
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Korean vertical scroll velocity mechanics, MAPPA key animation smear frames, Redice Studio palette maturation, and Madhouse scenic negative space.
          </p>

          {/* Sub-facets chips */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {subTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTag(selectedTag === topic ? null : topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === topic
                    ? 'bg-rose-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Spotlight */}
      {featuredItem && <FeaturedCard item={featuredItem} />}

      {/* Filter Navigation */}
      <Navigation />

      {/* Category Discovery Grid */}
      {animeItems.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No manhwa & anime articles published yet"
          description="Animation breakdowns, sakuga analysis, and webtoon craft studies will appear here."
          actionLabel="Browse Web Novels & Manga"
          onAction={() => navigateTo('novels')}
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
