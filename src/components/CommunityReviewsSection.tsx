import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  Flag,
  Send,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { ReportReason } from '../types/community';
import { CommunityRatingBadge } from './CommunityRatingBadge';

interface CommunityReviewsSectionProps {
  itemId: string;
  itemType: 'discovery' | 'directory';
  itemTitle: string;
}

export const CommunityReviewsSection: React.FC<CommunityReviewsSectionProps> = ({
  itemId,
  itemType,
  itemTitle
}) => {
  const {
    getItemReviews,
    addReview,
    markReviewHelpful,
    reportReview,
    isRateLimited,
    rateLimitRemainingSeconds
  } = useCommunity();

  const { showToast } = useDiscovery();

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Anti-bot spam field
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reporting modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');

  const reviews = getItemReviews(itemId);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (content.trim().length < 10) {
      setFormError('Please write at least 10 characters for your review.');
      return;
    }

    setIsSubmitting(true);

    const res = addReview(
      itemId,
      itemType,
      authorName,
      rating,
      title,
      content,
      honeypot
    );

    setIsSubmitting(false);

    if (res.success) {
      showToast('Thank you! Your community review has been published.', 'success');
      setTitle('');
      setContent('');
      setFormError(null);
    } else {
      setFormError(res.error || 'Failed to submit review.');
    }
  };

  const handleReportSubmit = (reviewId: string) => {
    const res = reportReview(reviewId, reportReason);
    showToast(res.message, res.success ? 'success' : 'info');
    setReportingReviewId(null);
  };

  return (
    <section id="community-reviews" className="pt-8 border-t border-zinc-800 space-y-8">
      
      {/* Section Header & Separation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0b0e15] border border-zinc-800/90 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white">
              Community Reviews & Discussions
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Real opinions and user experiences. Community ratings are strictly separated from factual editorial specifications.
          </p>
        </div>

        <CommunityRatingBadge itemId={itemId} size="md" interactive={true} />
      </div>

      {/* Review Submission Form */}
      <div className="p-6 rounded-3xl bg-[#0e121a] border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Write a Community Review for "{itemTitle}"
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">
            Verified Community Layer
          </span>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Honeypot field (hidden from normal users, catches bots) */}
          <input
            type="text"
            name="website_hp_check"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Interactive 1-5 Star Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Your Community Rating: <span className="text-amber-400 font-bold">{rating} / 5 Stars</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-zinc-600 hover:text-amber-400 transition-all transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-650'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 block">
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex, VFX Artist, Web Dev"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={50}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Review Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 block">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Unbelievable performance on M3 Max"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <label className="font-semibold text-zinc-300">
                Detailed Review & Community Feedback *
              </label>
              <span className={`text-[11px] font-mono ${content.length < 10 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {content.length}/1500 chars (min 10)
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Share what worked well, technical quirks, usability tips, or who should check this out..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1500}
              className="w-full p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Submit Action & Anti-Spam Cooldown status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-spam enabled • Duplicate protection active</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isRateLimited || content.trim().length < 10}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                isRateLimited || content.trim().length < 10
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer'
              }`}
            >
              {isRateLimited ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Cooldown ({rateLimitRemainingSeconds}s)</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Real Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Community Feedback</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-300">
              {reviews.length}
            </span>
          </h4>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center bg-[#0d1017] rounded-3xl border border-zinc-800/80 p-6 space-y-2">
            <p className="text-sm font-semibold text-zinc-300">No community reviews yet.</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We never fabricate artificial feedback. Be the first real community member to rate and write your honest experience!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((rev) => {
              const isFlagged = rev.status === 'flagged';
              const isUnderReview = rev.status === 'under_review';

              return (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isFlagged
                      ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
                      : 'bg-[#0e121a] border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  {/* Review Top Meta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-200">
                            {rev.authorName}
                          </span>
                          {rev.isReportedByCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              Reported by you
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-zinc-900/90 px-2 py-1 rounded-lg border border-zinc-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {rev.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Flagged moderation warning if under review */}
                  {isUnderReview && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>This review has been flagged for moderation review.</span>
                    </div>
                  )}

                  {/* Headline & Body */}
                  <div className="mt-3 space-y-1">
                    {rev.title && (
                      <h5 className="text-xs font-bold text-white">
                        {rev.title}
                      </h5>
                    )}
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                      {rev.content}
                    </p>
                  </div>

                  {/* Actions: Helpful & Report */}
                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        const res = markReviewHelpful(rev.id);
                        showToast(res.message, 'info');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-colors ${
                        rev.isHelpfulByCurrentUser
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${rev.isHelpfulByCurrentUser ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>

                    {/* Report Trigger */}
                    {reportingReviewId === rev.id ? (
                      <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 animate-in fade-in">
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value as ReportReason)}
                          className="bg-zinc-950 text-zinc-200 text-[11px] px-2 py-1 rounded-lg border border-zinc-800 focus:outline-none"
                        >
                          <option value="spam">Spam / Bot</option>
                          <option value="harassment">Harassment</option>
                          <option value="inappropriate">Inappropriate</option>
                          <option value="misinformation">Misinformation</option>
                          <option value="other">Other</option>
                        </select>
                        <button
                          onClick={() => handleReportSubmit(rev.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setReportingReviewId(null)}
                          className="px-1.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReportingReviewId(rev.id)}
                        disabled={rev.isReportedByCurrentUser}
                        className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Report inappropriate review"
                      >
                        <Flag className="w-3 h-3" />
                        <span>{rev.isReportedByCurrentUser ? 'Reported' : 'Report'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
