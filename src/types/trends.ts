import { AIStudioContentType } from './aiStudio';

export type TrendStatus =
  | 'new'
  | 'watching'
  | 'create'
  | 'in_production'
  | 'published'
  | 'ignore';

export type TrendFreshness =
  | 'breaking'
  | 'trending_24h'
  | 'rising_3d'
  | 'steady_wave';

export type RelevanceLevel = 'high' | 'medium' | 'low';

export interface TrendSuggestedAngle {
  id: string;
  angleType: 'article' | 'top_10' | 'top_20' | 'recommendation' | 'comparison' | 'review' | 'alternatives';
  label: string; // e.g., "Deep-Dive Article", "Comparison Matrix", "Hands-on Review", "Top 10 Alternatives"
  title: string; // e.g., "DeepSeek R1 vs Claude 3.7: Which One Should You Actually Deploy?"
  description: string;
  targetContentType: AIStudioContentType;
  suggestedTone?: string;
  suggestedAudience?: string;
}

export interface TrendItem {
  id: string;
  topic: string;
  category: string;
  freshness: TrendFreshness;
  freshnessLabel: string;
  audienceRelevance: RelevanceLevel;
  audienceRelevanceScore: number; // 0-100
  audienceRelevanceRationale: string;
  commercialRelevance: RelevanceLevel;
  commercialRelevanceScore: number; // 0-100
  commercialRelevanceRationale: string;
  contentOpportunity: string;
  status: TrendStatus;
  
  // Research & Grounding data
  sourceSignals: string[];
  sourceNotes: string;
  targetAudience: string;
  
  // Editorial angles suggested per trend
  suggestedAngles: TrendSuggestedAngle[];

  // Growth & velocity signals
  velocityPercent?: number; // e.g. +145%
  searchVolumeTier?: string; // e.g. "High Search Intent"
  discussionCount?: number;
  
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIStudioPrefillData {
  topic: string;
  category: string;
  contentType: AIStudioContentType;
  targetAudience: string;
  sourceReferenceInfo: string;
  tone?: string;
  focusAngle?: string;
}
