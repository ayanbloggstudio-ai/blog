import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Sparkles, TrendingUp, Zap, Package, BookOpen, Layers } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { useCommunity } from '../context/CommunityContext';
import { useNovels } from '../context/NovelContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { CommunityProductCard } from '../components/community/CommunityProductCard';
import { NovelCard } from '../components/novel/NovelCard';
import { Navigation } from '../components/Navigation';
import { EmptyState } from '../components/EmptyState';
import { apiClient } from '../services/apiClient';

export const TrendingPage: React.FC = () => {
  const { items, viewMode, sparksMap, navigateTo } = useDiscovery();
  const { products } = useCommunity();
  const { novels } = useNovels();

  const [activeScope, setActiveScope] = useState<'all' | 'discoveries' | 'products' | 'novels'>('all');
  const [realScores, setRealScores] = useState<{
    productScores: Record<string, number>;
    novelScores: Record<string, number>;
  }>({ productScores: {}, novelScores: {} });

  useEffect(() => {
    apiClient.fetchRealTrendingScores().then(res => {
      if (res && res.productScores && res.novelScores) {
        setRealScores(res);
      }
    }).catch(e => console.warn('Trending scores fetch error:', e));
  }, []);

  // Sort Discoveries strictly by heatScore + sparks velocity
  const sortedTrending = useMemo(() => {
    return [...items].sort((a, b) => {
      const aSparks = sparksMap[a.id] ?? a.metrics.sparks;
      const bSparks = sparksMap[b.id] ?? b.metrics.sparks;
      return (b.heatScore + bSparks / 40) - (a.heatScore + aSparks / 40);
    });
  }, [items, sparksMap]);

  // Sort Products using real database trending score
  const sortedTrendingProducts = useMemo(() => {
    return [...products]
      .filter(p => p.status === 'published' || p.status === 'trending' || p.status === 'featured')
      .sort((a, b) => {
        const scoreA = realScores.productScores[a.id] ?? ((a.viewsCount || 0) + a.initialLikes * 4 + a.initialSaves * 6 + (a.sharesCount || 0) * 10);
        const scoreB = realScores.productScores[b.id] ?? ((b.viewsCount || 0) + b.initialLikes * 4 + b.initialSaves * 6 + (b.sharesCount || 0) * 10);
        return scoreB - scoreA;
      });
  }, [products, realScores.productScores]);

  // Sort Novels using real database trending score
  const sortedTrendingNovels = useMemo(() => {
    return [...novels]
      .filter(n => n.submissionStatus === 'approved' || (n as any).status === 'published')
      .sort((a, b) => {
        const scoreA = realScores.novelScores[a.id] ?? ((a.views || 0) + (a.likes || 0) * 4 + (a.saves || 0) * 6 + (a.commentsCount || 0) * 8);
        const scoreB = realScores.novelScores[b.id] ?? ((b.views || 0) + (b.likes || 0) * 4 + (b.saves || 0) * 6 + (b.commentsCount || 0) * 8);
        return scoreB - scoreA;
      });
  }, [novels, realScores.novelScores]);

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
              Recency Decay Weighted
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trending Index
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Real ranking dynamic velocity calculated from recent views, likes, saves, comments, and shares.
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveScope('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeScope === 'all'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            All Trending
          </button>
          <button
            onClick={() => setActiveScope('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeScope === 'products'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({sortedTrendingProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveScope('novels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeScope === 'novels'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Novels & Manga ({sortedTrendingNovels.length})</span>
          </button>
          <button
            onClick={() => setActiveScope('discoveries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeScope === 'discoveries'
                ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Discoveries</span>
          </button>
        </div>
      </div>

      {/* Scope: Products */}
      {activeScope === 'products' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Trending Digital Tools & Physical Products</span>
          </h2>
          {sortedTrendingProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No trending products yet"
              description="Explore community products to spark the engagement velocity."
              actionLabel="Explore Community"
              onAction={() => navigateTo('community')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTrendingProducts.map((p) => (
                <CommunityProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scope: Novels & Manga */}
      {activeScope === 'novels' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Trending Web Novels & Manga</span>
          </h2>
          {sortedTrendingNovels.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No trending web novels yet"
              description="Start reading chapters to build reading streaks and velocity."
              actionLabel="Browse Web Novels"
              onAction={() => navigateTo('novels')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTrendingNovels.map((n) => (
                <NovelCard key={n.id} novel={n} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scope: Discoveries / All */}
      {(activeScope === 'all' || activeScope === 'discoveries') && (
        <>
          {/* #1 Trending Spotlight */}
          {numberOne && activeScope === 'all' && <FeaturedCard item={numberOne} rankBadge={1} />}

          {/* Filter Navigation */}
          {activeScope === 'discoveries' && <Navigation />}

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
                  {(activeScope === 'all' ? restTrending : sortedTrending).map((item, idx) => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="default" rankBadge={idx + (activeScope === 'all' ? 2 : 1)} />
                  ))}
                </div>
              )}

              {viewMode === 'magazine' && (
                <div className="space-y-6">
                  {(activeScope === 'all' ? restTrending : sortedTrending).map((item, idx) => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="horizontal" rankBadge={idx + (activeScope === 'all' ? 2 : 1)} />
                  ))}
                </div>
              )}

              {viewMode === 'compact' && (
                <div className="space-y-3">
                  {(activeScope === 'all' ? restTrending : sortedTrending).map((item, idx) => (
                    <DiscoveryCard key={item.id} item={item} layoutVariant="compact" rankBadge={idx + (activeScope === 'all' ? 2 : 1)} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeScope === 'all' && (
            <>
              {/* Also show Top Trending Products preview if any exist */}
              {sortedTrendingProducts.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>Top Trending Products & Tools</span>
                    </h3>
                    <button
                      onClick={() => setActiveScope('products')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      View All Products →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedTrendingProducts.slice(0, 3).map(p => (
                      <CommunityProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Also show Top Trending Web Novels & Manga preview if any exist */}
              {sortedTrendingNovels.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>Top Trending Web Novels & Manga</span>
                    </h3>
                    <button
                      onClick={() => setActiveScope('novels')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      View All Series →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sortedTrendingNovels.slice(0, 4).map(n => (
                      <NovelCard key={n.id} novel={n} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
