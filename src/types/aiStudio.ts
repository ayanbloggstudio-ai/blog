export type AIStudioContentType =
  | 'article'
  | 'short-story'
  | 'top-10'
  | 'top-20'
  | 'recommendation'
  | 'comparison'
  | 'ai-tool'
  | 'tech-product'
  | 'movie'
  | 'manhwa'
  | 'anime';

export interface AIHeadlineIdea {
  id: string;
  text: string;
  angle: string;
  charCount: number;
}

export interface AIQuickTake {
  whatItIs: string;
  whyItMatters: string;
  keyPoints: string[];
  keyHighlights?: string[];
}

export interface AIOutlineSection {
  heading: string;
  points: string[];
}

export interface AISeoMeta {
  title: string;
  metaDescription: string;
  slugSuggestion: string;
  primaryKeywords: string[];
}

export interface AIRelatedIdea {
  title: string;
  contentType: string;
  rationale: string;
}

export interface AIInternalLinkSuggestion {
  anchorText: string;
  suggestedDestination: string;
  context: string;
}

export interface AISocialCaptions {
  twitterThreadStarter: string;
  linkedInPost: string;
  redditDiscussionStarter: string;
  newsletterBlurb: string;
}

export interface AIFactCheckFlag {
  item: string;
  status: 'needs_verification' | 'grounded_in_source' | 'general_knowledge';
  guidance: string;
  resolved?: boolean;
}

export interface AISpecItem {
  label: string;
  value: string;
}

export interface AIGeneratedContentResult {
  headlines: AIHeadlineIdea[];
  shortSummary: string;
  quickTake: AIQuickTake;
  articleOutline: AIOutlineSection[];
  firstDraft: string;
  seo: AISeoMeta;
  relatedContentIdeas: AIRelatedIdea[];
  internalLinkSuggestions: AIInternalLinkSuggestion[];
  socialCaptions: AISocialCaptions;
  factCheckFlags: AIFactCheckFlag[];
  pros?: string[];
  considerations?: string[];
  suggestedTags: string[];
  suggestedSpecs?: AISpecItem[];
  _isFallback?: boolean;
  _errorDetails?: string;
}

export interface AIStudioFormState {
  topic: string;
  category: string;
  contentType: AIStudioContentType;
  targetAudience: string;
  sourceReferenceInfo: string;
  tone: string;
  focusAngle: string;
}

export interface HumanEditedContentState {
  selectedHeadline: string;
  tagline: string;
  shortSummary: string;
  whatItIs: string;
  whyItMatters: string;
  keyPoints: string[];
  keyHighlights: string[];
  firstDraft: string;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  tags: string[];
  pros: string[];
  considerations: string[];
  specs: AISpecItem[];
  officialUrl: string;
  authorName: string;
  coverImage: string;
  aspectRatio: 'video' | 'portrait' | 'square' | 'tall';
}

export type AIStudioWorkflowStage =
  | 'configure'     // 1. Topic & Inputs
  | 'generating'    // 2. AI Draft in progress
  | 'fact_check'    // 3. Fact-check & Truth Warnings
  | 'editing'       // 4. Human editing suite
  | 'preview'       // 5. Visual Live Preview
  | 'approved';     // 6. Sign-off & Published/Saved to CMS
