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
  Tag
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import {
  AIStudioContentType,
  AIStudioFormState,
  AIGeneratedContentResult,
  HumanEditedContentState,
  AIStudioWorkflowStage,
  AISpecItem
} from '../../types/aiStudio';
import { requestAIGeneration } from '../../services/aiContentStudioService';
import { CMSContentItem } from '../../types/cms';

// Content Type Options with Metadata
const CONTENT_TYPE_OPTIONS: {
  id: AIStudioContentType;
  label: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  {
    id: 'article',
    label: 'Article',
    desc: 'In-depth editorial analysis, visual breakdowns, and insights',
    icon: FileText,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'ai-tool',
    label: 'AI Tool',
    desc: 'Models, productivity engines, agents, and generative workflows',
    icon: Sparkles,
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'tech-product',
    label: 'Tech Product',
    desc: 'Hardware architecture, modern gadgets, and developer tools',
    icon: Cpu,
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'movie',
    label: 'Movie',
    desc: 'Cinematography, narrative craft, and visual direction in cinema',
    icon: Film,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'manhwa',
    label: 'Manhwa',
    desc: 'Webtoon pacing, panel flow, and serialized visual storytelling',
    icon: BookOpen,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'anime',
    label: 'Anime',
    desc: 'Sakuga animation, episodic arcs, and visual direction',
    icon: Zap,
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
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
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    desc: 'Curator spotlight on why you should experience this now',
    icon: Star,
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  },
  {
    id: 'short-story',
    label: 'Short Story',
    desc: 'Creative fiction and narrative vignette',
    icon: Feather,
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  }
];

// Sample Topic Presets for fast testing & instant inspiration
const PRESET_TEMPLATES: {
  name: string;
  topic: string;
  category: string;
  contentType: AIStudioContentType;
  targetAudience: string;
  sourceReferenceInfo: string;
  tone: string;
}[] = [
  {
    name: 'AI Tool Spotlight',
    topic: 'Cursor Composer & Background Spec-Driven Agents',
    category: 'AI & Tools',
    contentType: 'ai-tool',
    targetAudience: 'Software engineers, AI developers, and tech leads',
    sourceReferenceInfo: `Cursor IDE introduced Composer background agent modes.
Enables multi-file refactoring, background terminal command execution, and codebase context indexing.
Supports Claude 3.7 Sonnet, GPT-4o, and custom local models.
Key ergonomics: Shift+Cmd+I for instant composer overlay.`,
    tone: 'Technical, authoritative, pragmatic, and developer-focused'
  },
  {
    name: 'Cinema Visual Breakdown',
    topic: 'Dune: Part Two — The Visual Language of Giedi Prime and Desert Scale',
    category: 'Movies & TV',
    contentType: 'movie',
    targetAudience: 'Cinephiles, visual artists, and film directors',
    sourceReferenceInfo: `Director: Denis Villeneuve. Cinematographer: Greig Fraser.
Infrared cameras (ARRI Alexa LF with custom IR filter) used for the monochrome Giedi Prime arena sequence.
Desert scale achieved through extreme wide framing with high horizon lines.
Sound design by Richard King utilizing organic organic foley for sandworms.`,
    tone: 'Cinephile, analytical, evocative, and appreciative of visual craft'
  },
  {
    name: 'Top 10 Ranked List',
    topic: 'Top 10 Ultra-Lightweight Open-Source LLMs for Edge Devices in 2026',
    category: 'AI & Tools',
    contentType: 'top-10',
    targetAudience: 'Edge AI engineers, IoT architects, and privacy enthusiasts',
    sourceReferenceInfo: `Key models under 8B parameters:
1. DeepSeek R1 Distill Qwen 7B (High reasoning density)
2. Qwen 2.5 Coder 7B (Exceptional code generation)
3. Llama 3.2 3B & 1B (Ultra-low memory footprint for mobile)
4. Gemma 2 2B / 9B (Clean instruction following)
5. Phi-3.5 Mini 3.8B (Strong STEM benchmarks)
Quantization frameworks: GGUF / llama.cpp / Ollama / MLX.`,
    tone: 'Curated, structured, benchmark-grounded, and objective'
  },
  {
    name: 'Side-by-Side Comparison',
    topic: 'Claude 3.7 Sonnet (Hybrid Thinking) vs DeepSeek R1 for Complex Code Refactoring',
    category: 'AI & Tools',
    contentType: 'comparison',
    targetAudience: 'Senior developers and architects deciding on their AI pair-programming stack',
    sourceReferenceInfo: `Claude 3.7 Sonnet: Hybrid architecture combining instantaneous generation with dynamic thinking tokens.
DeepSeek R1: Pure reasoning model trained with large-scale RL, open-weights availability.
Benchmarking criteria: Multi-file dependency graph reasoning, edge-case detection, hallucination rate in complex TypeScript/Rust.`,
    tone: 'Deeply analytical, nuanced, honest about constraints and pricing'
  },
  {
    name: 'Manhwa Visual Analysis',
    topic: 'Solo Leveling: Ragnarok & The Evolution of Vertical Webtoon Sakuga',
    category: 'Manhwa & Anime',
    contentType: 'manhwa',
    targetAudience: 'Webtoon fans, manhwa artists, and digital comic creators',
    sourceReferenceInfo: `Original artist: DUBU (REDICE Studio). Successor team maintaining vertical scroll impact.
Techniques: Dynamic infinite scrolling, speed line distortion, lighting bloom on mana aura.
Pacing: Short panel gutters to create high-velocity action momentum.`,
    tone: 'Passionate, visually descriptive, respectful of creator legacy'
  }
];

