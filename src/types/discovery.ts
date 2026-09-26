export type CategoryType = 'AI & Tools' | 'Tech' | 'Movies & TV' | 'Manhwa & Anime';

export type UserInterest = 'AI' | 'Tech' | 'Movies' | 'Manhwa' | 'Anime';

export type FeedTab = 'for-you' | 'trending' | 'latest';

export type ViewMode = 'masonry' | 'magazine' | 'compact';

export type PageRoute =
  | 'for-you'
  | 'trending'
  | 'latest'
  | 'category-ai'
  | 'category-tech'
  | 'category-movies'
  | 'category-anime'
  | 'detail'
  | 'search'
  | 'directories'
  | 'directory-ai'
  | 'directory-tech'
  | 'directory-movies'
  | 'directory-manhwa'
  | 'directory-anime'
  | 'directory-item'
  | 'curated-list'
  | 'compare'
  | 'community'
  | 'novels';

export interface Author {
  name: string;
  avatar: string;
  role?: string;
}

export interface QuickScan {
  whatItIs: string;
  whyItMatters: string;
  keyPoints: string[];
  readingTimeSeconds: number; // 30-60 seconds fast scan
}

export interface SectionContent {
  heading: string;
  paragraphs: string[];
  visualCallout?: {
    text: string;
    subtext?: string;
    type?: string;
  };
}

export interface VisualSpec {
  label: string;
  value: string;
  description?: string;
}

export interface DiscoveryItem {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  category: CategoryType;
  subcategory?: UserInterest;
  coverImage: string;
  gallery?: {
    url: string;
    caption: string;
    aspectRatio?: 'video' | 'portrait' | 'square';
  }[];
  aspectRatio: 'video' | 'portrait' | 'square' | 'tall';
  tags: string[];
  author: Author;
  publishedAt: string;
  readTime: string;
  scanTime: string; // e.g. "35s scan"
  quickScan: QuickScan;
  visualBreakdown?: VisualSpec[];
  sections?: SectionContent[];
  featured?: boolean;
  heatScore: number;
  trendingRank?: number;
  highlights?: string[];
  externalSource?: {
    name: string;
    url: string;
  };
  metrics: {
    views: number;
    sparks: number;
    saves: number;
    shares?: number;
    sparkRate?: string | number;
  };
  badge?: string;
}

export interface UserPersonalizationState {
  hasCompletedOnboarding: boolean;
  selectedInterests: UserInterest[];
  savedItemIds: string[];
  userSparkedItemIds: string[];
  viewedItemIds: string[];
  notInterestedIds: string[];
  boostedTags: string[];
  lastActive: number;
}
