import React from 'react';
import {
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Zap,
  Tag,
  Check,
  DollarSign,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { DirectoryItem, BestForLabel } from '../types/directory';
import { useDiscovery } from '../context/DiscoveryContext';
import { SafeImage } from './SafeImage';

interface DirectoryCardProps {
  item: DirectoryItem;
  rankBadge?: number;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ item, rankBadge }) => {
  const {
    openDirectoryItem,
    shareItem
  } = useDiscovery();

  const getBestForBadgeStyle = (label: BestForLabel) => {
    switch (label) {
      case 'Best for beginners':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60';
      case 'Best for creators':
        return 'bg-purple-950/90 text-purple-300 border-purple-700/60';
      case 'Best for power users':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/60';
      case 'Best for solo devs':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-700/60';
      case 'Best for cinematography lovers':
        return 'bg-blue-950/90 text-blue-300 border-blue-700/60';
      case 'Best for binge reading':
        return 'bg-rose-950/90 text-rose-300 border-rose-700/60';
      case 'Best for animation enthusiasts':
        return 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-700/60';
      case 'Trending':
        return 'bg-rose-950/90 text-rose-300 border-rose-700/60';
      case 'Popular':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/60';
      case 'New':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="group relative bg-[#0f131c] hover:bg-[#131824] border border-zinc-800/90 hover:border-zinc-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl">
      {/* Cover Image & Contextual Badges */}
      <div 
        onClick={() => openDirectoryItem(item.id)}
        className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-950 cursor-pointer"
      >
        <SafeImage
          src={item.coverImage}
          alt={item.title}
          fallbackType="product"
          fallbackTitle={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f131c] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {typeof rankBadge === 'number' && !isNaN(rankBadge) && rankBadge > 0 ? (
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-zinc-950 font-black text-xs shadow-md pointer-events-auto">
                #{rankBadge}
              </span>
            ) : null}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border pointer-events-auto shadow-sm ${getBestForBadgeStyle(item.bestFor)}`}>
              <Sparkles className="w-3 h-3" />
              {item.bestFor}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-md">
            {item.categoryName}
          </span>
        </div>

        {/* Pricing / Model Pill */}
        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-emerald-300 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            {item.pricing}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => openDirectoryItem(item.id)}
              className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer leading-snug"
            >
              {item.title}
            </h3>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {item.tagline}
          </p>

          {/* Quick Specs Pill Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {item.quickSpecs.slice(0, 2).map((spec, i) => (
              <div key={i} className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80 text-[11px]">
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">{spec.label}</span>
                <span className="text-zinc-200 font-medium truncate block">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Key Feature Highlight */}
          <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/30 text-[11px] text-zinc-300 flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{item.keyHighlights[0]}</span>
          </div>
        </div>

        {/* Card Footer & Action Buttons */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
          <a
            href={item.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors flex items-center gap-1"
            title="Visit official website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => openDirectoryItem(item.id)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
