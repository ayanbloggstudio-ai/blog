/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Flame,
  Clock,
  Star,
  Search,
  Bookmark,
  Layers,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Filter,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { NovelItem, NovelPortalTab, NovelSortOption, ReadingProgress } from '../types/novel';
import { useNovels } from '../context/NovelContext';
import { NovelCard } from '../components/novel/NovelCard';
import { NovelDetailPage } from './NovelDetailPage';
import { NovelReaderPage } from './NovelReaderPage';
import { NovelCreatorStudio } from '../components/novel/NovelCreatorStudio';
import { EmptyState } from '../components/EmptyState';
import { NOVEL_GENRES, MANGA_GENRES } from '../data/novelData';
import { sortNovels } from '../utils/novelRanking';

export const NovelCatalogView: React.FC = () => {
  const {
    novels,
    readingProgress,
    savedNovelIds,
    openReader
  } = useNovels();

  // Primary Vertical Tab: Web Novels vs Manga/Manhwa vs PRISM Originals vs Continue/Saved vs Creator Studio
  const [activeTab, setActiveTab] = useState<NovelPortalTab>('web-novels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortOption, setSortOption] = useState<NovelSortOption>('trending');

  // Active items currently in progress for Continue Reading shelf
  const continueReadingItems = useMemo(() => {
    const list = Object.values(readingProgress) as ReadingProgress[];
    return list
      .map(prog => {
        const item = novels.find(n => n.id === prog.novelId);
        return item ? { novel: item, progress: prog } : null;
      })
      .filter((entry): entry is { novel: NovelItem; progress: ReadingProgress } => entry !== null)
      .sort((a, b) => new Date(b.progress.lastReadAt).getTime() - new Date(a.progress.lastReadAt).getTime());
  }, [readingProgress, novels]);

  // Saved / Bookmarked items
  const savedItems = useMemo(() => {
    return novels.filter(n => savedNovelIds.includes(n.id));
  }, [novels, savedNovelIds]);

  // Filter novels by Tab, Search query, and Genre
  const filteredNovels = useMemo(() => {
    let list = novels;

    // 1. Tab filtering
    if (activeTab === 'web-novels') {
      list = list.filter(n => n.type === 'novel');
    } else if (activeTab === 'manga') {
      list = list.filter(n => n.type === 'manga' || n.type === 'manhwa');
    } else if (activeTab === 'originals') {
      list = list.filter(n => n.isOriginal);
    } else if (activeTab === 'continue') {
      const continueIds = continueReadingItems.map(c => c.novel.id);
      list = list.filter(n => continueIds.includes(n.id));
    } else if (activeTab === 'saved') {
      list = list.filter(n => savedNovelIds.includes(n.id));
    }

    // 2. Genre filtering
    if (selectedGenre !== 'All Genres') {
      list = list.filter(n => n.genres.includes(selectedGenre));
    }

    // 3. Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.genres.some(g => g.toLowerCase().includes(q)) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 4. Ranking / sorting
    return sortNovels(list, sortOption);
  }, [novels, activeTab, selectedGenre, searchQuery, sortOption, continueReadingItems, savedNovelIds]);

  // Featured Hero Item
  const featuredItem = useMemo(() => {
    return novels.find(n => n.featured && n.isOriginal) || novels.find(n => n.featured) || novels[0];
  }, [novels]);

  // Genres depending on active vertical
  const activeGenres = activeTab === 'manga' ? MANGA_GENRES : NOVEL_GENRES;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-indigo-950/70 via-zinc-950 to-zinc-900 shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover filter blur-2xl"
          />
        </div>

        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRISM Web Novels & Manga Vertical</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Curated Web Fiction & Graphic Chronicles
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explore distraction-free reading for high-octane LitRPGs, cultivation epics, and serialized webtoons. Featuring verified PRISM Originals, velocity-based trending algorithms, and an approved creator studio.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-zinc-200">{novels.filter(n => n.type === 'novel').length}</strong> Novels
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <strong className="text-zinc-200">{novels.filter(n => n.type !== 'novel').length}</strong> Manga & Manhwa
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-zinc-200">{novels.filter(n => n.isOriginal).length}</strong> PRISM Originals
              </span>
            </div>
          </div>

          {/* Quick Jump Action Card */}
          {featuredItem && (
            <div
              onClick={() => openReader(featuredItem.id, 1)}
              className="w-full lg:w-80 p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-700/80 shadow-xl transition-all cursor-pointer group shrink-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={featuredItem.coverImage}
                  alt={featuredItem.title}
                  className="w-16 h-22 object-cover rounded-xl border border-zinc-700/80 group-hover:scale-105 transition-transform shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    Featured Spotlight
                  </span>
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {featuredItem.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    By {featuredItem.author}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-indigo-400 font-bold mt-2">
                    <span>Read Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Segmented Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        {/* Vertical Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => {
              setActiveTab('web-novels');
              setSelectedGenre('All Genres');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'web-novels'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Web Novels</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manga');
              setSelectedGenre('All Genres');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'manga'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manga & Manhwa</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('originals');
              setSelectedGenre('All Genres');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'originals'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 font-black shadow-md'
                : 'text-amber-300 hover:text-amber-200 bg-amber-950/30 border border-amber-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>PRISM Originals</span>
          </button>

          <button
            onClick={() => setActiveTab('continue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'continue'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Continue ({continueReadingItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'saved'
                ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300 hover:text-white bg-purple-950/30 border border-purple-800/50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Creator Studio</span>
          </button>
        </div>

        {/* Search Bar Input */}
        {activeTab !== 'upload' && (
          <div className="relative w-full sm:w-64 md:w-72 shrink-0">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, tag..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* IF CREATOR STUDIO TAB IS ACTIVE */}
      {activeTab === 'upload' ? (
        <NovelCreatorStudio />
      ) : (
        <>
          {/* Continue Reading Shelf (When on Home or Continue tab) */}
          {continueReadingItems.length > 0 && (activeTab === 'web-novels' || activeTab === 'continue') && !searchQuery && (
            <section className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    Continue Reading
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">
                  Auto-saved bookmarks & progress
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {continueReadingItems.map(({ novel, progress }) => (
                  <div
                    key={novel.id}
                    onClick={() => openReader(novel.id, progress.chapterNumber)}
                    className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-600/60 transition-all cursor-pointer shadow-md flex items-center gap-4 group"
                  >
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-14 h-20 object-cover rounded-xl border border-zinc-700/80 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors truncate">
                        {novel.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Chapter {progress.chapterNumber} of {progress.totalChapters}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-2 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress.scrollPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                        <span>{progress.scrollPercent}% read</span>
                        <span className="text-emerald-400 font-bold group-hover:underline">
                          Resume Chapter →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Genre and Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            {/* Genre Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {activeGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === g
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-850'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-500 font-medium">Sort by:</span>
              <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                {(['trending', 'popular', 'latest', 'top-rated'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortOption(opt)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all ${
                      sortOption === opt
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt === 'trending' ? '🔥 Trending' : opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRISM Originals Dedicated Spotlight Shelf (When in Web Novels or Originals and originals exist) */}
          {(activeTab === 'web-novels' || activeTab === 'originals') &&
            selectedGenre === 'All Genres' &&
            !searchQuery &&
            novels.some((n) => n.isOriginal) && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/20 via-rose-950/20 to-indigo-950/20 border border-amber-700/30 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-extrabold text-lg text-white">
                      PRISM Originals
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      Official Publications
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Commissioned and published directly by PRISM
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {novels
                    .filter((n) => n.isOriginal)
                    .map((orig) => (
                      <NovelCard key={orig.id} novel={orig} featured />
                    ))}
                </div>
              </div>
            )}

          {/* Main Grid: All Filtered Novels or Manga */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {activeTab === 'manga' ? (
                  <Layers className="w-4 h-4 text-rose-400" />
                ) : (
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                )}
                <span>
                  {activeTab === 'manga' ? 'Manga & Manhwa Catalog' : 'Curated Web Novels'}{' '}
                  <span className="text-sm font-normal text-zinc-500">
                    ({filteredNovels.length} titles)
                  </span>
                </span>
              </h3>
            </div>

            {filteredNovels.length === 0 ? (
              <EmptyState
                icon={activeTab === 'manga' ? Layers : BookOpen}
                title={
                  searchQuery || selectedGenre !== 'All Genres'
                    ? 'No titles match your filter criteria'
                    : activeTab === 'manga'
                    ? 'No manga or manhwa published yet'
                    : activeTab === 'originals'
                    ? 'No PRISM originals published yet'
                    : activeTab === 'continue'
                    ? 'No reading history yet'
                    : activeTab === 'saved'
                    ? 'No saved titles yet'
                    : 'No novels published yet'
                }
                description={
                  searchQuery || selectedGenre !== 'All Genres'
                    ? 'Try adjusting the genre filter or clearing your search query.'
                    : activeTab === 'manga'
                    ? 'Visual manga, manhwa, and webtoons will appear here once published.'
                    : activeTab === 'originals'
                    ? 'Official productions and commissioned works will appear here once released.'
                    : activeTab === 'continue'
                    ? 'Start reading any web novel or manga to track your progress automatically.'
                    : activeTab === 'saved'
                    ? 'Bookmark web novels and manga to access them quickly here.'
                    : 'Serialized web novels and episodic chapters will appear here once published.'
                }
                actionLabel={
                  searchQuery || selectedGenre !== 'All Genres'
                    ? 'Reset Filters'
                    : 'Submit a Series'
                }
                onAction={
                  searchQuery || selectedGenre !== 'All Genres'
                    ? () => {
                        setSelectedGenre('All Genres');
                        setSearchQuery('');
                      }
                    : () => setActiveTab('upload')
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredNovels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const NovelPortalPage: React.FC = () => {
  const {
    selectedNovelId,
    selectedChapterNumber,
    getNovel
  } = useNovels();

  // If a novel and chapter are selected for active reading, render reader view
  if (selectedNovelId && selectedChapterNumber) {
    const novel = getNovel(selectedNovelId);
    if (novel) {
      return <NovelReaderPage novel={novel} chapterNumber={selectedChapterNumber} />;
    }
  }

  // If a novel is selected for detail overview, render detail page
  if (selectedNovelId) {
    const novel = getNovel(selectedNovelId);
    if (novel) {
      return <NovelDetailPage novel={novel} />;
    }
  }

  return <NovelCatalogView />;
};
