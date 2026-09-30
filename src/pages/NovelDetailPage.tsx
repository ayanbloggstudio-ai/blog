/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Heart,
  Bookmark,
  Bell,
  Share2,
  Sparkles,
  Flame,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Send,
  Flag,
  ListOrdered,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { NovelItem, NovelChapter } from '../types/novel';
import { useNovels } from '../context/NovelContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { NovelCard } from '../components/novel/NovelCard';

interface NovelDetailPageProps {
  novel: NovelItem;
}

export const NovelDetailPage: React.FC<NovelDetailPageProps> = ({ novel }) => {
  const {
    closeNovelDetail,
    openReader,
    getReadingProgress,
    isNovelSaved,
    toggleSaveNovel,
    isNovelFollowed,
    toggleFollowNovel,
    isNovelLiked,
    toggleLikeNovel,
    getNovelComments,
    addNovelComment,
    likeComment,
    reportComment,
    novels
  } = useNovels();

  const { showToast } = useDiscovery();

  const [chapterSortAsc, setChapterSortAsc] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters');
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reportModalCommentId, setReportModalCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate or Off-topic');

  const progress = getReadingProgress(novel.id);
  const isSaved = isNovelSaved(novel.id);
  const isFollowed = isNovelFollowed(novel.id);
  const isLiked = isNovelLiked(novel.id);
  const comments = getNovelComments(novel.id);

  // Chapters sorted
  const sortedChapters = [...(novel.chapters || [])].sort((a, b) => {
    return chapterSortAsc ? (a.chapterNumber || 0) - (b.chapterNumber || 0) : (b.chapterNumber || 0) - (a.chapterNumber || 0);
  });

  const latestChapter = novel.chapters && novel.chapters.length > 0 ? novel.chapters[novel.chapters.length - 1] : undefined;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Novel link copied to clipboard!');
    } else {
      showToast('Sharing link: ' + url);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addNovelComment(
      novel.id,
      commentText.trim(),
      undefined,
      authorName.trim() || 'Prism Reader'
    );
    setCommentText('');
    showToast('Comment posted to novel discussion!');
  };

  const handleConfirmReport = () => {
    if (reportModalCommentId) {
      reportComment(reportModalCommentId, reportReason);
      setReportModalCommentId(null);
      showToast('Comment reported for moderation review.');
    }
  };

  // Related novels in same genre or type
  const relatedNovels = novels
    .filter(n => n.id !== novel.id && (n.type === novel.type || n.genres.some(g => novel.genres.includes(g))))
    .slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={closeNovelDetail}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
            title="Share this novel"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative bg-zinc-900/70 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Ambient Backing Banner */}
        <div className="absolute inset-0 h-56 sm:h-72 overflow-hidden opacity-30 pointer-events-none">
          <img
            src={novel.bannerImage || novel.coverImage}
            alt=""
            className="w-full h-full object-cover filter blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-900" />
        </div>

        {/* Content Box */}
        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Large Cover */}
          <div className="w-44 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 bg-zinc-950 shrink-0 mx-auto md:mx-0 group relative">
            <img
              src={novel.coverImage}
              alt={novel.title}
              className="w-full h-full object-cover"
            />
            {novel.isOriginal && (
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                PRISM ORIGINAL
              </div>
            )}
          </div>

          {/* Core Info & Metadata */}
          <div className="flex-1 space-y-4 text-left min-w-0">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {novel.type}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60 capitalize">
                Status: {novel.status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {(typeof novel.rating === 'number' ? novel.rating : 0).toFixed(2)} ({novel.ratingCount || 0} reviews)
              </span>
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {novel.title}
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-zinc-300 flex items-center gap-2 flex-wrap">
                <span>Created by</span>
                <span className="font-bold text-indigo-400">{novel.author}</span>
                {novel.authorRole && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {novel.authorRole}
                  </span>
                )}
              </p>
            </div>

            {/* Editorial Note (for Originals) */}
            {novel.editorialNote && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Editor's Spotlight: </span>
                  {novel.editorialNote}
                </div>
              </div>
            )}

            {/* Synopsis Description */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
              {novel.description}
            </p>

            {/* Genres & Tags */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-zinc-400 mr-1">Genres:</span>
                {novel.genres.map((g, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-zinc-400 mr-1">Tags:</span>
                {novel.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Metric Strip */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white text-sm">{novel.chapters?.length || 0}</div>
                  <div className="text-zinc-500">Chapters</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-white text-sm">{(novel.views || 0).toLocaleString()}</div>
                  <div className="text-zinc-500">Total Reads</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-sm">{(novel.saves || 0).toLocaleString()}</div>
                  <div className="text-zinc-500">Bookmarks</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white text-sm">{(novel.followers || 0).toLocaleString()}</div>
                  <div className="text-zinc-500">Followers</div>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Continue Reading or Chapter 1 */}
              {progress && sortedChapters.length > 0 ? (
                <button
                  onClick={() => openReader(novel.id, progress.chapterNumber)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Continue Ch. {progress.chapterNumber} ({progress.scrollPercent}%)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const firstChapter = sortedChapters[0];
                    if (firstChapter) {
                      openReader(novel.id, firstChapter.chapterNumber);
                    } else {
                      showToast('No chapters published yet for this series.');
                    }
                  }}
                  disabled={sortedChapters.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg transition-all ${
                    sortedChapters.length === 0
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 hover:scale-102'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{sortedChapters.length === 0 ? 'No Chapters Yet' : 'Read Chapter 1'}</span>
                </button>
              )}

              {/* Latest Chapter Quick Jump */}
              {latestChapter && (latestChapter.chapterNumber || 0) > 1 && (
                <button
                  onClick={() => openReader(novel.id, latestChapter.chapterNumber)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700/80 transition-all"
                >
                  <span>Latest: Ch. {latestChapter.chapterNumber}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}

              {/* Like Button */}
              <button
                onClick={() => {
                  toggleLikeNovel(novel.id);
                  showToast(isLiked ? 'Removed like' : 'Liked novel!');
                }}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 border-zinc-700/80'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                <span>{typeof novel.likes === 'number' && !isNaN(novel.likes) ? novel.likes : 0}</span>
              </button>

              {/* Bookmark Save Button */}
              <button
                onClick={() => {
                  toggleSaveNovel(novel.id);
                  showToast(isSaved ? 'Removed from library' : 'Saved to your library!');
                }}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 border-zinc-700/80'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-emerald-400' : ''}`} />
                <span>{isSaved ? 'Bookmarked' : 'Save'}</span>
              </button>

              {/* Follow Button */}
              <button
                onClick={() => {
                  toggleFollowNovel(novel.id);
                  showToast(isFollowed ? 'Unfollowed novel updates' : 'Following novel updates!');
                }}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                  isFollowed
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 border-zinc-700/80'
                }`}
              >
                <Bell className={`w-4 h-4 ${isFollowed ? 'fill-current text-amber-400' : ''}`} />
                <span>{isFollowed ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header: Chapter Directory vs Community Discussion */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 pb-2 text-sm sm:text-base font-bold transition-all relative ${
              activeTab === 'chapters'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-indigo-400" />
            <span>Chapters ({novel.chapters.length})</span>
            {activeTab === 'chapters' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 pb-2 text-sm sm:text-base font-bold transition-all relative ${
              activeTab === 'comments'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>Community Discussion ({comments.length})</span>
            {activeTab === 'comments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {activeTab === 'chapters' && (
          <button
            onClick={() => setChapterSortAsc(!chapterSortAsc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span>{chapterSortAsc ? 'Oldest First' : 'Newest First'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: CHAPTERS LIST */}
      {activeTab === 'chapters' && (
        <div className="space-y-2.5">
          {sortedChapters.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center text-zinc-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="font-semibold text-zinc-300">No chapters released yet</p>
              <p className="text-xs text-zinc-500 mt-1">Check back soon for new chapter updates.</p>
            </div>
          ) : (
            sortedChapters.map((chapter) => {
              const isRead = progress && progress.chapterNumber >= chapter.chapterNumber;
              const isCurrent = progress && progress.chapterNumber === chapter.chapterNumber;

              return (
                <div
                  key={chapter.id}
                  onClick={() => openReader(novel.id, chapter.chapterNumber)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-700/60 hover:border-emerald-500'
                      : 'bg-zinc-900/60 hover:bg-zinc-850/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-500 text-zinc-950'
                          : isRead
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-zinc-800/90 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors'
                      }`}
                    >
                      {chapter.chapterNumber}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                        {chapter.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(chapter.publishedAt).toLocaleDateString()}
                        </span>
                        {typeof chapter.wordCount === 'number' && !isNaN(chapter.wordCount) && chapter.wordCount > 0 ? (
                          <span>{chapter.wordCount.toLocaleString()} words</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isCurrent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Reading Now
                      </span>
                    ) : isRead ? (
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                        Read
                      </span>
                    ) : null}

                    <span className="p-2 rounded-xl bg-zinc-800/60 text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: COMMENTS / COMMUNITY DISCUSSION */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* Post Comment Form */}
          <form
            onSubmit={handlePostComment}
            className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3.5"
          >
            <h4 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Share your thoughts or theories</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your reader name (optional)"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment, character review, or chapter prediction..."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          {/* Comments Feed */}
          {comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No comments yet on this novel. Be the first reader to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-zinc-950 font-bold text-xs flex items-center justify-center">
                        {comment.authorName[0]?.toUpperCase() || 'R'}
                      </div>
                      <span className="font-bold text-xs text-zinc-200">{comment.authorName}</span>
                      {typeof comment.chapterNumber === 'number' && !isNaN(comment.chapterNumber) && comment.chapterNumber > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                          Ch. {comment.chapterNumber}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-zinc-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setReportModalCommentId(comment.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Report comment"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-9">
                    {comment.content}
                  </p>

                  <div className="pl-9 flex items-center gap-3 text-xs text-zinc-400 pt-1">
                    <button
                      onClick={() => likeComment(comment.id)}
                      className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                        comment.isLiked ? 'text-rose-400 font-bold' : ''
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Novels Shelf */}
      {relatedNovels.length > 0 && (
        <div className="pt-8 border-t border-zinc-800/80 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Readers Also Enjoyed</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedNovels.map((item) => (
              <NovelCard key={item.id} novel={item} />
            ))}
          </div>
        </div>
      )}

      {/* Moderation Report Modal */}
      {reportModalCommentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-zinc-100 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Report Comment</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Select the reason for reporting this comment to PRISM moderators:
            </p>
            <div className="space-y-1.5">
              {[
                'Inappropriate or Harassment',
                'Spoilers without warning',
                'Spam or Promo link',
                'Off-topic / Hate speech'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-800 text-xs text-zinc-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="text-rose-500 focus:ring-0"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReportModalCommentId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
