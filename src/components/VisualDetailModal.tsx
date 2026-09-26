import React, { useState } from 'react';
import { X, Sparkles, Bookmark, Share2, Flame, ExternalLink, Check, Eye, ChevronRight } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';

export const VisualDetailModal: React.FC = () => {
  const {
    selectedItem,
    setSelectedItem,
    isSaved,
    toggleSave,
    isSparked,
    toggleSpark,
    sparksMap,
    items
  } = useDiscovery();

  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedItem) return null;

  const saved = isSaved(selectedItem.id);
  const sparked = isSparked(selectedItem.id);
  const currentSparks = sparksMap[selectedItem.id] ?? selectedItem.metrics.sparks;

  const galleryImages = selectedItem.gallery && selectedItem.gallery.length > 0
    ? [selectedItem.coverImage, ...selectedItem.gallery.map(g => g.url)]
    : [selectedItem.coverImage];

  const currentDisplayImage = galleryImages[activeImageIndex] || selectedItem.coverImage;

  // Related items from same category (excluding current)
  const relatedItems = (items || [])
    .filter(i => i && i.category === selectedItem.category && i.id !== selectedItem.id)
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-10 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#0d1017] border border-zinc-750 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={() => setSelectedItem(null)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 backdrop-blur-md transition-all shadow-lg"
          aria-label="Close inspector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Media Header */}
        <div className="relative w-full bg-zinc-950 overflow-hidden">
          <div className="relative aspect-[16/9] max-h-[460px] w-full">
            <img
              src={currentDisplayImage}
              alt={selectedItem.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-black/40" />

            {/* Category & Heat Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 shadow-md">
                {selectedItem.category}
              </span>
              {selectedItem.badge && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 backdrop-blur-md">
                  {selectedItem.badge}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                {selectedItem.heatScore}° Heat
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-zinc-300">
                {selectedItem.readTime}
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails if multiple */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-zinc-950/90 border-b border-zinc-800 overflow-x-auto">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-400 scale-105'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-350px)] overflow-y-auto">
          {/* Title & Tagline */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {selectedItem.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              {selectedItem.tagline}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-zinc-800/80">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={selectedItem.author.avatar}
                alt={selectedItem.author.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <div className="text-xs sm:text-sm font-semibold text-zinc-200">
                  {selectedItem.author.name}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {selectedItem.author.role || 'Curator'}
                </div>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSpark(selectedItem.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  sparked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{currentSparks} Sparks</span>
              </button>

              <button
                onClick={() => toggleSave(selectedItem.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                title="Share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Deep Summary */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
              Visual Discovery Synopsis
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedItem.summary}
            </p>
          </div>

          {/* Visual Breakdown Spec Cards */}
          {selectedItem.visualBreakdown && selectedItem.visualBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Visual Specs & Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedItem.visualBreakdown.map((spec, i) => (
                  <div key={i} className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                      {spec.label}
                    </div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {spec.value}
                    </div>
                    {spec.description && (
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {spec.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Highlights Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
              Key Visual Takeaways
            </h3>
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-2.5">
              {selectedItem.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedItem.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Discoveries in this Category */}
          {relatedItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                More in {selectedItem.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group bg-zinc-900/60 hover:bg-zinc-850 p-2.5 rounded-xl border border-zinc-800 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <h5 className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 line-clamp-2">
                      {item.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-mono">
                      <span>{item.readTime}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
