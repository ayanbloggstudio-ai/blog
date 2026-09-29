import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  DollarSign,
  Search,
  CheckCircle2,
  Edit,
  ShieldCheck,
  AlertCircle,
  MousePointerClick,
  Eye,
  TrendingUp,
  Package,
  Layers,
  Save,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useCommunity } from '../../context/CommunityContext';
import { useDiscovery } from '../../context/DiscoveryContext';

export const AdminLinksAffiliates: React.FC = () => {
  const { items, updateContent } = useCMS();
  const { products, updateProduct, recordProductClick } = useCommunity();
  const { showToast } = useDiscovery();

  // Mode: All | Community Products | CMS Articles
  const [sourceFilter, setSourceFilter] = useState<'all' | 'products' | 'cms'>('all');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'affiliate-only' | 'missing-official'>('all');

  // Edit Modal State
  const [editingTarget, setEditingTarget] = useState<{
    type: 'product' | 'cms';
    id: string;
    title: string;
    officialUrl: string;
    affiliateUrl: string;
    affiliateCtaText: string;
    affiliateDisclosure: string;
  } | null>(null);

  // Combine products and CMS items into a normalized affiliate view
  const combinedLinks = [
    ...products.map((p) => ({
      id: p.id,
      title: p.name,
      category: `${p.mainCategory}: ${p.category}`,
      type: 'product' as const,
      officialUrl: p.officialWebsiteUrl || '',
      affiliateUrl: p.affiliateUrl || '',
      ctaText: p.affiliateCtaText || 'Try Now',
      disclosure: p.affiliateDisclosure || 'PRISM receives referral compensation on verified partner clicks.',
      views: p.viewsCount || 0,
      clicks: p.referralClicks || 0,
      ctr: (p.viewsCount || 0) > 0 ? (((p.referralClicks || 0) / (p.viewsCount || 1)) * 100).toFixed(1) : '0.0'
    })),
    ...items.map((it) => ({
      id: it.id,
      title: it.title,
      category: it.category,
      type: 'cms' as const,
      officialUrl: it.officialUrl || '',
      affiliateUrl: it.affiliateUrl || '',
      ctaText: 'Visit Partner',
      disclosure: it.affiliateDisclosure || 'PRISM is reader-supported with outbound links.',
      views: 0,
      clicks: 0,
      ctr: '0.0'
    }))
  ];

  const filteredLinks = combinedLinks.filter((it) => {
    if (sourceFilter === 'products' && it.type !== 'product') return false;
    if (sourceFilter === 'cms' && it.type !== 'cms') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      if (!it.title.toLowerCase().includes(q) && !it.officialUrl.toLowerCase().includes(q) && !it.affiliateUrl.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filterType === 'affiliate-only') return Boolean(it.affiliateUrl);
    if (filterType === 'missing-official') return !it.officialUrl;
    return true;
  });

  const totalAffiliates = combinedLinks.filter((i) => Boolean(i.affiliateUrl)).length;
  const totalOfficial = combinedLinks.filter((i) => Boolean(i.officialUrl)).length;
  const totalClicks = combinedLinks.reduce((sum, i) => sum + i.clicks, 0);
  const totalViews = combinedLinks.reduce((sum, i) => sum + i.views, 0);
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const handleOpenEdit = (it: typeof combinedLinks[0]) => {
    setEditingTarget({
      type: it.type,
      id: it.id,
      title: it.title,
      officialUrl: it.officialUrl,
      affiliateUrl: it.affiliateUrl,
      affiliateCtaText: it.ctaText,
      affiliateDisclosure: it.disclosure
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    if (editingTarget.type === 'product') {
      updateProduct(editingTarget.id, {
        officialWebsiteUrl: editingTarget.officialUrl.trim(),
        affiliateUrl: editingTarget.affiliateUrl.trim(),
        affiliateCtaText: editingTarget.affiliateCtaText.trim() as any,
        affiliateDisclosure: editingTarget.affiliateDisclosure.trim()
      });
      showToast(`Updated links for product: ${editingTarget.title}`, 'success');
    } else {
      updateContent(editingTarget.id, {
        officialUrl: editingTarget.officialUrl.trim(),
        affiliateUrl: editingTarget.affiliateUrl.trim(),
        affiliateDisclosure: editingTarget.affiliateDisclosure.trim()
      });
      showToast(`Updated links for CMS content: ${editingTarget.title}`, 'success');
    }

    setEditingTarget(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied affiliate URL to clipboard', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>Outbound & Affiliate Referral Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage official destination URLs, partner referral tags, custom CTA buttons, and real conversion click-through rates.
          </p>
        </div>

        {/* Real Stats Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300">
            {totalAffiliates} Active Affiliates
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            {totalClicks} Total Clicks ({overallCtr}% CTR)
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Tracked Items</span>
          <div className="text-xl font-mono font-extrabold text-white mt-1">{combinedLinks.length}</div>
          <span className="text-[10px] text-zinc-500">Products & Articles</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Affiliate Enabled</span>
          <div className="text-xl font-mono font-extrabold text-amber-300 mt-1">{totalAffiliates}</div>
          <span className="text-[10px] text-zinc-500">Monetized links</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Total Clicks Recorded</span>
          <div className="text-xl font-mono font-extrabold text-cyan-300 mt-1">{totalClicks}</div>
          <span className="text-[10px] text-zinc-500">Authentic outbound</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Avg Click-Through (CTR)</span>
          <div className="text-xl font-mono font-extrabold text-emerald-300 mt-1">{overallCtr}%</div>
          <span className="text-[10px] text-zinc-500">Clicks ÷ Impressions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0e15] border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Source Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                sourceFilter === 'all' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Outbound ({combinedLinks.length})
            </button>
            <button
              onClick={() => setSourceFilter('products')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sourceFilter === 'products' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Community Products ({products.length})</span>
            </button>
            <button
              onClick={() => setSourceFilter('cms')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sourceFilter === 'cms' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Articles & Directory ({items.length})</span>
            </button>
          </div>

          {/* Filter Types */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterType === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({combinedLinks.length})
            </button>
            <button
              onClick={() => setFilterType('affiliate-only')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterType === 'affiliate-only' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Affiliate Active ({totalAffiliates})
            </button>
            <button
              onClick={() => setFilterType('missing-official')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterType === 'missing-official' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Missing Official URL ({combinedLinks.length - totalOfficial})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, official destination URL, affiliate tracking tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Outbound Links Table */}
      <div className="space-y-3">
        {filteredLinks.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-4 sm:p-5 rounded-2xl bg-[#0e121a] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white truncate">{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                    item.type === 'product'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  }`}
                >
                  {item.type}
                </span>
              </div>

              {/* URLs & CTA Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Official URL */}
                <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                  <span className="text-zinc-500 font-semibold shrink-0">Official:</span>
                  {item.officialUrl ? (
                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline truncate flex items-center gap-1"
                    >
                      <span className="truncate">{item.officialUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-rose-400/80 italic">No official URL configured</span>
                  )}
                </div>

                {/* Affiliate URL */}
                <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                  <span className="text-zinc-500 font-semibold shrink-0">Affiliate:</span>
                  {item.affiliateUrl ? (
                    <div className="flex items-center gap-1 truncate">
                      <a
                        href={item.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline truncate flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span className="truncate">{item.affiliateUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(item.affiliateUrl)}
                        className="p-1 text-zinc-400 hover:text-white shrink-0"
                        title="Copy Affiliate URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-600 italic">No affiliate link added</span>
                  )}
                </div>
              </div>

              {/* Performance Tracking: Views, Clicks, CTR, CTA text */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1 text-purple-300 font-mono">
                  <Eye className="w-3 h-3" /> {item.views} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                  <MousePointerClick className="w-3 h-3" /> {item.clicks} clicks
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300 font-mono font-bold">
                  CTR: {item.ctr}%
                </span>
                <span>•</span>
                <span className="text-zinc-300 font-medium">
                  CTA Label: <strong className="text-white">"{item.ctaText}"</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
              {/* Test Outbound Click Button */}
              {item.type === 'product' && item.affiliateUrl && (
                <button
                  onClick={() => {
                    recordProductClick(item.id);
                    showToast(`Recorded test referral click for "${item.title}"`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-950/60 text-amber-300 border border-zinc-800 hover:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Simulate verified outbound referral click"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Test Click</span>
                </button>
              )}

              {/* Edit Links Modal */}
              <button
                onClick={() => handleOpenEdit(item)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Links</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Links & Disclosure Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e15] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Edit Links: {editingTarget.title}</span>
              </h3>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Official Website URL</label>
                <input
                  type="url"
                  value={editingTarget.officialUrl}
                  onChange={(e) => setEditingTarget({ ...editingTarget, officialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Affiliate / Referral Link URL
                </label>
                <input
                  type="url"
                  value={editingTarget.affiliateUrl}
                  onChange={(e) => setEditingTarget({ ...editingTarget, affiliateUrl: e.target.value })}
                  placeholder="https://partner.com?ref=prism"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">CTA Button Text</label>
                <input
                  type="text"
                  value={editingTarget.affiliateCtaText}
                  onChange={(e) => setEditingTarget({ ...editingTarget, affiliateCtaText: e.target.value })}
                  placeholder="e.g. Try Now, Buy Now, Visit Website"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Affiliate Disclosure</label>
                <textarea
                  rows={3}
                  value={editingTarget.affiliateDisclosure}
                  onChange={(e) => setEditingTarget({ ...editingTarget, affiliateDisclosure: e.target.value })}
                  placeholder="PRISM is reader-supported with verified partner referral links..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Affiliate Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
