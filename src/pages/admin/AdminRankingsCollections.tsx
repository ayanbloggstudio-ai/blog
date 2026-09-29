import React, { useState } from 'react';
import {
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Save,
  Layers,
  CheckCircle2,
  Eye,
  FileText,
  Flame,
  TrendingUp
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CMSCollection } from '../../types/cms';
import { AdminCommunityRanking } from './AdminCommunityRanking';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';

export const AdminRankingsCollections: React.FC = () => {
  const {
    collections,
    createCollection,
    updateCollection,
    deleteCollection,
    items,
    categories
  } = useCMS();

  const { showToast } = useDiscovery();

  // Mode: 'community' (Live Product Velocity & Trending) | 'editorial' (Curated Top 10/20 Lists)
  const [rankingMode, setRankingMode] = useState<'community' | 'editorial'>('community');

  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [confirmDeleteListId, setConfirmDeleteListId] = useState<string | null>(null);

  // New Collection Form
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-ai');
  const [newType, setNewType] = useState<'top-10' | 'top-20' | 'curated-stack'>('top-10');
  const [newCuratorNotes, setNewCuratorNotes] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const publishedItems = (items || []).filter((i) => i && i.status === 'published');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cat = (categories || []).find((c) => c && c.id === newCategoryId);

    createCollection({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      categoryId: newCategoryId,
      categoryName: cat?.name || 'AI & Tools',
      type: newType,
      itemIds: selectedItemIds.length > 0 ? selectedItemIds : publishedItems.slice(0, 5).map((i) => i.id),
      curatorNotes: newCuratorNotes.trim(),
      targetAudience: newAudience.trim(),
      status: 'published'
    });

    showToast(`Created ranking collection: "${newTitle}"`, 'success');
    setIsCreating(false);
    setNewTitle('');
    setNewSubtitle('');
    setSelectedItemIds([]);
  };

  const moveItem = (colId: string, itemIdx: number, direction: 'up' | 'down') => {
    const col = (collections || []).find((c) => c && c.id === colId);
    if (!col) return;

    const newArr = [...(col.itemIds || [])];
    const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;

    if (targetIdx < 0 || targetIdx >= newArr.length) return;

    const temp = newArr[itemIdx];
    newArr[itemIdx] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    updateCollection(colId, { itemIds: newArr });
  };

  const removeItemFromCollection = (colId: string, itemId: string) => {
    const col = (collections || []).find((c) => c && c.id === colId);
    if (!col) return;
    const newArr = (col.itemIds || []).filter((id) => id !== itemId);
    updateCollection(colId, { itemIds: newArr });
  };

  const addItemToCollection = (colId: string, itemId: string) => {
    const col = (collections || []).find((c) => c && c.id === colId);
    if (!col || (col.itemIds || []).includes(itemId)) return;
    updateCollection(colId, { itemIds: [...(col.itemIds || []), itemId] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>Product Rankings & Curated Stacks</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time engagement velocity rankings and authoritative editorial Top 10 / 20 curated lists.
          </p>
        </div>

        {rankingMode === 'editorial' && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Ranking List</span>
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setRankingMode('community')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            rankingMode === 'community'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Live Community Product Ranking (Velocity + Trending)</span>
        </button>

        <button
          onClick={() => setRankingMode('editorial')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            rankingMode === 'editorial'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Editorial Curated Stacks ({collections.length})</span>
        </button>
      </div>

      {/* If Live Community Ranking */}
      {rankingMode === 'community' ? (
        <AdminCommunityRanking />
      ) : (
        <>
          {/* Creation Modal / Form */}
          {isCreating && (
        <div className="p-6 rounded-3xl bg-[#0b0e15] border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white">Create New Curated List</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  List Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Top 10 AI Generation Tools for 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category *
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                placeholder="Evaluated on prompt latency and render quality"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Curator Method Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evaluated strictly on developer ergonomics"
                  value={newCuratorNotes}
                  onChange={(e) => setNewCuratorNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI engineers & technical designers"
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Save & Initialize List
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Collections List */}
      <div className="space-y-6">
        {collections.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No curated ranking lists created yet"
            description="Create your first Top 10 or Top 20 editorial stack using the '+ New Curated List' button above."
            actionLabel="+ New Curated List"
            onAction={() => setIsCreating(true)}
          />
        ) : (
          collections.map((col) => {
            return (
              <div
                key={col.id}
                className="p-6 rounded-3xl bg-[#0e121a] border border-zinc-800 space-y-4"
              >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {col.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Category: {col.categoryName}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {col.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {col.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {confirmDeleteListId === col.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteCollection(col.id);
                          setConfirmDeleteListId(null);
                          showToast(`Deleted list`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteListId(null)}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteListId(col.id)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                      title="Delete list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items in this collection with re-ordering controls */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">
                  Ranked Entries ({col.itemIds.length} items):
                </span>

                <div className="space-y-2">
                  {col.itemIds.map((itemId, idx) => {
                    const itemData = items.find((i) => i.id === itemId);

                    return (
                      <div
                        key={itemId}
                        className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-850 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          {itemData?.coverImage && (
                            <SafeImage
                              src={itemData.coverImage}
                              alt={itemData?.title || ''}
                              fallbackType="article"
                              fallbackTitle={itemData?.title}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-900 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white truncate block">
                              {itemData?.title || itemId}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {itemData?.category} • {itemData?.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveItem(col.id, idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(col.id, idx, 'down')}
                            disabled={idx === col.itemIds.length - 1}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItemFromCollection(col.id, itemId)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400"
                            title="Remove from list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add item dropdown */}
              <div className="pt-2 flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToCollection(col.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 text-xs border border-zinc-800 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    + Add published item to this ranking list...
                  </option>
                  {(publishedItems || [])
                    .filter((p) => p && !(col.itemIds || []).includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          );
        })
      )}
      </div>
    </>
  )}
</div>
  );
};
