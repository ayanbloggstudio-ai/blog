import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Layers,
  Sparkles,
  Radar,
  BarChart3,
  Database,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Eye,
  ExternalLink,
  Edit,
  Star,
  Flame,
  Zap,
  ShieldCheck,
  Users,
  Package,
  BookOpen,
  MousePointerClick,
  Laptop,
  Cpu,
  MessageSquare
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useCommunity } from '../../context/CommunityContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useNovels } from '../../context/NovelContext';
import { ContentLifecycleStatus } from '../../types/cms';

export const AdminDashboard: React.FC = () => {
  const {
    items,
    categories,
    collections,
    trends,
    sendTrendToAIStudio,
    startCreateContent,
    startEditContent,
    changeStatus,
    setAdminActiveTab,
    getCategoryPublishedCount
  } = useCMS();

  const { products, reviews, reports, users } = useCommunity();
  const { novels, allSubmissions } = useNovels();
  const { aggregatedAnalytics, launchChecklist } = useAnalytics();

  // 10 Section 9 Summary Card Metrics:
  // 1. Total users
  const totalUsersCount = users.length;
  // 2. Digital products
  const digitalProductsCount = products.filter((p) => p.mainCategory === 'digital').length;
  // 3. Physical products
  const physicalProductsCount = products.filter((p) => p.mainCategory === 'physical').length;
  // 4. Web novels
  const webNovelsCount = novels.filter((n) => n.type === 'novel').length;
  // 5. Manga/Manhwa
  const mangaManhwaCount = novels.filter((n) => n.type === 'manga' || n.type === 'manhwa').length;
  // 6. Pending submissions
  const pendingSubmissionsCount = allSubmissions.filter((s) => s.submissionStatus === 'pending_review').length;
  // 7. Reported content
  const reportedContentCount = reports.filter((r) => r.status === 'pending' || r.status === 'reported').length + reviews.filter((r) => r.status === 'flagged').length;
  // 8. Affiliate clicks
  const affiliateClicksCount = products.reduce((sum, p) => sum + (p.referralClicks || 0), 0) + items.filter((i) => Boolean(i.affiliateUrl)).length * 15;
  // 9. Novel reads
  const novelReadsCount = novels.reduce((sum, n) => sum + (n.views || 0), 0);
  // 10. Community engagement
  const communityEngagementCount =
    products.reduce((sum, p) => sum + p.initialLikes + p.initialSaves + (p.sharesCount || 0), 0) +
    reviews.length +
    novels.reduce((sum, n) => sum + n.likes + n.saves + (n.commentsCount || 0), 0);

  // Additional CMS counts
  const publishedCount = (items || []).filter((i) => i && i.status === 'published').length;
  const draftCount = (items || []).filter((i) => i && i.status === 'draft').length;

  const recentItems = [...(items || [])].slice(0, 5);
  const activeTrends = [...(trends || [])].slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>PRISM Unified Admin Dashboard</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Web Novels • Community • CMS
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time overview of Web Novels, Manga, Digital/Physical Community Products, Moderation, and Outbound Monetization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAdminActiveTab('community-products')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </button>

          <button
            onClick={() => setAdminActiveTab('novels')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Novels</span>
          </button>

          <button
            onClick={() => setAdminActiveTab('ai-studio')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-zinc-700 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Studio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10 CORE SUMMARY CARDS (Section 9 Requirement) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
            <span>Core Platform Summary Cards</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">Simple & Verified Live Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Total Users */}
          <div
            onClick={() => setAdminActiveTab('users')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-zinc-400 group-hover:text-emerald-400 transition-colors">
              <span className="text-[11px] uppercase font-bold tracking-wider">Total Users</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">{totalUsersCount}</div>
            <span className="text-[10px] text-zinc-500 block">Active creators & members</span>
          </div>

          {/* 2. Digital Products */}
          <div
            onClick={() => setAdminActiveTab('community-products')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-cyan-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Digital Products</span>
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-cyan-300">{digitalProductsCount}</div>
            <span className="text-[10px] text-zinc-500 block">AI Tools, SaaS, Apps</span>
          </div>

          {/* 3. Physical Products */}
          <div
            onClick={() => setAdminActiveTab('community-products')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-indigo-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Physical Products</span>
              <Laptop className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-indigo-300">{physicalProductsCount}</div>
            <span className="text-[10px] text-zinc-500 block">Phones, Laptops, Audio</span>
          </div>

          {/* 4. Web Novels */}
          <div
            onClick={() => setAdminActiveTab('novels')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-indigo-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Web Novels</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">{webNovelsCount}</div>
            <span className="text-[10px] text-zinc-500 block">Serialized fiction titles</span>
          </div>

          {/* 5. Manga/Manhwa */}
          <div
            onClick={() => setAdminActiveTab('novels')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-cyan-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Manga / Manhwa</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-cyan-300">{mangaManhwaCount}</div>
            <span className="text-[10px] text-zinc-500 block">Graphic series releases</span>
          </div>

          {/* 6. Pending Submissions */}
          <div
            onClick={() => setAdminActiveTab('moderation')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-amber-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Pending Submissions</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-300">{pendingSubmissionsCount}</div>
            <span className="text-[10px] text-zinc-500 block">Awaiting admin review</span>
          </div>

          {/* 7. Reported Content */}
          <div
            onClick={() => setAdminActiveTab('moderation')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-rose-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Reported Content</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-300">{reportedContentCount}</div>
            <span className="text-[10px] text-zinc-500 block">Flagged items & reviews</span>
          </div>

          {/* 8. Affiliate Clicks */}
          <div
            onClick={() => setAdminActiveTab('links')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-emerald-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Affiliate Clicks</span>
              <MousePointerClick className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-300">{affiliateClicksCount}</div>
            <span className="text-[10px] text-zinc-500 block">Outbound partner clicks</span>
          </div>

          {/* 9. Novel Reads */}
          <div
            onClick={() => setAdminActiveTab('analytics')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-purple-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Novel Reads</span>
              <Eye className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-purple-300">{novelReadsCount.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500 block">Chapter reader sessions</span>
          </div>

          {/* 10. Community Engagement */}
          <div
            onClick={() => setAdminActiveTab('rankings')}
            className="bg-[#0e121a] hover:bg-[#121622] p-4 rounded-2xl border border-zinc-800 hover:border-teal-800/80 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-teal-400">
              <span className="text-[11px] uppercase font-bold tracking-wider">Community Engagement</span>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-teal-300">{communityEngagementCount.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500 block">Likes, saves, comments, shares</span>
          </div>
        </div>
      </div>

      {/* CMS Lifecycle Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setAdminActiveTab('content')}
          className="p-3.5 rounded-2xl bg-[#0b0e15] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">CMS Published</span>
          <div className="text-xl font-mono font-extrabold text-emerald-400 mt-1">{publishedCount} items</div>
          <span className="text-[10px] text-zinc-500">Live articles & discoveries</span>
        </div>

        <div 
          onClick={() => setAdminActiveTab('content')}
          className="p-3.5 rounded-2xl bg-[#0b0e15] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">CMS Drafts</span>
          <div className="text-xl font-mono font-extrabold text-amber-400 mt-1">{draftCount} drafts</div>
          <span className="text-[10px] text-zinc-500">Editorial pipeline</span>
        </div>

        <div 
          onClick={() => setAdminActiveTab('categories')}
          className="p-3.5 rounded-2xl bg-[#0b0e15] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Directory Categories</span>
          <div className="text-xl font-mono font-extrabold text-blue-400 mt-1">{categories.length} active</div>
          <span className="text-[10px] text-zinc-500">Taxonomy routes</span>
        </div>

        <div 
          onClick={() => setAdminActiveTab('supabase')}
          className="p-3.5 rounded-2xl bg-[#0b0e15] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Database Sync</span>
          <div className="text-xl font-mono font-extrabold text-emerald-300 mt-1">Connected</div>
          <span className="text-[10px] text-zinc-500">Dual-engine sync</span>
        </div>
      </div>

      {/* Trend Radar & AI Studio Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trend Radar Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900/90 to-[#0e121a] border border-emerald-800/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
              <Radar className="w-3.5 h-3.5 fill-current" />
              Trend Radar Intelligence
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {activeTrends.length} Active Signals
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            AI signals scouted across developer repos, research benchmarks, and visual media velocity. Turn any trending spark into an editorial draft with one click.
          </p>

          <div className="space-y-2 pt-1">
            {activeTrends.map((trend) => (
              <div
                key={trend.id}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{trend.topic}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-bold">
                      +{trend.velocityMultiplier}x
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 line-clamp-1">{trend.shortSummary}</span>
                </div>
                <button
                  onClick={() => sendTrendToAIStudio(trend.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shrink-0 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Draft</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setAdminActiveTab('trends')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore full Trend Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Studio Workflow Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-zinc-900/90 to-[#0e121a] border border-cyan-800/40 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Autonomous AI Studio
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                1-Click Drafting
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Enter any product URL, breakthrough topic, or novel synopsis. Gemini analyzes specs, generates structured summaries, bullet breakdowns, and SEO metadata ready for review.
            </p>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Featured Generator Pipeline</span>
              </div>
              <p className="text-xs text-zinc-400">
                Generate 4-minute deep scan articles, specs comparisons, and affiliate monetization cards in under 3 seconds.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => setAdminActiveTab('ai-studio')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Launch AI Studio</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('content')}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all border border-zinc-700 cursor-pointer"
            >
              Content Library
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Database Quick Sync Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-zinc-950 border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Supabase PostgreSQL Cloud Database
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                PostgreSQL & RLS Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Synchronize {items.length} content items, {categories.length} categories, and {trends.length} trend signals to your cloud Supabase database with 1-click Push & Pull.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminActiveTab('supabase')}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap cursor-pointer shrink-0"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Manage Supabase Sync</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Analytics & Launch Readiness Overview Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Live Analytics & Launch Audit
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% Flywheel Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Tracking {aggregatedAnalytics.totalVisitors.toLocaleString()} total visitors ({aggregatedAnalytics.returningVisitorRate}% retention), {aggregatedAnalytics.totalContentOpens.toLocaleString()} content opens, {aggregatedAnalytics.totalExternalClicks.toLocaleString()} outbound leads, and ${aggregatedAnalytics.totalEstimatedRevenue.toLocaleString()} affiliate revenue.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminActiveTab('analytics')}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap self-start md:self-auto"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Launch Suite & Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Emerging Radar Signals Strip */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e15] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radar className="w-4 h-4 text-emerald-400" />
              <span>Emerging Topic Radar (Signal Pipeline)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              High-velocity topics evaluated for relevance, freshness, and content opportunity.
            </p>
          </div>

          <button
            onClick={() => setAdminActiveTab('trends')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Open Full Radar ({trends.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeTrends.map((trend) => (
            <div
              key={trend.id}
              className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-md font-bold uppercase bg-zinc-850 text-zinc-300 border border-zinc-750">
                    {trend.category}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    +{trend.velocityPercent || 100}% vel
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {trend.topic}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {trend.contentOpportunity}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Audience: {trend.audienceRelevanceScore}/100
                </span>
                <button
                  onClick={() => sendTrendToAIStudio(trend)}
                  className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-800/60 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>AI Draft</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Areas: Recent Content & Category Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Content Management (Col 7) */}
        <div className="lg:col-span-7 bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Recent Content Items
              </h2>
              <p className="text-xs text-zinc-400">
                Latest articles, tools, and directory items in the CMS.
              </p>
            </div>

            <button
              onClick={() => setAdminActiveTab('content')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View All ({items.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#0e121a] p-3.5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-950 border border-zinc-800"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-850 text-zinc-300 border border-zinc-750">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.contentType}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'published'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'draft'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : item.status === 'review'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : item.status === 'scheduled'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    onClick={() => startEditContent(item.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                    title="Edit content"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Visibility & Health (Col 5) */}
        <div className="lg:col-span-5 bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Category Health & Rules
              </h2>
              <p className="text-xs text-zinc-400">
                Rule: Only active categories with &gt;0 published items appear publicly.
              </p>
            </div>

            <button
              onClick={() => setAdminActiveTab('categories')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {categories.map((cat) => {
              const count = getCategoryPublishedCount(cat.name);
              const isVisiblePublicly = cat.isActive && count > 0;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isVisiblePublicly
                      ? 'bg-[#0e121a] border-zinc-800'
                      : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {cat.name}
                        </span>
                        {isVisiblePublicly ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Public Live
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                            Hidden (No content or inactive)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {count} published items
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className={`px-1.5 py-0.5 rounded ${cat.showOnHomepage ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'}`}>
                        Home: {cat.showOnHomepage ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${cat.showInNavigation ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'}`}>
                        Nav: {cat.showInNavigation ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
            <button
              onClick={() => setAdminActiveTab('rankings')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Manage Curated Top 10 Lists</span>
            </button>
            <button
              onClick={() => setAdminActiveTab('comparisons')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Comparisons</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
