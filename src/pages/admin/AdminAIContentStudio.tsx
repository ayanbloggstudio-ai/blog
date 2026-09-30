import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  Send,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Share2,
  ExternalLink,
  BookOpen,
  Cpu,
  Film,
  Star,
  Scale,
  ListOrdered,
  Feather,
  Plus,
  Trash2,
  Info,
  Calendar,
  Layers,
  Search,
  MessageSquare,
  Twitter,
  Linkedin,
  Mail,
  Zap,
  Tag,
  Wand2,
  Maximize2,
  Minimize2,
  CheckCheck,
  Save,
  Clock,
  Archive,
  Radio,
  X,
  ExternalLink as LinkIcon
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import {
  AIStudioContentType,
  AIStudioFormState,
  AIGeneratedContentResult,
  HumanEditedContentState,
  AIStudioWorkflowStage,
  AISpecItem,
  AIRefineAction,
  DesiredContentLength,
  GeminiStatusInfo
} from '../../types/aiStudio';
import {
  requestAIGeneration,
  requestTextRefinement,
  checkGeminiStatus
} from '../../services/aiContentStudioService';
import { CMSContentItem } from '../../types/cms';
import { EmptyState } from '../../components/EmptyState';

// All 8 Required Content Types + Specialized Visual Curations
const CONTENT_TYPE_OPTIONS: {
  id: AIStudioContentType;
  label: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  {
    id: 'blog-article',
    label: 'Blog Article',
    desc: 'Engaging storytelling, actionable hooks, and clear conclusions',
    icon: FileText,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'tech-article',
    label: 'Tech Article',
    desc: 'Deep architecture, benchmarks, trade-offs, and engineering rigor',
    icon: Cpu,
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'ai-tool',
    label: 'AI Tool',
    desc: 'Models, productivity engines, agents, and generative workflows',
    icon: Sparkles,
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'product-description',
    label: 'Product Description',
    desc: 'Feature breakdowns, ergonomics, specs, and practical buyer verdict',
    icon: Tag,
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'movie-review',
    label: 'Movie & TV Review',
    desc: 'Cinematography, narrative pacing, direction, and spoiler-free verdict',
    icon: Film,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'anime-manga',
    label: 'Anime & Manga Article',
    desc: 'Sakuga animation, panel gutters, visual arcs, and character progression',
    icon: Zap,
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
  },
  {
    id: 'novel-outline',
    label: 'Web Novel Outline',
    desc: 'Multi-volume story progression, magic/tech system, and plot turns',
    icon: BookOpen,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'novel-chapter',
    label: 'Web Novel Chapter',
    desc: 'Full immersive prose chapter with dialogue, action, and cliffhanger',
    icon: Feather,
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  },
  {
    id: 'top-10',
    label: 'Top 10 / 20',
    desc: 'Ranked listicle with structured evaluation criteria',
    icon: ListOrdered,
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  },
  {
    id: 'comparison',
    label: 'Comparison',
    desc: 'Side-by-side technical and workflow evaluation matrix',
    icon: Scale,
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    desc: 'Curator spotlight on why you should experience this now',
    icon: Star,
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  }
];

