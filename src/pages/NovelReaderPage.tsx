/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  MessageSquare,
  Type,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Share2,
  Heart,
  Send,
  Flag,
  ListOrdered,
  X
} from 'lucide-react';
import { NovelItem, NovelChapter, ReaderSettings } from '../types/novel';
import { useNovels } from '../context/NovelContext';
import { useDiscovery } from '../context/DiscoveryContext';

interface NovelReaderPageProps {
  novel: NovelItem;
  chapterNumber: number;
}

export const NovelReaderPage: React.FC<NovelReaderPageProps> = ({ novel, chapterNumber }) => {
  const {
    openReader,
    closeReader,
    openNovel,
    updateReadingProgress,
    getReadingProgress,
    isNovelSaved,
    toggleSaveNovel,
    getNovelComments,
    addNovelComment,
    likeComment,
    reportComment,
    readerSettings,
    updateReaderSettings
  } = useNovels();

  const { showToast } = useDiscovery();

  // Settings dropdown modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

  // Content ref for scroll tracking
  const containerRef = useRef<HTMLDivElement>(null);

  // Current chapter
  const currentChapter = useMemo(() => {
    return novel.chapters.find(c => c.chapterNumber === chapterNumber) || novel.chapters[0];
  }, [novel, chapterNumber]);

  const hasPrev = currentChapter.chapterNumber > 1;
  const hasNext = currentChapter.chapterNumber < novel.chapters.length;

  const isSaved = isNovelSaved(novel.id);
  const chapterComments = getNovelComments(novel.id, currentChapter.chapterNumber);

  // Track scroll percentage and save progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      const progressPercent = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setScrollProgress(progressPercent);
      
      // Auto save reading progress
      updateReadingProgress(novel.id, currentChapter.chapterNumber, progressPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [novel.id, currentChapter.chapterNumber, updateReadingProgress]);

  // Navigate to previous chapter
  const goToPrev = () => {
    if (hasPrev) {
      openReader(novel.id, currentChapter.chapterNumber - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to next chapter
  const goToNext = () => {
    if (hasNext) {
      openReader(novel.id, currentChapter.chapterNumber + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('You have caught up with the latest chapter!');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Chapter link copied to clipboard!');
    } else {
      showToast('Link: ' + url);
    }
  };

  const handlePostChapterComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addNovelComment(
      novel.id,
      commentText.trim(),
      currentChapter.chapterNumber,
      authorName.trim() || 'Prism Reader'
    );
    setCommentText('');
    showToast('Chapter comment posted!');
  };

  // Theme Styling Classes
  const getThemeClasses = () => {
    switch (readerSettings.theme) {
      case 'light':
        return 'bg-[#f8f9fa] text-zinc-900 selection:bg-indigo-200';
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#3e2f1c] selection:bg-[#ecd8b0]';
      case 'black':
        return 'bg-[#000000] text-zinc-200 selection:bg-zinc-800';
      case 'dark':
      default:
        return 'bg-[#0b0e14] text-zinc-200 selection:bg-indigo-900/60';
    }
  };

  // Text Sizing
  const getTextSizeClass = () => {
    switch (readerSettings.fontSize) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl leading-loose';
      case 'xl':
        return 'text-xl sm:text-2xl leading-loose';
      case 'md':
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  // Reading Width Container
  const getWidthClass = () => {
    switch (readerSettings.readingWidth) {
      case 'narrow':
        return 'max-w-xl';
      case 'wide':
        return 'max-w-4xl';
      case 'standard':
      default:
        return 'max-w-2xl';
    }
  };

  // Font Family
  const getFontFamilyClass = () => {
    switch (readerSettings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // Split story into paragraphs
  const paragraphs = useMemo(() => {
    return currentChapter.content
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);
  }, [currentChapter.content]);

  return (
    <div className={`min-h-screen -mx-3 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 px-4 sm:px-6 transition-colors duration-200 ${getThemeClasses()}`}>
      {/* Sticky Progress Bar at the Top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800/40 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Reader Top Toolbar */}
      <header className="sticky top-1 z-40 max-w-4xl mx-auto py-3 px-3 sm:px-5 my-2 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 shadow-lg flex items-center justify-between gap-3 text-zinc-200">
        {/* Left: Back Action */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={closeReader}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Back to novel page"
            aria-label="Back to novel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs">
              {novel.title}
            </h2>
            <div className="text-[11px] text-zinc-400 truncate">
              Ch. {currentChapter.chapterNumber}: {currentChapter.title}
            </div>
          </div>
        </div>

        {/* Right: Controls (Settings, Chapters Drawer, Bookmark, Comments) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Chapter Selector Drawer Trigger */}
          <button
            onClick={() => setIsChapterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            title="Open chapter directory"
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Chapters</span>
            <span className="text-[10px] text-zinc-400 font-mono">({currentChapter.chapterNumber}/{novel.chapters.length})</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => {
              toggleSaveNovel(novel.id);
              showToast(isSaved ? 'Bookmark removed' : 'Saved bookmark to your reading list!');
            }}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title={isSaved ? 'Bookmarked' : 'Bookmark this novel'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-emerald-400' : ''}`} />
          </button>

          {/* Reader Settings Modal Trigger */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isSettingsOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title="Reader display settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Reader Customizer Panel Popover */}
      {isSettingsOpen && (
        <div className="max-w-md mx-auto mb-6 p-4 sm:p-5 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 text-zinc-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reader Customization</span>
            </span>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 text-zinc-500 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Reading Theme</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => updateReaderSettings({ theme: 'dark' })}
                className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  readerSettings.theme === 'dark'
                    ? 'border-indigo-500 bg-zinc-800 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => updateReaderSettings({ theme: 'sepia' })}
                className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  readerSettings.theme === 'sepia'
                    ? 'border-amber-600 bg-[#fbf0d9] text-[#3e2f1c] shadow-sm'
                    : 'border-zinc-800 bg-amber-950/20 text-amber-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>Sepia</span>
              </button>

              <button
                onClick={() => updateReaderSettings({ theme: 'light' })}
                className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  readerSettings.theme === 'light'
                    ? 'border-indigo-500 bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'border-zinc-800 bg-zinc-800 text-zinc-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => updateReaderSettings({ theme: 'black' })}
                className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  readerSettings.theme === 'black'
                    ? 'border-zinc-600 bg-black text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
                <span>OLED</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-400">Font Size</span>
              <span className="text-zinc-500 uppercase font-mono">{readerSettings.fontSize}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateReaderSettings({ fontSize: size })}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    readerSettings.fontSize === size
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Width */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-400">Page Width</span>
              <span className="text-zinc-500 capitalize">{readerSettings.readingWidth}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['narrow', 'standard', 'wide'] as const).map((width) => (
                <button
                  key={width}
                  onClick={() => updateReaderSettings({ readingWidth: width })}
                  className={`py-1.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    readerSettings.readingWidth === width
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">Typography Family</span>
            <div className="grid grid-cols-3 gap-2">
              {(['serif', 'sans', 'mono'] as const).map((family) => (
                <button
                  key={family}
                  onClick={() => updateReaderSettings({ fontFamily: family })}
                  className={`py-1.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    readerSettings.fontFamily === family
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {family === 'serif' ? 'Serif (Book)' : family === 'sans' ? 'Sans-Serif' : 'Monospace'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Story Reading Area */}
      <main
        ref={containerRef}
        className={`mx-auto py-8 sm:py-14 px-3 sm:px-6 space-y-8 ${getWidthClass()} ${getFontFamilyClass()}`}
      >
        {/* Chapter Header */}
        <header className="space-y-3 text-center border-b border-zinc-800/40 pb-6">
          <div className="text-xs uppercase tracking-widest font-extrabold text-indigo-400">
            {novel.title}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {currentChapter.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
            <span>Chapter {currentChapter.chapterNumber}</span>
            <span>•</span>
            <span>{new Date(currentChapter.publishedAt).toLocaleDateString()}</span>
            {currentChapter.wordCount && (
              <>
                <span>•</span>
                <span>{currentChapter.wordCount.toLocaleString()} words</span>
              </>
            )}
          </div>
        </header>

        {/* Story Body Paragraphs */}
        <article className={`space-y-6 ${getTextSizeClass()}`}>
          {paragraphs.map((paragraph, index) => {
            // Check if special format or dialog
            const isSystemAlert = paragraph.startsWith('[') && paragraph.endsWith(']');
            const isDivider = paragraph.startsWith('---');

            if (isDivider) {
              return (
                <div key={index} className="py-4 text-center text-zinc-500 tracking-widest font-mono text-xs">
                  * * *
                </div>
              );
            }

            if (isSystemAlert) {
              return (
                <div
                  key={index}
                  className="my-5 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 text-indigo-300 font-mono text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-inner"
                >
                  {paragraph}
                </div>
              );
            }

            return (
              <p
                key={index}
                className="leading-relaxed tracking-normal"
              >
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Chapter Completion Notice */}
        <div className="pt-8 border-t border-zinc-800/60 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>End of Chapter {currentChapter.chapterNumber}</span>
          </div>
          <p className="text-xs text-zinc-500">
            Progress recorded ({scrollProgress}%). Don't forget to join the chapter discussion below.
          </p>
        </div>

        {/* Bottom Navigation Cluster */}
        <div className="py-6 border-y border-zinc-800/60 flex items-center justify-between gap-3 font-sans">
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              hasPrev
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                : 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-900 text-zinc-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Chapter</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <button
            onClick={() => setIsChapterDrawerOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300"
          >
            Ch. {currentChapter.chapterNumber} / {novel.chapters.length}
          </button>

          <button
            onClick={goToNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
              hasNext
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            <span className="hidden sm:inline">{hasNext ? 'Next Chapter' : 'Latest Caught Up'}</span>
            <span className="sm:hidden">{hasNext ? 'Next' : 'Completed'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter-Specific Discussion & Comments */}
        <section className="pt-4 space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              <span>Chapter {currentChapter.chapterNumber} Discussion ({chapterComments.length})</span>
            </h3>

            <button
              onClick={handleShare}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Share chapter"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Comment Form */}
          <form
            onSubmit={handlePostChapterComment}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3"
          >
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your handle or reader name (optional)"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`React to Chapter ${currentChapter.chapterNumber}...`}
              rows={2}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          {chapterComments.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No comments on Chapter {currentChapter.chapterNumber} yet. Be the first to share your reaction!
            </div>
          ) : (
            <div className="space-y-3">
              {chapterComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">{comment.authorName}</span>
                    <button
                      onClick={() => {
                        reportComment(comment.id, 'Reported by reader');
                        showToast('Comment reported to moderators.');
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-0.5"
                      title="Report comment"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                    <button
                      onClick={() => likeComment(comment.id)}
                      className={`flex items-center gap-1 hover:text-rose-400 ${
                        comment.isLiked ? 'text-rose-400 font-bold' : ''
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                    <span>•</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Chapter Selector Slide-in Drawer Modal */}
      {isChapterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm h-full bg-zinc-900 border-l border-zinc-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 font-sans">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-indigo-400" />
                  <span>Chapter Directory</span>
                </h3>
                <button
                  onClick={() => setIsChapterDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-1.5 max-h-[75vh] overflow-y-auto pr-1">
                {novel.chapters.map((ch) => {
                  const isCurrent = ch.chapterNumber === currentChapter.chapterNumber;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        openReader(novel.id, ch.chapterNumber);
                        setIsChapterDrawerOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : 'bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="truncate">
                        Ch. {ch.chapterNumber}: {ch.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold shrink-0">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={closeReader}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
              >
                Return to Novel Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
