import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { DiscoveryItem } from '../types/discovery';
import { DirectoryItem } from '../types/directory';

interface CommunityVoteBarProps {
  item: DiscoveryItem | DirectoryItem;
  onScrollToReviews?: () => void;
}

export const CommunityVoteBar: React.FC<CommunityVoteBarProps> = ({
  item,
  onScrollToReviews
}) => {
  const { getCommunityStats, voteItem } = useCommunity();
  const { toggleSave, isSaved, shareItem, showToast } = useDiscovery();

  const stats = getCommunityStats(item.id);
  const saved = isSaved(item.id);

  const handleVote = (type: 'like' | 'dislike') => {
    const res = voteItem(item.id, type);
    if (res.success) {
      showToast(res.message, 'info');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-[#0c1017] border border-zinc-800 shadow-lg">
      
      {/* Like Button */}
      <button
        onClick={() => handleVote('like')}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
          stats.userVote === 'like'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
            : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
        }`}
        title="Like this item"
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${stats.userVote === 'like' ? 'fill-emerald-400 text-emerald-400' : ''}`} />
        <span>Like</span>
        {stats.likes > 0 && (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800">
            {stats.likes}
          </span>
        )}
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleVote('dislike')}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
          stats.userVote === 'dislike'
            ? 'bg-rose-950 text-rose-300 border-rose-700 shadow-sm'
            : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
        }`}
        title="Dislike this item"
      >
        <ThumbsDown className={`w-3.5 h-3.5 ${stats.userVote === 'dislike' ? 'fill-rose-400 text-rose-400' : ''}`} />
        <span>Dislike</span>
        {stats.dislikes > 0 && (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800">
            {stats.dislikes}
          </span>
        )}
      </button>

      {/* Save Button */}
      <button
        onClick={() => toggleSave(item.id)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
          saved
            ? 'bg-amber-950 text-amber-300 border-amber-700 shadow-sm'
            : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
        }`}
        title="Save to your private collection"
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Share Button */}
      <button
        onClick={() => shareItem(item)}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1.5 transition-all"
        title="Share discovery link"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      {/* Jump to Reviews / Discussion counter */}
      {onScrollToReviews && (
        <button
          onClick={onScrollToReviews}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/90 text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1.5 transition-all ml-auto"
          title="Read community reviews"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reviews ({stats.reviewCount})</span>
        </button>
      )}
    </div>
  );
};
