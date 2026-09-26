import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Search,
  Check
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';

export const AdminMediaLibrary: React.FC = () => {
  const { mediaAssets, addMediaAsset, deleteMediaAsset, categories } = useCMS();
  const { showToast } = useDiscovery();

  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'AI & Tools');
  const [newTags, setNewTags] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    addMediaAsset({
      url: newUrl.trim(),
      title: newTitle.trim() || 'Visual Asset',
      category: newCategory,
      tags: newTags.split(',').map((s) => s.trim()).filter(Boolean)
    });

    showToast('Added media asset to library', 'success');
    setIsAdding(false);
    setNewUrl('');
    setNewTitle('');
    setNewTags('');
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span>Visual Media & Imagery Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Store high-resolution covers, gallery stills, and UI mockups with 1-click clipboard insertion.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Add Media Modal */}
      {isAdding && (
        <div className="p-6 rounded-3xl bg-[#0b0e15] border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white">Add Image to Media Library</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Image URL *
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Asset Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neon Architecture Render"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Hardware, Apple, Silicon"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Save to Library
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      {mediaAssets.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media assets uploaded yet"
          description="Store high-resolution covers, diagrams, stills, and screenshots with 1-click clipboard insertion."
          actionLabel="+ Add First Asset"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mediaAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-[#0e121a] rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                <SafeImage
                  src={asset.url}
                  alt={asset.title}
                  fallbackTitle={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopyUrl(asset.url, asset.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {copiedId === asset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === asset.id ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {asset.category}
                </span>
                <button
                  onClick={() => {
                    deleteMediaAsset(asset.id);
                    showToast('Removed media asset', 'info');
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-white truncate">
                {asset.title}
              </h4>

              <div className="flex flex-wrap gap-1">
                {asset.tags.map((t) => (
                  <span key={t} className="text-[10px] text-zinc-500">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
