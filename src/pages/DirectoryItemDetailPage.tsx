import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Scale,
  Sparkles,
  Check,
  Info,
  DollarSign,
  Share2,
  Bookmark,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Tag,
  FileText
} from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { DirectoryCard } from '../components/DirectoryCard';
import { CommunityVoteBar } from '../components/CommunityVoteBar';
import { CommunityRatingBadge } from '../components/CommunityRatingBadge';
import { CommunityReviewsSection } from '../components/CommunityReviewsSection';

export const DirectoryItemDetailPage: React.FC = () => {
  const {
    activeDirectoryItemId,
    getDirectoryItem,
    directoryItems,
    navigateTo,
    openDirectoryItem,
    openComparison,
    compareItemIds,
    addToCompare,
    removeFromCompare,
    shareItem,
    showToast
  } = useDiscovery();

  const { trackExternalClick } = useAnalytics();

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const item = activeDirectoryItemId ? getDirectoryItem(activeDirectoryItemId) : directoryItems[0];

  if (!item) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Item not found in directory</h2>
        <button
          onClick={() => navigateTo('directories')}
          className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          Return to Directories
        </button>
      </div>
    );
  }

  const isCompared = compareItemIds.includes(item.id);

  const gallery = item.galleryImages && item.galleryImages.length > 0
    ? item.galleryImages
    : [item.coverImage];

  // Similar items in the same directory category
  const similarItems = (directoryItems || [])
    .filter(d => d && d.id !== item.id && d.category === item.category)
    .slice(0, 3);

  const scrollToReviews = () => {
    const el = document.getElementById('community-reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <button
            onClick={() => navigateTo('directories')}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Directories</span>
          </button>
          <span>/</span>
          <span className="text-emerald-400 font-semibold">{item.categoryName}</span>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px]">{item.title}</span>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isCompared) {
                removeFromCompare(item.id);
              } else {
                addToCompare(item.id);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isCompared
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={() => shareItem(item)}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <a
            href={item.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalClick(
              { id: item.id, title: item.title, category: item.categoryName },
              item.officialWebsite,
              'Visit Website',
              false
            )}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>Visit Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Hero Header & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gallery on Left */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
            <img
              src={gallery[activeImageIdx] || item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {item.bestFor}
              </span>
            </div>

            <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-xs font-mono text-emerald-300 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                {item.pricing}
              </span>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === i ? 'border-emerald-400 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Core Specs on Right */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {item.categoryName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{item.releaseOrVersion}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{item.platformOrFormat}</span>
              </div>

              {/* Real Community Rating */}
              <CommunityRatingBadge itemId={item.id} size="sm" interactive={true} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {item.title}
            </h1>

            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              {item.tagline}
            </p>
          </div>

          {/* Quick Specifications Grid */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Quick Specifications
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {item.quickSpecs.map((spec, i) => (
                <div key={i} className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 block uppercase font-semibold">{spec.label}</span>
                  <span className="text-xs font-bold text-zinc-200 mt-0.5 block">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Vote Bar */}
          <CommunityVoteBar item={item} onScrollToReviews={scrollToReviews} />

          {/* Contextual Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {item.badges.map((b) => (
              <span
                key={b}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
              >
                #{b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Structured In-Depth Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
        
        {/* Left: Who It's For & Highlights */}
        <div className="space-y-6">
          <div className="bg-[#0e121a] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Target Suitability (Who It's For)
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {item.whoItsFor}
            </p>
          </div>

          <div className="bg-[#0e121a] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Key Highlights
            </h3>
            <ul className="space-y-2">
              {item.keyHighlights.map((hl, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                  <span className="leading-relaxed">{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Neutral Pros & Considerations */}
        <div className="space-y-6">
          <div className="bg-[#0e121a] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Notable Strengths
            </h3>
            <ul className="space-y-2">
              {item.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0e121a] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              Important Considerations
            </h3>
            <ul className="space-y-2">
              {item.considerations.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Official & Affiliate-Ready External Links Bar */}
      <section className="bg-gradient-to-r from-zinc-900 to-[#0c1017] p-6 rounded-3xl border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Official & Verified Outbound Links
            </h3>
            <p className="text-xs text-zinc-400">
              Direct access to documentation, official portals, and store distributors.
            </p>
          </div>
          <span className="text-[10px] text-zinc-400 italic">
            * Some links may be affiliate-supported to maintain this free directory.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {item.externalLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackExternalClick(
                { id: item.id, title: item.title, category: item.categoryName },
                link.url,
                link.label,
                (link.label || '').toLowerCase().includes('affiliate') || (link.label || '').toLowerCase().includes('pricing') || (link.label || '').toLowerCase().includes('get ') || idx === 1
              )}
              className="p-3 rounded-2xl bg-zinc-950/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-between gap-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all group"
            >
              <span className="truncate">{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* COMMUNITY LAYER: Reviews, Ratings & Discussions */}
      <CommunityReviewsSection
        itemId={item.id}
        itemType="directory"
        itemTitle={item.title}
      />

      {/* ALTERNATIVES & SIMILAR ITEMS */}
      {item.alternatives && item.alternatives.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Key Alternatives & Comparison Options
              </h3>
              <p className="text-xs text-zinc-400">
                Understand how {item.title} compares against other options on the market.
              </p>
            </div>

            <button
              onClick={() => {
                const targetIds = [item.id, ...(item.compareWithIds || [])];
                openComparison(targetIds);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.alternatives.map((alt) => (
              <div key={alt.id} className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{alt.name}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-850 text-zinc-300 border border-zinc-700">
                    {alt.bestFor}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {alt.summary}
                </p>
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850 text-[11px] text-zinc-300">
                  <span className="text-emerald-400 font-semibold">Key Difference: </span>
                  {alt.keyDifference}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SIMILAR ITEMS IN THIS DIRECTORY */}
      {similarItems.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              More in {item.categoryName}
            </h3>
            <p className="text-xs text-zinc-400">
              Browse other curated items in this visual category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarItems.map((sim) => (
              <DirectoryCard key={sim.id} item={sim} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
