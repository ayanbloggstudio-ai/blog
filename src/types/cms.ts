import { CategoryType, UserInterest } from './discovery';
import { DirectoryCategory, BestForLabel } from './directory';

export type ContentLifecycleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export type CMSContentType = 'article' | 'ai-tool' | 'tech-product' | 'movie' | 'manhwa' | 'anime';

export interface CMSContentItem {
  id: string;
  title: string;
  slug: string;
  category: string; // references CMSCategoryConfig.name or id
  subcategory?: UserInterest;
  contentType: CMSContentType;
  status: ContentLifecycleStatus;
  
  // Editorial & Core Copy
  tagline: string;
  summary: string;
  mainContent?: string; // Rich article or deep overview markdown
  whoItsFor?: string;
  bestFor?: BestForLabel;
  pricing?: string;
  releaseOrVersion?: string;
  platformOrFormat?: string;
  
  // Fast Scan & Highlights
  whatItIs: string;
  whyItMatters: string;
  keyPoints: string[];
  keyHighlights?: string[];
  pros?: string[];
  considerations?: string[];
  
  // Media
  coverImage: string;
  galleryImages?: string[];
  aspectRatio?: 'video' | 'portrait' | 'square' | 'tall';
  
  // Tags & Meta
  tags: string[];
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  scanTime: string; // e.g. "35s scan"
  readTime: string; // e.g. "4 min read"
  
  // Dates
  publishedAt: string;
  updatedAt: string;
  scheduledAt?: string; // ISO date string if status === 'scheduled'
  
  // Links
  officialUrl?: string;
  externalUrl?: string;
  affiliateUrl?: string;
  affiliateDisclosure?: string;
  
  // SEO Meta
  seoTitle?: string;
  metaDescription?: string;
  
  // Specifications
  specs?: { label: string; value: string }[];
  
  // Heat / Rank / Featured
  featured?: boolean;
  heatScore: number;
}

export interface CMSCategoryConfig {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  userInterest?: UserInterest;
  directoryCategory?: DirectoryCategory;
  
  // 4 Main Admin Controls
  isActive: boolean;        // Active vs Inactive
  showOnHomepage: boolean;  // Homepage ON / OFF
  showInNavigation: boolean;// Navigation ON / OFF
  showInSearch: boolean;    // Search ON / OFF
  
  order: number;
}

export interface CMSCollection {
  id: string;
  title: string;
  subtitle: string;
  categoryId: string;
  categoryName: string;
  type: 'top-10' | 'top-20' | 'curated-stack';
  itemIds: string[];
  curatorNotes: string;
  targetAudience: string;
  status: 'published' | 'draft';
  updatedAt: string;
}

export interface CMSComparisonPair {
  id: string;
  title: string;
  categoryId: string;
  itemIds: string[]; // 2 to 3 items
  notes: string;
  isFeatured: boolean;
}

export interface CMSMediaAsset {
  id: string;
  url: string;
  title: string;
  tags: string[];
  category: string;
  uploadedAt: string;
  aspectRatio?: string;
}
