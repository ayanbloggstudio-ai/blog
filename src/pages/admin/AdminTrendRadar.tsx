import React, { useState, useMemo } from 'react';
import {
  Radar,
  Sparkles,
  TrendingUp,
  Flame,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Scale,
  Star,
  ListOrdered,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Layers,
  BarChart2,
  DollarSign,
  Users,
  Compass,
  Zap,
  Bookmark,
  XCircle,
  MoreHorizontal,
  Info,
  Check,
  Trash2
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import {
  TrendItem,
  TrendStatus,
  TrendFreshness,
  RelevanceLevel,
  TrendSuggestedAngle
} from '../../types/trends';
import { AIStudioContentType } from '../../types/aiStudio';

// Helper colors for Freshness
const FRESHNESS_CONFIG: Record<
  TrendFreshness,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  breaking: {
    label: 'Breaking',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: Flame
  },
  trending_24h: {
    label: 'Trending (24h)',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: TrendingUp
  },
  rising_3d: {
    label: 'Rising (3d)',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    icon: Zap
  },
  steady_wave: {
    label: 'Steady Wave',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: Clock
  }
};

// Helper colors for Status
const STATUS_CONFIG: Record<
  TrendStatus,
  { label: string; badgeClass: string; desc: string }
> = {
  new: {
    label: 'New',
    badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700/60',
    desc: 'Recently spotted signal'
  },
  watching: {
    label: 'Watching',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-700/60',
    desc: 'Monitoring signal velocity'
  },
  create: {
    label: 'Create',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
    desc: 'Greenlit for production'
  },
  in_production: {
    label: 'In Production',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-700/60',
    desc: 'Being drafted in AI Studio / CMS'
  },
  published: {
    label: 'Published',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-700/60',
    desc: 'Live on platform'
  },
  ignore: {
    label: 'Ignore',
    badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    desc: 'Dismissed topic'
  }
};

// Helper for Content Type icon
const getAngleIcon = (type: TrendSuggestedAngle['angleType']) => {
  switch (type) {
    case 'article':
      return FileText;
    case 'top_10':
    case 'top_20':
      return ListOrdered;
    case 'recommendation':
      return Star;
    case 'comparison':
      return Scale;
    case 'review':
      return CheckCircle2;
    case 'alternatives':
      return Layers;
    default:
      return BookOpen;
  }
};

