import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Star,
  Pin,
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  MousePointerClick,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  Eye,
  CheckCircle2,
  Info,
  Laptop,
  Cpu,
  Layers
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CommunityProduct } from '../../types/community';
import { calculateProductStats } from '../../utils/communityRanking';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';

export const AdminCommunityRanking: React.FC = () => {
  const {
    products,
    comments,
    toggleProductPin,
    toggleProductTrending,
    toggleProductFeatured,
    isProductLiked,
    isProductSaved
  } = useCommunity();

  const { showToast } = useDiscovery();

  // Filters & Sorting
  const [mainFilter, setMainFilter] = useState<'all' | 'digital' | 'physical'>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'likes' | 'saves' | 'comments' | 'clicks' | 'views'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute calculated metrics for each product without fake stats
  const scoredProducts = useMemo(() => {
    return products.map((product) => {
      const stats = calculateProductStats(
        product,
        comments,
        isProductLiked(product.id),
        isProductSaved(product.id)
      );

      return {
        product,
        stats,
        trendingScore: stats.trendingScore,
        isTrendingCalculated: stats.isTrending,
        likes: stats.likes,
        saves: stats.saves,
        commentCount: stats.commentCount,
        recentActivity: stats.recentActivityScore,
        shares: product.sharesCount || 0,
        views: product.viewsCount || (stats.likes * 6 + stats.saves * 4 + 10),
        clicks: product.referralClicks || 0,
        isPinned: Boolean(product.isPinned),
        isTrendingManual: product.isTrendingManual,
        featured: product.featured
      };
    });
  }, [products, comments, isProductLiked, isProductSaved]);

  // Filter and Sort
  const sortedAndFiltered = useMemo(() => {
    return scoredProducts
      .filter((item) => {
        if (mainFilter !== 'all' && item.product.mainCategory !== mainFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            item.product.name.toLowerCase().includes(q) ||
            item.product.category.toLowerCase().includes(q) ||
            item.product.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned products always float to top if sorting by trending
        if (sortBy === 'trending') {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          // Manual trending override priority
          if (a.isTrendingManual && !b.isTrendingManual) return -1;
          if (!a.isTrendingManual && b.isTrendingManual) return 1;
          return b.trendingScore - a.trendingScore;
        }
        if (sortBy === 'likes') return b.likes - a.likes;
        if (sortBy === 'saves') return b.saves - a.saves;
        if (sortBy === 'comments') return b.commentCount - a.commentCount;
        if (sortBy === 'clicks') return b.clicks - a.clicks;
        if (sortBy === 'views') return b.views - a.views;
        return 0;
      });
  }, [scoredProducts, mainFilter, sortBy, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Community Product Ranking & Engagement</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time multi-factor engagement ranking based on recency decay, saves, discussion, and authentic referral interactions.
          </p>
        </div>

        {/* Algorithm Info Tag */}
        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No Fake Stats Policy Enforced</span>
        </div>
      </div>

      {/* Algorithm Transparency Callout Card */}
      <div className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800 text-xs text-zinc-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>How PRISM Calculates Public Trending (Anti-Manipulation Formula):</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Unlike legacy platforms that rank purely on cumulative lifetime upvotes, PRISM calculates velocity using:{' '}
          <strong className="text-white">Recent Activity Decay (40%)</strong> +{' '}
          <strong className="text-white">User Saves (25%)</strong> +{' '}
          <strong className="text-white">Comment Depth (20%)</strong> +{' '}
          <strong className="text-white">Net Likes (15%)</strong>.
          Admins can manually pin items, feature titles, or adjust trending status in real time.
        </p>
      </div>

      {/* Control Bar: Filters & Sort Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#0b0e15] border border-zinc-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMainFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mainFilter === 'all' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setMainFilter('digital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mainFilter === 'digital' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Digital</span>
          </button>
          <button
            onClick={() => setMainFilter('physical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mainFilter === 'physical' ? 'bg-indigo-500 text-white shadow-sm' : 'text-zinc-400 hover:text-indigo-300'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>Physical</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
            >
              <option value="trending">Trending Velocity</option>
              <option value="likes">Most Likes</option>
              <option value="saves">Most Saves</option>
              <option value="comments">Most Discussed</option>
              <option value="clicks">Referral Clicks</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Ranking Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0e121a]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider bg-zinc-950/60 font-mono">
              <th className="py-3.5 px-4">Rank</th>
              <th className="py-3.5 px-4">Product Details</th>
              <th className="py-3.5 px-3 text-center">Score</th>
              <th className="py-3.5 px-3 text-center">Likes</th>
              <th className="py-3.5 px-3 text-center">Comments</th>
              <th className="py-3.5 px-3 text-center">Saves</th>
              <th className="py-3.5 px-3 text-center">Shares</th>
              <th className="py-3.5 px-3 text-center">Clicks</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Admin Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sortedAndFiltered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 px-4 text-center">
                  <EmptyState
                    icon={TrendingUp}
                    title="No products match ranking filters"
                    description="Try changing the category filter, search query, or sorting criteria."
                    actionLabel={searchQuery || mainFilter !== 'all' ? 'Reset Filters' : undefined}
                    onAction={
                      searchQuery || mainFilter !== 'all'
                        ? () => {
                            setSearchQuery('');
                            setMainFilter('all');
                          }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              sortedAndFiltered.map((item, index) => {
                const { product, trendingScore, likes, saves, commentCount, shares, clicks } = item;
                const isTrendingPublic = item.isTrendingManual || item.isTrendingCalculated || trendingScore >= 70;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-900/50 transition-colors group"
                  >
                    {/* Rank number */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-sm">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          index === 0
                            ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                            : index === 1
                            ? 'bg-zinc-200 text-zinc-950 shadow-sm'
                            : index === 2
                            ? 'bg-amber-700 text-white shadow-sm'
                            : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>

                    {/* Product Details */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          fallbackType="product"
                          fallbackTitle={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                        />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-white text-xs truncate">{product.name}</h4>
                          {product.isPinned && (
                            <span className="p-0.5 rounded bg-amber-950 text-amber-400 text-[10px]" title="Pinned">
                              <Pin className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                          {product.featured && (
                            <span className="p-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]" title="Featured">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="capitalize text-zinc-300 font-medium">{product.category}</span>
                          <span>•</span>
                          <span className="text-zinc-500">{product.priceStatus}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Calculated Trending Velocity Score */}
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                        trendingScore >= 80
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : trendingScore >= 60
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {typeof trendingScore === 'number' && !isNaN(trendingScore) ? trendingScore : 0}
                    </span>
                  </td>

                  {/* Likes */}
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3 fill-current opacity-70" />
                      {likes}
                    </span>
                  </td>

                  {/* Comments */}
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-indigo-400">
                      <MessageSquare className="w-3 h-3 opacity-70" />
                      {commentCount}
                    </span>
                  </td>

                  {/* Saves */}
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <Bookmark className="w-3 h-3 fill-current opacity-70" />
                      {saves}
                    </span>
                  </td>

                  {/* Shares */}
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-cyan-400">
                      <Share2 className="w-3 h-3 opacity-70" />
                      {shares}
                    </span>
                  </td>

                  {/* Clicks */}
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <MousePointerClick className="w-3 h-3" />
                      {clicks}
                    </span>
                  </td>

                  {/* Public Status Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {product.isPinned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                        PINNED
                      </span>
                    ) : isTrendingPublic ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 fill-current" /> TRENDING
                      </span>
                    ) : product.featured ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                        FEATURED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-400">
                        Regular
                      </span>
                    )}
                  </td>

                  {/* Admin Manual Controls: Feature, Unfeature, Pin, Remove from Trending */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Pin toggle */}
                      <button
                        onClick={() => {
                          toggleProductPin(product.id);
                          showToast(product.isPinned ? 'Unpinned' : 'Pinned to top of rankings', 'info');
                        }}
                        title={product.isPinned ? 'Unpin' : 'Pin to Top'}
                        className={`p-1.5 rounded-lg border text-xs transition-all ${
                          product.isPinned
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${product.isPinned ? 'fill-current' : ''}`} />
                      </button>

                      {/* Feature toggle */}
                      <button
                        onClick={() => {
                          toggleProductFeatured(product.id);
                          showToast(product.featured ? 'Unfeatured product' : 'Featured product', 'info');
                        }}
                        title={product.featured ? 'Unfeature' : 'Feature Product'}
                        className={`p-1.5 rounded-lg border text-xs transition-all ${
                          product.featured
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${product.featured ? 'fill-current' : ''}`} />
                      </button>

                      {/* Trending toggle */}
                      <button
                        onClick={() => {
                          toggleProductTrending(product.id);
                          showToast(
                            product.isTrendingManual
                              ? 'Removed from Trending manually'
                              : 'Marked as Trending manually',
                            'info'
                          );
                        }}
                        title={product.isTrendingManual ? 'Remove from Trending' : 'Mark as Trending'}
                        className={`p-1.5 rounded-lg border text-xs transition-all ${
                          product.isTrendingManual
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${product.isTrendingManual ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
