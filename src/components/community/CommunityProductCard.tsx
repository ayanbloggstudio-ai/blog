import React from 'react';
import {
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Flame,
  ArrowRight,
  ExternalLink,
  Star,
  Sparkles
} from 'lucide-react';
import { CommunityProduct } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { SafeImage } from '../SafeImage';

interface CommunityProductCardProps {
  product: CommunityProduct;
  onViewDetails?: (product: CommunityProduct) => void;
}

export const CommunityProductCard: React.FC<CommunityProductCardProps> = ({
  product,
  onViewDetails
}) => {
  const {
    getProductStats,
    toggleLikeProduct,
    toggleSaveProduct,
    setSelectedProductId
  } = useCommunity();

  const { showToast } = useDiscovery();

  const stats = getProductStats(product.id);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      setSelectedProductId(product.id);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLiked = toggleLikeProduct(product.id);
    showToast(isNowLiked ? `Liked ${product.name}!` : `Removed like from ${product.name}`, 'info');
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowSaved = toggleSaveProduct(product.id);
    showToast(isNowSaved ? `Saved ${product.name} to collection!` : `Removed ${product.name} from saved items`, 'info');
  };

  return (
    <article
      onClick={handleDetailsClick}
      className="group relative flex flex-col justify-between bg-[#0b0e17] hover:bg-[#0f1422] rounded-3xl border border-zinc-800/90 hover:border-zinc-700/80 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer"
    >
      {/* Top Media & Badges Zone */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-900">
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackType="product"
          fallbackTitle={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-transparent to-black/40 opacity-90 group-hover:opacity-75 transition-opacity pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Main Category & Subcategory Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md border ${
                product.mainCategory === 'digital'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {product.mainCategory}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-950/80 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
              {product.category}
            </span>
          </div>

          {/* Trending Indicator */}
          {stats.isTrending && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/90 text-white font-bold text-[11px] shadow-lg shadow-rose-500/30 backdrop-blur-md animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>Trending</span>
            </div>
          )}
        </div>

        {/* Price / Status Overlay in bottom right of image */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-950/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-md">
            {product.priceStatus}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Product Name & Average Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 tracking-tight">
              {product.name}
            </h3>

            {stats.averageRating !== null && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{stats.averageRating}</span>
                <span className="text-[10px] text-zinc-400">({stats.ratingCount})</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Tags preview */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Footer: Interaction Counts + View Details CTA */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          {/* Counts Cluster (Likes, Comments, Saves) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stats.isLikedByUser
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              title={stats.isLikedByUser ? 'Unlike' : 'Like product'}
              aria-label="Like product"
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${stats.isLikedByUser ? 'fill-rose-400 text-rose-400' : ''}`}
              />
              <span>{stats.likes}</span>
            </button>

            {/* Comment Count */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 text-zinc-400 border border-zinc-800"
              title={`${stats.commentCount} discussions & reviews`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>{stats.commentCount}</span>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stats.isSavedByUser
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              title={stats.isSavedByUser ? 'Unsave' : 'Save product'}
              aria-label="Save product"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${stats.isSavedByUser ? 'fill-amber-400 text-amber-400' : ''}`}
              />
              <span>{stats.saves}</span>
            </button>
          </div>

          {/* View Details Button */}
          <button
            onClick={handleDetailsClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm hover:shadow group/btn shrink-0"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