export const AdminTrendRadar: React.FC = () => {
  const { trends, updateTrendStatus, deleteTrend, addTrend, sendTrendToAIStudio, categories } = useCMS();
  const { showToast } = useDiscovery();

  // Filter & Search State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'velocity' | 'audience' | 'commercial' | 'newest'>('velocity');

  // Modal / Drawer States
  const [activeResearchTrend, setActiveResearchTrend] = useState<TrendItem | null>(null);
  const [isAddTrendModalOpen, setIsAddTrendModalOpen] = useState<boolean>(false);

  // New Trend Form State
  const [newTrendForm, setNewTrendForm] = useState({
    topic: '',
    category: 'AI & Tools',
    freshness: 'breaking' as TrendFreshness,
    freshnessLabel: 'Breaking (Just now)',
    audienceRelevance: 'high' as RelevanceLevel,
    audienceRelevanceScore: 92,
    audienceRelevanceRationale: 'High interest and direct demand from readers.',
    commercialRelevance: 'high' as RelevanceLevel,
    commercialRelevanceScore: 85,
    commercialRelevanceRationale: 'High intent and monetization opportunity.',
    contentOpportunity: 'Clear search intent with under-covered practical angles.',
    sourceNotes: '',
    targetAudience: 'Software engineers, tech builders, and enthusiasts',
    status: 'new' as TrendStatus
  });

  // Filtered and Sorted Trends
  const filteredTrends = useMemo(() => {
    return (trends || []).filter((trend) => {
      if (!trend) return false;

      // Status Filter
      if (selectedStatusFilter !== 'all' && trend.status !== selectedStatusFilter) {
        return false;
      }

      // Category Filter
      if (selectedCategoryFilter !== 'all' && trend.category !== selectedCategoryFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTopic = trend.topic?.toLowerCase().includes(q);
        const matchOpportunity = trend.contentOpportunity?.toLowerCase().includes(q);
        const matchCategory = trend.category?.toLowerCase().includes(q);
        if (!matchTopic && !matchOpportunity && !matchCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'velocity') {
        return (b.velocityPercent || 0) - (a.velocityPercent || 0);
      }
      if (sortBy === 'audience') {
        return (b.audienceRelevanceScore || 0) - (a.audienceRelevanceScore || 0);
      }
      if (sortBy === 'commercial') {
        return (b.commercialRelevanceScore || 0) - (a.commercialRelevanceScore || 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [trends, selectedStatusFilter, selectedCategoryFilter, searchQuery, sortBy]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: trends?.length || 0,
      new: 0,
      watching: 0,
      create: 0,
      in_production: 0,
      published: 0,
      ignore: 0
    };
    (trends || []).forEach((t) => {
      if (t && t.status) {
        counts[t.status] = (counts[t.status] || 0) + 1;
      }
    });
    return counts;
  }, [trends]);

  // Handle Add Trend Submission
  const handleCreateTrend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendForm.topic.trim()) {
      showToast('Please enter a topic title.', 'error');
      return;
    }

    const defaultAngles: TrendSuggestedAngle[] = [
      {
        id: `angle-${Date.now()}-1`,
        angleType: 'article',
        label: 'Deep-Dive Article',
        title: `${newTrendForm.topic}: What It Is and Why It Matters`,
        description: 'Comprehensive editorial breakdown with fast takeaways.',
        targetContentType: 'article'
      },
      {
        id: `angle-${Date.now()}-2`,
        angleType: 'review',
        label: 'Hands-on Review',
        title: `${newTrendForm.topic} In-Depth Review: Real-World Evaluation`,
        description: 'Objective test results, pros, and considerations.',
        targetContentType: 'ai-tool'
      },
      {
        id: `angle-${Date.now()}-3`,
        angleType: 'alternatives',
        label: 'Alternatives Guide',
        title: `Top 5 Best Alternatives to ${newTrendForm.topic}`,
        description: 'Ranked comparison of similar tools and workflows.',
        targetContentType: 'top-10'
      }
    ];

    addTrend({
      ...newTrendForm,
      sourceSignals: ['Manual editorial discovery signal'],
      suggestedAngles: defaultAngles,
      velocityPercent: 120,
      searchVolumeTier: 'High Search Intent',
      discussionCount: 150
    });

    setIsAddTrendModalOpen(false);
    showToast(`Added "${newTrendForm.topic}" to Trend Radar!`, 'success');

    // Reset Form
    setNewTrendForm({
      topic: '',
      category: 'AI & Tools',
      freshness: 'breaking',
      freshnessLabel: 'Breaking (Just now)',
      audienceRelevance: 'high',
      audienceRelevanceScore: 92,
      audienceRelevanceRationale: 'High interest and direct demand from readers.',
      commercialRelevance: 'high',
      commercialRelevanceScore: 85,
      commercialRelevanceRationale: 'High intent and monetization opportunity.',
      contentOpportunity: 'Clear search intent with under-covered practical angles.',
      sourceNotes: '',
      targetAudience: 'Software engineers, tech builders, and enthusiasts',
      status: 'new'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-cyan-950/30 border border-emerald-800/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Radar className="w-52 h-52 text-emerald-400 animate-spin-slow" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
              <Radar className="w-3.5 h-3.5 fill-current" />
              TREND RADAR
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-[11px] font-medium border border-zinc-700/80">
              Signal Discovery & Editorial Pipeline
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 text-[11px] font-medium border border-cyan-800/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Direct AI Studio Integration
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Spot Emerging Topics & Decide What to Create
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Monitor search spikes, developer releases, and community discussions. Prioritize topics that are <strong className="text-white">Fresh</strong>, <strong className="text-white">Relevant</strong>, <strong className="text-white">Useful</strong>, and fit active categories. Send any trend directly to the <strong className="text-cyan-300">AI Content Studio</strong> with 1-click.
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Signals</div>
            <div className="text-xl font-extrabold font-mono text-white mt-0.5">{trends.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Ready to Create</div>
            <div className="text-xl font-extrabold font-mono text-cyan-300 mt-0.5">{statusCounts.create || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">In Production</div>
            <div className="text-xl font-extrabold font-mono text-purple-300 mt-0.5">{statusCounts.in_production || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Published</div>
            <div className="text-xl font-extrabold font-mono text-emerald-300 mt-0.5">{statusCounts.published || 0}</div>
          </div>
        </div>
      </div>

      {/* Editorial Principles & Guardrails Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0e14] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <span>Radar Editorial Guidelines</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px]">Strict</span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-3xl">
              • <strong>Never automatically publish a trend</strong> — human editorial approval is mandatory.<br />
              • <strong>Do not chase every viral topic</strong> — prioritize high-utility, evergreen substance over transient noise.<br />
              • <strong>Category discipline</strong> — active categories only; future categories remain admin-only.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddTrendModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 whitespace-nowrap self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Trend</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-5 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Signals', count: statusCounts.all },
            { id: 'new', label: 'New', count: statusCounts.new },
            { id: 'watching', label: 'Watching', count: statusCounts.watching },
            { id: 'create', label: 'Ready to Create', count: statusCounts.create },
            { id: 'in_production', label: 'In Production', count: statusCounts.in_production },
            { id: 'published', label: 'Published', count: statusCounts.published },
            { id: 'ignore', label: 'Ignored', count: statusCounts.ignore }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                selectedStatusFilter === tab.id
                  ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedStatusFilter === tab.id
                    ? 'bg-zinc-900 text-zinc-100'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Category, and Sort Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-zinc-850">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search trends by topic, keyword, or opportunity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Active Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="velocity">Sort by Signal Velocity</option>
              <option value="audience">Sort by Audience Score</option>
              <option value="commercial">Sort by Commercial Score</option>
              <option value="newest">Sort by Newest</option>
            </select>
          </div>

        </div>
      </div>

      {/* Trends List / Grid */}
      {filteredTrends.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0b0e14] border border-zinc-800 text-center space-y-3">
          <Radar className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No trends match your filters</h3>
          <p className="text-xs text-zinc-400">
            Try adjusting your search query, status filters, or add a custom trend signal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrends.map((trend) => {
            const freshnessInfo = FRESHNESS_CONFIG[trend.freshness] || FRESHNESS_CONFIG.breaking;
            const statusInfo = STATUS_CONFIG[trend.status] || STATUS_CONFIG.new;
            const FreshnessIcon = freshnessInfo.icon;

            return (
              <div
                key={trend.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 hover:border-zinc-700 transition-all space-y-5 shadow-xl group"
              >
                
                {/* Header Row: Topic, Category, Freshness, Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Freshness Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${freshnessInfo.badgeClass}`}
                      >
                        <FreshnessIcon className="w-3 h-3" />
                        <span>{trend.freshnessLabel || freshnessInfo.label}</span>
                      </span>

                      {/* Category Badge */}
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {trend.category}
                      </span>

                      {/* Velocity Indicator */}
                      {trend.velocityPercent && (
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50">
                          +{trend.velocityPercent}% velocity
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      {trend.topic}
                    </h2>
                  </div>

                  {/* Top Status & Lifecycle Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                    <select
                      value={trend.status}
                      onChange={(e) => {
                        updateTrendStatus(trend.id, e.target.value as TrendStatus);
                        showToast(`Status updated to ${e.target.value.toUpperCase()}`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="new">Status: New</option>
                      <option value="watching">Status: Watching</option>
                      <option value="create">Status: Ready to Create</option>
                      <option value="in_production">Status: In Production</option>
                      <option value="published">Status: Published</option>
                      <option value="ignore">Status: Ignore</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setActiveResearchTrend(trend)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-750 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="View full research notes and source signals"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Research</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sendTrendToAIStudio(trend);
                        showToast(`Sent "${trend.topic}" to AI Content Studio!`, 'success');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Create Content</span>
                    </button>
                  </div>

                </div>

                {/* Metrics Row: Audience Relevance, Commercial Relevance, Content Opportunity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-850 text-xs">
                  
                  {/* Audience Relevance */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Audience Relevance</span>
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {trend.audienceRelevanceScore}/100 ({trend.audienceRelevance.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {trend.audienceRelevanceRationale}
                    </p>
                  </div>

                  {/* Commercial Relevance */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Commercial Relevance</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-300">
                        {trend.commercialRelevanceScore}/100 ({trend.commercialRelevance.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {trend.commercialRelevanceRationale}
                    </p>
                  </div>

                  {/* Content Opportunity */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>Content Opportunity</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-300">
                        {trend.searchVolumeTier || 'High Search Intent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {trend.contentOpportunity}
                    </p>
                  </div>

                </div>

                {/* Suggested Editorial Formats & Angles (Article, Review, Alternatives, Comparison, Top 10) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Suggested Editorial Formats for this Trend</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Click any angle to draft directly in AI Content Studio
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {(trend.suggestedAngles || []).map((angle) => {
                      const Icon = getAngleIcon(angle.angleType);
                      return (
                        <div
                          key={angle.id}
                          onClick={() => {
                            sendTrendToAIStudio(trend, angle);
                            showToast(`Launching AI Studio for: "${angle.title}"`, 'success');
                          }}
                          className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-cyan-500/60 cursor-pointer transition-all flex flex-col justify-between gap-2 group/angle"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{angle.label}</span>
                              </span>
                              <span className="text-[10px] uppercase font-mono text-zinc-500">
                                {angle.targetContentType}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-zinc-100 group-hover/angle:text-white line-clamp-2 leading-snug">
                              {angle.title}
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-2">
                              {angle.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 group-hover/angle:text-cyan-300 font-semibold">
                            <span>Send to AI Studio</span>
                            <ArrowRight className="w-3 h-3 group-hover/angle:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-850 text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newStatus = trend.status === 'watching' ? 'create' : 'watching';
                        updateTrendStatus(trend.id, newStatus);
                        showToast(`Marked as ${newStatus.toUpperCase()}`, 'info');
                      }}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>{trend.status === 'watching' ? 'Greenlight (Create)' : 'Save to Watchlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateTrendStatus(trend.id, 'ignore');
                        showToast(`Ignored topic "${trend.topic}"`, 'info');
                      }}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-rose-400" />
                      <span>Ignore</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono">
                    Spotted {new Date(trend.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESEARCH & SOURCE NOTES MODAL */}
      {/* ========================================================================= */}
      {activeResearchTrend && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-[#0b0e14] border border-cyan-800/50 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {activeResearchTrend.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {activeResearchTrend.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveResearchTrend(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Source Signals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Observed Source Signals</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {(activeResearchTrend.sourceSignals || []).map((sig, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Factual Source Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Factual Reference Notes (Truth Anchor)</span>
              </h4>
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {activeResearchTrend.sourceNotes}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveResearchTrend(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold"
              >
                Close Research
              </button>

              <button
                type="button"
                onClick={() => {
                  sendTrendToAIStudio(activeResearchTrend);
                  setActiveResearchTrend(null);
                  showToast(`Sent "${activeResearchTrend.topic}" to AI Content Studio!`, 'success');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Send Directly to AI Content Studio</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CUSTOM TREND MODAL */}
      {/* ========================================================================= */}
      {isAddTrendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-[#0b0e14] border border-emerald-800/50 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Add Emerging Trend Signal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTrendModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrend} className="space-y-4">
              
              {/* Topic Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Topic Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTrendForm.topic}
                  onChange={(e) => setNewTrendForm({ ...newTrendForm, topic: e.target.value })}
                  placeholder="e.g., DeepSeek R1 Hybrid Reasoning Architecture"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Freshness */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase">
                    Category
                  </label>
                  <select
                    value={newTrendForm.category}
                    onChange={(e) => setNewTrendForm({ ...newTrendForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase">
                    Freshness
                  </label>
                  <select
                    value={newTrendForm.freshness}
                    onChange={(e) => setNewTrendForm({ ...newTrendForm, freshness: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="breaking">Breaking (Hours)</option>
                    <option value="trending_24h">Trending (24h)</option>
                    <option value="rising_3d">Rising (3d)</option>
                    <option value="steady_wave">Steady Wave</option>
                  </select>
                </div>
              </div>

              {/* Content Opportunity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Content Opportunity Angle
                </label>
                <input
                  type="text"
                  value={newTrendForm.contentOpportunity}
                  onChange={(e) => setNewTrendForm({ ...newTrendForm, contentOpportunity: e.target.value })}
                  placeholder="e.g., High search intent for local offline quantization setups"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Factual Reference Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Source Reference Notes (Truth Anchor)
                </label>
                <textarea
                  rows={4}
                  value={newTrendForm.sourceNotes}
                  onChange={(e) => setNewTrendForm({ ...newTrendForm, sourceNotes: e.target.value })}
                  placeholder="Key specs, release notes, or factual bullet points..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTrendModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Add to Radar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
