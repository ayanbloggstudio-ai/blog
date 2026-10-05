import React from 'react';
import {
  LayoutDashboard,
  Radar,
  Sparkles,
  BarChart3,
  FileText,
  Edit,
  Layers,
  Star,
  Scale,
  Image as ImageIcon,
  ShieldAlert,
  Globe,
  Database,
  Eye,
  Sun,
  Moon,
  BookOpen,
  Package,
  Users
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useTheme } from '../../context/ThemeContext';
import { useCommunity } from '../../context/CommunityContext';
import { useNovels } from '../../context/NovelContext';

// Admin Sub-pages
import { AdminDashboard } from './AdminDashboard';
import { AdminNovelManager } from './AdminNovelManager';
import { AdminCommunityProducts } from './AdminCommunityProducts';
import { AdminTrendRadar } from './AdminTrendRadar';
import { AdminAIContentStudio } from './AdminAIContentStudio';
import { AdminAnalyticsLaunch } from './AdminAnalyticsLaunch';
import { AdminSupabase } from './AdminSupabase';
import { AdminContentList } from './AdminContentList';
import { AdminContentEditor } from './AdminContentEditor';
import { AdminCategories } from './AdminCategories';
import { AdminRankingsCollections } from './AdminRankingsCollections';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminModeration } from './AdminModeration';
import { AdminLinksAffiliates } from './AdminLinksAffiliates';

export const AdminLayout: React.FC = () => {
  const {
    adminActiveTab,
    setAdminActiveTab,
    setIsAdminViewOpen,
    startCreateContent,
    items,
    editingItemId
  } = useCMS();

  const { products } = useCommunity();
  const { novels } = useNovels();
  const { navigateTo } = useDiscovery();
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleExitCMS = () => {
    setIsAdminViewOpen(false);
    navigateTo('for-you');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* CMS Top Header */}
      <header className="sticky top-0 z-50 bg-[#0a0d14]/95 backdrop-blur-md border-b border-zinc-800/90 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdminActiveTab('dashboard')}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center font-black text-zinc-950 text-base shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                P
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span>PRISM</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700/60 font-bold">
                    ADMIN
                  </span>
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setAdminActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'dashboard'
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* Web Novels & Manga */}
            <button
              onClick={() => setAdminActiveTab('novels')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'novels'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Novels & Manga ({novels.length})</span>
            </button>

            {/* Digital & Physical Products */}
            <button
              onClick={() => setAdminActiveTab('community-products')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'community-products'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('trends')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'trends'
                  ? 'bg-emerald-400 text-zinc-950 font-black shadow-md shadow-emerald-500/25'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40'
              }`}
            >
              <Radar className="w-3.5 h-3.5 fill-current" />
              <span>Trend Radar</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('ai-studio')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'ai-studio'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>AI Studio</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'analytics'
                  ? 'bg-cyan-400 text-zinc-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30 border border-cyan-800/30'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('content')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'content'
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CMS ({items.length})</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('rankings')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'rankings'
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Rankings</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('links')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'links'
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Affiliates</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('moderation')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'moderation'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-rose-300 hover:text-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Moderation</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                adminActiveTab === 'users'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-purple-300 hover:text-purple-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users</span>
            </button>
          </nav>

          {/* Right Actions: View Public Website */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-700 text-xs font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            <button
              onClick={handleExitCMS}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Return to user-facing live platform"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Live Public View</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'novels', label: 'Novels & Manga 📖' },
            { id: 'community-products', label: 'Products (Dig/Phys) 📦' },
            { id: 'moderation', label: 'Moderation 🛡️' },
            { id: 'rankings', label: 'Rankings 🏆' },
            { id: 'links', label: 'Affiliates 🔗' },
            { id: 'analytics', label: 'Analytics 📊' },
            { id: 'users', label: 'Users 👥' },
            { id: 'trends', label: 'Trend Radar 📡' },
            { id: 'ai-studio', label: 'AI Studio ✨' },
            { id: 'supabase', label: 'Supabase DB 🗄️' },
            { id: 'content', label: 'CMS Articles' },
            { id: 'editor', label: 'Editor' },
            { id: 'categories', label: 'Categories' },
            { id: 'media', label: 'Media' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'editor') {
                  startCreateContent();
                } else {
                  setAdminActiveTab(tab.id as any);
                }
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium cursor-pointer ${
                adminActiveTab === tab.id
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Admin Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {adminActiveTab === 'dashboard' && <AdminDashboard />}
        {adminActiveTab === 'novels' && <AdminNovelManager />}
        {adminActiveTab === 'community-products' && <AdminCommunityProducts />}
        {adminActiveTab === 'users' && <AdminModeration initialTab="users" />}
        {adminActiveTab === 'trends' && <AdminTrendRadar />}
        {adminActiveTab === 'ai-studio' && <AdminAIContentStudio />}
        {adminActiveTab === 'analytics' && <AdminAnalyticsLaunch />}
        {adminActiveTab === 'supabase' && <AdminSupabase />}
        {adminActiveTab === 'content' && <AdminContentList />}
        {adminActiveTab === 'editor' && <AdminContentEditor />}
        {adminActiveTab === 'categories' && <AdminCategories />}
        {adminActiveTab === 'rankings' && <AdminRankingsCollections />}
        {adminActiveTab === 'media' && <AdminMediaLibrary />}
        {adminActiveTab === 'links' && <AdminLinksAffiliates />}
        {adminActiveTab === 'moderation' && <AdminModeration />}
      </main>
    </div>
  );
};