export const AdminAIContentStudio: React.FC = () => {
  const {
    items,
    categories,
    createContent,
    updateContent,
    deleteContent,
    changeStatus,
    setAdminActiveTab,
    aiStudioPrefill,
    setAiStudioPrefill
  } = useCMS();
  const { showToast } = useDiscovery();

  // Gemini API Configuration Status
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatusInfo | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);

  // Active Main View (Generator Studio vs Saved Drafts Manager)
  const [activeStudioTab, setActiveStudioTab] = useState<'create' | 'saved_drafts'>('create');
  const [draftSearchQuery, setDraftSearchQuery] = useState<string>('');
  const [draftFilterStatus, setDraftFilterStatus] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');

  // Currently editing database item id (null if fresh generation)
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

  // Workflow Stage State
  const [stage, setStage] = useState<AIStudioWorkflowStage>('configure');

  // Input Form State
  const [formState, setFormState] = useState<AIStudioFormState>({
    topic: '',
    title: '',
    category: 'AI & Tools',
    contentType: 'blog-article',
    targetAudience: 'Developers, tech innovators, and visual media enthusiasts',
    desiredLength: 'medium',
    sourceReferenceInfo: '',
    additionalInstructions: '',
    tone: 'Editorial, sharp, well-structured, authoritative and engaging',
    focusAngle: 'In-depth, analytical, and practical'
  });

  // Handle incoming Trend Radar prefill
  useEffect(() => {
    if (aiStudioPrefill) {
      setFormState({
        topic: aiStudioPrefill.topic,
        title: '',
        category: aiStudioPrefill.category || 'AI & Tools',
        contentType: (aiStudioPrefill.contentType as any) || 'blog-article',
        targetAudience: aiStudioPrefill.targetAudience || 'Developers, tech innovators, and visual media enthusiasts',
        desiredLength: 'medium',
        sourceReferenceInfo: aiStudioPrefill.sourceReferenceInfo || '',
        additionalInstructions: '',
        tone: aiStudioPrefill.tone || 'Editorial, sharp, well-structured, authoritative and engaging',
        focusAngle: aiStudioPrefill.focusAngle || 'In-depth, analytical, and practical'
      });
      setStage('configure');
      setActiveStudioTab('create');
      showToast(`Loaded trend from Radar: "${aiStudioPrefill.topic}"`, 'info');
      setAiStudioPrefill(null);
    }
  }, [aiStudioPrefill, setAiStudioPrefill, showToast]);

  // Fetch Gemini API status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const status = await checkGeminiStatus();
        if (isMounted) setGeminiStatus(status);
      } catch (err: any) {
        if (isMounted) {
          setGeminiStatus({
            isConfigured: false,
            model: 'gemini-3.8-flash',
            error: err.message || 'Could not verify Gemini status'
          });
        }
      } finally {
        if (isMounted) setIsCheckingStatus(false);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Generation & Error States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [rawAiResult, setRawAiResult] = useState<AIGeneratedContentResult | null>(null);

  // Refinement Action in Progress
  const [activeRefineAction, setActiveRefineAction] = useState<AIRefineAction | null>(null);
  const [customRefineInstruction, setCustomRefineInstruction] = useState<string>('');
  const [showCustomPromptModal, setShowCustomPromptModal] = useState<boolean>(false);

  // Fact-Check Sign-offs State
  const [resolvedFactChecks, setResolvedFactChecks] = useState<Record<string, boolean>>({});
  const [humanFactCheckSignoff, setHumanFactCheckSignoff] = useState<boolean>(false);

  // Human Edited Content State
  const [editedState, setEditedState] = useState<HumanEditedContentState>({
    selectedHeadline: '',
    tagline: '',
    shortSummary: '',
    whatItIs: '',
    whyItMatters: '',
    keyPoints: [],
    keyHighlights: [],
    firstDraft: '',
    seoTitle: '',
    metaDescription: '',
    slug: '',
    tags: [],
    pros: [],
    considerations: [],
    specs: [],
    officialUrl: '',
    authorName: 'PRISM Editorial Staff',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    aspectRatio: 'video'
  });

  // Copied state tracker for clipboard actions
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSocialTab, setSelectedSocialTab] = useState<'twitter' | 'linkedin' | 'reddit' | 'newsletter'>('twitter');

  // Helper to copy text to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Execute AI Generation
  const handleGenerate = async () => {
    if (!formState.topic.trim()) {
      showToast('Please enter a topic to generate content.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setStage('generating');

    try {
      const result = await requestAIGeneration(formState);
      setRawAiResult(result);
      setLoadedDraftId(null); // Fresh generation

      // Pre-fill human editable state
      const topHeadline = formState.title?.trim() || result.headlines?.[0]?.text || formState.topic;
      const cleanSlug = result.seo?.slugSuggestion || formState.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Pick contextual cover image based on category
      let defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80';
      if (formState.category.includes('Tech')) {
        defaultCover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80';
      } else if (formState.category.includes('Movies')) {
        defaultCover = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80';
      } else if (formState.category.includes('Anime') || formState.category.includes('Manhwa')) {
        defaultCover = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=80';
      }

      setEditedState({
        selectedHeadline: topHeadline,
        tagline: result.shortSummary?.split('.')[0] || result.quickTake?.whatItIs || formState.topic,
        shortSummary: result.shortSummary || '',
        whatItIs: result.quickTake?.whatItIs || '',
        whyItMatters: result.quickTake?.whyItMatters || '',
        keyPoints: result.quickTake?.keyPoints || [],
        keyHighlights: result.quickTake?.keyHighlights || [],
        firstDraft: result.firstDraft || '',
        seoTitle: result.seo?.title || `${topHeadline} | PRISM`,
        metaDescription: result.seo?.metaDescription || result.shortSummary || '',
        slug: cleanSlug,
        tags: result.suggestedTags || [formState.category, formState.contentType],
        pros: result.pros || [],
        considerations: result.considerations || [],
        specs: result.suggestedSpecs || [],
        officialUrl: '',
        authorName: 'PRISM Editorial Staff',
        coverImage: defaultCover,
        aspectRatio: formState.contentType.includes('movie') || formState.contentType.includes('anime') ? 'video' : 'video'
      });

      // Fact checks
      const initialFlags: Record<string, boolean> = {};
      (result.factCheckFlags || []).forEach((f, idx) => {
        initialFlags[`flag-${idx}`] = f.status === 'grounded_in_source';
      });
      setResolvedFactChecks(initialFlags);
      setHumanFactCheckSignoff(false);

      setStage('fact_check');
      showToast('AI draft generated with Gemini! Please review fact-checking guardrails.', 'success');
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Failed to generate AI content. Please verify API configuration.');
      setStage('configure');
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Perform Refinement Action (Continue, Improve, Expand, Shorten, Fix Grammar, Regenerate)
  const handleRefineAction = async (action: AIRefineAction, customInstructions?: string) => {
    if (!editedState.firstDraft.trim()) {
      showToast('There is no draft content to refine.', 'error');
      return;
    }

    setActiveRefineAction(action);
    try {
      const response = await requestTextRefinement({
        action,
        text: editedState.firstDraft,
        topic: formState.topic || editedState.selectedHeadline,
        context: `${editedState.whatItIs}\n${editedState.whyItMatters}`,
        instructions: customInstructions || ''
      });

      if (action === 'continue') {
        setEditedState((prev) => ({
          ...prev,
          firstDraft: `${prev.firstDraft.trim()}\n\n${response.resultText}`
        }));
        showToast('Successfully continued writing with Gemini!', 'success');
      } else {
        setEditedState((prev) => ({
          ...prev,
          firstDraft: response.resultText
        }));
        showToast(`Draft successfully updated: ${action.replace('_', ' ')}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || `Failed to execute ${action}`, 'error');
    } finally {
      setActiveRefineAction(null);
      setShowCustomPromptModal(false);
    }
  };

  // Fact check toggle
  const toggleFactCheck = (key: string) => {
    setResolvedFactChecks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resolveAllFactChecks = () => {
    if (!rawAiResult) return;
    const allResolved: Record<string, boolean> = {};
    (rawAiResult.factCheckFlags || []).forEach((_, idx) => {
      allResolved[`flag-${idx}`] = true;
    });
    setResolvedFactChecks(allResolved);
    showToast('Marked all fact-check points as verified against primary sources.', 'info');
  };

  // Insert Internal Link into Markdown Draft
  const insertInternalLink = (anchor: string, destination: string) => {
    const markdownLink = `[${anchor}](${destination})`;
    setEditedState((prev) => ({
      ...prev,
      firstDraft: `${prev.firstDraft}\n\n*Related Reference: ${markdownLink}*`
    }));
    showToast(`Inserted reference link to ${anchor}`, 'success');
  };

  // Publish / Save Draft to CMS
  const handleSaveToCMS = (status: 'draft' | 'scheduled' | 'published') => {
    if (status === 'published' && !humanFactCheckSignoff) {
      showToast('Human editorial fact-check confirmation is required before publishing live.', 'error');
      return;
    }

    if (!editedState.selectedHeadline.trim()) {
      showToast('Headline cannot be empty.', 'error');
      return;
    }

    const payload: Partial<CMSContentItem> = {
      title: editedState.selectedHeadline,
      slug: editedState.slug || editedState.selectedHeadline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: formState.category,
      contentType: (formState.contentType === 'short-story' || formState.contentType === 'top-10' || formState.contentType === 'top-20' || formState.contentType === 'recommendation' || formState.contentType === 'comparison' ? 'article' : formState.contentType) as any,
      status: status,
      tagline: editedState.tagline || editedState.whatItIs.slice(0, 120),
      summary: editedState.shortSummary,
      mainContent: editedState.firstDraft,
      whatItIs: editedState.whatItIs,
      whyItMatters: editedState.whyItMatters,
      keyPoints: editedState.keyPoints,
      keyHighlights: editedState.keyHighlights,
      pros: editedState.pros,
      considerations: editedState.considerations,
      coverImage: editedState.coverImage,
      galleryImages: [editedState.coverImage],
      aspectRatio: editedState.aspectRatio,
      tags: editedState.tags,
      authorName: editedState.authorName,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authorRole: 'Editorial Specialist',
      scanTime: '45s scan',
      readTime: `${Math.max(2, Math.ceil(editedState.firstDraft.split(/\s+/).filter(Boolean).length / 200))} min read`,
      officialUrl: editedState.officialUrl || '',
      externalUrl: editedState.officialUrl || '',
      affiliateUrl: '',
      seoTitle: editedState.seoTitle,
      metaDescription: editedState.metaDescription,
      specs: editedState.specs,
      featured: status === 'published',
      heatScore: 92
    };

    if (loadedDraftId) {
      const res = updateContent(loadedDraftId, payload);
      if (res.success) {
        showToast(
          status === 'published'
            ? 'Article published live to PRISM!'
            : `Draft successfully updated in database!`,
          'success'
        );
        if (status === 'published') setStage('approved');
      } else {
        showToast(res.error || 'Failed to update draft', 'error');
      }
    } else {
      const res = createContent(payload);
      if (res.success) {
        setLoadedDraftId(res.id);
        showToast(
          status === 'published'
            ? 'Article published live to PRISM!'
            : `Saved new draft to database (ID: ${res.id})`,
          'success'
        );
        if (status === 'published') setStage('approved');
      } else {
        showToast(res.error || 'Failed to save draft', 'error');
      }
    }
  };

  // Load existing article / draft into the editor
  const loadItemIntoEditor = (item: CMSContentItem) => {
    setLoadedDraftId(item.id);
    setFormState((prev) => ({
      ...prev,
      topic: item.title,
      category: item.category,
      contentType: (item.contentType as any) || 'blog-article',
      targetAudience: item.whoItsFor || prev.targetAudience
    }));

    setEditedState({
      selectedHeadline: item.title,
      tagline: item.tagline || '',
      shortSummary: item.summary || '',
      whatItIs: item.whatItIs || '',
      whyItMatters: item.whyItMatters || '',
      keyPoints: item.keyPoints || [],
      keyHighlights: item.keyHighlights || [],
      firstDraft: item.mainContent || '',
      seoTitle: item.seoTitle || item.title,
      metaDescription: item.metaDescription || item.summary || '',
      slug: item.slug || '',
      tags: item.tags || [],
      pros: item.pros || [],
      considerations: item.considerations || [],
      specs: item.specs || [],
      officialUrl: item.officialUrl || '',
      authorName: item.authorName || 'PRISM Editorial Staff',
      coverImage: item.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
      aspectRatio: (item.aspectRatio as any) || 'video'
    });

    setHumanFactCheckSignoff(item.status === 'published');
    setRawAiResult({
      headlines: [{ id: '1', text: item.title, angle: 'Current Title', charCount: item.title.length }],
      shortSummary: item.summary || '',
      quickTake: {
        whatItIs: item.whatItIs || '',
        whyItMatters: item.whyItMatters || '',
        keyPoints: item.keyPoints || []
      },
      articleOutline: [],
      firstDraft: item.mainContent || '',
      seo: {
        title: item.seoTitle || item.title,
        metaDescription: item.metaDescription || item.summary || '',
        slugSuggestion: item.slug || '',
        primaryKeywords: item.tags || []
      },
      relatedContentIdeas: [],
      internalLinkSuggestions: [],
      socialCaptions: {
        twitterThreadStarter: item.summary || item.title,
        linkedInPost: item.summary || item.title,
        redditDiscussionStarter: item.summary || item.title,
        newsletterBlurb: item.summary || item.title
      },
      factCheckFlags: [],
      suggestedTags: item.tags || []
    });

    setStage('editing');
    setActiveStudioTab('create');
    showToast(`Loaded article: "${item.title}" into editor`, 'info');
  };

  // Filtered Saved Articles
  const filteredDrafts = (items || []).filter((it) => {
    if (!it) return false;
    if (draftFilterStatus !== 'all' && it.status !== draftFilterStatus) return false;
    if (draftSearchQuery.trim()) {
      const q = draftSearchQuery.toLowerCase();
      const match =
        it.title?.toLowerCase().includes(q) ||
        it.category?.toLowerCase().includes(q) ||
        it.summary?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/90 to-emerald-950/30 border border-cyan-800/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-cyan-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              AI CONTENT STUDIO
            </span>

            {/* Gemini Live API Status Indicator */}
            {isCheckingStatus ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-400 text-[11px] font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Checking Gemini API...
              </span>
            ) : geminiStatus?.isConfigured ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/90 text-emerald-300 text-[11px] font-mono border border-emerald-800/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8 Flash • API Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-950/90 text-rose-300 text-[11px] font-mono border border-rose-800/80 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                API Key Missing / Error
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-[11px] font-medium border border-zinc-700/80">
              Human-in-the-Loop Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dynamic Editorial & Content Generation Suite
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Generate authentic editorial articles, tech deep dives, AI tool breakdowns, cinema critiques, anime analyses, and serialized fiction. Every piece is drafted by Gemini AI and requires human review before live publication.
          </p>

          {/* Tab Switcher: Generator vs Saved Drafts */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setActiveStudioTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeStudioTab === 'create'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Writing & Refinement Studio</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('saved_drafts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeStudioTab === 'saved_drafts'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Saved Database Articles & Drafts ({items?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Workflow Progress Bar (When in Create Studio) */}
        {activeStudioTab === 'create' && (
          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'configure', label: '1. Topic & Parameters', icon: Sliders },
              { id: 'generating', label: '2. Gemini 3.8 Drafting', icon: Sparkles },
              { id: 'fact_check', label: '3. Fact-Check Guardrails', icon: ShieldAlert },
              { id: 'editing', label: '4. Human Editing Suite', icon: FileText },
              { id: 'preview', label: '5. Platform Preview', icon: Eye },
              { id: 'approved', label: '6. Saved to CMS', icon: CheckCircle2 }
            ].map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = stage === step.id;
              const isPast =
                (stage === 'generating' && idx === 0) ||
                (stage === 'fact_check' && idx <= 1) ||
                (stage === 'editing' && idx <= 2) ||
                (stage === 'preview' && idx <= 3) ||
                (stage === 'approved' && idx <= 4);

              return (
                <button
                  key={step.id}
                  disabled={!rawAiResult && idx > 0}
                  onClick={() => {
                    if (rawAiResult) {
                      setStage(step.id as AIStudioWorkflowStage);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    isCurrent
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : isPast
                      ? 'bg-zinc-900 text-emerald-400 border-emerald-800/60 hover:border-emerald-500'
                      : 'bg-zinc-950/60 text-zinc-500 border-zinc-800/60 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Global API Configuration Error Banner if missing key */}
      {!isCheckingStatus && geminiStatus && !geminiStatus.isConfigured && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/70 text-rose-200 text-xs flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-100">Gemini AI Configuration Required</h4>
            <p className="text-zinc-300">
              The backend could not locate a valid <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> environment variable. Ensure your API key is configured in the environment settings to generate content with Gemini 3.8 Flash.
            </p>
          </div>
        </div>
      )}

      {/* Error state if generation or refinement failed */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>Generation Error:</strong> {generationError}</span>
          </div>
          <button
            onClick={() => setGenerationError(null)}
            className="p-1 rounded-lg hover:bg-rose-900/50 text-rose-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAVED DATABASE ARTICLES & DRAFTS TAB */}
      {/* ========================================================================= */}
      {activeStudioTab === 'saved_drafts' && (
        <div className="space-y-6">
          
          {/* Controls & Filter Bar */}
          <div className="p-5 rounded-3xl bg-[#0b0e14] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search saved articles, categories..."
                  value={draftSearchQuery}
                  onChange={(e) => setDraftSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                {(['all', 'draft', 'published', 'scheduled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDraftFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      draftFilterStatus === st
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveStudioTab('create');
                setStage('configure');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Draft New Article with Gemini</span>
            </button>
          </div>

          {/* Drafts List or Empty State */}
          {filteredDrafts.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={
                items?.length === 0
                  ? 'No articles or drafts in database'
                  : 'No articles match your filter criteria'
              }
              description={
                items?.length === 0
                  ? 'Use the AI Writing Studio above to generate content with Gemini and save drafts to the database.'
                  : 'Try clearing your search query or switching status filters.'
              }
              actionLabel={items?.length === 0 ? 'Open AI Writing Studio' : 'Reset Filters'}
              onAction={
                items?.length === 0
                  ? () => {
                      setActiveStudioTab('create');
                      setStage('configure');
                    }
                  : () => {
                      setDraftSearchQuery('');
                      setDraftFilterStatus('all');
                    }
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrafts.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-[#0b0e14] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4 shadow-xl group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {item.category}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                          item.status === 'published'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : item.status === 'scheduled'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.summary || item.tagline || 'No summary available.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono pt-1">
                      <span>{item.readTime || '3 min read'}</span>
                      <span>•</span>
                      <span>{item.publishedAt || item.updatedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => loadItemIntoEditor(item)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-800 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open in Studio</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {item.status === 'published' ? (
                        <button
                          onClick={() => {
                            changeStatus(item.id, 'draft');
                            showToast(`Unpublished "${item.title}" to draft.`, 'info');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
                          title="Unpublish article to draft"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            changeStatus(item.id, 'published');
                            showToast(`Published "${item.title}" live!`, 'success');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800"
                          title="Publish article live"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            deleteContent(item.id);
                            showToast('Article deleted from database', 'info');
                          }
                        }}
                        className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 1: CONFIGURE TOPIC & INPUTS */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'configure' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-6 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Dynamic Generation Parameters</h2>
              </div>
              <span className="text-xs text-zinc-400">All fields directly configure the Gemini 3.8 prompt</span>
            </div>

            {/* Topic & Custom Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Topic / Subject Matter <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formState.topic}
                  onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                  placeholder="e.g. Claude 3.7 Sonnet Hybrid Reasoning vs DeepSeek R1"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Specific Title (Optional)
                </label>
                <input
                  type="text"
                  value={formState.title || ''}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="Leave blank for Gemini to craft headline ideas"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Category, Desired Length & Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Category / Genre <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="Web Novels & Fiction">Web Novels & Fiction</option>
                  <option value="Technology & Hardware">Technology & Hardware</option>
                  <option value="AI & Productivity">AI & Productivity</option>
                </select>
              </div>

              {/* Desired Length */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Desired Content Length
                </label>
                <select
                  value={formState.desiredLength}
                  onChange={(e) => setFormState({ ...formState, desiredLength: e.target.value as DesiredContentLength })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="short">Short (~500 - 800 words)</option>
                  <option value="medium">Medium (~1,200 - 1,800 words)</option>
                  <option value="long">Long (~2,500 - 3,500 words)</option>
                  <option value="comprehensive">Comprehensive Deep Dive (~4,000+ words)</option>
                </select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formState.targetAudience}
                  onChange={(e) => setFormState({ ...formState, targetAudience: e.target.value })}
                  placeholder="e.g. Senior engineers, Cinephiles"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Content Type Grid (All 8 Required Archetypes + Specialized Visuals) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Content Archetype / Format <span className="text-rose-400">*</span></span>
                <span className="text-[11px] text-cyan-400 font-normal">Select 1 archetype</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {CONTENT_TYPE_OPTIONS.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formState.contentType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormState({ ...formState, contentType: type.id })}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate text-white">{type.label}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1">{type.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone & Focus Angle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Writing Style & Tone
                </label>
                <input
                  type="text"
                  value={formState.tone}
                  onChange={(e) => setFormState({ ...formState, tone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Focus Angle
                </label>
                <input
                  type="text"
                  value={formState.focusAngle}
                  onChange={(e) => setFormState({ ...formState, focusAngle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Source Reference Notes (Truth Anchor) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Source Notes & Reference Documentation</span>
                </label>
                <span className="text-[11px] text-zinc-400">Quotes, specs, benchmarks, URLs</span>
              </div>
              <textarea
                rows={4}
                value={formState.sourceReferenceInfo}
                onChange={(e) => setFormState({ ...formState, sourceReferenceInfo: e.target.value })}
                placeholder="Paste official documentation highlights, developer release notes, film director quotes, benchmark numbers, or factual specifications here. Gemini will ground its draft strictly on this data to avoid hallucination."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Additional Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Additional Instructions
              </label>
              <input
                type="text"
                value={formState.additionalInstructions || ''}
                onChange={(e) => setFormState({ ...formState, additionalInstructions: e.target.value })}
                placeholder="e.g. Include a side-by-side comparison table, emphasize memory bandwidth, omit basic background"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !formState.topic.trim()}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl ${
                  !formState.topic.trim()
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 font-extrabold shadow-cyan-500/25 active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Dynamic Content (Gemini 3.8 Flash)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: GENERATION IN PROGRESS */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'generating' && (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#0b0e14] border border-cyan-800/40 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-3xl bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 animate-pulse">
            <Sparkles className="w-12 h-12 animate-spin" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-white">Synthesizing Editorial Assets with Gemini 3.8</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generating full dynamic draft, executive summary, quick scan takeaways, SEO metadata, and fact-checking warnings for <span className="text-cyan-300 font-semibold">"{formState.topic}"</span>...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live Model: gemini-3.8-flash | No hardcoded or mock fallback</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: FACT-CHECK & TRUTH WARNINGS */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'fact_check' && rawAiResult && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-amber-800/50 space-y-6 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Fact-Check & Verification Guardrails</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 font-mono border border-amber-800">
                      Editorial Safeguard
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Before editing the draft, verify all factual claims, release dates, and hardware specs against source documentation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resolveAllFactChecks}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Verified Against Source</span>
              </button>
            </div>

            {/* Fact-check items list */}
            <div className="space-y-3">
              {(rawAiResult.factCheckFlags || []).length === 0 ? (
                <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-400 text-xs">
                  No critical truth warnings flagged for this subject. Verify technical assertions before final publication.
                </div>
              ) : (
                (rawAiResult.factCheckFlags || []).map((flag, idx) => {
                  const key = `flag-${idx}`;
                  const isResolved = resolvedFactChecks[key] || false;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleFactCheck(key)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isResolved
                          ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-100'
                          : 'bg-amber-950/20 border-amber-800/50 text-amber-100 hover:border-amber-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isResolved}
                        onChange={() => {}}
                        className="mt-1 rounded text-emerald-500 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-2">
                            <span>{flag.item}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[10px] uppercase font-mono ${
                                flag.status === 'grounded_in_source'
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                                  : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {flag.status.replace(/_/g, ' ')}
                            </span>
                          </span>
                          <span className="text-[11px] font-medium text-zinc-400">
                            {isResolved ? '✓ Verified' : 'Click to Verify'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{flag.guidance}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Navigation Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStage('configure')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Parameters</span>
              </button>

              <button
                type="button"
                onClick={() => setStage('editing')}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <span>Proceed to Human Editing Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: HUMAN EDITING & REFINEMENT SUITE */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'editing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Editorial Workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Toolbar: AI Refinement Actions & Draft Actions */}
            <div className="p-4 rounded-3xl bg-[#0b0e14] border border-cyan-800/40 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  Gemini AI Refinement Actions
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToCMS('draft')}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{loadedDraftId ? 'Update Draft' : 'Save Draft'}</span>
                  </button>

                  <button
                    onClick={() => setStage('preview')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review & Publish</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80">
                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleGenerate()}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Generate a completely new draft from the current parameters"
                >
                  <RefreshCw className={`w-3 h-3 text-cyan-400 ${activeRefineAction === 'regenerate' ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleRefineAction('continue')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Continue writing seamlessly from the end of the text"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <span>{activeRefineAction === 'continue' ? 'Writing...' : 'Continue Writing'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleRefineAction('improve')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Improve editorial vocabulary, flow, and cadence"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{activeRefineAction === 'improve' ? 'Improving...' : 'Improve Writing'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleRefineAction('expand')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Expand with deep analytical breakdown and specifics"
                >
                  <Maximize2 className="w-3 h-3 text-purple-400" />
                  <span>{activeRefineAction === 'expand' ? 'Expanding...' : 'Expand Content'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleRefineAction('shorten')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Condense and tighten the draft"
                >
                  <Minimize2 className="w-3 h-3 text-rose-400" />
                  <span>{activeRefineAction === 'shorten' ? 'Shortening...' : 'Shorten Content'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => handleRefineAction('fix_grammar')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 disabled:opacity-50"
                  title="Correct all typos, grammar, and sentence fragments"
                >
                  <CheckCheck className="w-3 h-3 text-cyan-400" />
                  <span>{activeRefineAction === 'fix_grammar' ? 'Fixing...' : 'Fix Grammar'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRefineAction !== null}
                  onClick={() => setShowCustomPromptModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-zinc-700"
                  title="Custom AI instruction"
                >
                  <span>Custom Instruction...</span>
                </button>
              </div>
            </div>

            {/* Custom Refinement Instruction Modal */}
            {showCustomPromptModal && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-cyan-500/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Custom AI Refinement Instruction</span>
                  <button onClick={() => setShowCustomPromptModal(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Add a section evaluating developer pricing, rewrite the intro with a dramatic hook..."
                  value={customRefineInstruction}
                  onChange={(e) => setCustomRefineInstruction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCustomPromptModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRefineAction('improve', customRefineInstruction)}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-zinc-950 font-bold text-xs"
                  >
                    Apply Instruction
                  </button>
                </div>
              </div>
            )}

            {/* 1. Headline Selection & Customizer */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Headline Ideas ({rawAiResult?.headlines?.length || 0} Options)
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">Click to set active headline</span>
              </div>

              <div className="space-y-2">
                {(rawAiResult?.headlines || []).map((h) => {
                  const isSelected = editedState.selectedHeadline === h.text;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setEditedState({ ...editedState, selectedHeadline: h.text })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs leading-snug">{h.text}</div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-normal">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-300 font-mono">
                            {h.angle}
                          </span>
                          <span>{h.charCount} chars</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(h.text, `h-${h.id}`);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Copy headline"
                      >
                        {copiedKey === `h-${h.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Editable Active Headline */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Active Headline
                </label>
                <input
                  type="text"
                  value={editedState.selectedHeadline}
                  onChange={(e) => setEditedState({ ...editedState, selectedHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* 2. Executive Summary & Quick Scan */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Executive Summary & Quick Scan
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Short Executive Summary
                  </label>
                  <textarea
                    rows={2}
                    value={editedState.shortSummary}
                    onChange={(e) => setEditedState({ ...editedState, shortSummary: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      What It Is
                    </label>
                    <textarea
                      rows={2}
                      value={editedState.whatItIs}
                      onChange={(e) => setEditedState({ ...editedState, whatItIs: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Why It Matters
                    </label>
                    <textarea
                      rows={2}
                      value={editedState.whyItMatters}
                      onChange={(e) => setEditedState({ ...editedState, whyItMatters: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase">
                    Key Takeaway Points
                  </label>
                  {editedState.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newPts = [...editedState.keyPoints];
                          newPts[idx] = e.target.value;
                          setEditedState({ ...editedState, keyPoints: newPts });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditedState({
                            ...editedState,
                            keyPoints: editedState.keyPoints.filter((_, i) => i !== idx)
                          });
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditedState({
                        ...editedState,
                        keyPoints: [...editedState.keyPoints, 'Key takeaway point']
                      });
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Takeaway Point</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Full Markdown Draft Editor */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Full First Draft (Markdown)
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                  <span>{editedState.firstDraft.split(/\s+/).filter(Boolean).length} words</span>
                  <span>~{Math.max(1, Math.ceil(editedState.firstDraft.split(/\s+/).filter(Boolean).length / 200))} min read</span>
                </div>
              </div>

              <textarea
                rows={18}
                value={editedState.firstDraft}
                onChange={(e) => setEditedState({ ...editedState, firstDraft: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('fact_check')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Fact-Check</span>
              </button>

              <button
                type="button"
                onClick={() => setStage('preview')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual Live Preview</span>
              </button>
            </div>

          </div>

          {/* Right Sidebar: SEO, Social Captions & Internal Links */}
          <div className="space-y-6">
            
            {/* SEO & Meta Box */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">SEO & Metadata</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    <span>SEO Title</span>
                    <span className={editedState.seoTitle.length > 60 ? 'text-amber-400' : 'text-zinc-500'}>
                      {editedState.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editedState.seoTitle}
                    onChange={(e) => setEditedState({ ...editedState, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    <span>Meta Description</span>
                    <span className={editedState.metaDescription.length > 160 ? 'text-amber-400' : 'text-zinc-500'}>
                      {editedState.metaDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={editedState.metaDescription}
                    onChange={(e) => setEditedState({ ...editedState, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={editedState.slug}
                    onChange={(e) => setEditedState({ ...editedState, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Captions Suite */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Social Captions</h3>
                </div>
              </div>

              {/* Channel Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl text-xs">
                {[
                  { id: 'twitter', label: 'X / Thread', icon: Twitter },
                  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  { id: 'reddit', label: 'Reddit', icon: MessageSquare },
                  { id: 'newsletter', label: 'Newsletter', icon: Mail }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedSocialTab(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                      selectedSocialTab === tab.id
                        ? 'bg-zinc-800 text-white font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Caption Content */}
              <div className="space-y-2">
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedSocialTab === 'twitter' && (rawAiResult?.socialCaptions?.twitterThreadStarter || editedState.shortSummary)}
                  {selectedSocialTab === 'linkedin' && (rawAiResult?.socialCaptions?.linkedInPost || editedState.shortSummary)}
                  {selectedSocialTab === 'reddit' && (rawAiResult?.socialCaptions?.redditDiscussionStarter || editedState.shortSummary)}
                  {selectedSocialTab === 'newsletter' && (rawAiResult?.socialCaptions?.newsletterBlurb || editedState.shortSummary)}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const text =
                      selectedSocialTab === 'twitter'
                        ? rawAiResult?.socialCaptions?.twitterThreadStarter || editedState.shortSummary
                        : selectedSocialTab === 'linkedin'
                        ? rawAiResult?.socialCaptions?.linkedInPost || editedState.shortSummary
                        : selectedSocialTab === 'reddit'
                        ? rawAiResult?.socialCaptions?.redditDiscussionStarter || editedState.shortSummary
                        : rawAiResult?.socialCaptions?.newsletterBlurb || editedState.shortSummary;
                    handleCopy(text || '', `social-${selectedSocialTab}`);
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedKey === `social-${selectedSocialTab}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy {selectedSocialTab.toUpperCase()} Caption</span>
                </button>
              </div>
            </div>

            {/* Internal Link Suggestions */}
            {rawAiResult?.internalLinkSuggestions && rawAiResult.internalLinkSuggestions.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Internal Link Suggestions</h3>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {rawAiResult.internalLinkSuggestions.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">{link.anchorText}</span>
                        <button
                          type="button"
                          onClick={() => insertInternalLink(link.anchorText, link.suggestedDestination)}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold border border-zinc-700 flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Insert</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate">
                        {link.suggestedDestination}
                      </div>
                      <div className="text-[10px] text-zinc-500">{link.context}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: LIVE VISUAL PREVIEW & SIGN-OFF */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'preview' && (
        <div className="space-y-8">
          
          {/* Approval Sign-off Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-emerald-800/60 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Human Editorial Sign-Off & Verification</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confirm accuracy before saving to CMS or publishing live.
                </p>
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={humanFactCheckSignoff}
                onChange={(e) => setHumanFactCheckSignoff(e.target.checked)}
                className="mt-1 rounded text-emerald-500 w-4 h-4 cursor-pointer focus:ring-0"
              />
              <div className="text-xs text-zinc-200 leading-relaxed">
                <strong className="text-white block font-bold mb-0.5">
                  Human Fact-Check Confirmation (Required for Live Publication)
                </strong>
                I certify that I have reviewed this draft, verified all specifications against primary reference documentation, confirmed zero fake reviews or synthetic quotes are present, and approved it for editorial use.
              </div>
            </label>

            {/* Publishing Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStage('editing')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Editor</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveToCMS('draft')}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{loadedDraftId ? 'Update CMS Draft' : 'Save as CMS Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveToCMS('scheduled')}
                  className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 font-bold text-xs border border-purple-800 flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schedule Publication</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveToCMS('published')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>Publish Live to PRISM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Platform Rendering Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Visual Platform Rendering Preview</span>
              </h3>
            </div>

            <div className="max-w-2xl mx-auto rounded-3xl bg-[#0c1017] border border-zinc-800 overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {formState.category}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {formState.contentType.toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Editorial Verified
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-900">
                <img
                  src={editedState.coverImage}
                  alt={editedState.selectedHeadline}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                    {editedState.selectedHeadline}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {editedState.shortSummary}
              </p>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <div className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                  ⚡ PRISM Quick Scan
                </div>
                <div className="text-zinc-200">
                  <strong>What It Is:</strong> {editedState.whatItIs}
                </div>
                <div className="text-zinc-200">
                  <strong>Why It Matters:</strong> {editedState.whyItMatters}
                </div>
                <ul className="space-y-1 text-zinc-300 pt-1">
                  {editedState.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                <div className="flex flex-wrap items-center gap-1.5">
                  {editedState.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                      #{t}
                    </span>
                  ))}
                </div>
                <span>By {editedState.authorName}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 6: COMPLETED / SAVED CONFIRMATION */}
      {/* ========================================================================= */}
      {activeStudioTab === 'create' && stage === 'approved' && (
        <div className="p-12 rounded-3xl bg-[#0b0e14] border border-emerald-800/60 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-white">Content Successfully Saved to CMS!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your article <strong className="text-white">"{editedState.selectedHeadline}"</strong> has been saved to the PRISM database.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStage('configure');
                setLoadedDraftId(null);
                setFormState({
                  topic: '',
                  title: '',
                  category: 'AI & Tools',
                  contentType: 'blog-article',
                  targetAudience: 'Developers, tech innovators',
                  desiredLength: 'medium',
                  sourceReferenceInfo: '',
                  additionalInstructions: '',
                  tone: 'Editorial, sharp, well-structured',
                  focusAngle: 'In-depth, analytical, and practical'
                });
                setRawAiResult(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Draft Another Piece</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('saved_drafts')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <FileText className="w-3.5 h-3.5 fill-current" />
              <span>View Saved Database Articles</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
