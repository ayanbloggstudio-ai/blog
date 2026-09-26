/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Eye,
  Heart,
  Bookmark,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { NovelItem } from '../../types/novel';
import { useNovels } from '../../context/NovelContext';
import { SafeImage } from '../SafeImage';

interface NovelCardProps {
  novel: NovelItem;
  featured?: boolean;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel, featured = false }) => {
  const {
    openNovel,
    openReader,
    getReadingProgress,
    isNovelSaved,
    toggleSaveNovel,
    isNovelLiked,
    toggleLikeNovel
  } = useNovels();

  const progress = getReadingProgress(novel.id);
  const isSaved = isNovelSaved(novel.id);
  const isLiked = isNovelLiked(novel.id);

  // Format relative date or days ago
  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleReadAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (progress && progress.chapterNumber) {
      openReader(novel.id, progress.chapterNumber);
    } else {
      openReader(novel.id, 1);
    }
  };

  const handleCardClick = () => {
    openNovel(novel.id);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-zinc-900/80 hover:bg-zinc-850/90 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:shadow-indigo-500/5 ${
        featured ? 'md:flex-row md:items-stretch col-span-full' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div
        className={`relative overflow-hidden bg-zinc-950 shrink-0 ${
          featured ? 'w-full md:w-72 lg:w-80 h-72 md:h-auto' : 'w-full aspect-[3/4] max-h-64 sm:max-h-72'
        }`}
      >
        <SafeImage
          src={novel.coverImage}
          alt={novel.title}
          fallbackType="novel"
          fallbackTitle={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

        {/* Badges Cluster */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          {novel.isOriginal && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 shadow-md">
              <Sparkles className="w-3 h-3 fill-current" />
              PRISM Original
            </span>
          )}

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
            {novel.type}
          </span>

          {(novel.trendingScore && novel.trendingScore > 4000) && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <Flame className="w-3 h-3 text-amber-400" />
              Trending
            </span>
          )}
        </div>

        {/* Save Bookmark Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveNovel(novel.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-emerald-500 text-zinc-950 shadow-md scale-110'
              : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save to Library'}
          aria-label="Save novel"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Reading progress overlay at bottom of cover if active */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-zinc-950/95 to-transparent backdrop-blur-xs flex items-center justify-between text-[11px] text-zinc-300">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ch. {progress.chapterNumber} ({progress.scrollPercent}%)
            </span>
            <span className="text-[10px] text-zinc-400">In Progress</span>
          </div>
        )}
      </div>

      {/* Novel Card Body */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div className="space-y-2.5">
          {/* Genre and Update Time */}
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="font-medium text-indigo-400 truncate">
              {novel.genres[0] || 'Fiction'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(novel.lastUpdatedAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {novel.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span>By</span>
            <span className="font-semibold text-zinc-200">{novel.author}</span>
            {novel.authorRole && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                {novel.authorRole}
              </span>
            )}
          </p>

          {/* Short Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {novel.shortDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {novel.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Metadata & CTA Action Bar */}
        <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between gap-2">
          {/* Stats: Chapters, Views, Likes */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1" title={`${novel.chapters.length} chapters`}>
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-semibold text-zinc-300">{novel.chapters.length}</span>
              <span className="hidden sm:inline text-zinc-500">chs</span>
            </span>

            <span className="flex items-center gap-1" title={`${novel.views.toLocaleString()} reads`}>
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>{(novel.views > 1000 ? `${(novel.views / 1000).toFixed(1)}k` : novel.views)}</span>
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeNovel(novel.id);
              }}
              className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                isLiked ? 'text-rose-400 font-semibold' : ''
              }`}
              title="Like novel"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{novel.likes}</span>
            </button>
          </div>

          {/* Read CTA Button */}
          <button
            onClick={handleReadAction}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
              progress
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            <span>{progress ? 'Continue' : 'Read Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
