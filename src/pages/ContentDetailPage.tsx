import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Sparkles,
  Share2,
  Check,
  Flame,
  Zap,
  Layers,
  PlusCircle,
  EyeOff,
  Sliders,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  LayoutGrid,
  Rows3,
  List
} from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { CommunityVoteBar } from '../components/CommunityVoteBar';
import { CommunityRatingBadge } from '../components/CommunityRatingBadge';
import { CommunityReviewsSection } from '../components/CommunityReviewsSection';

export const ContentDetailPage: React.FC = () => {
  const {
    activeDetailItem,
    navigateTo,
    isSaved,
    toggleSave,
    isSparked,
    toggleSpark,
    sparksMap,
    getRelatedItems,
    getMoreLikeThis,
    shareItem,
    showMoreLikeThis,
    markAsNotInterested,
    setIsInterestsManagerOpen
  } = useDiscovery();

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [relatedLayout, setRelatedLayout] = useState<'default' | 'horizontal' | 'compact'>('default');
  const [moreLikeLayout, setMoreLikeLayout] = useState<'default' | 'horizontal' | 'compact'>('default');

  if (!activeDetailItem) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No discovery selected</h2>
        <button
          onClick={() => navigateTo('for-you')}
          className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const item = activeDetailItem;
  const saved = isSaved(item.id);
  const sparked = isSparked(item.id);
  const currentSparks = sparksMap[item.id] ?? item.metrics.sparks;

  const galleryList = item.gallery && item.gallery.length > 0
    ? [item.coverImage, ...item.gallery.map(g => g.url)]
    : [item.coverImage];

  const currentDisplayImage = galleryList[activeGalleryIndex] || item.coverImage;

  const relatedItems = getRelatedItems(item, 3);
  const moreLikeThisItems = getMoreLikeThis(item, 4);

  const scrollToReviews = () => {
    const el = document.getElementById('community-reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <button
            onClick={() => navigateTo('for-you')}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discoveries</span>
          </button>
          <span>/</span>
          <span className="text-emerald-400 font-semibold">{item.category}</span>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[180px]">{item.title}</span>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => toggleSpark(item.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              sparked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${sparked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{currentSparks}</span>
          </button>

          <button
            onClick={() => toggleSave(item.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => shareItem(item)}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title="Share URL"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setDetailMenuOpen(!detailMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {detailMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-52 bg-[#0f141f] border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    showMoreLikeThis(item);
                    setDetailMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Show More Like This</span>
                </button>
                <button
                  onClick={() => {
                    setIsInterestsManagerOpen(true);
                    setDetailMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manage Interests</span>
                </button>
                <button
                  onClick={() => {
                    markAsNotInterested(item.id);
                    setDetailMenuOpen(false);
                    navigateTo('for-you');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Not Interested in This</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Block with Real Community Rating */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {item.category}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-mono">{item.readTime}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
              ⚡ {item.scanTime}
            </span>
          </div>

          {/* Real Community Rating Badge */}
          <CommunityRatingBadge itemId={item.id} size="sm" interactive={true} />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {item.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
          {item.tagline}
        </p>

        {/* Community Vote Bar */}
        <CommunityVoteBar item={item} onScrollToReviews={scrollToReviews} />
      </div>

      {/* Hero Visual Display & Gallery Selector */}
      <div className="space-y-3">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
          <img
            src={currentDisplayImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="w-6 h-6 rounded-full border border-zinc-700 object-cover"
              />
              <span className="font-semibold">{item.author.name}</span>
              {item.author.role && (
                <span className="text-zinc-400">({item.author.role})</span>
              )}
            </div>
            <span className="font-mono text-zinc-400">{item.publishedAt}</span>
          </div>
        </div>

        {galleryList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {galleryList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGalleryIndex(idx)}
                className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeGalleryIndex === idx
                    ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 30-60 SECOND FAST SCAN ARCHITECTURE */}
      <section className="bg-[#0b0e15] p-5 sm:p-7 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              30-Second Fast Scan
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Reading time: ~{item.quickScan.readingTimeSeconds}s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              1. What It Is
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {item.quickScan.whatItIs}
            </p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              2. Why It Matters
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {item.quickScan.whyItMatters}
            </p>
          </div>
        </div>

        {/* 3 Core Points */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            3. Core Takeaways
          </span>
          <div className="space-y-2">
            {item.quickScan.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Breakdown / Spec Grid */}
      {item.visualBreakdown && item.visualBreakdown.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
            Visual Specifications & Performance Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {item.visualBreakdown.map((spec, i) => (
              <div key={i} className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 shadow-md">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  {spec.label}
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {spec.value}
                </div>
                {spec.description && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {spec.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* In-depth Editorial Content */}
      <article className="space-y-6 pt-4 border-t border-zinc-800">
        <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
          Detailed Deconstruction
        </h3>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          {item.summary}
        </p>

        {item.sections && item.sections.map((sec, idx) => (
          <div key={idx} className="space-y-3 pt-4">
            <h4 className="text-lg font-bold text-white">
              {sec.heading}
            </h4>
            {sec.paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {p}
              </p>
            ))}
            {sec.visualCallout && (
              <div className="my-4 p-4 rounded-xl bg-zinc-900 border-l-4 border-emerald-500 space-y-1">
                <div className="text-sm sm:text-base font-bold text-white">
                  {sec.visualCallout.text}
                </div>
                {sec.visualCallout.subtext && (
                  <div className="text-xs text-zinc-400">
                    {sec.visualCallout.subtext}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </article>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-850">
        {item.tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-3 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* COMMUNITY LAYER: Reviews, Ratings & Discussions */}
      <CommunityReviewsSection
        itemId={item.id}
        itemType="discovery"
        itemTitle={item.title}
      />

      {/* RELATED CONTENT */}
      {relatedItems.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Related in {item.category}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Curated visual studies with intersecting tags and technique
              </p>
            </div>

            {/* 3 Layout Choose Options */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRelatedLayout('default')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  relatedLayout === 'default'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Grid Cards Layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setRelatedLayout('horizontal')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  relatedLayout === 'horizontal'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Horizontal Magazine Layout"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>Row</span>
              </button>
              <button
                type="button"
                onClick={() => setRelatedLayout('compact')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  relatedLayout === 'compact'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Compact List Layout"
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact</span>
              </button>
            </div>
          </div>

          {relatedLayout === 'default' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedItems.map(rel => (
                <DiscoveryCard key={rel.id} item={rel} layoutVariant="default" />
              ))}
            </div>
          )}

          {relatedLayout === 'horizontal' && (
            <div className="space-y-4">
              {relatedItems.map(rel => (
                <DiscoveryCard key={rel.id} item={rel} layoutVariant="horizontal" />
              ))}
            </div>
          )}

          {relatedLayout === 'compact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedItems.map(rel => (
                <DiscoveryCard key={rel.id} item={rel} layoutVariant="compact" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* MORE LIKE THIS */}
      {moreLikeThisItems.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                More Like This
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Algorithmic recommendation matching visual aspect, aesthetic density, and pace
              </p>
            </div>

            {/* 3 Layout Choose Options */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMoreLikeLayout('default')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  moreLikeLayout === 'default'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Grid Cards Layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setMoreLikeLayout('horizontal')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  moreLikeLayout === 'horizontal'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Horizontal Magazine Layout"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>Row</span>
              </button>
              <button
                type="button"
                onClick={() => setMoreLikeLayout('compact')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  moreLikeLayout === 'compact'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Compact List Layout"
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact</span>
              </button>
            </div>
          </div>

          {moreLikeLayout === 'default' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreLikeThisItems.map(rec => (
                <DiscoveryCard key={rec.id} item={rec} layoutVariant="default" />
              ))}
            </div>
          )}

          {moreLikeLayout === 'horizontal' && (
            <div className="space-y-4">
              {moreLikeThisItems.map(rec => (
                <DiscoveryCard key={rec.id} item={rec} layoutVariant="horizontal" />
              ))}
            </div>
          )}

          {moreLikeLayout === 'compact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moreLikeThisItems.map(rec => (
                <DiscoveryCard key={rec.id} item={rec} layoutVariant="compact" />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
