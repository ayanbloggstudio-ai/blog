import React from 'react';
import { X, Sliders, Check, RotateCcw, Eye, Bookmark, Sparkles, Ban, Zap } from 'lucide-react';
import { useDiscovery, AVAILABLE_INTERESTS } from '../context/DiscoveryContext';
import { UserInterest } from '../types/discovery';

export const InterestsManagerModal: React.FC = () => {
  const {
    isInterestsManagerOpen,
    setIsInterestsManagerOpen,
    selectedInterests,
    toggleInterest,
    viewedIds,
    savedIds,
    userSparkedIds,
    notInterestedIds,
    boostedTags,
    clearPersonalizationHistory,
    setIsOnboardingOpen
  } = useDiscovery();

  if (!isInterestsManagerOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsInterestsManagerOpen(false)}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-[#0c1017] border border-zinc-750 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Interest Management & Taste Profile
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Control which topics algorithmically shape your For You feed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInterestsManagerOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Interests Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Active Topics ({selectedInterests.length}/5)
            </span>
            <span>Tap to toggle in real time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_INTERESTS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Personalization Telemetry */}
        <div className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            Taste Telemetry Signals (Local)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="text-emerald-400 font-bold font-mono text-base">{viewedIds.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Eye className="w-2.5 h-2.5" /> Viewed
              </div>
            </div>

            <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="text-amber-400 font-bold font-mono text-base">{savedIds.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Bookmark className="w-2.5 h-2.5" /> Saved
              </div>
            </div>

            <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="text-cyan-400 font-bold font-mono text-base">{userSparkedIds.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Sparked
              </div>
            </div>

            <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-850">
              <div className="text-rose-400 font-bold font-mono text-base">{notInterestedIds.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Ban className="w-2.5 h-2.5" /> Hidden
              </div>
            </div>
          </div>

          {boostedTags.length > 0 && (
            <div className="text-xs text-zinc-400 pt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Boosted Tags:</span>
              {boostedTags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
          <button
            onClick={() => {
              clearPersonalizationHistory();
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-300 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Signals</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsInterestsManagerOpen(false);
                setIsOnboardingOpen(true);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
            >
              Re-take Onboarding
            </button>

            <button
              onClick={() => setIsInterestsManagerOpen(false)}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
