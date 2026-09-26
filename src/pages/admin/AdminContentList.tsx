import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Copy,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowUpDown,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { ContentLifecycleStatus, CMSContentType } from '../../types/cms';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';

export const AdminContentList: React.FC = () => {
  const {
    items,
    categories,
    startCreateContent,
    startEditContent,
    deleteContent,
    duplicateContent,
    changeStatus,
    archiveContent,
    setAdminActiveTab
  } = useCMS();

  const { navigateTo, showToast } = useDiscovery();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      if (!item) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.title || '').toLowerCase().includes(q) ||
          (item.summary || '').toLowerCase().includes(q) ||
          (item.tags || []).some((t) => (t || '').toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && (item.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Content Type
      if (typeFilter !== 'all' && item.contentType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, categoryFilter, typeFilter]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string, title: string) => {
    deleteContent(id);
    setConfirmDeleteId(null);
    showToast(`Deleted "${title}"`, 'info');
  };

  const handleDuplicate = (id: string) => {
    const res = duplicateContent(id);
    if (res.success) {
      showToast('Created duplicate draft', 'success');
      startEditContent(res.newId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Content Library & Lifecycles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage drafts, reviews, scheduled timed drops, and live public releases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminActiveTab('ai-studio')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>AI Content Studio</span>
          </button>

          <button
            onClick={() => startCreateContent()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Content</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0e15] border border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, tag, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Content Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Content Types</option>
            <option value="article">Article / Breakdown</option>
            <option value="ai-tool">AI Tool</option>
            <option value="tech-product">Tech Product</option>
            <option value="movie">Movie / TV Show</option>
            <option value="manhwa">Manhwa</option>
            <option value="anime">Anime</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'All Items', count: (items || []).length },
            { id: 'published', label: 'Published', count: (items || []).filter((i) => i && i.status === 'published').length },
            { id: 'draft', label: 'Drafts', count: (items || []).filter((i) => i && i.status === 'draft').length },
            { id: 'review', label: 'In Review', count: (items || []).filter((i) => i && i.status === 'review').length },
            { id: 'scheduled', label: 'Scheduled', count: (items || []).filter((i) => i && i.status === 'scheduled').length },
            { id: 'archived', label: 'Archived', count: (items || []).filter((i) => i && i.status === 'archived').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                statusFilter === tab.id
                  ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Table / List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={items.length === 0 ? 'No articles or guides published yet' : 'No content items match current filters'}
            description={
              items.length === 0
                ? "Click '+ Create New Item' to start authoring your first breakdown or visual study."
                : 'Try clearing filters or changing search keywords.'
            }
            actionLabel={items.length === 0 ? '+ Create New Item' : 'Reset Filters'}
            onAction={
              items.length === 0
                ? () => startCreateContent()
                : () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setTypeFilter('all');
                  }
            }
          />
        ) : (
          filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Item Core Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <SafeImage
                    src={item.coverImage}
                    alt={item.title}
                    fallbackType="article"
                    fallbackTitle={item.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-zinc-950 border border-zinc-800"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Type: {item.contentType}
                      </span>
                      {item.scheduledAt && item.status === 'scheduled' && (
                        <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                          <Clock className="w-3 h-3" />
                          Drops: {new Date(item.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {item.tagline || item.summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                      <span>Updated: {item.updatedAt}</span>
                      {item.affiliateUrl && (
                        <span className="text-amber-400 font-mono">
                          Affiliate Enabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  
                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ContentLifecycleStatus;
                      changeStatus(item.id, newStatus);
                      showToast(`Status changed to ${newStatus}`, 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
                      item.status === 'published'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : item.status === 'draft'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : item.status === 'review'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : item.status === 'scheduled'
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Edit Button */}
                  <button
                    onClick={() => startEditContent(item.id)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Edit full content"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                    title="Duplicate draft"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive Button */}
                  <button
                    onClick={() => {
                      archiveContent(item.id);
                      showToast(`Archived "${item.title}"`, 'info');
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button with inline confirmation */}
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="px-2 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-800 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
