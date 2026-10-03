import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
  X,
  Save,
  Flag,
  Check,
  RotateCcw,
  ExternalLink,
  Wand2,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useNovels } from '../../context/NovelContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import {
  NovelItem,
  NovelChapter,
  NovelContentType,
  NovelStatus,
  NovelSubmissionStatus
} from '../../types/novel';
import { NovelAIGenerateType } from '../../types/aiStudio';
import { requestNovelGeneration } from '../../services/aiContentStudioService';
import { EmptyState } from '../../components/EmptyState';
import { SafeImage } from '../../components/SafeImage';
import { ImageUploadField } from '../../components/ImageUploadField';

export const AdminNovelManager: React.FC = () => {
  const {
    novels,
    allSubmissions,
    adminAddNovel,
    adminUpdateNovel,
    adminDeleteNovel,
    adminToggleFeatureNovel,
    adminToggleTrendingNovel,
    adminTogglePublishNovel,
    adminAddChapter,
    adminUpdateChapter,
    adminDeleteChapter,
    adminReorderChapters,
    adminApproveSubmission,
    adminRejectSubmission,
    adminSuspendSubmission,
    adminDeleteSubmission,
    adminRequestChangesSubmission,
    getNovelComments,
    adminDeleteComment,
    adminDismissCommentReport,
    openNovel
  } = useNovels();

  const { showToast } = useDiscovery();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'all' | 'originals' | 'novels' | 'manga' | 'submissions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<NovelItem | null>(null);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [selectedNovelForChapters, setSelectedNovelForChapters] = useState<NovelItem | null>(null);

  const [isEditingChapter, setIsEditingChapter] = useState<NovelChapter | null>(null);
  const [newChapterForm, setNewChapterForm] = useState<{
    chapterNumber: number;
    title: string;
    publishedAt: string;
    content: string;
  }>({
    chapterNumber: 1,
    title: '',
    publishedAt: new Date().toISOString().split('T')[0],
    content: ''
  });

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedNovelForComments, setSelectedNovelForComments] = useState<NovelItem | null>(null);

  // Submissions reject / request changes modal
  const [actionSubmissionId, setActionSubmissionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'request_changes'>('reject');
  const [actionNotes, setActionNotes] = useState('');

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Gemini AI Novel Assistant State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiType, setAiType] = useState<NovelAIGenerateType>('idea');
  const [aiNovelTitle, setAiNovelTitle] = useState('');
  const [aiGenre, setAiGenre] = useState('LitRPG & System');
  const [aiCharacters, setAiCharacters] = useState('');
  const [aiSetting, setAiSetting] = useState('');
  const [aiPlotDirection, setAiPlotDirection] = useState('');
  const [aiWritingStyle, setAiWritingStyle] = useState('Cinematic, fast-paced, immersive progression fantasy with visceral stakes');
  const [aiChapterLength, setAiChapterLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [aiPreviousChapterContext, setAiPreviousChapterContext] = useState('');
  const [aiAdditionalPrompt, setAiAdditionalPrompt] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResultText, setAiResultText] = useState('');
  const [copiedAI, setCopiedAI] = useState(false);

  // Series Form State
  const [seriesForm, setSeriesForm] = useState<Partial<NovelItem>>({
    title: '',
    slug: '',
    author: 'PRISM Editorial Staff',
    authorRole: 'Platform Author',
    type: 'novel',
    isOriginal: false,
    editorialNote: '',
    coverImage: '',
    bannerImage: '',
    shortDescription: '',
    description: '',
    genres: ['LitRPG & System'],
    tags: ['System', 'Reincarnation'],
    status: 'ongoing'
  });

  const [genresText, setGenresText] = useState('LitRPG & System, Fantasy');
  const [tagsText, setTagsText] = useState('Original, Progression, Action');

  // Aggregated Counts
  const originalsCount = novels.filter((n) => n.isOriginal).length;
  const webNovelsCount = novels.filter((n) => n.type === 'novel').length;
  const mangaCount = novels.filter((n) => n.type === 'manga' || n.type === 'manhwa').length;
  const pendingSubmissionsCount = allSubmissions.filter((s) => s.submissionStatus === 'pending_review').length;
  const totalChaptersCount = novels.reduce((sum, n) => sum + (n.chapters?.length || 0), 0);
  const totalReads = novels.reduce((sum, n) => sum + (n.views || 0), 0);

  // Filtered List
  const displayedItems = useMemo(() => {
    if (activeTab === 'submissions') {
      return allSubmissions.filter((sub) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            sub.title.toLowerCase().includes(q) ||
            sub.author.toLowerCase().includes(q) ||
            sub.genres.some((g) => g.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (statusFilter !== 'all' && sub.submissionStatus !== statusFilter) return false;
        return true;
      });
    }

    return novels.filter((novel) => {
      if (activeTab === 'originals' && !novel.isOriginal) return false;
      if (activeTab === 'novels' && novel.type !== 'novel') return false;
      if (activeTab === 'manga' && novel.type !== 'manga' && novel.type !== 'manhwa') return false;

      if (statusFilter !== 'all' && novel.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          novel.title.toLowerCase().includes(q) ||
          novel.author.toLowerCase().includes(q) ||
          novel.genres.some((g) => g.toLowerCase().includes(q)) ||
          novel.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [novels, allSubmissions, activeTab, statusFilter, searchQuery]);

  const openCreateSeries = (type: NovelContentType = 'novel', isOriginal = false) => {
    setEditingNovel(null);
    setSeriesForm({
      title: '',
      slug: '',
      author: isOriginal ? 'PRISM Editorial Studios' : 'Kenji Sato',
      authorRole: isOriginal ? 'Original Author & Showrunner' : 'Creator',
      type,
      isOriginal,
      editorialNote: isOriginal ? 'Featured PRISM Original serialization.' : '',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      bannerImage: '',
      shortDescription: '',
      description: '',
      genres: ['LitRPG & System'],
      tags: ['Original', 'Progression'],
      status: 'ongoing'
    });
    setGenresText('LitRPG & System, Fantasy');
    setTagsText('Original, Progression');
    setIsSeriesModalOpen(true);
  };

  const openEditSeries = (novel: NovelItem) => {
    setEditingNovel(novel);
    setSeriesForm({ ...novel });
    setGenresText((novel.genres || []).join(', '));
    setTagsText((novel.tags || []).join(', '));
    setIsSeriesModalOpen(true);
  };

  const handleSeriesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesForm.title?.trim()) {
      showToast('Please enter a series title', 'info');
      return;
    }

    const payload: Partial<NovelItem> = {
      ...seriesForm,
      title: seriesForm.title.trim(),
      slug: seriesForm.slug?.trim() || seriesForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      genres: genresText.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    };

    if (editingNovel) {
      adminUpdateNovel(editingNovel.id, payload);
      showToast(`Saved series: "${seriesForm.title}"`, 'success');
    } else {
      adminAddNovel(payload);
      showToast(`Created new series: "${seriesForm.title}"`, 'success');
    }
    setIsSeriesModalOpen(false);
  };

  const handleDeleteSeries = () => {
    if (confirmDeleteId) {
      adminDeleteNovel(confirmDeleteId);
      showToast('Series deleted', 'info');
      setConfirmDeleteId(null);
    }
  };

  // Chapter handlers
  const openChapterManager = (novel: NovelItem) => {
    setSelectedNovelForChapters(novel);
    setIsEditingChapter(null);
    setNewChapterForm({
      chapterNumber: (novel.chapters?.length || 0) + 1,
      title: `Chapter ${(novel.chapters?.length || 0) + 1}`,
      publishedAt: new Date().toISOString().split('T')[0],
      content: ''
    });
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNovelForChapters) return;

    if (!newChapterForm.title.trim() || !newChapterForm.content.trim()) {
      showToast('Please enter both chapter title and content text', 'info');
      return;
    }

    if (isEditingChapter) {
      adminUpdateChapter(selectedNovelForChapters.id, isEditingChapter.id, {
        title: newChapterForm.title.trim(),
        chapterNumber: Number(newChapterForm.chapterNumber),
        content: newChapterForm.content.trim(),
        publishedAt: newChapterForm.publishedAt,
        wordCount: newChapterForm.content.trim().split(/\s+/).length
      });
      showToast('Chapter updated', 'success');
      setIsEditingChapter(null);
    } else {
      adminAddChapter(selectedNovelForChapters.id, {
        chapterNumber: Number(newChapterForm.chapterNumber),
        title: newChapterForm.title.trim(),
        publishedAt: newChapterForm.publishedAt,
        content: newChapterForm.content.trim(),
        wordCount: newChapterForm.content.trim().split(/\s+/).length
      });
      showToast('New chapter added', 'success');
    }

    // Refresh selected novel
    const updated = novels.find((n) => n.id === selectedNovelForChapters.id);
    if (updated) {
      setSelectedNovelForChapters(updated);
      setNewChapterForm({
        chapterNumber: (updated.chapters?.length || 0) + 1,
        title: `Chapter ${(updated.chapters?.length || 0) + 1}`,
        publishedAt: new Date().toISOString().split('T')[0],
        content: ''
      });
    }
  };

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    if (!selectedNovelForChapters) return;
    const chaps = [...(selectedNovelForChapters.chapters || [])];
    const idx = chaps.findIndex((c) => c.id === chapterId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chaps.length) return;

    const temp = chaps[idx];
    chaps[idx] = chaps[targetIdx];
    chaps[targetIdx] = temp;

    const orderedIds = chaps.map((c) => c.id);
    adminReorderChapters(selectedNovelForChapters.id, orderedIds);

    const updated = novels.find((n) => n.id === selectedNovelForChapters.id);
    if (updated) setSelectedNovelForChapters(updated);
    showToast('Chapters reordered', 'info');
  };

  // Submissions Review Handlers
  const handleApproveSubmission = (id: string) => {
    adminApproveSubmission(id);
    showToast('Submission approved and published to the public catalog!', 'success');
  };

  const openActionModal = (id: string, type: 'reject' | 'request_changes') => {
    setActionSubmissionId(id);
    setActionType(type);
    setActionNotes(type === 'reject' ? 'Incomplete manuscript or does not meet publishing quality standards.' : 'Please format chapter headings and expand story overview.');
  };

  const executeSubmissionAction = () => {
    if (!actionSubmissionId) return;
    if (actionType === 'reject') {
      adminRejectSubmission(actionSubmissionId, actionNotes);
      showToast('Submission marked as rejected with feedback sent.', 'info');
    } else {
      adminRequestChangesSubmission(actionSubmissionId, actionNotes);
      showToast('Changes requested from author.', 'info');
    }
    setActionSubmissionId(null);
  };

  // Gemini AI Novel Assistant Handlers
  const openNovelAIAssistant = (preferredType: NovelAIGenerateType = 'idea', targetNovel?: NovelItem | null) => {
    const novel = targetNovel || selectedNovelForChapters || (novels.length > 0 ? novels[0] : null);
    if (novel) {
      setAiNovelTitle(novel.title);
      setAiGenre(novel.genres?.[0] || 'LitRPG & System');
      setAiSetting(novel.shortDescription || '');
      if (novel.chapters && novel.chapters.length > 0) {
        const lastChap = novel.chapters[novel.chapters.length - 1];
        setAiPreviousChapterContext(lastChap.content || '');
      } else {
        setAiPreviousChapterContext('');
      }
    } else if (seriesForm.title) {
      setAiNovelTitle(seriesForm.title);
      setAiGenre(genresText.split(',')[0]?.trim() || 'LitRPG & System');
      setAiSetting(seriesForm.shortDescription || '');
      setAiPreviousChapterContext('');
    } else {
      setAiNovelTitle('');
      setAiPreviousChapterContext('');
    }

    setAiType(preferredType);
    setAiError(null);
    setAiResultText('');
    setCopiedAI(false);
    setIsAIAssistantOpen(true);
  };

  const handleGenerateNovelAI = async () => {
    if (!aiNovelTitle.trim()) {
      showToast('Please enter a novel title.', 'error');
      return;
    }

    setIsAIGenerating(true);
    setAiError(null);

    try {
      const response = await requestNovelGeneration({
        type: aiType,
        novelTitle: aiNovelTitle,
        genre: aiGenre,
        characters: aiCharacters,
        setting: aiSetting,
        plotDirection: aiPlotDirection,
        writingStyle: aiWritingStyle,
        chapterLength: aiChapterLength,
        previousChapterContext: aiPreviousChapterContext,
        additionalPrompt: aiAdditionalPrompt
      });

      setAiResultText(response.result);
      showToast(`Generated ${aiType.replace('_', ' ')} with Gemini!`, 'success');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Generation failed. Please try again.');
      showToast(err.message || 'Novel generation failed', 'error');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const applyAIToChapterForm = () => {
    if (!aiResultText.trim()) return;
    setNewChapterForm(prev => ({
      ...prev,
      content: aiResultText.trim()
    }));
    setIsAIAssistantOpen(false);
    showToast('Applied generated content to chapter form!', 'success');
  };

  const applyAIToSeriesSynopsis = () => {
    if (!aiResultText.trim()) return;
    setSeriesForm(prev => ({
      ...prev,
      description: aiResultText.trim()
    }));
    setIsAIAssistantOpen(false);
    showToast('Applied generated content to series synopsis!', 'success');
  };

  const saveAIChapterAsDraft = () => {
    if (!selectedNovelForChapters) {
      showToast('Please open the Chapters modal of a novel to save chapters.', 'error');
      return;
    }
    if (!aiResultText.trim()) {
      showToast('Generated text is empty.', 'error');
      return;
    }

    const nextChapNum = (selectedNovelForChapters.chapters?.length || 0) + 1;
    adminAddChapter(selectedNovelForChapters.id, {
      chapterNumber: nextChapNum,
      title: `Chapter ${nextChapNum}`,
      publishedAt: new Date().toISOString().split('T')[0],
      content: aiResultText.trim(),
      wordCount: aiResultText.trim().split(/\s+/).length
    });

    const updated = novels.find(n => n.id === selectedNovelForChapters.id);
    if (updated) setSelectedNovelForChapters(updated);
    setIsAIAssistantOpen(false);
    showToast(`Chapter ${nextChapNum} saved as draft!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Web Novel & Manga Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage PRISM Originals, Web Novels, Manga/Manhwa series, chapters, user submissions moderation, and reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openNovelAIAssistant('idea')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Gemini Story Architect</span>
          </button>

          <button
            onClick={() => openCreateSeries('novel', true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>+ PRISM Original</span>
          </button>

          <button
            onClick={() => openCreateSeries('novel', false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Series</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Series</span>
          <div className="text-xl font-mono font-extrabold text-white mt-1">{novels.length}</div>
          <span className="text-[10px] text-zinc-500">Live in catalog</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-current" /> PRISM Originals
          </span>
          <div className="text-xl font-mono font-extrabold text-amber-300 mt-1">{originalsCount}</div>
          <span className="text-[10px] text-zinc-500">Platform owned</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Web Novels</span>
          <div className="text-xl font-mono font-extrabold text-indigo-300 mt-1">{webNovelsCount}</div>
          <span className="text-[10px] text-zinc-500">Serialized fiction</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Manga / Manhwa</span>
          <div className="text-xl font-mono font-extrabold text-cyan-300 mt-1">{mangaCount}</div>
          <span className="text-[10px] text-zinc-500">Visual comics</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Total Chapters</span>
          <div className="text-xl font-mono font-extrabold text-emerald-300 mt-1">{totalChaptersCount}</div>
          <span className="text-[10px] text-zinc-500">{totalReads} reads</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Submissions
          </span>
          <div className="text-xl font-mono font-extrabold text-rose-300 mt-1">{pendingSubmissionsCount}</div>
          <span className="text-[10px] text-zinc-500">Pending review</span>
        </div>
      </div>

      {/* Section Tab Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0e15] border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'all' ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Series ({novels.length})
            </button>
            <button
              onClick={() => setActiveTab('originals')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'originals'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3 h-3 fill-current" />
              <span>PRISM Originals ({originalsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('novels')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'novels' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-indigo-300'
              }`}
            >
              Web Novels ({webNovelsCount})
            </button>
            <button
              onClick={() => setActiveTab('manga')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'manga' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              Manga / Manhwa ({mangaCount})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Submissions Queue ({allSubmissions.length})</span>
              {pendingSubmissionsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Lifecycles</option>
              {activeTab === 'submissions' ? (
                <>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </>
              ) : (
                <>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search series by title, author, genres, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Series or Submissions List */}
      <div className="space-y-3">
        {displayedItems.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              activeTab === 'submissions'
                ? 'No pending submissions'
                : novels.length === 0
                ? 'No series published yet'
                : 'No items match current filter criteria'
            }
            description={
              activeTab === 'submissions'
                ? 'User submitted manuscripts and manga will appear here for editorial review and approval.'
                : novels.length === 0
                ? "Click '+ New Series' or '+ PRISM Original' above to create your first series."
                : 'Try clearing the search query or adjusting status filters.'
            }
            actionLabel={
              activeTab === 'submissions'
                ? undefined
                : novels.length === 0
                ? '+ New Series'
                : 'Reset Filters'
            }
            onAction={
              novels.length === 0
                ? () => openCreateSeries('novel', false)
                : () => {
                    setActiveTab('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }
            }
          />
        ) : (
          displayedItems.map((item) => {
            const isSubmissionTab = activeTab === 'submissions';
            const chaptersCount = item.chapters?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <SafeImage
                    src={item.coverImage}
                    alt={item.title}
                    fallbackType="novel"
                    fallbackTitle={item.title}
                    className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl object-cover shrink-0 bg-zinc-950 border border-zinc-800 shadow-md"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                          item.type === 'novel'
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                            : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                        }`}
                      >
                        {item.type}
                      </span>

                      {item.isOriginal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-950 text-amber-300 border border-amber-800/80 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-current" /> PRISM Original
                        </span>
                      )}

                      {isSubmissionTab ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            item.submissionStatus === 'pending_review'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : item.submissionStatus === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : item.submissionStatus === 'rejected'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          Submission: {item.submissionStatus.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                          {item.status}
                        </span>
                      )}

                      {item.featured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      )}

                      {(item.trendingScore || 0) >= 80 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" /> Trending
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white truncate flex items-center gap-2">
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-zinc-400">
                      Author: <span className="text-zinc-200 font-semibold">{item.author}</span>
                      {item.submittedBy && <span className="text-zinc-500 text-[11px] ml-2">(User: {item.submittedBy})</span>}
                    </p>

                    <p className="text-xs text-zinc-400 line-clamp-1">{item.shortDescription || item.description}</p>

                    {item.submissionNotes && (
                      <p className="text-xs text-amber-300/90 font-mono bg-amber-950/30 px-2 py-1 rounded border border-amber-800/40">
                        {item.submissionNotes}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                      <span className="text-indigo-300 font-mono font-bold">
                        {chaptersCount} Chapters
                      </span>
                      <span>•</span>
                      <span>{(item.views || 0).toLocaleString()} Views</span>
                      <span>•</span>
                      <span>{item.likes || 0} Likes</span>
                      <span>•</span>
                      <span>{item.saves || 0} Saves</span>
                      <span>•</span>
                      <span>Score: {item.trendingScore || 50}</span>
                      <span>•</span>
                      <span>Updated: {item.lastUpdatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                  {isSubmissionTab ? (
                    // Submission Workflow Actions
                    <>
                      {item.submissionStatus === 'pending_review' && (
                        <button
                          onClick={() => handleApproveSubmission(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        onClick={() => openActionModal(item.id, 'reject')}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-300 text-xs font-bold border border-zinc-700"
                      >
                        Reject...
                      </button>

                      <button
                        onClick={() => openActionModal(item.id, 'request_changes')}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-950/60 text-zinc-300 hover:text-amber-300 text-xs font-bold border border-zinc-700"
                      >
                        Request Changes...
                      </button>

                      <button
                        onClick={() => {
                          adminSuspendSubmission(item.id);
                          showToast('Submission suspended', 'info');
                        }}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 text-xs"
                        title="Suspend submission"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          adminDeleteSubmission(item.id);
                          showToast('Submission permanently removed', 'info');
                        }}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs"
                        title="Delete submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    // Catalog Novel Management Actions
                    <>
                      {/* Manage Chapters */}
                      <button
                        onClick={() => openChapterManager(item)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Chapters ({chaptersCount})</span>
                      </button>

                      {/* Comments Modal */}
                      <button
                        onClick={() => {
                          setSelectedNovelForComments(item);
                          setIsCommentsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs"
                        title="Manage Reader Comments & Reports"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Feature toggle */}
                      <button
                        onClick={() => {
                          adminToggleFeatureNovel(item.id);
                          showToast(item.featured ? 'Unfeatured series' : 'Featured series', 'info');
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          item.featured
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                        title="Toggle Feature"
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-current' : ''}`} />
                      </button>

                      {/* Trending toggle */}
                      <button
                        onClick={() => {
                          adminToggleTrendingNovel(item.id);
                          showToast('Trending status updated', 'info');
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          (item.trendingScore || 0) >= 80
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                        }`}
                        title="Toggle Trending"
                      >
                        <Flame className={`w-3.5 h-3.5 ${(item.trendingScore || 0) >= 80 ? 'fill-current' : ''}`} />
                      </button>

                      {/* Edit Series Details */}
                      <button
                        onClick={() => openEditSeries(item)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-all"
                        title="Delete series"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Series Add / Edit Modal */}
      {isSeriesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e15] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{editingNovel ? 'Edit Series Details' : 'Add New Series'}</span>
              </h2>
              <button
                onClick={() => setIsSeriesModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSeriesSubmit} className="space-y-4">
              {/* Type, PRISM Original, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Series Type</label>
                  <select
                    value={seriesForm.type || 'novel'}
                    onChange={(e) => setSeriesForm({ ...seriesForm, type: e.target.value as NovelContentType })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="novel">Web Novel (Text / Chapters)</option>
                    <option value="manga">Manga (Graphic)</option>
                    <option value="manhwa">Manhwa (Webtoon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Status</label>
                  <select
                    value={seriesForm.status || 'ongoing'}
                    onChange={(e) => setSeriesForm({ ...seriesForm, status: e.target.value as NovelStatus })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="hiatus">Hiatus</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
                    <input
                      type="checkbox"
                      checked={seriesForm.isOriginal || false}
                      onChange={(e) => setSeriesForm({ ...seriesForm, isOriginal: e.target.checked })}
                      className="rounded bg-zinc-900 border-zinc-700 text-amber-500"
                    />
                    <span>PRISM Original ✨</span>
                  </label>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={seriesForm.title || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                    placeholder="e.g. Omni-Sovereign: System Core"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Clean Slug URL</label>
                  <input
                    type="text"
                    value={seriesForm.slug || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Author Name</label>
                  <input
                    type="text"
                    value={seriesForm.author || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Author Role / Badge</label>
                  <input
                    type="text"
                    value={seriesForm.authorRole || ''}
                    onChange={(e) => setSeriesForm({ ...seriesForm, authorRole: e.target.value })}
                    placeholder="e.g. Lead Author, Resident Creator"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Cover & Banner Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadField
                  label="Series Cover Image"
                  value={seriesForm.coverImage || ''}
                  onChange={(val) => setSeriesForm({ ...seriesForm, coverImage: val })}
                  aspectRatio="portrait"
                  helperText="Upload novel cover illustration or enter an image URL."
                />
                <ImageUploadField
                  label="Banner Image (Optional)"
                  value={seriesForm.bannerImage || ''}
                  onChange={(val) => setSeriesForm({ ...seriesForm, bannerImage: val })}
                  aspectRatio="video"
                  helperText="Upload wide banner background or enter image URL."
                />
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Short Description</label>
                <input
                  type="text"
                  value={seriesForm.shortDescription || ''}
                  onChange={(e) => setSeriesForm({ ...seriesForm, shortDescription: e.target.value })}
                  placeholder="One sentence synopsis"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Full Story Description / Synopsis</label>
                <textarea
                  rows={4}
                  value={seriesForm.description || ''}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  placeholder="Story synopsis, world building details, system mechanics, etc."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Genres & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Genres (Comma-separated)</label>
                  <input
                    type="text"
                    value={genresText}
                    onChange={(e) => setGenresText(e.target.value)}
                    placeholder="LitRPG & System, Fantasy, Sci-Fi"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="Reincarnation, Magic, Tower"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Editorial Note */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Editorial Note (Optional)</label>
                <input
                  type="text"
                  value={seriesForm.editorialNote || ''}
                  onChange={(e) => setSeriesForm({ ...seriesForm, editorialNote: e.target.value })}
                  placeholder="e.g. Winner of the 2026 PRISM Sci-Fi Novel Prize"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSeriesModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNovel ? 'Save Series Changes' : 'Create Series'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapters Management Modal */}
      {isChapterModalOpen && selectedNovelForChapters && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e15] border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Manage Chapters: {selectedNovelForChapters.title}</span>
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedNovelForChapters.chapters?.length || 0} chapters published
                </span>
              </div>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add or Edit Chapter Form */}
            <form onSubmit={handleSaveChapter} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  {isEditingChapter ? `Edit Chapter #${isEditingChapter.chapterNumber}` : '+ Add Next Chapter'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNovelAIAssistant('chapter', selectedNovelForChapters)}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 text-[11px] font-bold border border-purple-800 flex items-center gap-1 transition-all"
                    title="Write a new chapter using Gemini 3.8 Flash"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Draft Chapter with Gemini</span>
                  </button>
                  {selectedNovelForChapters.chapters && selectedNovelForChapters.chapters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openNovelAIAssistant('chapter_continuation', selectedNovelForChapters)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-800 flex items-center gap-1 transition-all"
                      title="Continue writing seamlessly from the previous chapter"
                    >
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                      <span>Continue Previous Chapter</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Chapter #</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newChapterForm.chapterNumber}
                    onChange={(e) => setNewChapterForm({ ...newChapterForm, chapterNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    value={newChapterForm.title}
                    onChange={(e) => setNewChapterForm({ ...newChapterForm, title: e.target.value })}
                    placeholder="e.g. Chapter 6: The Nexus Awakening"
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Story Content / Markdown *</label>
                <textarea
                  rows={6}
                  required
                  value={newChapterForm.content}
                  onChange={(e) => setNewChapterForm({ ...newChapterForm, content: e.target.value })}
                  placeholder="Write or paste the chapter paragraphs here..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {isEditingChapter && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingChapter(null);
                      setNewChapterForm({
                        chapterNumber: (selectedNovelForChapters.chapters?.length || 0) + 1,
                        title: `Chapter ${(selectedNovelForChapters.chapters?.length || 0) + 1}`,
                        publishedAt: new Date().toISOString().split('T')[0],
                        content: ''
                      });
                    }}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditingChapter ? 'Save Chapter' : 'Add Chapter'}</span>
                </button>
              </div>
            </form>

            {/* Chapters Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Existing Chapters ({selectedNovelForChapters.chapters?.length || 0})
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedNovelForChapters.chapters || []).map((chap, idx) => (
                  <div
                    key={chap.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-zinc-800 text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0">
                        {chap.chapterNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white truncate">{chap.title}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {chap.wordCount || 1000} words • {chap.views} reads • {chap.likes} likes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMoveChapter(chap.id, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMoveChapter(chap.id, 'down')}
                        disabled={idx === (selectedNovelForChapters.chapters?.length || 0) - 1}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setIsEditingChapter(chap);
                          setNewChapterForm({
                            chapterNumber: chap.chapterNumber,
                            title: chap.title,
                            publishedAt: chap.publishedAt,
                            content: chap.content
                          });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-indigo-400"
                        title="Edit Chapter"
                      >
                        <Edit className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          adminDeleteChapter(selectedNovelForChapters.id, chap.id);
                          showToast(`Deleted chapter ${chap.chapterNumber}`, 'info');
                          const updated = novels.find((n) => n.id === selectedNovelForChapters.id);
                          if (updated) setSelectedNovelForChapters(updated);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Comments & Reports Modal */}
      {isCommentsModalOpen && selectedNovelForComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e15] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Comments & Reports: {selectedNovelForComments.title}</span>
              </h3>
              <button
                onClick={() => setIsCommentsModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {getNovelComments(selectedNovelForComments.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">No reader comments yet for this novel.</div>
              ) : (
                getNovelComments(selectedNovelForComments.id).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{c.authorName}</span>
                      <span className="text-[10px] text-zinc-400">{c.createdAt}</span>
                    </div>
                    <p className="text-zinc-300">{c.content}</p>
                    {c.isReported && (
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300">
                        Reported Reason: {c.reportReason || 'Flagged by readers'}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/60">
                      {c.isReported && (
                        <button
                          onClick={() => {
                            adminDismissCommentReport(selectedNovelForComments.id, c.id);
                            showToast('Report dismissed', 'info');
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                        >
                          Dismiss Report
                        </button>
                      )}
                      <button
                        onClick={() => {
                          adminDeleteComment(selectedNovelForComments.id, c.id);
                          showToast('Comment removed', 'info');
                        }}
                        className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submission Reject / Request Changes Feedback Modal */}
      {actionSubmissionId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{actionType === 'reject' ? 'Reject Submission' : 'Request Changes'}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Provide editorial feedback to the author explaining what needs to be changed or why the title was rejected.
            </p>
            <textarea
              rows={4}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionSubmissionId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={executeSubmissionAction}
                className={`px-5 py-2 rounded-xl font-bold text-xs ${
                  actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                }`}
              >
                Confirm {actionType === 'reject' ? 'Rejection' : 'Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Story & Chapter Assistant Modal */}
      {isAIAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e15] border border-purple-800/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500 text-zinc-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    GEMINI NOVEL ARCHITECT
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Model: gemini-3.8-flash
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  Web Novel & Serialized Fiction Assistant
                </h2>
              </div>
              <button
                onClick={() => setIsAIAssistantOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
                <span><strong>Generation Error:</strong> {aiError}</span>
                <button onClick={() => setAiError(null)} className="text-rose-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Generator Mode Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'idea', label: 'Story Ideas', desc: '3 high-stakes hooks' },
                { id: 'character', label: 'Characters', desc: 'Dossiers & dynamics' },
                { id: 'story_outline', label: 'Story Outline', desc: 'Multi-arc blueprint' },
                { id: 'chapter_outline', label: 'Chapter Outline', desc: 'Pacing & beats' },
                { id: 'chapter', label: 'Full Chapter', desc: 'Complete prose scene' },
                { id: 'chapter_continuation', label: 'Continuation', desc: 'Seamless continuation' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAiType(tab.id as NovelAIGenerateType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    aiType === tab.id
                      ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/50 ring-1 ring-purple-500'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{tab.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{tab.desc}</div>
                </button>
              ))}
            </div>

            {/* Input Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Novel Title *</label>
                  <input
                    type="text"
                    value={aiNovelTitle}
                    onChange={(e) => setAiNovelTitle(e.target.value)}
                    placeholder="e.g. Sovereign of the Broken Core"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Genre *</label>
                  <input
                    type="text"
                    value={aiGenre}
                    onChange={(e) => setAiGenre(e.target.value)}
                    placeholder="LitRPG, Cultivation, Dark Fantasy, Cyberpunk..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Characters</label>
                  <input
                    type="text"
                    value={aiCharacters}
                    onChange={(e) => setAiCharacters(e.target.value)}
                    placeholder="Protagonist, rival, companion..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Setting / World-Building</label>
                  <input
                    type="text"
                    value={aiSetting}
                    onChange={(e) => setAiSetting(e.target.value)}
                    placeholder="Shattered floating islands, system dungeon..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Writing Style</label>
                  <input
                    type="text"
                    value={aiWritingStyle}
                    onChange={(e) => setAiWritingStyle(e.target.value)}
                    placeholder="Cinematic, visceral, poetic..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Plot Direction / Key Tension Beat</label>
                  <input
                    type="text"
                    value={aiPlotDirection}
                    onChange={(e) => setAiPlotDirection(e.target.value)}
                    placeholder="A trap springs during the dungeon raid..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Target Chapter Length</label>
                  <select
                    value={aiChapterLength}
                    onChange={(e) => setAiChapterLength(e.target.value as 'short' | 'medium' | 'long')}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="short">Short Scene (~800 - 1,200 words)</option>
                    <option value="medium">Standard Chapter (~1,500 - 2,500 words)</option>
                    <option value="long">Epic Extended Chapter (~3,000 - 4,500 words)</option>
                  </select>
                </div>
              </div>

              {/* Previous Chapter Context Box (For strict continuity) */}
              {(aiType === 'chapter' || aiType === 'chapter_continuation') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-300">
                      Previous Chapter Context (for Strict Continuity)
                    </label>
                    {selectedNovelForChapters?.chapters && selectedNovelForChapters.chapters.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const chaps = selectedNovelForChapters.chapters || [];
                          const lastChap = chaps[chaps.length - 1];
                          setAiPreviousChapterContext(lastChap?.content || '');
                          showToast(`Loaded Chapter #${lastChap.chapterNumber} text for continuity`, 'info');
                        }}
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Load Last Chapter Context
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={aiPreviousChapterContext}
                    onChange={(e) => setAiPreviousChapterContext(e.target.value)}
                    placeholder="Paste the ending paragraphs of the previous chapter here. Gemini will continue the story seamlessly without inventing previous events."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                  />
                </div>
              )}

              {/* Additional Instructions */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Additional Author Notes</label>
                <input
                  type="text"
                  value={aiAdditionalPrompt}
                  onChange={(e) => setAiAdditionalPrompt(e.target.value)}
                  placeholder="e.g. End on a massive cliffhanger, include system notification status screen, emphasize cold wind..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generate Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400">
                  Powered by Gemini 3.8 Flash • Drafts remain unpublished until approved
                </span>

                <button
                  type="button"
                  disabled={isAIGenerating || !aiNovelTitle.trim()}
                  onClick={handleGenerateNovelAI}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    isAIGenerating || !aiNovelTitle.trim()
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-95'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 fill-current ${isAIGenerating ? 'animate-spin' : ''}`} />
                  <span>{isAIGenerating ? 'Writing with Gemini 3.8...' : `Generate ${aiType.replace('_', ' ')}`}</span>
                </button>
              </div>
            </div>

            {/* Generated Output Area */}
            {aiResultText && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Generated Content Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span>{aiResultText.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                <textarea
                  rows={12}
                  value={aiResultText}
                  onChange={(e) => setAiResultText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-serif leading-relaxed focus:outline-none focus:border-purple-500 shadow-inner"
                />

                {/* Actions on Generated Output */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResultText);
                      setCopiedAI(true);
                      showToast('Copied text to clipboard', 'success');
                      setTimeout(() => setCopiedAI(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedAI ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAI ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={applyAIToSeriesSynopsis}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                    >
                      Insert into Synopsis
                    </button>

                    <button
                      type="button"
                      onClick={applyAIToChapterForm}
                      className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Insert into Chapter Form</span>
                    </button>

                    {selectedNovelForChapters && (
                      <button
                        type="button"
                        onClick={saveAIChapterAsDraft}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save as Draft Chapter</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
              <h3 className="text-base font-bold text-white">Delete Entire Series?</h3>
              <p className="text-xs text-zinc-400">
                This will delete the novel and all its chapters from PRISM. Readers will no longer have access. This action cannot be undone.
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
                onClick={handleDeleteSeries}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Yes, Delete Series
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
