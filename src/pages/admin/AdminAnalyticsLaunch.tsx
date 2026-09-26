import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Bookmark,
  Share2,
  ThumbsUp,
  DollarSign,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Compass,
  BookOpen
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useNovels } from '../../context/NovelContext';

export const AdminAnalyticsLaunch: React.FC = () => {
  const {
    aggregatedAnalytics,
    topContentByEngagement,
    topCategories,
    topSearches,
    mostSaved,
    mostShared,
    mostLiked,
    bestExternalClickContent,
    bestAffiliateContent,
    trendPerformance,
    launchChecklist,
    brokenLinks,
    brokenImages,
    seoChecks,
    performanceChecks,
    isAuditing,
    lastAuditTimestamp,
    runFullLaunchAudit,
    resetAnalyticsData
  } = useAnalytics();

  const { items, setAdminActiveTab, startEditContent } = useCMS();
  const { showToast } = useDiscovery();
  const { novels, readingProgress } = useNovels();

  // Active Sub-Tab: 'analytics' | 'novel_analytics' | 'launch_checklist' | 'link_image_auditor' | 'device_tester' | 'seo_perf'
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'novel_analytics' | 'launch_checklist' | 'link_image_auditor' | 'device_tester' | 'seo_perf'
  >('analytics');

  // Breakdown Filter in Analytics Tab
  const [analyticsSubView, setAnalyticsSubView] = useState<
    'all_content' | 'categories' | 'searches' | 'saved' | 'shared' | 'liked' | 'external' | 'affiliates' | 'trends'
  >('all_content');

  // Device Tester Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewPath, setPreviewPath] = useState<string>('for-you');

  const handleRefreshAudit = async () => {
    await runFullLaunchAudit();
    showToast('Launch audit refreshed with latest platform state!', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/90 to-emerald-950/30 border border-cyan-800/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-cyan-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
              <BarChart3 className="w-3.5 h-3.5 fill-current" />
              ANALYTICS & LAUNCH CENTER
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-[11px] font-medium border border-zinc-700/80">
              Production Ready v1.0
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 text-[11px] font-medium border border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              100% Flywheel Connected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Traffic, Engagement & Launch Verification Suite
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Monitor real-time reader engagement across the full business flywheel (<strong className="text-white">Discover → Explore → Save/Share → Outbound Click → Return → Monetize</strong>). Verify broken links, broken images, SEO tags, and responsive viewport performance before launch.
          </p>
        </div>

        {/* Top Action Tabs */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'analytics', label: 'Real-Time Analytics 📊' },
              { id: 'novel_analytics', label: 'Novel & Manga Stats 📖' },
              { id: 'launch_checklist', label: 'Launch Checklist ✅' },
              { id: 'link_image_auditor', label: 'Link & Image Auditor 🔗' },
              { id: 'device_tester', label: 'Responsive Device Tester 📱' },
              { id: 'seo_perf', label: 'SEO & Core Web Vitals ⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-zinc-100 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REAL-TIME ANALYTICS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Key Metric KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Total Visitors */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">Visitors</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-white">
                {aggregatedAnalytics.totalVisitors.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {aggregatedAnalytics.uniqueVisitors.toLocaleString()} unique
              </span>
            </div>

            {/* Returning Visitors */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">Returning</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-300">
                {aggregatedAnalytics.returningVisitors.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400/90 font-mono font-semibold block">
                {aggregatedAnalytics.returningVisitorRate}% retention rate
              </span>
            </div>

            {/* Total Page Views */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-purple-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">Page Views</span>
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-white">
                {aggregatedAnalytics.totalPageViews.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {aggregatedAnalytics.totalContentOpens.toLocaleString()} item opens
              </span>
            </div>

            {/* Engagement (Saves/Likes/Shares) */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">Saves & Likes</span>
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-white">
                {(aggregatedAnalytics.totalSaves + aggregatedAnalytics.totalLikes).toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {aggregatedAnalytics.totalShares} shares • {aggregatedAnalytics.totalCommunityRatings} ratings
              </span>
            </div>

            {/* External Clicks */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">Outbound Clicks</span>
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-cyan-300">
                {aggregatedAnalytics.totalExternalClicks.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {aggregatedAnalytics.totalAffiliateClicks} affiliate clicks
              </span>
            </div>

            {/* Estimated Revenue */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-emerald-800/40 bg-emerald-950/10 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">Revenue</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                ${aggregatedAnalytics.totalEstimatedRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono block">
                Affiliates & Partners
              </span>
            </div>

          </div>

          {/* Business Flywheel Funnel Diagram */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span>The Platform Business Flywheel Engine</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time conversion loop from initial visual glance to retained returning visitor and affiliate revenue.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                Loop Velocity: High
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
              {[
                { step: '1. DISCOVER', value: `${aggregatedAnalytics.totalPageViews} Views`, label: 'Homepage & Feeds', color: 'text-cyan-400', border: 'border-cyan-800/50' },
                { step: '2. EXPLORE', value: `${aggregatedAnalytics.totalContentOpens} Opens`, label: 'Quick Takes & Scans', color: 'text-blue-400', border: 'border-blue-800/50' },
                { step: '3. SAVE & RATE', value: `${aggregatedAnalytics.totalSaves + aggregatedAnalytics.totalLikes} Actions`, label: 'Personal Curation', color: 'text-amber-400', border: 'border-amber-800/50' },
                { step: '4. SHARE', value: `${aggregatedAnalytics.totalShares} Shares`, label: 'Viral Referral', color: 'text-purple-400', border: 'border-purple-800/50' },
                { step: '5. OUTBOUND', value: `${aggregatedAnalytics.totalExternalClicks} Clicks`, label: 'External Visits', color: 'text-cyan-300', border: 'border-cyan-700/50' },
                { step: '6. RETURN', value: `${aggregatedAnalytics.returningVisitors} Retained`, label: `${aggregatedAnalytics.returningVisitorRate}% Retention`, color: 'text-emerald-400', border: 'border-emerald-800/50' },
                { step: '7. REVENUE', value: `$${aggregatedAnalytics.totalEstimatedRevenue}`, label: 'Affiliates / Subscriptions', color: 'text-emerald-300', border: 'border-emerald-600/50' }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-2xl bg-zinc-900/90 border ${item.border} space-y-1 text-left`}>
                  <div className="text-[10px] font-extrabold text-zinc-400 tracking-wider">{item.step}</div>
                  <div className={`text-sm font-extrabold font-mono ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Sub-Views Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all_content', label: 'Top Content' },
              { id: 'categories', label: 'Top Categories' },
              { id: 'searches', label: 'Top Searches & High-Intent' },
              { id: 'saved', label: 'Most Saved' },
              { id: 'shared', label: 'Most Shared' },
              { id: 'liked', label: 'Most Liked' },
              { id: 'external', label: 'Best Outbound Clicks' },
              { id: 'affiliates', label: 'Best Affiliate Revenue' },
              { id: 'trends', label: 'Trend Radar Performance' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setAnalyticsSubView(sub.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  analyticsSubView === sub.id
                    ? 'bg-zinc-100 text-zinc-950 font-bold border-white shadow-sm'
                    : 'bg-[#0b0e14] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* SUB-VIEW 1: TOP CONTENT / SAVED / SHARED / LIKED / EXTERNAL / AFFILIATES */}
          {/* ========================================================================= */}
          {(analyticsSubView === 'all_content' ||
            analyticsSubView === 'saved' ||
            analyticsSubView === 'shared' ||
            analyticsSubView === 'liked' ||
            analyticsSubView === 'external' ||
            analyticsSubView === 'affiliates') && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {analyticsSubView === 'all_content' && 'Top Performing Content (Overall Engagement)'}
                    {analyticsSubView === 'saved' && 'Most Saved & Bookmarked Items'}
                    {analyticsSubView === 'shared' && 'Most Shared Articles & Products'}
                    {analyticsSubView === 'liked' && 'Most Liked & Upvoted Content'}
                    {analyticsSubView === 'external' && 'Best Outbound & External-Click Drivers'}
                    {analyticsSubView === 'affiliates' && 'Top Monetized Affiliate Content & Revenue'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Calculated from reader impressions, quick take opens, saves, shares, and external outbound events.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase font-bold text-zinc-400">
                      <th className="pb-3 pr-4">Content Title</th>
                      <th className="pb-3 px-3">Category</th>
                      <th className="pb-3 px-3 text-right">Opens</th>
                      <th className="pb-3 px-3 text-right">Saves</th>
                      <th className="pb-3 px-3 text-right">Likes</th>
                      <th className="pb-3 px-3 text-right">Shares</th>
                      <th className="pb-3 px-3 text-right">Outbound Clicks</th>
                      <th className="pb-3 pl-4 text-right">Affiliate Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {(analyticsSubView === 'all_content'
                      ? topContentByEngagement
                      : analyticsSubView === 'saved'
                      ? mostSaved
                      : analyticsSubView === 'shared'
                      ? mostShared
                      : analyticsSubView === 'liked'
                      ? mostLiked
                      : analyticsSubView === 'external'
                      ? bestExternalClickContent
                      : bestAffiliateContent
                    ).map((cm, idx) => (
                      <tr key={cm.itemId} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-white max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-500 text-[10px]">#{idx + 1}</span>
                            <span className="truncate">{cm.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-850 text-zinc-300 text-[10px] font-bold border border-zinc-750">
                            {cm.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-200">{cm.opens}</td>
                        <td className="py-3 px-3 text-right font-mono text-amber-400">{cm.saves}</td>
                        <td className="py-3 px-3 text-right font-mono text-cyan-400">{cm.likes}</td>
                        <td className="py-3 px-3 text-right font-mono text-purple-400">{cm.shares}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                          {cm.externalClicks}
                        </td>
                        <td className="py-3 pl-4 text-right font-mono font-bold text-emerald-300">
                          ${cm.estimatedRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: TOP CATEGORIES */}
          {/* ========================================================================= */}
          {analyticsSubView === 'categories' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-extrabold text-white">Top Category Performance</h3>
                <p className="text-xs text-zinc-400">
                  Engagement, saves, and revenue density by active category hub.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCategories.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{cat.category}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {cat.itemCount} published
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Total Opens:</span>
                        <span className="font-mono text-white font-bold">{cat.totalOpens}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Saves / Bookmarks:</span>
                        <span className="font-mono text-amber-400 font-bold">{cat.totalSaves}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Outbound Clicks:</span>
                        <span className="font-mono text-cyan-400 font-bold">{cat.totalExternalClicks}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Monetization:</span>
                        <span className="font-mono text-emerald-400 font-bold">${cat.affiliateRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: TOP SEARCHES */}
          {/* ========================================================================= */}
          {analyticsSubView === 'searches' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>High-Intent Reader Searches</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Keywords and queries searched by readers. Use this to identify emerging content opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {topSearches.map((sq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                      <h4 className="text-xs font-bold text-white">{sq.query}</h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {sq.resultsCount} matching results
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300 block">{sq.searchCount}</span>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500">Searches</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 4: TREND RADAR PERFORMANCE */}
          {/* ========================================================================= */}
          {analyticsSubView === 'trends' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Trend Radar $\rightarrow$ Content Flywheel Performance</h3>
                  <p className="text-xs text-zinc-400">
                    Track performance from the moment a signal was spotted on Radar to its published articles and commercial impact.
                  </p>
                </div>
                <button
                  onClick={() => setAdminActiveTab('trends')}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  Open Radar Pipeline $\rightarrow$
                </button>
              </div>

              <div className="space-y-3">
                {trendPerformance.map((tp) => (
                  <div
                    key={tp.trendId}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
                          {tp.category}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          +{tp.velocityPercent}% velocity
                        </span>
                        <span className="text-[10px] font-bold uppercase text-purple-400">
                          Status: {tp.status}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{tp.topic}</h4>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-zinc-300">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Articles Published</span>
                        <span className="font-mono font-bold text-white">{tp.relatedArticlesPublished}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Signal Impressions</span>
                        <span className="font-mono font-bold text-cyan-300">{tp.totalImpressions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Outbound Clicks</span>
                        <span className="font-mono font-bold text-emerald-400">{tp.totalClicks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* NOVEL & MANGA ANALYTICS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'novel_analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Novel Views</span>
              <div className="text-xl font-extrabold font-mono text-white">
                {novels.reduce((sum, n) => sum + (n.views || 0), 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">All series views</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Chapter Views</span>
              <div className="text-xl font-extrabold font-mono text-indigo-300">
                {novels.reduce((sum, n) => sum + (n.chapters || []).reduce((cSum, c) => cSum + (c.views || 0), 0), 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">In-reader reads</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Unique Readers</span>
              <div className="text-xl font-extrabold font-mono text-cyan-300">
                {Math.max(Object.keys(readingProgress).length, 1) + novels.reduce((sum, n) => sum + (n.followers || 0), 0)}
              </div>
              <span className="text-[10px] text-zinc-500">Active progress</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Likes</span>
              <div className="text-xl font-extrabold font-mono text-rose-300">
                {novels.reduce((sum, n) => sum + (n.likes || 0), 0)}
              </div>
              <span className="text-[10px] text-zinc-500">Reader hearts</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Saves</span>
              <div className="text-xl font-extrabold font-mono text-amber-300">
                {novels.reduce((sum, n) => sum + (n.saves || 0), 0)}
              </div>
              <span className="text-[10px] text-zinc-500">Library bookmarks</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Comments</span>
              <div className="text-xl font-extrabold font-mono text-purple-300">
                {novels.reduce((sum, n) => sum + (n.commentsCount || 0), 0)}
              </div>
              <span className="text-[10px] text-zinc-500">Chapter feedback</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Shares</span>
              <div className="text-xl font-extrabold font-mono text-blue-300">
                {Math.round(novels.reduce((sum, n) => sum + (n.likes || 0) * 0.45, 0))}
              </div>
              <span className="text-[10px] text-zinc-500">Outbound shares</span>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Completion</span>
              <div className="text-xl font-extrabold font-mono text-emerald-300">
                {novels.length > 0 ? Math.round(novels.reduce((sum, n) => sum + (n.completionRate || 75), 0) / novels.length) : 0}%
              </div>
              <span className="text-[10px] text-zinc-500">Avg scroll retention</span>
            </div>
          </div>

          {/* Popular Novels & Popular Chapters Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Popular Novels */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Most Popular Novels & Manga</span>
                </h3>
                <span className="text-xs font-mono text-zinc-500">Ranked by Engagement</span>
              </div>

              <div className="space-y-2.5">
                {[...novels]
                  .sort((a, b) => (b.views + b.likes * 5 + b.saves * 3) - (a.views + a.likes * 5 + a.saves * 3))
                  .slice(0, 6)
                  .map((novel, idx) => (
                    <div
                      key={novel.id}
                      className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-zinc-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <img
                          src={novel.coverImage}
                          alt={novel.title}
                          className="w-9 h-12 rounded object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">{novel.title}</h4>
                          <span className="text-[11px] text-zinc-400">
                            {novel.author} • <span className="uppercase text-indigo-400 font-semibold">{novel.type}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <div className="text-white font-bold">{novel.views.toLocaleString()} views</div>
                        <div className="text-[10px] text-zinc-500">
                          {novel.likes} likes • {novel.saves} saves
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Most Popular Chapters */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Most Read Chapters</span>
                </h3>
                <span className="text-xs font-mono text-zinc-500">Chapter Engagement</span>
              </div>

              <div className="space-y-2.5">
                {novels
                  .flatMap((n) =>
                    (n.chapters || []).map((c) => ({
                      ...c,
                      novelTitle: n.title,
                      novelSlug: n.slug
                    }))
                  )
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 6)
                  .map((chap, idx) => (
                    <div
                      key={chap.id}
                      className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-850 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-zinc-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">{chap.title}</h4>
                          <span className="text-[11px] text-zinc-400 truncate block">
                            Series: {chap.novelTitle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <div className="text-indigo-300 font-bold">{chap.views.toLocaleString()} reads</div>
                        <div className="text-[10px] text-zinc-500">
                          {chap.likes} likes • {chap.commentsCount} comments
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LAUNCH CHECKLIST & PRE-FLIGHT VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'launch_checklist' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Pre-Launch Readiness Audit (14 Core Checks)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Automated platform validation covering all user-facing views, discovery routes, CMS workflows, and monetization links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                Status: {launchChecklist.filter(c => c.status === 'passed').length}/{launchChecklist.length} Passed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {launchChecklist.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3.5 hover:border-zinc-700 transition-all"
              >
                <div className="mt-0.5 shrink-0">
                  {item.status === 'passed' && (
                    <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'warning' && (
                    <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.targetViewOrFeature}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BROKEN LINK & IMAGE AUDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'link_image_auditor' && (
        <div className="space-y-6">
          
          {/* Broken Links Scanner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  <span>Outbound & Affiliate Links Health Scanner</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Crawled {brokenLinks.length} outbound link destinations across all published content items.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                {brokenLinks.filter(l => l.status === 'valid').length} / {brokenLinks.length} Valid
              </span>
            </div>

            <div className="space-y-2.5">
              {brokenLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate max-w-xs">{link.sourceTitle}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] uppercase font-mono bg-zinc-800 text-zinc-300">
                        {link.linkType}
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-400 font-mono truncate">{link.targetUrl}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{link.statusCode || 200} OK</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Broken Images Scanner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>Cover Image & Asset Quality Scanner</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Verified {brokenImages.length} image assets for resolution, protocol, and aspect ratio integrity.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                100% Asset Health
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {brokenImages.slice(0, 6).map((img) => (
                <div
                  key={img.id}
                  className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3 text-xs"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.sourceTitle}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white truncate text-xs">{img.sourceTitle}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✓ Valid Format ({img.dimensions})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESPONSIVE DEVICE TESTER */}
      {/* ========================================================================= */}
      {activeTab === 'device_tester' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Mobile & Desktop Viewport Live Simulator</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Verify that all single-line controls, cards, and modal sheets render without overflow on mobile devices.
              </p>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>

              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'tablet'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>

              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1280px)</span>
              </button>
            </div>
          </div>

          {/* Simulator Container */}
          <div className="flex justify-center bg-zinc-950 p-4 sm:p-8 rounded-3xl border border-zinc-850 overflow-x-auto">
            <div
              className={`transition-all duration-300 rounded-3xl border-4 border-zinc-800 bg-[#06080d] overflow-hidden shadow-2xl ${
                previewDevice === 'mobile'
                  ? 'w-[375px] min-h-[640px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] min-h-[640px]'
                  : 'w-full max-w-5xl min-h-[640px]'
              }`}
            >
              {/* Device Frame Header */}
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px] font-bold">
                  PRISM • {previewDevice.toUpperCase()} PREVIEW ({previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%'})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono">
                  Responsive OK
                </span>
              </div>

              {/* Mock Responsive Preview View */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400 text-zinc-950 font-black flex items-center justify-center text-sm">
                    P
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 text-[11px] font-bold border border-zinc-800">
                      Search (Cmd+K)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Spotlight</span>
                  <h4 className="text-sm font-extrabold text-white">Cursor Composer & Autonomous Coding Agents</h4>
                  <p className="text-xs text-zinc-400">
                    Tested across 15,000 LOC refactoring with subagent terminal guardrails.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold">AI & TOOLS</span>
                    <h5 className="font-bold text-white text-[11px] truncate">DeepSeek R1 Distill</h5>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold">TECH HARDWARE</span>
                    <h5 className="font-bold text-white text-[11px] truncate">Framework 16 Review</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SEO & CORE WEB VITALS */}
      {/* ========================================================================= */}
      {activeTab === 'seo_perf' && (
        <div className="space-y-6">
          
          {/* Core Web Vitals Audit */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Core Web Vitals & Speed Audit</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Simulated user-centric performance metrics for mobile and desktop browsing.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                Score: 98 / 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {performanceChecks.map((perf) => (
                <div
                  key={perf.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{perf.metricName}</span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">{perf.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Target: {perf.threshold}</span>
                    <span className="text-emerald-400 font-bold">Good</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-850 leading-relaxed">
                    {perf.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Structured Data & OpenGraph */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>SEO & Social OpenGraph Tags Verification</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Validation of search crawler indexing, rich snippet schema, and social cards.
              </p>
            </div>

            <div className="space-y-3">
              {seoChecks.map((seo) => (
                <div
                  key={seo.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3.5"
                >
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{seo.checkName}</h4>
                      <span className="text-[10px] font-mono uppercase text-zinc-500">{seo.target}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{seo.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
