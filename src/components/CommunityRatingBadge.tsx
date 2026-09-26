import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useDiscovery } from '../context/DiscoveryContext';

interface CommunityRatingBadgeProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const CommunityRatingBadge: React.FC<CommunityRatingBadgeProps> = ({
  itemId,
  size = 'md',
  interactive = true
}) => {
  const { getCommunityStats, rateItem } = useCommunity();
  const { showToast } = useDiscovery();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const stats = getCommunityStats(itemId);
  const { averageRating, ratingCount, userRating } = stats;

  const handleStarClick = (rating: number) => {
    if (!interactive) return;
    const res = rateItem(itemId, rating);
    if (res.success) {
      showToast(res.message, 'success');
    }
  };

  const starSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
      {/* Visual Stars & Community Rating Display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating !== null
              ? star <= hoverRating
              : userRating !== null
              ? star <= userRating
              : averageRating !== null
              ? star <= Math.round(averageRating)
              : false;

            return (
              <button
                key={star}
                type="button"
                disabled={!interactive}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => interactive && setHoverRating(star)}
                onMouseLeave={() => interactive && setHoverRating(null)}
                className={`transition-transform ${
                  interactive ? 'hover:scale-125 cursor-pointer focus:outline-none' : 'cursor-default'
                }`}
                title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
              >
                <Star
                  className={`${starSizeClass} ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Real community rating score: Only displayed when real community ratings exist! */}
        {averageRating !== null && ratingCount > 0 ? (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-white text-xs sm:text-sm">
              ⭐ {averageRating.toFixed(1)}/5
            </span>
            <span className="text-zinc-400 text-[11px]">
              ({ratingCount.toLocaleString()} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-500 italic">
            No community ratings yet • Be the first to rate
          </span>
        )}
      </div>

      {userRating !== null && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
          Your Rating: {userRating}★
        </span>
      )}
    </div>
  );
};
