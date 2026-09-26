import React, { useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  Compass,
  Home,
  Sliders,
  AlertTriangle,
  Info,
  Trash2,
  Edit
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CMSCategoryConfig } from '../../types/cms';

export const AdminCategories: React.FC = () => {
  const {
    categories,
    updateCategory,
    createCategory,
    deleteCategory,
    getCategoryPublishedCount
  } = useCMS();

  const { showToast } = useDiscovery();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatActive, setNewCatActive] = useState(true);
  const [newCatHomepage, setNewCatHomepage] = useState(true);
  const [newCatNav, setNewCatNav] = useState(true);
  const [newCatSearch, setNewCatSearch] = useState(true);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const res = createCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: 'Layers',
      description: newCatDesc.trim(),
      isActive: newCatActive,
      showOnHomepage: newCatHomepage,
      showInNavigation: newCatNav,
      showInSearch: newCatSearch,
      order: categories.length + 1
    });

    if (res.success) {
      showToast(`Category "${newCatName}" created! Note: Add published items before it goes live publicly.`, 'success');
      setIsCreateModalOpen(false);
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
    }
  };

  const handleDelete = (id: string, name: string) => {
    const res = deleteCategory(id);
    if (res.success) {
      showToast(`Category "${name}" deleted.`, 'info');
    } else {
      showToast(res.error || 'Could not delete category.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Category Architecture & Visibility Controls
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Toggle global category visibility, homepage sections, navigation bars, and search indexing.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Enforcement Notice */}
      <div className="p-4 rounded-2xl bg-[#0b0e15] border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            Public Display Rule Enforced:
          </span>
          <p className="text-zinc-300 leading-relaxed">
            Only categories set to <strong className="text-emerald-400">Active</strong> that contain <strong className="text-white">at least 1 published content item</strong> are rendered publicly on the live site. Categories with 0 published items or marked Inactive are automatically hidden from users.
          </p>
        </div>
      </div>

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => {
          const publishedCount = getCategoryPublishedCount(cat.name);
          const isPubliclyLive = cat.isActive && publishedCount > 0;

          return (
            <div
              key={cat.id}
              className={`p-5 rounded-3xl border transition-all ${
                isPubliclyLive
                  ? 'bg-[#0e121a] border-zinc-800'
                  : 'bg-zinc-950/70 border-zinc-900 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Category Info & Public Status */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-xs text-zinc-500">
                      /{cat.slug}
                    </span>

                    {/* Live Public Status Tag */}
                    {isPubliclyLive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Live Publicly ({publishedCount} items)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Hidden ({publishedCount === 0 ? '0 published items' : 'Inactive'})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 max-w-xl">
                    {cat.description || 'No description set.'}
                  </p>
                </div>

                {/* Right: The 4 Core Toggle Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                  
                  {/* 1. Active / Inactive Toggle */}
                  <button
                    onClick={() => {
                      updateCategory(cat.id, { isActive: !cat.isActive });
                      showToast(`${cat.name} set to ${!cat.isActive ? 'Active' : 'Inactive'}`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      cat.isActive
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Global Status
                    </span>
                    <span className="text-xs font-black mt-1 block">
                      {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </button>

                  {/* 2. Homepage ON / OFF */}
                  <button
                    onClick={() => {
                      updateCategory(cat.id, { showOnHomepage: !cat.showOnHomepage });
                      showToast(`Homepage display ${!cat.showOnHomepage ? 'Enabled' : 'Disabled'} for ${cat.name}`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      cat.showOnHomepage
                        ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Homepage
                    </span>
                    <span className="text-xs font-black mt-1 block">
                      {cat.showOnHomepage ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 3. Navigation ON / OFF */}
                  <button
                    onClick={() => {
                      updateCategory(cat.id, { showInNavigation: !cat.showInNavigation });
                      showToast(`Navigation display ${!cat.showInNavigation ? 'Enabled' : 'Disabled'} for ${cat.name}`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      cat.showInNavigation
                        ? 'bg-purple-950/60 border-purple-700 text-purple-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Navigation
                    </span>
                    <span className="text-xs font-black mt-1 block">
                      {cat.showInNavigation ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 4. Search ON / OFF */}
                  <button
                    onClick={() => {
                      updateCategory(cat.id, { showInSearch: !cat.showInSearch });
                      showToast(`Search indexing ${!cat.showInSearch ? 'Enabled' : 'Disabled'} for ${cat.name}`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      cat.showInSearch
                        ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Search Index
                    </span>
                    <span className="text-xs font-black mt-1 block">
                      {cat.showInSearch ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Category */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Category</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gaming & VR"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="gaming-vr"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of what this category covers..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCatActive}
                    onChange={(e) => setNewCatActive(e.target.checked)}
                    className="rounded bg-zinc-900 text-emerald-500"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCatHomepage}
                    onChange={(e) => setNewCatHomepage(e.target.checked)}
                    className="rounded bg-zinc-900 text-emerald-500"
                  />
                  <span>Show on Homepage</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCatNav}
                    onChange={(e) => setNewCatNav(e.target.checked)}
                    className="rounded bg-zinc-900 text-emerald-500"
                  />
                  <span>Show in Navigation</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCatSearch}
                    onChange={(e) => setNewCatSearch(e.target.checked)}
                    className="rounded bg-zinc-900 text-emerald-500"
                  />
                  <span>Index in Search</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
