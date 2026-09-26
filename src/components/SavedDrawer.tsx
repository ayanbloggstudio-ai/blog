import React from 'react';
import { X, Bookmark, Trash2, ArrowUpRight, Sparkles, FolderHeart, Zap } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { SafeImage } from './SafeImage';

export const SavedDrawer: React.FC = () => {
  const {
    isSavedOpen,
    setIsSavedOpen,
    savedItems,
    toggleSave,
    navigateTo
  } = useDiscovery();

  if (!isSavedOpen) return null;

  const handleOpenItem = (itemId: string) => {
    setIsSavedOpen(false);
    navigateTo('detail', itemId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={() => setIsSavedOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-96 sm:max-w-md bg-[#0d1017] border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Bookmark className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Saved Discoveries
                </h3>
                <p className="text-xs text-zinc-400">
                  {savedItems.length} {savedItems.length === 1 ? 'visual item' : 'visual items'} bookmarked
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSavedOpen(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close saved drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <FolderHeart className="w-6 h-6 text-zinc-400" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">No bookmarks yet</h4>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Click the bookmark icon on any visual discovery card to curate your personal moodboard.
                </p>
              </div>
            ) : (
              savedItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded-xl p-3 flex gap-3.5 transition-all"
                >
                  <SafeImage
                    src={item.coverImage}
                    alt={item.title}
                    fallbackType="article"
                    fallbackTitle={item.title}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-950 shrink-0 cursor-pointer group-hover:scale-102 transition-transform"
                    onClick={() => handleOpenItem(item.id)}
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <button
                          onClick={() => toggleSave(item.id)}
                          className="text-zinc-400 hover:text-rose-400 p-1 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4
                        onClick={() => handleOpenItem(item.id)}
                        className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {item.quickScan.whatItIs}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                      <span className="font-mono text-emerald-400 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        {item.scanTime}
                      </span>
                      <button
                        onClick={() => handleOpenItem(item.id)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        <span>Scan</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {savedItems.length > 0 && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
              <span>Saved in browser</span>
              <button
                onClick={() => {
                  savedItems.forEach(item => toggleSave(item.id));
                }}
                className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