export const AdminAIContentStudio: React.FC = () => {
  const { categories, createContent, setAdminActiveTab, aiStudioPrefill, setAiStudioPrefill } = useCMS();
  const { showToast } = useDiscovery();

  // Workflow Stage State
  const [stage, setStage] = useState<AIStudioWorkflowStage>('configure');

  // Input Form State
  const [formState, setFormState] = useState<AIStudioFormState>({
    topic: '',
    category: 'AI & Tools',
    contentType: 'article',
    targetAudience: 'Developers, tech innovators, and visual media enthusiasts',
    sourceReferenceInfo: '',
    tone: 'Editorial, sharp, well-structured, authoritative and engaging',
    focusAngle: 'In-depth, analytical, and practical'
  });

  // Handle incoming Trend Radar prefill
  useEffect(() => {
    if (aiStudioPrefill) {
      setFormState({
        topic: aiStudioPrefill.topic,
        category: aiStudioPrefill.category || 'AI & Tools',
        contentType: aiStudioPrefill.contentType || 'article',
        targetAudience: aiStudioPrefill.targetAudience || 'Developers, tech innovators, and visual media enthusiasts',
        sourceReferenceInfo: aiStudioPrefill.sourceReferenceInfo || '',
        tone: aiStudioPrefill.tone || 'Editorial, sharp, well-structured, authoritative and engaging',
        focusAngle: aiStudioPrefill.focusAngle || 'In-depth, analytical, and practical'
      });
      setStage('configure');
      showToast(`Loaded trend from Radar: "${aiStudioPrefill.topic}"`, 'info');
      setAiStudioPrefill(null);
    }
  }, [aiStudioPrefill, setAiStudioPrefill, showToast]);

  // Generation & Error States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [rawAiResult, setRawAiResult] = useState<AIGeneratedContentResult | null>(null);

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

  // Load Preset Template
  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setFormState({
      topic: preset.topic,
      category: preset.category,
      contentType: preset.contentType,
      targetAudience: preset.targetAudience,
      sourceReferenceInfo: preset.sourceReferenceInfo,
      tone: preset.tone,
      focusAngle: 'In-depth, analytical, and practical'
    });
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

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

      // Pre-fill human editable state
      const topHeadline = result.headlines?.[0]?.text || formState.topic;
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
        tagline: result.shortSummary?.split('.')[0] || result.quickTake.whatItIs,
        shortSummary: result.shortSummary || '',
        whatItIs: result.quickTake.whatItIs || '',
        whyItMatters: result.quickTake.whyItMatters || '',
        keyPoints: result.quickTake.keyPoints || [],
        keyHighlights: result.quickTake.keyHighlights || [],
        firstDraft: result.firstDraft || '',
        seoTitle: result.seo.title || `${topHeadline} | PRISM`,
        metaDescription: result.seo.metaDescription || result.shortSummary,
        slug: cleanSlug,
        tags: result.suggestedTags || [formState.category, formState.contentType],
        pros: result.pros || [],
        considerations: result.considerations || [],
        specs: result.suggestedSpecs || [],
        officialUrl: '',
        authorName: 'PRISM Editorial Staff',
        coverImage: defaultCover,
        aspectRatio: formState.contentType === 'movie' || formState.contentType === 'anime' ? 'video' : 'video'
      });

      // Reset fact check verification map
      const initialFlags: Record<string, boolean> = {};
      (result.factCheckFlags || []).forEach((f, idx) => {
        initialFlags[`flag-${idx}`] = f.status === 'grounded_in_source';
      });
      setResolvedFactChecks(initialFlags);
      setHumanFactCheckSignoff(false);

      setStage('fact_check');
      showToast('AI draft generated! Please review fact-checking guardrails.', 'success');
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Failed to generate AI content. Please try again.');
      setStage('configure');
      showToast('Generation encountered an error. Check inputs.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to toggle fact check item resolution
  const toggleFactCheck = (key: string) => {
    setResolvedFactChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Resolve all fact-check warnings
  const resolveAllFactChecks = () => {
    if (!rawAiResult) return;
    const allResolved: Record<string, boolean> = {};
    (rawAiResult.factCheckFlags || []).forEach((_, idx) => {
      allResolved[`flag-${idx}`] = true;
    });
    setResolvedFactChecks(allResolved);
    showToast('Marked all fact-check points as verified against primary sources.', 'info');
  };

  // Check if all fact checks are marked resolved
  const allFactChecksPassed = rawAiResult?.factCheckFlags
    ? rawAiResult.factCheckFlags.every((_, idx) => resolvedFactChecks[`flag-${idx}`])
    : true;

  // Insert Internal Link into Markdown Draft
  const insertInternalLink = (anchor: string, destination: string) => {
    const markdownLink = `[${anchor}](${destination})`;
    setEditedState(prev => ({
      ...prev,
      firstDraft: `${prev.firstDraft}\n\n*Related Reference: ${markdownLink}*`
    }));
    showToast(`Inserted reference link to ${anchor}`, 'success');
  };

  // Publish / Save to CMS
  const handlePublishToCMS = (status: 'draft' | 'scheduled' | 'published') => {
    if (!humanFactCheckSignoff) {
      showToast('Please check the human editorial fact-check confirmation before saving.', 'error');
      return;
    }

    if (!editedState.selectedHeadline.trim()) {
      showToast('Headline cannot be empty.', 'error');
      return;
    }

    const newItemData: Omit<CMSContentItem, 'id' | 'publishedAt' | 'updatedAt'> = {
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
      readTime: `${Math.max(2, Math.ceil(editedState.firstDraft.split(' ').length / 200))} min read`,
      officialUrl: editedState.officialUrl || '',
      externalUrl: editedState.officialUrl || '',
      affiliateUrl: '',
      seoTitle: editedState.seoTitle,
      metaDescription: editedState.metaDescription,
      specs: editedState.specs,
      featured: status === 'published',
      heatScore: 92
    };

    createContent(newItemData);
    setStage('approved');
    showToast(
      status === 'published'
        ? 'Content published live to PRISM!'
        : `Content saved to CMS as ${status.toUpperCase()}`,
      'success'
    );
  };

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
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-[11px] font-medium border border-zinc-700/80">
              Gemini 3.7 Flash Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 text-[11px] font-medium border border-emerald-800/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Human-in-the-Loop Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Editorial Drafting & Multi-Asset Creation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Generate grounded headlines, executive summaries, quick scan breakdowns, full markdown drafts, SEO meta, social captions, and internal linking proposals. <strong className="text-white">AI is your drafting assistant — human fact-checking and approval are mandatory.</strong>
          </p>
        </div>

        {/* Workflow Progress Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'configure', label: '1. Topic & Inputs', icon: Sliders },
            { id: 'generating', label: '2. AI Drafting', icon: Sparkles },
            { id: 'fact_check', label: '3. Fact-Check Guardrails', icon: ShieldAlert },
            { id: 'editing', label: '4. Human Editing', icon: FileText },
            { id: 'preview', label: '5. Visual Preview', icon: Eye },
            { id: 'approved', label: '6. Published / CMS', icon: CheckCircle2 }
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
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: CONFIGURE TOPIC & SOURCES */}
      {/* ========================================================================= */}
      {stage === 'configure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">Content Parameters</h2>
                </div>
                <span className="text-xs text-zinc-400">All fields ground the AI draft</span>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Topic / Subject Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formState.topic}
                  onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                  placeholder="e.g., DeepSeek R1 Reasoning Architecture vs Claude 3.7 Sonnet"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                />
              </div>

              {/* Category & Content Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
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
                    placeholder="e.g., Senior engineers, Cinephiles, Manhwa artists"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Content Type Pills (All 10 formats) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Content Format / Archetype</span>
                  <span className="text-[11px] text-cyan-400 font-normal">Select 1 of 10 formats</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
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

              {/* Source & Reference Notes (Truth Anchor) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Source & Reference Information (Truth Anchor)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">Raw notes, quotes, specs, URLs</span>
                </div>
                <textarea
                  rows={5}
                  value={formState.sourceReferenceInfo}
                  onChange={(e) => setFormState({ ...formState, sourceReferenceInfo: e.target.value })}
                  placeholder="Paste official documentation highlights, developer release notes, film director quotes, benchmark numbers, or factual specifications here. The AI will strictly ground its draft on this information to avoid hallucination."
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-750 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Tone & Focus Angle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Editorial Tone
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
                  <span>Generate Full Editorial Suite (Gemini 3.7)</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Sidebar: Preset Topics & Strict Ethical Guardrails */}
          <div className="space-y-6">
            
            {/* Quick Inspiration Presets */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Instant Presets</h3>
                </div>
                <span className="text-[10px] text-zinc-500">1-click load</span>
              </div>
              
              <div className="space-y-2.5">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold mb-1">
                      <span>{preset.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">{preset.contentType}</span>
                    </div>
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-white line-clamp-2">
                      {preset.topic}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Editorial Truth Policy */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-200">Strict Truth & Ethics Policy</h3>
              </div>
              <ul className="text-xs text-rose-200/80 space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Never invent reviews or user quotes:</strong> Real community reviews come solely from live readers.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Never invent prices or specs:</strong> All figures must be grounded in verified reference notes.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Never copy external articles:</strong> All prose is freshly drafted for PRISM's visual format.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>No automatic publishing:</strong> Every draft requires human verification and sign-off.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: GENERATION IN PROGRESS */}
      {/* ========================================================================= */}
      {stage === 'generating' && (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#0b0e14] border border-cyan-800/40 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-3xl bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 animate-pulse">
            <Sparkles className="w-12 h-12 animate-spin" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-white">Synthesizing Editorial Assets with Gemini 3.7</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generating 5 headline ideas, executive summary, quick scan takeaways, structured markdown draft, SEO metadata, internal link suggestions, and fact-checking warnings for <span className="text-cyan-300 font-semibold">"{formState.topic}"</span>...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Processing temperature: 0.7 | Model: gemini-3.7-flash</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: FACT-CHECK & TRUTH WARNINGS */}
      {/* ========================================================================= */}
      {stage === 'fact_check' && rawAiResult && (
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
                      Mandatory Step
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
              {(rawAiResult.factCheckFlags || []).map((flag, idx) => {
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
              })}
            </div>

            {/* Truth Policy Reminder Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Anti-Hallucination rule: Zero fake statistics, ungrounded benchmark numbers, or invented reviewer quotes allowed.
                </span>
              </div>
              <span className="text-zinc-500 font-mono text-[11px] shrink-0">
                {Object.values(resolvedFactChecks).filter(Boolean).length} / {rawAiResult.factCheckFlags?.length || 0} Verified
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStage('configure')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Inputs</span>
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
      {/* STAGE 4: HUMAN EDITING SUITE */}
      {/* ========================================================================= */}
      {stage === 'editing' && rawAiResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Editorial Workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Headline Selection & Customizer */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Headline Ideas (5 Options)
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">Click to select active title</span>
              </div>

              <div className="space-y-2">
                {(rawAiResult.headlines || []).map((h) => {
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
                <span className="text-[11px] text-zinc-400">High-impact fast takeaways</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Short Executive Summary (2 sentences)
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
                        keyPoints: [...editedState.keyPoints, 'New key takeaway point']
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

            {/* 3. Comprehensive First Draft Markdown Editor */}
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
                rows={16}
                value={editedState.firstDraft}
                onChange={(e) => setEditedState({ ...editedState, firstDraft: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            {/* 4. Navigation to Preview */}
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
                <span className="text-[10px] text-zinc-500">Google SERP</span>
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
                <span className="text-[10px] text-zinc-500">Multi-Channel</span>
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
                  {selectedSocialTab === 'twitter' && rawAiResult.socialCaptions?.twitterThreadStarter}
                  {selectedSocialTab === 'linkedin' && rawAiResult.socialCaptions?.linkedInPost}
                  {selectedSocialTab === 'reddit' && rawAiResult.socialCaptions?.redditDiscussionStarter}
                  {selectedSocialTab === 'newsletter' && rawAiResult.socialCaptions?.newsletterBlurb}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const text =
                      selectedSocialTab === 'twitter'
                        ? rawAiResult.socialCaptions?.twitterThreadStarter
                        : selectedSocialTab === 'linkedin'
                        ? rawAiResult.socialCaptions?.linkedInPost
                        : selectedSocialTab === 'reddit'
                        ? rawAiResult.socialCaptions?.redditDiscussionStarter
                        : rawAiResult.socialCaptions?.newsletterBlurb;
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
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Internal Link Suggestions</h3>
                </div>
                <span className="text-[10px] text-zinc-500">SEO Taxonomy</span>
              </div>

              <div className="space-y-2.5">
                {(rawAiResult.internalLinkSuggestions || []).map((link, idx) => (
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

            {/* Related Content Ideas */}
            <div className="p-6 rounded-3xl bg-[#0b0e14] border border-zinc-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Follow-up Content Ideas</h3>
                </div>
              </div>

              <div className="space-y-2">
                {(rawAiResult.relatedContentIdeas || []).map((idea, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1">
                    <div className="text-xs font-bold text-white">{idea.title}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{idea.contentType}</div>
                    <div className="text-[10px] text-zinc-400">{idea.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: LIVE VISUAL PREVIEW & SIGN-OFF */}
      {/* ========================================================================= */}
      {stage === 'preview' && (
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
                  Human Fact-Check Confirmation (Mandatory)
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
                  onClick={() => handlePublishToCMS('draft')}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Save as CMS Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishToCMS('scheduled')}
                  className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 font-bold text-xs border border-purple-800 flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schedule Publication</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishToCMS('published')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>Publish Live to PRISM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visual Live Card & Detail View Mockup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Visual Platform Rendering Preview</span>
              </h3>
              <span className="text-xs text-zinc-500">Live PRISM Card simulation</span>
            </div>

            {/* Mocked Visual Discovery Card */}
            <div className="max-w-2xl mx-auto rounded-3xl bg-[#0c1017] border border-zinc-800 overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
              
              {/* Card Header & Badge */}
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

              {/* Cover Image */}
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

              {/* Tagline / Summary */}
              <p className="text-xs text-zinc-300 leading-relaxed">
                {editedState.shortSummary}
              </p>

              {/* Quick Scan Breakdown Box */}
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

              {/* Tags & Meta Footer */}
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
      {stage === 'approved' && (
        <div className="p-12 rounded-3xl bg-[#0b0e14] border border-emerald-800/60 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-white">Content Successfully Pushed to CMS!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your fact-checked, human-approved article <strong className="text-white">"{editedState.selectedHeadline}"</strong> has been saved and integrated into PRISM's content repository.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStage('configure');
                setFormState({
                  topic: '',
                  category: 'AI & Tools',
                  contentType: 'article',
                  targetAudience: '',
                  sourceReferenceInfo: '',
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
              onClick={() => setAdminActiveTab('content')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <FileText className="w-3.5 h-3.5 fill-current" />
              <span>View All CMS Content</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
