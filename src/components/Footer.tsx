import React from 'react';
import { ArrowUp, Sparkles, Compass, LayoutDashboard } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { useCMS } from '../context/CMSContext';
import { PageRoute } from '../types/discovery';

export const Footer: React.FC = () => {
  const { navigateTo } = useDiscovery();
  const { getPublicCategories, setIsAdminViewOpen } = useCMS();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publicCategories = getPublicCategories('all');

  const getCategoryRoute = (categoryName: string): PageRoute => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('ai')) return 'category-ai';
    if (lower.includes('tech')) return 'category-tech';
    if (lower.includes('movie') || lower.includes('tv')) return 'category-movies';
    if (lower.includes('manhwa') || lower.includes('anime')) return 'category-anime';
    return 'category-ai';
  };

  return (
    <footer className="w-full bg-[#080a0f] border-t border-zinc-850 mt-16 text-zinc-400">
      <div className="w-full max-w-7xl mx-auto px-[clamp(12px,2vw,32px)] py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-850/80">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xs">
                P
              </div>
              <span className="text-base font-bold text-white tracking-tight font-sans">
                PRISM // VISUAL DISCOVERY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              A bespoke visual discovery surface deconstructing advances in artificial intelligence, hardware engineering, cinematic frames, and illustrated storytelling.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time curation radar active</span>
            </div>
          </div>

          {/* Col 2: Public Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Active Curated Streams
            </h4>
            <ul className="space-y-1.5 text-xs">
              {publicCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateTo(getCategoryRoute(cat.name))}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation Pages & Admin */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Discovery Streams & CMS
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('for-you')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  For You Feed
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trending')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Trending Velocity
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('latest')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Latest Drops
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('directories')}
                  className="hover:text-purple-400 transition-colors"
                >
                  Directories & Top Lists
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('community')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Community & Reviews
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setIsAdminViewOpen(true)}
                  className="hover:text-emerald-400 text-emerald-400/90 font-bold transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin CMS Console</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} Prism Visual Discovery. All curated media assets property of their respective creators.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAdminViewOpen(true)} className="text-zinc-400 hover:text-white">
              CMS Admin
            </button>
            <span>•</span>
            <button onClick={scrollToTop} className="text-emerald-400 hover:underline">
              Scroll Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
