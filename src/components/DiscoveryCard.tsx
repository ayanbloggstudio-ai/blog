import React, { useState } from 'react';
import {
  Bookmark,
  Sparkles,
  Flame,
  Zap,
  ArrowUpRight,
  Share2,
  MoreHorizontal,
  EyeOff,
  PlusCircle,
  Check,
  Star,
  MessageSquare
} from 'lucide-react';
import { DiscoveryItem } from '../types/discovery';
import { useDiscovery } from '../context/DiscoveryContext';
import { useCommunity } from '../context/CommunityContext';
import { SafeImage } from './SafeImage';

interface DiscoveryCardProps {
  item: DiscoveryItem;
  layoutVariant?: 'default' | 'horizontal' | 'compact';
  rankBadge?: number;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ item, layoutVariant = 'default', rankBadge }) => {
  const {
    isSaved,
    toggleSave,
    isSparked,
    toggleSpark,
    sparksMap,
    navigateTo,
    setSelectedTag,
    markAsNotInterested,
    showMoreLikeThis,
    shareItem
  } = useDiscovery();

  const { getCommunityStats } = useCommunity();

  const [menuOpen, setMenuOpen] = useState(false);

  const saved = isSaved(item.id);
  const sparked = isSparked(item.id);
  const currentSparks = sparksMap[item.id] ?? item.metrics.sparks;
  const communityStats = getCommunityStats(item.id);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'AI & Tools':
        return {
          bg: 'bg-cyan-950/80',
          border: 'border-cyan-800/60',
          text: 'text-cyan-300',
          dot: 'bg-cyan-400'
        };
      case 'Tech':
        return {
          bg: 'bg-blue-950/80',
          border: 'border-blue-800/60',
          text: 'text-blue-300',
          dot: 'bg-blue-400'
        };
      case 'Movies & TV':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-800/60',
          text: 'text-amber-300',
          dot: 'bg-amber-400'
        };
      case 'Manhwa & Anime':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-800/60',
          text: 'text-rose-300',
          dot: 'bg-rose-400'
        };
      default:
        return {
          bg: 'bg-zinc-900',
          border: 'border-zinc-800',
          text: 'text-zinc-300',
          dot: 'bg-zinc-400'
        };
    }
  };

  const catStyle = getCategoryColor(item.category);

  const getAspectClass = () => {
    if (layoutVariant === 'horizontal' || layoutVariant === 'compact') return 'aspect-video';
    switch (item.aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'tall':
        return 'aspect-[9/16]';
      case 'square':
        return 'aspect-square';
      case 'video':
      default:
        return 'aspect-[16/10]';
    }
  };

  // Compact layout variant
  if (layoutVariant === 'compact') {
    return (
      <div className="group relative bg-[#11141c] hover:bg-[#151923] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3 sm:p-3.5 transition-all flex items-center justify-between gap-4">
        <div 
          onClick={() => navigateTo('detail', item.id)}
          className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-950 relative">
            <SafeImage
              src={item.coverImage}
              alt={item.title}
              fallbackType="article"
              fallbackTitle={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {rankBadge && (
              <span className="absolute top-1 left-1 flex items-center justify-center w-5 h-5 rounded bg-amber-400 text-zinc-950 font-black text-[10px]">
                #{rankBadge}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                {item.category}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                {item.scanTime}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {item.quickScan?.whatItIs || item.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSpark(item.id);
            }}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              sparked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Spark"
          >
            <Sparkles className={`w-3.5 h-3.5 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(item.id);
            }}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Save"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // Horizontal magazine layout variant
  if (layoutVariant === 'horizontal') {
    return (
      <div className="group relative bg-[#11141c] hover:bg-[#151923] border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl overflow-hidden transition-all shadow-lg flex flex-col md:flex-row">
        <div 
          onClick={() => navigateTo('detail', item.id)}
          className="md:w-5/12 relative cursor-pointer overflow-hidden bg-zinc-950"
        >
          <SafeImage
            src={item.coverImage}
            alt={item.title}
            fallbackType="article"
            fallbackTitle={item.title}
            className="w-full h-full min-h-[220px] object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent md:hidden pointer-events-none" />
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {rankBadge && (
              <span className="flex items-center justify-center w-6 h-6 rounded bg-amber-400 text-zinc-950 font-black text-xs shadow-md">
                #{rankBadge}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {item.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              {item.heatScore}° Heat
            </div>
            {communityStats.averageRating !== null && (
              <div className="bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-zinc-800 text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{communityStats.averageRating}★</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6 md:w-7/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 text-xs text-zinc-400">
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {item.scanTime}
              </span>
              <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>

            <h3 
              onClick={() => navigateTo('detail', item.id)}
              className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug mb-2"
            >
              {item.title}
            </h3>

            <div className="space-y-1.5 mb-4 bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                <span className="text-emerald-400 font-semibold">Core Concept: </span>
                {item.quickScan.whatItIs}
              </p>
              <div className="flex items-start gap-1.5 text-xs text-zinc-400 pt-1">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="line-clamp-1">{item.quickScan.keyPoints[0]}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
            <div className="flex items-center gap-2">
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
              />
              <span className="text-xs text-zinc-300 font-medium truncate max-w-[120px]">
                {item.author.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleSpark(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sparked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
                title="Spark"
              >
                <Sparkles className={`w-3.5 h-3.5 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{currentSparks}</span>
              </button>

              <button
                onClick={() => toggleSave(item.id)}
                className={`p-2 rounded-lg border transition-all ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
                title={saved ? 'Saved' : 'Save'}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              </button>

              <button
                onClick={() => shareItem(item)}
                className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Overflow Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div 
                    className="absolute right-0 bottom-full mb-1 w-44 bg-[#0f141f] border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        showMoreLikeThis(item);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Show More Like This</span>
                    </button>
                    <button
                      onClick={() => {
                        markAsNotInterested(item.id);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Not Interested</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Masonry Card Layout
  return (
    <div className="group relative bg-[#10131b] hover:bg-[#141824] border border-zinc-800/90 hover:border-zinc-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl">
      {/* Cover Image Container */}
      <div 
        onClick={() => navigateTo('detail', item.id)}
        className={`relative w-full ${getAspectClass()} overflow-hidden bg-zinc-950 cursor-pointer`}
      >
        <SafeImage
          src={item.coverImage}
          alt={item.title}
          fallbackType="article"
          fallbackTitle={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {rankBadge && (
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-zinc-950 font-black text-xs shadow-md">
                #{rankBadge}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border pointer-events-auto ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {item.category}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 backdrop-blur-md flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            {item.scanTime}
          </span>
        </div>

        {/* Real community rating & heat score */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-amber-400">
            <Flame className="w-3 h-3" />
            <span>{item.heatScore}°</span>
          </div>

          {/* Real community rating score (only when real ratings exist!) */}
          {communityStats.averageRating !== null && communityStats.ratingCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-amber-300">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{communityStats.averageRating}★</span>
              <span className="text-zinc-500">({communityStats.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSpark(item.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md text-xs font-medium transition-all shadow-md ${
              sparked
                ? 'bg-amber-500 text-zinc-950 font-bold scale-105'
                : 'bg-zinc-950/80 text-zinc-300 hover:text-white border border-zinc-700/60 hover:bg-zinc-900'
            }`}
            title="Spark"
          >
            <Sparkles className={`w-3.5 h-3.5 ${sparked ? 'fill-zinc-950' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(item.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              saved
                ? 'bg-emerald-500 text-zinc-950 font-bold scale-105'
                : 'bg-zinc-950/80 text-zinc-300 hover:text-white border border-zinc-700/60 hover:bg-zinc-900'
            }`}
            title={saved ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-zinc-950' : ''}`} />
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white border border-zinc-700/60 hover:bg-zinc-900 backdrop-blur-md transition-all shadow-md"
              title="More actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div 
                className="absolute right-0 bottom-full mb-2 w-44 bg-[#0f141f] border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    shareItem(item);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Share Link</span>
                </button>
                <button
                  onClick={() => {
                    showMoreLikeThis(item);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Show More Like This</span>
                </button>
                <button
                  onClick={() => {
                    markAsNotInterested(item.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Not Interested</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {item.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTag(tag);
                }}
                className="text-[10px] font-medium text-zinc-400 hover:text-emerald-400 transition-colors bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850"
              >
                #{tag}
              </button>
            ))}
          </div>

          <h3
            onClick={() => navigateTo('detail', item.id)}
            className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug mb-1.5"
          >
            {item.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.quickScan.whatItIs}
          </p>

          <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 mb-4">
            <div className="flex items-start gap-1.5 text-[11px] text-zinc-300">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="line-clamp-2">{item.quickScan.keyPoints[0]}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-zinc-850/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={item.author.avatar}
              alt={item.author.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
            />
            <span className="text-zinc-400 truncate text-[11px]">
              {item.author.name}
            </span>
          </div>

          <button
            onClick={() => navigateTo('detail', item.id)}
            className="px-2.5 py-1 rounded-md bg-zinc-850 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-300 text-[11px] font-semibold transition-all flex items-center gap-1"
          >
            <span>Scan</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
