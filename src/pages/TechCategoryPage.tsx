import React from 'react';
import { CircuitBoard, Sparkles, Zap, HardDrive, Glasses } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';

export const TechCategoryPage: React.FC = () => {
  const { items, viewMode, setSelectedTag, selectedTag, navigateTo } = useDiscovery();

  const techItems = (items || []).filter(i => i && i.category === 'Tech');
  const featuredItem = techItems.find(i => i.featured) || techItems[0];
  const feedItems = featuredItem ? techItems.filter(i => i && i.id !== featuredItem.id) : techItems;

  const subTopics = [
    'Cyberdeck',
    'Hardware Mod',
    'Photonics',
    'Spatial Computing',
    'Optics',
    'Quantum Computing'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1426] via-[#091120] to-[#07090e] border border-blue-900/50 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-500/40 text-blue-300">
            <CircuitBoard className="w-3.5 h-3.5" />
            Curated Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tech & Hardware
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Milled cyberdecks, holographic micro-HUD waveguides, solid-state electrolyte cells, and monolithic quantum silicon teardowns.
          </p>

          {/* Sub-facets chips */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {subTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTag(selectedTag === topic ? null : topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === topic
                    ? 'bg-blue-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Spotlight */}
      {featuredItem && <FeaturedCard item={featuredItem} />}

      {/* Filter Navigation */}
      <Navigation />

      {/* Category Discovery Grid */}
      {techItems.length === 0 ? (
        <EmptyState
          icon={CircuitBoard}
          title="No tech articles published yet"
          description="Hardware teardowns, computing architectures, and cyberdeck builds will appear here."
          actionLabel="Explore Community Hardware"
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
