import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { useDiscovery, AVAILABLE_INTERESTS } from '../context/DiscoveryContext';
import { UserInterest } from '../types/discovery';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    selectedInterests,
    completeOnboarding
  } = useDiscovery();

  const [tempInterests, setTempInterests] = useState<UserInterest[]>(
    selectedInterests.length > 0 ? selectedInterests : ['AI', 'Tech', 'Movies', 'Manhwa', 'Anime']
  );

  if (!isOnboardingOpen) return null;

  const toggleChoice = (id: UserInterest) => {
    setTempInterests(prev =>
      (prev || []).includes(id) ? (prev || []).filter(x => x !== id) : [...(prev || []), id]
    );
  };

  const selectAll = () => {
    setTempInterests(['AI', 'Tech', 'Movies', 'Manhwa', 'Anime']);
  };

  const handleFinish = () => {
    completeOnboarding(tempInterests.length > 0 ? tempInterests : ['AI', 'Tech', 'Movies', 'Manhwa', 'Anime']);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOnboardingOpen(false)}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-[#0d1017] border border-zinc-750 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close"
          title="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pr-6 pl-6 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Prism</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            What are you into?
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Choose the visual disciplines you care about to personalize your daily 30-second discovery stream.
          </p>
        </div>

        {/* 5 Interest Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {AVAILABLE_INTERESTS.map((item) => {
            const isSelected = tempInterests.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChoice(item.id)}
                className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <span>Personalize My Feed ({tempInterests.length} Selected)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <button
              type="button"
              onClick={selectAll}
              className="text-zinc-400 hover:text-emerald-400 transition-colors py-1"
            >
              Select All (Everything)
            </button>
            <button
              type="button"
              onClick={() => {
                setTempInterests(['AI', 'Tech', 'Movies', 'Manhwa', 'Anime']);
                handleFinish();
              }}
              className="hover:underline py-1 text-zinc-400 hover:text-zinc-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
