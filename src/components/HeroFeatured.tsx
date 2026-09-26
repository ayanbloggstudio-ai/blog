import React, { useState } from 'react';
import { Sparkles, Flame, Bookmark, ArrowRight, Eye, Layers } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { DiscoveryItem } from '../types/discovery';

export const HeroFeatured: React.FC = () => {
  const { items, setSelectedItem, isSaved, toggleSave, isSparked, toggleSpark, sparksMap } = useDiscovery();
  
  // Pick featured items or top heat items
  const featuredPool = (items || []).filter(item => item && (item.featured || (item.heatScore || 0) >= 95)).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!featuredPool || featuredPool.length === 0) return null;

  const currentItem = featuredPool[currentIndex] || featuredPool[0];
  if (!currentItem) return null;
  const saved = isSaved(currentItem.id);
  const sparked = isSparked(currentItem.id);
  const currentSparks = sparksMap[currentItem.id] ?? currentItem.metrics?.sparks ?? 0;

  return (
    <div className="relative mb-10 w-full rounded-3xl overflow-hidden border border-zinc-800 bg-[#0e121a] shadow-2xl">
      {/* Background visual art layer with glass gradient overlay */}
      <div className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex flex-col justify-end p-6 sm:p-8 md:p-12 overflow-hidden">
        <img
          src={currentItem.coverImage}
          alt={currentItem.title}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 transform scale-100 transition-all duration-700 ease-out"
        />
        
        {/* Dynamic Multi-layered Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090c12] via-[#090c12]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090c12]/90 via-[#090c12]/50 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Top meta tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              SPOTLIGHT DISCOVERY
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 backdrop-blur-md">
              {currentItem.category}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {currentItem.heatScore}° Heat Score
            </span>
          </div>

          {/* Title */}
          <h2 
            onClick={() => setSelectedItem(currentItem)}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight cursor-pointer hover:text-emerald-300 transition-colors"
          >
            {currentItem.title}
          </h2>

          {/* Tagline */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">
            {currentItem.tagline}
          </p>

          {/* Quick Specs / Highlight bar */}
          {currentItem.visualBreakdown && currentItem.visualBreakdown.length > 0 && (
            <div className="hidden sm:grid grid-cols-3 gap-3 py-2 max-w-xl">
              {currentItem.visualBreakdown.slice(0, 3).map((spec, i) => (
                <div key={i} className="bg-zinc-900/70 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 truncate">
                    {spec.label}
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setSelectedItem(currentItem)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <span>Explore Visual Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSpark(currentItem.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
                sparked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{currentSparks} Sparks</span>
            </button>

            <button
              onClick={() => toggleSave(currentItem.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                saved
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200'
              }`}
              title={saved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Carousel indicators & switchers */}
        <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-8 z-20 flex items-center gap-2">
          {featuredPool.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? 'w-8 bg-emerald-400'
                  : 'w-2 bg-zinc-600/80 hover:bg-zinc-400'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
