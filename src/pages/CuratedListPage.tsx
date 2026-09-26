import React from 'react';
import {
  ArrowLeft,
  ListOrdered,
  Sparkles,
  ExternalLink,
  Check,
  Scale,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Users,
  Layers
} from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { DirectoryCard } from '../components/DirectoryCard';

export const CuratedListPage: React.FC = () => {
  const {
    activeCuratedListId,
    getCuratedList,
    curatedLists,
    directoryItems,
    getDirectoryItem,
    openDirectoryItem,
    openComparison,
    navigateTo
  } = useDiscovery();

  const list = activeCuratedListId ? getCuratedList(activeCuratedListId) : curatedLists[0];

  if (!list) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">List not found</h2>
        <button
          onClick={() => navigateTo('directories')}
          className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          Return to Directories
        </button>
      </div>
    );
  }

  const items = (list.itemIds || [])
    .map(id => getDirectoryItem(id))
    .filter(Boolean) as typeof directoryItems;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <button
          onClick={() => navigateTo('directories')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Directories & Lists</span>
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {list.type === 'top-10' ? 'Top 10 Curated Index' : 'Thematic Recommendation Stack'}
        </span>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {list.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
          {list.subtitle}
        </p>

        {/* Curator Rationale & Audience Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Curator Evaluation Notes
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {list.curatorNotes}
            </p>
          </div>

          <div className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Target Audience
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {list.targetAudience}
            </p>
          </div>
        </div>
      </div>

      {/* Numbered Ranked Entries */}
      <div className="space-y-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-emerald-400" />
            Ranked Recommendations ({items.length} Entries)
          </h2>

          {items.length >= 2 && (
            <button
              onClick={() => openComparison(items.map(i => i.id).slice(0, 3))}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Top Picks</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="group bg-[#0f131c] hover:bg-[#131824] border border-zinc-800 rounded-3xl p-5 sm:p-7 transition-all flex flex-col md:flex-row gap-6 shadow-xl"
            >
              {/* Media Thumbnail */}
              <div 
                onClick={() => openDirectoryItem(item.id)}
                className="md:w-5/12 relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 cursor-pointer shrink-0"
              >
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 font-black text-xs shadow-md">
                    #{idx + 1}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-zinc-950">
                    {item.bestFor}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    {item.pricing}
                  </span>
                </div>
              </div>

              {/* Details & Specs */}
              <div className="md:w-7/12 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {item.categoryName}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {item.releaseOrVersion}
                    </span>
                  </div>

                  <h3
                    onClick={() => openDirectoryItem(item.id)}
                    className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {item.tagline}
                  </p>

                  <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Suitability Fit:
                    </span>
                    <p className="text-xs text-zinc-200">
                      {item.whoItsFor}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <a
                    href={item.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => openDirectoryItem(item.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Full Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
