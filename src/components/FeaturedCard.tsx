import React, { useState } from 'react';
import { Sparkles, Flame, Bookmark, ArrowRight, Zap, Share2, MoreHorizontal, EyeOff, PlusCircle } from 'lucide-react';
import { DiscoveryItem } from '../types/discovery';
import { useDiscovery } from '../context/DiscoveryContext';
import { SafeImage } from './SafeImage';

interface FeaturedCardProps {
  item: DiscoveryItem;
  rankBadge?: number;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, rankBadge }) => {
  const {
    navigateTo,
    isSaved,
    toggleSave,
    isSparked,
    toggleSpark,
    sparksMap,
    shareItem,
    showMoreLikeThis,
    markAsNotInterested
  } = useDiscovery();

  const [menuOpen, setMenuOpen] = useState(false);

  const saved = isSaved(item.id);
  const sparked = isSparked(item.id);
  const currentSparks = sparksMap[item.id] ?? item.metrics.sparks;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 bg-[#0e121a] shadow-2xl group transition-all duration-300 hover:border-zinc-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        
        {/* Left / Top: Visual Media Box */}
        <div 
          onClick={() => navigateTo('detail', item.id)}
          className="lg:col-span-7 relative min-h-[260px] sm:min-h-[320px] lg:min-h-full cursor-pointer overflow-hidden bg-zinc-950"
        >
          <SafeImage
            src={item.coverImage}
            alt={item.title}
            fallbackType="article"
            fallbackTitle={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#0e121a] pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {typeof rankBadge === 'number' && !isNaN(rankBadge) && rankBadge > 0 ? (
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 font-black text-sm shadow-lg">
                #{rankBadge}
              </span>
            ) : null}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 shadow-md">
              {item.category}
            </span>
            {item.badge && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 backdrop-blur-md">
                {item.badge}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              {typeof item.heatScore === 'number' && !isNaN(item.heatScore) ? item.heatScore : 0}° Heat Score
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-800/60 text-xs font-medium text-emerald-300 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {item.scanTime}
            </span>
          </div>
        </div>

        {/* Right / Bottom: 30-Second Scan Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Spotlight
              </span>
              <span className="font-mono">{item.readTime}</span>
            </div>

            <h2 
              onClick={() => navigateTo('detail', item.id)}
              className="text-xl sm:text-2xl font-extrabold text-white leading-tight cursor-pointer hover:text-emerald-300 transition-colors"
            >
              {item.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
              {item.tagline}
            </p>

            {/* 30-Second Quick Scan Box */}
            <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  ⚡ 30s Quick Scan
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {item.quickScan.readingTimeSeconds}s Read
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                {item.quickScan.whatItIs}
              </p>
              <div className="space-y-1 pt-1 border-t border-zinc-850">
                {item.quickScan.keyPoints.slice(0, 2).map((kp, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                    <span className="text-emerald-400 shrink-0">•</span>
                    <span className="line-clamp-1">{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-850 relative">
            <button
              onClick={() => navigateTo('detail', item.id)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
            >
              <span>Explore Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSpark(item.id)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                sparked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
              }`}
              title="Spark"
            >
              <Sparkles className={`w-4 h-4 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => toggleSave(item.id)}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                saved
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
              }`}
              title={saved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => shareItem(item)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div 
                  className="absolute right-0 bottom-full mb-2 w-48 bg-[#0f141f] border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
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
      </div>
    </div>
  );
};
