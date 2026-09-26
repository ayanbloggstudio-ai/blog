export type DirectoryCategory = 'ai-tools' | 'tech-products' | 'movies' | 'manhwa' | 'anime';

export type BestForLabel =
  | 'Best for beginners'
  | 'Best for creators'
  | 'Best for power users'
  | 'Best for solo devs'
  | 'Best for cinematography lovers'
  | 'Best for binge reading'
  | 'Best for animation enthusiasts'
  | 'Popular'
  | 'Trending'
  | 'New';

export type PricingModel =
  | 'Free & Open Source'
  | 'Freemium'
  | 'Commercial'
  | 'Streaming Subscription'
  | 'Official Webtoon'
  | 'Hardware Purchase';

export interface ExternalLinkItem {
  label: string;
  url: string;
  type: 'official' | 'docs' | 'store' | 'stream' | 'affiliate' | 'github';
  isAffiliate?: boolean;
}

export interface QuickSpec {
  label: string;
  value: string;
}

export interface DirectoryAlternative {
  id: string;
  name: string;
  summary: string;
  keyDifference: string;
  bestFor: string;
}

export interface DirectoryItem {
  id: string;
  slug: string;
  title: string;
  category: DirectoryCategory;
  categoryName: string;
  tagline: string;
  description: string;
  coverImage: string;
  galleryImages?: string[];
  bestFor: BestForLabel;
  badges: string[];
  pricing: string;
  pricingType: PricingModel;
  officialWebsite: string;
  externalLinks: ExternalLinkItem[];
  quickSpecs: QuickSpec[];
  keyHighlights: string[];
  whoItsFor: string;
  pros: string[];
  considerations: string[]; // Neutral considerations instead of harsh negative bashing
  alternatives: DirectoryAlternative[];
  compareWithIds: string[];
  scanTimeSeconds: number;
  releaseOrVersion: string;
  platformOrFormat: string;
  rankInTopList?: number;
}

export interface CuratedList {
  id: string;
  title: string;
  category: DirectoryCategory | 'cross-discipline';
  categoryName: string;
  type: 'top-10' | 'top-20' | 'recommendation';
  subtitle: string;
  description: string;
  coverImage: string;
  itemIds: string[];
  curatorNotes: string;
  targetAudience: string;
}
