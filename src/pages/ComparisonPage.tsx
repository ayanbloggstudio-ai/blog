import React from 'react';
import {
  ArrowLeft,
  Scale,
  X,
  ExternalLink,
  Check,
  Info,
  DollarSign,
  Sparkles,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';

export const ComparisonPage: React.FC = () => {
  const {
    compareItemIds,
    removeFromCompare,
    clearCompare,
    getDirectoryItem,
    directoryItems,
    addToCompare,
    openDirectoryItem,
    navigateTo
  } = useDiscovery();

  const items = (compareItemIds || [])
    .map(id => getDirectoryItem(id))
    .filter(Boolean) as typeof directoryItems;

  const availableToAdd = (directoryItems || []).filter(d => d && !(compareItemIds || []).includes(d.id));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <button
            onClick={() => navigateTo('directories')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Directories</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-cyan-400" />
            Side-by-Side Comparison Matrix
          </h1>
          
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Compare contextual fit, pricing models, key specifications, and considerations without numerical bias.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCompare}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 transition-colors self-start sm:self-auto"
          >
            Clear Matrix
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center bg-[#0d1017] rounded-3xl border border-zinc-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Scale className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-base font-bold text-white">No items selected for comparison</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Browse the directories and tap "Compare" on any 2 or 3 tools, products, or titles to inspect them side-by-side.
          </p>
          <button
            onClick={() => navigateTo('directories')}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
          >
            Browse Directories
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* View Mode & Item count bar on Mobile/Desktop */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 font-medium">
              Comparing <strong className="text-white">{items.length} {items.length === 1 ? 'entry' : 'entries'}</strong>
            </span>
            <div className="md:hidden flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-400 px-1.5 font-medium">Layout:</span>
              <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-emerald-400 font-semibold">Stacked</span>
            </div>
          </div>

          {/* Main Matrix Table: Stacks on mobile, multi-column on md+ */}
          <div className="w-full">
            <div className={`grid gap-5 sm:gap-6 grid-cols-1 ${
              items.length === 2 ? 'md:grid-cols-2' : items.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'max-w-md mx-auto'
            }`}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="w-full bg-[#0e121a] border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-xl"
                >
                  {/* Top Card Box */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-zinc-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {item.bestFor}
                      </span>

                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div 
                      onClick={() => openDirectoryItem(item.id)}
                      className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 cursor-pointer relative"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        {item.categoryName}
                      </span>
                      <h3 
                        onClick={() => openDirectoryItem(item.id)}
                        className="text-lg font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {item.tagline}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pricing & Model</span>
                      <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        {item.pricing}
                      </div>
                    </div>

                    {/* Who It's For */}
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Best Contextual Fit</span>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        {item.whoItsFor}
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                        Specifications
                      </span>
                      <div className="space-y-1.5">
                        {item.quickSpecs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-850">
                            <span className="text-zinc-400">{spec.label}</span>
                            <span className="font-semibold text-zinc-200 font-mono text-[11px]">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notable Strengths */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Notable Strengths
                      </span>
                      <ul className="space-y-1.5">
                        {item.pros.slice(0, 2).map((pro, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5 text-xs text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Considerations */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Considerations
                      </span>
                      <ul className="space-y-1.5">
                        {item.considerations.slice(0, 2).map((con, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5 text-xs text-zinc-300">
                            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Outbound & Detail Buttons */}
                  <div className="pt-4 border-t border-zinc-800 space-y-2">
                    <button
                      onClick={() => openDirectoryItem(item.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Full Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={item.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Visit Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add More to Comparison */}
          {items.length < 3 && availableToAdd.length > 0 && (
            <div className="bg-[#0c1017] p-5 rounded-3xl border border-zinc-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Add another entry to this comparison ({items.length}/3)
              </div>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => addToCompare(entry.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{entry.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
