import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Pin,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  Share2,
  MousePointerClick,
  DollarSign,
  Layers,
  Heart,
  Bookmark,
  MessageSquare,
  ShieldAlert,
  X,
  Save,
  Laptop,
  Cpu
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import {
  CommunityProduct,
  CommunityProductStatus,
  CommunityMainCategory
} from '../../types/community';
import { DIGITAL_CATEGORIES, PHYSICAL_CATEGORIES } from '../../data/communityProductsData';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';
import { ImageUploadField } from '../../components/ImageUploadField';

export const AdminCommunityProducts: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductPin,
    toggleProductTrending,
    toggleProductFeatured,
    setProductStatus,
    recordProductClick
  } = useCommunity();

  const { showToast } = useDiscovery();

  // Filters
  const [mainFilter, setMainFilter] = useState<'all' | 'digital' | 'physical'>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CommunityProduct | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CommunityProduct>>({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    mainCategory: 'digital',
    category: 'AI tools',
    image: '',
    logo: '',
    keyFeatures: [],
    priceStatus: 'Free',
    officialWebsiteUrl: '',
    affiliateUrl: '',
    affiliateCtaText: 'Try Now',
    affiliateDisclosure: 'PRISM may receive referral credits if you subscribe or purchase via partner links.',
    featured: false,
    tags: [],
    status: 'published',
    isPinned: false,
    isTrendingManual: false
  });

  const [keyFeaturesText, setKeyFeaturesText] = useState('');
  const [tagsText, setTagsText] = useState('');

  // Filtered list
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      if (!p) return false;
      if (mainFilter !== 'all' && p.mainCategory !== mainFilter) return false;
      if (subCategoryFilter !== 'all' && p.category !== subCategoryFilter) return false;
      if (statusFilter !== 'all') {
        const prodStatus = p.status || (p.featured ? 'featured' : 'published');
        if (prodStatus !== statusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [products, mainFilter, subCategoryFilter, statusFilter, searchQuery]);

  // Aggregate Metrics
  const digitalCount = products.filter((p) => p.mainCategory === 'digital').length;
  const physicalCount = products.filter((p) => p.mainCategory === 'physical').length;
  const totalClicks = products.reduce((sum, p) => sum + (p.referralClicks || 0), 0);
  const totalViews = products.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      mainCategory: mainFilter === 'physical' ? 'physical' : 'digital',
      category: mainFilter === 'physical' ? 'Smartphones' : 'AI tools',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      logo: '',
      keyFeatures: [],
      priceStatus: 'Free',
      officialWebsiteUrl: '',
      affiliateUrl: '',
      affiliateCtaText: 'Try Now',
      affiliateDisclosure: 'PRISM is reader-supported with verified outbound partner links.',
      featured: false,
      tags: ['Innovation', 'Visual'],
      status: 'published',
      isPinned: false,
      isTrendingManual: false
    });
    setKeyFeaturesText('');
    setTagsText('Innovation, Visual');
    setIsModalOpen(true);
  };

  const openEditModal = (product: CommunityProduct) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      status: product.status || (product.featured ? 'featured' : 'published')
    });
    setKeyFeaturesText((product.keyFeatures || []).join('\n'));
    setTagsText((product.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Please provide a product name', 'info');
      return;
    }

    const payload: Partial<CommunityProduct> = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      keyFeatures: keyFeaturesText.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast(`Updated "${formData.name}" successfully`, 'success');
    } else {
      addProduct(payload);
      showToast(`Added product "${formData.name}" to catalog`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      deleteProduct(confirmDeleteId);
      showToast('Product deleted from community catalog', 'info');
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Community Products Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage Digital & Physical products, affiliate links, trending velocity, and engagement metrics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Products</span>
          <div className="text-xl font-mono font-extrabold text-white mt-1">{products.length}</div>
          <span className="text-[10px] text-zinc-500">In database</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Digital Products
          </span>
          <div className="text-xl font-mono font-extrabold text-cyan-300 mt-1">{digitalCount}</div>
          <span className="text-[10px] text-zinc-500">AI, SaaS, Apps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1">
            <Laptop className="w-3 h-3" /> Physical Products
          </span>
          <div className="text-xl font-mono font-extrabold text-indigo-300 mt-1">{physicalCount}</div>
          <span className="text-[10px] text-zinc-500">Laptops, Phones</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Referral Clicks</span>
          <div className="text-xl font-mono font-extrabold text-amber-300 mt-1">{totalClicks}</div>
          <span className="text-[10px] text-zinc-500">Verified outbound</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Product Views</span>
          <div className="text-xl font-mono font-extrabold text-purple-300 mt-1">{totalViews}</div>
          <span className="text-[10px] text-zinc-500">Total impressions</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Overall CTR</span>
          <div className="text-xl font-mono font-extrabold text-emerald-300 mt-1">{overallCtr}%</div>
          <span className="text-[10px] text-zinc-500">Click conversion</span>
        </div>
      </div>

      {/* Main Filter & Search Control */}
      <div className="p-4 rounded-2xl bg-[#0b0e15] border border-zinc-800 space-y-3">
        {/* Main Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => {
                setMainFilter('all');
                setSubCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mainFilter === 'all'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => {
                setMainFilter('digital');
                setSubCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainFilter === 'digital'
                  ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Digital Products ({digitalCount})</span>
            </button>
            <button
              onClick={() => {
                setMainFilter('physical');
                setSubCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainFilter === 'physical'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-indigo-300'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Physical Products ({physicalCount})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'published', label: 'Published' },
              { id: 'featured', label: 'Featured' },
              { id: 'trending', label: 'Trending' },
              { id: 'draft', label: 'Drafts' },
              { id: 'suspended', label: 'Suspended' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st.id
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by title, tagline, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={subCategoryFilter}
            onChange={(e) => setSubCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Subcategories</option>
            {mainFilter !== 'physical' &&
              DIGITAL_CATEGORIES.filter((c) => c !== 'All Digital').map((c) => (
                <option key={c} value={c}>
                  Digital: {c}
                </option>
              ))}
            {mainFilter !== 'digital' &&
              PHYSICAL_CATEGORIES.filter((c) => c !== 'All Physical').map((c) => (
                <option key={c} value={c}>
                  Physical: {c}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Product List Table / Cards */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "No community products available yet" : "No products match current filters"}
            description={products.length === 0 ? "Click '+ Add Product' above to create your first digital tool or hardware entry." : "Try clearing filters or changing search keywords."}
            actionLabel={products.length === 0 ? "+ Add Product" : "Reset Filters"}
            onAction={products.length === 0 ? () => openCreateModal() : () => {
              setMainFilter('all');
              setSubCategoryFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredProducts.map((p) => {
            const currentStatus = p.status || (p.featured ? 'featured' : 'published');
            const ctr = (p.viewsCount || 0) > 0 ? (((p.referralClicks || 0) / (p.viewsCount || 1)) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={p.id}
                className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Product Information */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fallbackType="product"
                    fallbackTitle={p.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-zinc-950 border border-zinc-800"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                          p.mainCategory === 'digital'
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                        }`}
                      >
                        {p.mainCategory}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {p.category}
                      </span>

                      {p.isPinned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-current" /> Pinned
                        </span>
                      )}

                      {p.featured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      )}

                      {(p.isTrendingManual || p.recentActivityScore >= 80) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" /> Trending
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white truncate flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className="text-xs font-mono text-zinc-400 font-normal">({p.priceStatus})</span>
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1">{p.shortDescription || p.description}</p>

                    {/* Stats & Links row */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3 h-3" /> {typeof p.initialLikes === 'number' && !isNaN(p.initialLikes) ? p.initialLikes : 0}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Bookmark className="w-3 h-3" /> {typeof p.initialSaves === 'number' && !isNaN(p.initialSaves) ? p.initialSaves : 0}
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Share2 className="w-3 h-3" /> {p.sharesCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-mono">
                        <MousePointerClick className="w-3 h-3" /> {p.referralClicks || 0} clicks ({ctr}% CTR)
                      </span>
                      {p.officialWebsiteUrl && (
                        <a
                          href={p.officialWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 underline decoration-zinc-700"
                        >
                          <span>Official</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {p.affiliateUrl && (
                        <span className="text-amber-300 font-mono text-[10px] bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40">
                          CTA: {p.affiliateCtaText || 'Try Now'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Dropdown, Toggles & Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                  {/* Status Dropdown */}
                  <select
                    value={currentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as CommunityProductStatus;
                      setProductStatus(p.id, newStatus);
                      showToast(`Status updated to ${newStatus}`, 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
                      currentStatus === 'published'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : currentStatus === 'featured'
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : currentStatus === 'trending'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : currentStatus === 'draft'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : currentStatus === 'suspended'
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="featured">Featured</option>
                    <option value="trending">Trending</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  {/* Pin button */}
                  <button
                    onClick={() => {
                      toggleProductPin(p.id);
                      showToast(p.isPinned ? 'Unpinned product' : 'Pinned product to top', 'info');
                    }}
                    title={p.isPinned ? 'Unpin product' : 'Pin product'}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      p.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${p.isPinned ? 'fill-current' : ''}`} />
                  </button>

                  {/* Trending toggle */}
                  <button
                    onClick={() => {
                      toggleProductTrending(p.id);
                      showToast(p.isTrendingManual ? 'Removed manual trending' : 'Marked as Trending', 'info');
                    }}
                    title="Toggle Trending"
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      p.isTrendingManual
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${p.isTrendingManual ? 'fill-current' : ''}`} />
                  </button>

                  {/* Feature toggle */}
                  <button
                    onClick={() => {
                      toggleProductFeatured(p.id);
                      showToast(p.featured ? 'Unfeatured product' : 'Featured product', 'info');
                    }}
                    title="Toggle Feature"
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      p.featured
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-current' : ''}`} />
                  </button>

                  {/* Test Outbound Click */}
                  <button
                    onClick={() => {
                      recordProductClick(p.id);
                      showToast(`Tracked referral click for ${p.name}`, 'success');
                    }}
                    title="Test Outbound Referral Click"
                    className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-all text-xs"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-800 transition-all"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e15] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{editingProduct ? 'Edit Community Product' : 'Add New Community Product'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Main Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Product Type</label>
                  <select
                    value={formData.mainCategory}
                    onChange={(e) => {
                      const newMain = e.target.value as CommunityMainCategory;
                      setFormData({
                        ...formData,
                        mainCategory: newMain,
                        category: newMain === 'physical' ? 'Smartphones' : 'AI tools'
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="digital">Digital Product (AI Tools, Apps, SaaS, etc.)</option>
                    <option value="physical">Physical Product (Smartphones, Laptops, etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {formData.mainCategory === 'digital'
                      ? DIGITAL_CATEGORIES.filter((c) => c !== 'All Digital').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))
                      : PHYSICAL_CATEGORIES.filter((c) => c !== 'All Physical').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SplatStudio WebGPU"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-from-name"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Status & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Product Status</label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CommunityProductStatus })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="featured">Featured</option>
                    <option value="trending">Trending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Pricing Status</label>
                  <input
                    type="text"
                    value={formData.priceStatus || ''}
                    onChange={(e) => setFormData({ ...formData, priceStatus: e.target.value })}
                    placeholder="e.g. Free, $20/mo, $1,199"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="One sentence punchy summary"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed breakdown of the product, capabilities, and target audience..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadField
                  label="Product Cover Image"
                  value={formData.image || ''}
                  onChange={(val) => setFormData({ ...formData, image: val })}
                  aspectRatio="video"
                  helperText="Upload image file or paste product screenshot URL."
                />
                <ImageUploadField
                  label="Product Logo (Optional)"
                  value={formData.logo || ''}
                  onChange={(val) => setFormData({ ...formData, logo: val })}
                  aspectRatio="square"
                  helperText="Upload square logo file or paste icon URL."
                />
              </div>

              {/* URLs & Affiliate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    value={formData.officialWebsiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                    placeholder="https://officialsite.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Affiliate / Referral URL</label>
                  <input
                    type="url"
                    value={formData.affiliateUrl || ''}
                    onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                    placeholder="https://partner.com?ref=prism"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* CTA Text & Disclosure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">CTA Text</label>
                  <input
                    type="text"
                    value={formData.affiliateCtaText || 'Try Now'}
                    onChange={(e) => setFormData({ ...formData, affiliateCtaText: e.target.value })}
                    placeholder="e.g. Try Now, Buy Now, Visit Website"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="AI, Tool, WebGPU, Cloud"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Affiliate Disclosure</label>
                <input
                  type="text"
                  value={formData.affiliateDisclosure || ''}
                  onChange={(e) => setFormData({ ...formData, affiliateDisclosure: e.target.value })}
                  placeholder="PRISM may receive referral credits if you subscribe or purchase via partner links."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Key Highlights / Features (One per line)</label>
                <textarea
                  rows={3}
                  value={keyFeaturesText}
                  onChange={(e) => setKeyFeaturesText(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-emerald-500"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isPinned || false}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-emerald-500"
                  />
                  <span>Pin to Top</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isTrendingManual || false}
                    onChange={(e) => setFormData({ ...formData, isTrendingManual: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-emerald-500"
                  />
                  <span>Force Trending</span>
                </label>
              </div>

              {/* Save Strip */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Community Product?</h3>
              <p className="text-xs text-zinc-400">
                This will remove the product and its associated links from the catalog. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
