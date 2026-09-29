import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  Bookmark,
  Share2,
  ExternalLink,
  Flame,
  Star,
  CheckCircle,
  ShieldAlert,
  MessageSquare,
  AlertTriangle,
  EyeOff,
  Trash2,
  Edit3,
  Sparkles,
  Info,
  Clock,
  Flag,
  Send,
  Check,
  X
} from 'lucide-react';
import { CommunityProduct, ReportReason } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CommunityProductCard } from './CommunityProductCard';

interface CommunityProductDetailProps {
  product: CommunityProduct;
  onBack: () => void;
}

export const CommunityProductDetail: React.FC<CommunityProductDetailProps> = ({
  product,
  onBack
}) => {
  const {
    getProductStats,
    toggleLikeProduct,
    toggleSaveProduct,
    getProductComments,
    addComment,
    updateComment,
    reportComment,
    hideComment,
    deleteComment,
    markCommentHelpful,
    getRelatedProducts,
    recordProductClick,
    recordProductView,
    recordProductShare,
    isRateLimited,
    rateLimitRemainingSeconds
  } = useCommunity();

  const { showToast } = useDiscovery();

  const stats = getProductStats(product.id);
  const comments = getProductComments(product.id);
  const relatedProducts = getRelatedProducts(product, 3);

  // Record view on mount & dynamic SEO
  useEffect(() => {
    recordProductView(product.id);
    document.title = `${product.name} | PRISM Community`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', product.shortDescription || product.description || 'Explore curated products on PRISM');
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${product.name} | PRISM Community`);
    }
  }, [product.id, product.name, product.shortDescription, product.description, recordProductView]);

  // New Comment / Review Form State
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [includeRating, setIncludeRating] = useState<boolean>(true);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState<number | undefined>(undefined);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  // Report Modal / Confirmation State
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [commentFilter, setCommentFilter] = useState<'all' | 'reviews' | 'discussions'>('all');

  const handleLike = () => {
    const isNowLiked = toggleLikeProduct(product.id);
    showToast(isNowLiked ? `Liked ${product.name}!` : `Removed like from ${product.name}`, 'info');
  };

  const handleSave = () => {
    const isNowSaved = toggleSaveProduct(product.id);
    showToast(isNowSaved ? `Saved ${product.name} to collection!` : `Removed ${product.name} from saved items`, 'info');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} on PRISM Community`,
      text: product.shortDescription,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Product link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Could not copy link', 'info');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      showToast('Please write some content before submitting.', 'info');
      return;
    }

    setIsSubmitting(true);
    const result = addComment({
      productId: product.id,
      authorName: authorName.trim() || 'Community Member',
      rating: includeRating ? rating : undefined,
      title: reviewTitle.trim() || undefined,
      content: reviewContent.trim(),
      honeypot
    });

    setIsSubmitting(false);

    if (result.success) {
      showToast('Thank you! Your feedback has been published.', 'success');
      setReviewContent('');
      setReviewTitle('');
    } else {
      showToast(result.error || 'Failed to submit review.', 'info');
    }
  };

  const handleConfirmReport = () => {
    if (!reportingCommentId) return;
    const res = reportComment(reportingCommentId, reportReason);
    showToast(res.message, 'info');
    setReportingCommentId(null);
  };

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'reviews') return typeof c.rating === 'number';
    if (commentFilter === 'discussions') return typeof c.rating !== 'number';
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-emerald-400" />
          <span>Back to Community Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              product.mainCategory === 'digital'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {product.mainCategory}
          </span>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
            {product.category}
          </span>
        </div>
      </div>

      {/* Hero Section: Product Identity & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-black/30 opacity-80" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-950/90 text-white border border-zinc-700/60 backdrop-blur-md">
                {product.category}
              </span>

              {stats.isTrending && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 backdrop-blur-md animate-pulse">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Trending Velocity</span>
                </div>
              )}
            </div>

            {/* Price Badge in Image Bottom */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-zinc-950/95 text-emerald-400 border border-emerald-500/40 backdrop-blur-md shadow-xl">
                {product.priceStatus}
              </span>
            </div>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0e121c] border border-zinc-800 text-center">
            <div className="p-2">
              <div className="text-xl font-black text-white">{stats.likes}</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Community Likes</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black text-white">{stats.saves}</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Saved Items</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black text-white">{stats.commentCount}</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Discussions</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{stats.averageRating !== null ? stats.averageRating : '—'}</span>
              </div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                {stats.ratingCount > 0 ? `${stats.ratingCount} Reviews` : 'No reviews yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details, CTAs & Features (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Curated Discovery
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-zinc-400">
                Added {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Features List */}
          <div className="p-5 rounded-3xl bg-[#0c101a] border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Key Highlights & Features</span>
            </h3>

            <ul className="space-y-2.5">
              {product.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Website & Affiliate CTAs */}
          <div className="space-y-3 p-5 rounded-3xl bg-[#0e1320] border border-zinc-800/90 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary CTA (Affiliate or Official) */}
              <a
                href={product.affiliateUrl || product.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordProductClick(product.id, Boolean(product.affiliateUrl), product.affiliateUrl || product.officialWebsiteUrl)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <span>{product.affiliateCtaText || 'Visit Official Website'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* If affiliate is distinct from official, show secondary official link */}
              {product.affiliateUrl && product.officialWebsiteUrl !== product.affiliateUrl && (
                <a
                  href={product.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordProductClick(product.id, false, product.officialWebsiteUrl)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-700/80 transition-colors"
                >
                  <span>Official Site</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              )}
            </div>

            {/* Subtle Affiliate Disclosure */}
            {product.affiliateUrl && (
              <div className="flex items-start gap-2 text-[11px] text-zinc-400/90 pt-1 leading-normal">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <p>
                  {product.affiliateDisclosure ||
                    'Affiliate Disclosure: PRISM may earn an affiliate commission on qualifying purchases at no extra cost to you. Curated independently based on community signals.'}
                </p>
              </div>
            )}
          </div>

          {/* Interaction Action Buttons Cluster */}
          <div className="flex items-center gap-2 pt-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                stats.isLikedByUser
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${stats.isLikedByUser ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{stats.isLikedByUser ? 'Liked' : 'Like'} ({stats.likes})</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                stats.isSavedByUser
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${stats.isSavedByUser ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{stats.isSavedByUser ? 'Saved' : 'Save'} ({stats.saves})</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              title="Share product link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Comments & Reviews Section */}
      <div className="pt-8 border-t border-zinc-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Community Reviews & Discussions</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real feedback from engineers, creators, and technologists. Star ratings and qualitative reviews.
            </p>
          </div>

          {/* Comment Type Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setCommentFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                commentFilter === 'all' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({comments.length})
            </button>
            <button
              onClick={() => setCommentFilter('reviews')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                commentFilter === 'reviews' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Reviews Only ({comments.filter((c) => typeof c.rating === 'number').length})
            </button>
            <button
              onClick={() => setCommentFilter('discussions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                commentFilter === 'discussions' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Discussions ({comments.filter((c) => typeof c.rating !== 'number').length})
            </button>
          </div>
        </div>

        {/* Post a Review / Comment Form */}
        <div className="p-6 rounded-3xl bg-[#0b0e18] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Write a Review or Discussion Point</span>
            </h3>

            {/* Toggle Rating option */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRating}
                onChange={(e) => setIncludeRating(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-700"
              />
              <span>Include Star Rating</span>
            </label>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            {/* Honeypot field (hidden from legitimate users) */}
            <input
              type="text"
              name="website_url_honey"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Your Name or Handle
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {includeRating && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className="p-1 text-zinc-600 hover:text-amber-400 transition-colors focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starVal <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-700 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-2">{rating} Stars</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summary of your experience..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Detailed Feedback & Insights
              </label>
              <textarea
                rows={3}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Share your real hands-on impressions, pros, trade-offs, or setup tips..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                {isRateLimited ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Cooldown: wait {rateLimitRemainingSeconds}s before posting
                  </span>
                ) : (
                  'Moderated per community safety guidelines.'
                )}
              </span>

              <button
                type="submit"
                disabled={isSubmitting || isRateLimited}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>

        {/* Comments / Reviews List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#0b0e15] border border-zinc-800/80 text-center space-y-2">
              <MessageSquare className="w-6 h-6 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No entries match this filter</h4>
              <p className="text-xs text-zinc-400">Be the first to share your thoughts on {product.name}!</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-5 rounded-3xl bg-[#0b0e18] border border-zinc-800/80 space-y-3 transition-colors hover:border-zinc-700/60"
              >
                {/* Comment Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-850">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{comment.authorName}</span>
                        {typeof comment.rating === 'number' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{comment.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Moderation Status Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {comment.status === 'under_review' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Under Moderation Review
                      </span>
                    )}
                    {comment.status === 'flagged' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                </div>

                {/* Content or Edit Mode */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2 pt-1 pb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Comment title (optional)"
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingComment || !editContent.trim()}
                        onClick={async () => {
                          setIsUpdatingComment(true);
                          await updateComment(comment.id, {
                            title: editTitle.trim() || undefined,
                            content: editContent.trim(),
                            rating: editRating
                          });
                          setIsUpdatingComment(false);
                          setEditingCommentId(null);
                          showToast('Comment updated successfully!', 'success');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {comment.title && (
                      <h4 className="text-xs font-bold text-zinc-200">{comment.title}</h4>
                    )}
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                )}

                {/* Comment Actions (Helpful, Edit, Report, Hide, Delete) */}
                <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-850">
                  <button
                    onClick={() => markCommentHelpful(comment.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      comment.isHelpfulByCurrentUser
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({comment.helpfulCount})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit comment */}
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditTitle(comment.title || '');
                        setEditContent(comment.content || '');
                        setEditRating(comment.rating);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                      title="Edit your comment"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Hide for current user */}
                    <button
                      onClick={() => {
                        hideComment(comment.id);
                        showToast('Comment hidden from your view.', 'info');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Hide comment from view"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>

                    {/* Report comment */}
                    <button
                      onClick={() => setReportingCommentId(comment.id)}
                      className={`p-1.5 transition-colors ${
                        comment.isReportedByCurrentUser
                          ? 'text-rose-400'
                          : 'text-zinc-500 hover:text-rose-400'
                      }`}
                      title={comment.isReportedByCurrentUser ? 'Already reported' : 'Report comment'}
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete comment */}
                    <button
                      onClick={() => {
                        deleteComment(comment.id);
                        showToast('Comment removed.', 'info');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportingCommentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c101a] border border-zinc-800 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Report Comment to Moderation</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Please choose a reason for reporting this content. Our moderation team reviews all flagged items.
            </p>

            <div className="space-y-2">
              {(['spam', 'harassment', 'misinformation', 'inappropriate', 'other'] as ReportReason[]).map(
                (reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs text-zinc-300 hover:bg-zinc-850"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="capitalize">{reason}</span>
                  </label>
                )
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportingCommentId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-zinc-800 space-y-5">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Related Community Products</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedProducts.map((rel) => (
              <CommunityProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
