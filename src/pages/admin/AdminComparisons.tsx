import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { EmptyState } from '../../components/EmptyState';

export const AdminComparisons: React.FC = () => {
  const {
    comparisons,
    createComparison,
    updateComparison,
    deleteComparison,
    items,
    categories
  } = useCMS();

  const { showToast, openComparison } = useDiscovery();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-ai');
  const [newNotes, setNewNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const publishedItems = (items || []).filter((i) => i && i.status === 'published');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedIds.length < 2) {
      showToast('Please specify a title and select at least 2 items to compare.', 'error');
      return;
    }

    createComparison({
      title: newTitle.trim(),
      categoryId: newCategoryId,
      itemIds: selectedIds,
      notes: newNotes.trim(),
      isFeatured: true
    });

    showToast(`Created comparison: "${newTitle}"`, 'success');
    setIsCreating(false);
    setNewTitle('');
    setNewNotes('');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-cyan-400" />
            <span>Side-by-Side Comparison Matrices</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pre-configure head-to-head comparison pairings for readers to contrast features, specs, and trade-offs.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Comparison</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="p-6 rounded-3xl bg-[#0b0e15] border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white">Create Comparison Pair</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Comparison Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cursor IDE vs Claude 3.7 Sonnet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-cyan-500"
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
                Editorial Comparison Notes / Key Trade-offs
              </label>
              <textarea
                rows={2}
                placeholder="In-editor autocompletions vs full architectural refactoring..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Select 2 or 3 Items to Compare (Currently selected: {selectedIds.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-zinc-950 rounded-xl border border-zinc-850">
                {publishedItems.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedIds((prev) => (prev || []).filter((id) => id !== item.id));
                        } else if (selectedIds.length < 3) {
                          setSelectedIds([...selectedIds, item.id]);
                        } else {
                          showToast('Maximum 3 items per comparison matrix.', 'info');
                        }
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs transition-colors ${
                        isChecked
                          ? 'bg-cyan-950 text-cyan-200 border-cyan-700 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <input type="checkbox" checked={isChecked} readOnly className="rounded" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  );
                })}
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
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs"
              >
                Save Comparison Pair
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comparisons List */}
      {(comparisons || []).length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No comparison matrices created yet"
          description="Create head-to-head architectural or product comparisons using '+ Create Comparison Matrix' above."
          actionLabel="+ Create Comparison Matrix"
          onAction={() => setIsCreating(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(comparisons || []).map((comp) => {
            const matchedItems = (items || []).filter((i) => i && (comp.itemIds || []).includes(i.id));

            return (
              <div
                key={comp.id}
                className="p-5 rounded-3xl bg-[#0e121a] border border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Matrix Pair
                    </span>
                    <button
                      onClick={() => {
                        deleteComparison(comp.id);
                        showToast(`Deleted comparison`, 'info');
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {comp.notes}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {matchedItems.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
                      >
                        {m.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {comp.itemIds.length} items mapped
                  </span>
                  <button
                    onClick={() => openComparison(comp.itemIds)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>Preview Matrix</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
