import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  Link,
  Globe,
  Tag,
  Search,
  Sparkles,
  Zap,
  Layers,
  Plus,
  Trash2,
  FileText,
  DollarSign
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CMSContentItem, ContentLifecycleStatus, CMSContentType } from '../../types/cms';
import { BestForLabel } from '../../types/directory';

export const AdminContentEditor: React.FC = () => {
  const {
    editingItemId,
    getContentById,
    createContent,
    updateContent,
    categories,
    mediaAssets,
    setAdminActiveTab
  } = useCMS();

  const { showToast } = useDiscovery();

  const isNew = !editingItemId;
  const existingItem = editingItemId ? getContentById(editingItemId) : undefined;

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [contentType, setContentType] = useState<CMSContentType>('article');
  const [status, setStatus] = useState<ContentLifecycleStatus>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  
  // Copy fields
  const [tagline, setTagline] = useState('');
  const [summary, setSummary] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [whoItsFor, setWhoItsFor] = useState('');
  const [bestFor, setBestFor] = useState<BestForLabel>('Best for creators');
  const [pricing, setPricing] = useState('Free tier & Paid options');
  const [releaseOrVersion, setReleaseOrVersion] = useState('v1.0');
  const [platformOrFormat, setPlatformOrFormat] = useState('Web & Desktop');

  // Fast Scan & Bullet points
  const [whatItIs, setWhatItIs] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [keyPointsText, setKeyPointsText] = useState('');
  const [keyHighlightsText, setKeyHighlightsText] = useState('');
  const [prosText, setProsText] = useState('');
  const [considerationsText, setConsiderationsText] = useState('');

  // Media
  const [coverImage, setCoverImage] = useState('');
  const [galleryImagesText, setGalleryImagesText] = useState('');

  // Tags & Author
  const [tagsText, setTagsText] = useState('');
  const [authorName, setAuthorName] = useState('PRISM Editorial');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);

  // Links
  const [officialUrl, setOfficialUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [affiliateDisclosure, setAffiliateDisclosure] = useState('PRISM may earn an affiliate commission on verified referral links.');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Media Library Quick Picker Modal state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title || '');
      setSlug(existingItem.slug || '');
      setCategory(existingItem.category || (categories[0]?.name || 'AI & Tools'));
      setContentType(existingItem.contentType || 'article');
      setStatus(existingItem.status || 'draft');
      setScheduledAt(existingItem.scheduledAt || '');
      setTagline(existingItem.tagline || '');
      setSummary(existingItem.summary || '');
      setMainContent(existingItem.mainContent || '');
      setWhoItsFor(existingItem.whoItsFor || '');
      setBestFor((existingItem.bestFor as BestForLabel) || 'Best for creators');
      setPricing(existingItem.pricing || 'Free & Paid Tiers');
      setReleaseOrVersion(existingItem.releaseOrVersion || 'v1.0');
      setPlatformOrFormat(existingItem.platformOrFormat || 'Web');
      setWhatItIs(existingItem.whatItIs || '');
      setWhyItMatters(existingItem.whyItMatters || '');
      setKeyPointsText(existingItem.keyPoints ? existingItem.keyPoints.join('\n') : '');
      setKeyHighlightsText(existingItem.keyHighlights ? existingItem.keyHighlights.join('\n') : '');
      setProsText(existingItem.pros ? existingItem.pros.join('\n') : '');
      setConsiderationsText(existingItem.considerations ? existingItem.considerations.join('\n') : '');
      setCoverImage(existingItem.coverImage || '');
      setGalleryImagesText(existingItem.galleryImages ? existingItem.galleryImages.join('\n') : '');
      setTagsText(existingItem.tags ? existingItem.tags.join(', ') : '');
      setAuthorName(existingItem.authorName || 'PRISM Editorial');
      setAuthorAvatar(existingItem.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
      setPublishedAt(existingItem.publishedAt || new Date().toISOString().split('T')[0]);
      setOfficialUrl(existingItem.officialUrl || '');
      setExternalUrl(existingItem.externalUrl || '');
      setAffiliateUrl(existingItem.affiliateUrl || '');
      setAffiliateDisclosure(existingItem.affiliateDisclosure || 'PRISM contains verified partner links.');
      setSeoTitle(existingItem.seoTitle || '');
      setMetaDescription(existingItem.metaDescription || '');
    } else {
      // Defaults for brand new
      setCategory(categories[0]?.name || 'AI & Tools');
      setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
      setTagsText('Innovation, Visual, Modern');
    }
  }, [existingItem, categories]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a content title.', 'error');
      return;
    }

    const payload: Partial<CMSContentItem> = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category || categories[0]?.name || 'AI & Tools',
      contentType,
      status,
      scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
      tagline: tagline.trim() || title.trim(),
      summary: summary.trim() || tagline.trim(),
      mainContent: mainContent.trim(),
      whoItsFor: whoItsFor.trim(),
      bestFor,
      pricing: pricing.trim(),
      releaseOrVersion: releaseOrVersion.trim(),
      platformOrFormat: platformOrFormat.trim(),
      whatItIs: whatItIs.trim() || summary.trim() || tagline.trim(),
      whyItMatters: whyItMatters.trim() || tagline.trim(),
      keyPoints: keyPointsText.split('\n').map((s) => s.trim()).filter(Boolean),
      keyHighlights: keyHighlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
      pros: prosText.split('\n').map((s) => s.trim()).filter(Boolean),
      considerations: considerationsText.split('\n').map((s) => s.trim()).filter(Boolean),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      galleryImages: galleryImagesText.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean),
      authorName: authorName.trim() || 'PRISM Editorial',
      authorAvatar: authorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      publishedAt: publishedAt || new Date().toISOString().split('T')[0],
      officialUrl: officialUrl.trim(),
      externalUrl: externalUrl.trim(),
      affiliateUrl: affiliateUrl.trim(),
      affiliateDisclosure: affiliateDisclosure.trim(),
      seoTitle: seoTitle.trim() || `${title.trim()} | PRISM`,
      metaDescription: metaDescription.trim() || whatItIs.trim() || summary.trim()
    };

    if (isNew) {
      const res = createContent(payload);
      if (res.success) {
        showToast(`Created content: "${title}"`, 'success');
        setAdminActiveTab('content');
      } else {
        showToast(res.error || 'Failed to create item', 'error');
      }
    } else {
      const res = updateContent(editingItemId, payload);
      if (res.success) {
        showToast(`Saved changes for: "${title}"`, 'success');
        setAdminActiveTab('content');
      } else {
        showToast(res.error || 'Failed to update item', 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Header & Save Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 sticky top-16 bg-[#07090e]/95 backdrop-blur-md z-30 py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdminActiveTab('content')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isNew ? 'Create New Discovery Content' : `Editing: ${title || 'Content Item'}`}
            </h1>
            <span className="text-xs text-zinc-400">
              {isNew ? 'Fill in core specs, media, fast scan & SEO metadata' : `ID: ${editingItemId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status quick select */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentLifecycleStatus)}
            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
              status === 'published'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : status === 'draft'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : status === 'review'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : status === 'scheduled'
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Publish Now</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Update</span>
          </button>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Core Fields (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Basic Content Details */}
          <div className="bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              1. Basic Content Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Content Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cursor: The AI-First Code Editor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.isActive ? 'Active' : 'Inactive'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Content Type *
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as CMSContentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="article">Visual Article & Study</option>
                    <option value="ai-tool">AI Tool / Generator</option>
                    <option value="tech-product">Tech Product / Hardware</option>
                    <option value="movie">Movie / TV Production</option>
                    <option value="manhwa">Manhwa / Webtoon</option>
                    <option value="anime">Anime / Sakuga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  placeholder="One punchy sentence summarizing the core value"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Executive Summary / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="2-3 sentence overview of this item..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-y"
                />
              </div>
            </div>
          </div>

          {/* 2. 30-Second Fast Scan Architecture */}
          <div className="bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" />
              2. 30-Second Fast Scan
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  1. What It Is (Crisp definition)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next-generation multi-agent coding IDE with full repo awareness"
                  value={whatItIs}
                  onChange={(e) => setWhatItIs(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  2. Why It Matters (Significance)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reduces codebase refactoring velocity from days to seconds"
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  3. Key Takeaway Points (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Native background indexing\nMulti-file edit generation\nPrivacy mode with zero telemetry retention`}
                  value={keyPointsText}
                  onChange={(e) => setKeyPointsText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 3. Detailed Specifications & Pros/Cons */}
          <div className="bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              3. Specifications, Best-For & Suitability
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Best-For Contextual Label
                </label>
                <select
                  value={bestFor}
                  onChange={(e) => setBestFor(e.target.value as BestForLabel)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Best for beginners">Best for beginners</option>
                  <option value="Best for creators">Best for creators</option>
                  <option value="Popular">Popular</option>
                  <option value="Trending">Trending</option>
                  <option value="New">New</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Pricing / Access Tier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Tier / $20/mo Pro"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Version / Release
                </label>
                <input
                  type="text"
                  placeholder="e.g. v2.4 (Feb 2026)"
                  value={releaseOrVersion}
                  onChange={(e) => setReleaseOrVersion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Platform / Format
                </label>
                <input
                  type="text"
                  placeholder="e.g. macOS / Windows / Linux"
                  value={platformOrFormat}
                  onChange={(e) => setPlatformOrFormat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Target Audience (Who It's For)
              </label>
              <input
                type="text"
                placeholder="e.g. Full-stack developers, ML researchers, and engineering leads"
                value={whoItsFor}
                onChange={(e) => setWhoItsFor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  Notable Strengths (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Instant codebase context\nExtremely low latency`}
                  value={prosText}
                  onChange={(e) => setProsText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1">
                  Considerations (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Requires active internet for cloud models\nLearning curve for multi-agent keys`}
                  value={considerationsText}
                  onChange={(e) => setConsiderationsText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Full Article Body */}
          <div className="bg-[#0b0e15] p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              4. In-Depth Main Content / Deconstruction
            </h2>
            <textarea
              rows={6}
              placeholder="Write detailed markdown or in-depth technical analysis..."
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-y leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Right Column: Links, Media, SEO, Schedule (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status & Timing */}
          <div className="bg-[#0b0e15] p-5 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Lifecycle & Timing
            </h3>

            {status === 'scheduled' && (
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 space-y-1.5">
                <label className="text-[11px] font-bold text-purple-300 block">
                  Schedule Automatic Release Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs border border-purple-700 focus:outline-none"
                />
                <p className="text-[10px] text-purple-400">
                  The system will automatically publish this when the timestamp is reached.
                </p>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Published Date
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Media & Visuals */}
          <div className="bg-[#0b0e15] p-5 rounded-3xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Cover Image & Media
              </h3>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Browse Media
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Cover Image URL *
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Visual preview */}
            {coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Gallery Images (One URL per line)
              </label>
              <textarea
                rows={2}
                placeholder="https://...\nhttps://..."
                value={galleryImagesText}
                onChange={(e) => setGalleryImagesText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* External & Affiliate Links */}
          <div className="bg-[#0b0e15] p-5 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              External & Affiliate Links
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                External Docs / Github URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                Affiliate / Partner Tracking URL
              </label>
              <input
                type="url"
                placeholder="https://partner.link/?ref=prism"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* SEO & Tags */}
          <div className="bg-[#0b0e15] p-5 rounded-3xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              SEO & Tags
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="AI, Code, Developer Tools"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                placeholder="Title for Google search results"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                SEO Meta Description ({metaDescription.length}/160 chars)
              </label>
              <textarea
                rows={2}
                maxLength={160}
                placeholder="Search engine snippet description..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 text-xs text-white border border-zinc-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-zinc-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Select from Media Library</h3>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setCoverImage(asset.url);
                    setIsMediaPickerOpen(false);
                    showToast('Selected cover image from library', 'info');
                  }}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-emerald-500 cursor-pointer"
                >
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white">
                    Use Image
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
