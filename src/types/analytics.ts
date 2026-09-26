export interface VisitorSession {
  sessionId: string;
  visitorId: string;
  isReturning: boolean;
  firstVisitAt: string;
  lastVisitAt: string;
  visitCount: number;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
}

export interface PageViewEvent {
  id: string;
  viewName: string;
  path: string;
  timestamp: string;
  visitorId: string;
}

export interface ContentOpenEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  category: string;
  contentType: string;
  timestamp: string;
  visitorId: string;
}

export interface SearchEvent {
  id: string;
  query: string;
  categoryFilter?: string;
  resultsCount: number;
  timestamp: string;
  visitorId: string;
}

export interface InteractionEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  category: string;
  interactionType: 'save' | 'unsave' | 'like' | 'dislike' | 'share' | 'rate' | 'review';
  metadata?: {
    platform?: 'twitter' | 'linkedin' | 'reddit' | 'copy_link';
    rating?: number;
  };
  timestamp: string;
  visitorId: string;
}

export interface ExternalClickEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  category: string;
  destinationUrl: string;
  anchorLabel: string;
  isAffiliate: boolean;
  affiliateNetwork?: string;
  estimatedRevenue?: number;
  timestamp: string;
  visitorId: string;
}

export interface AggregatedAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  returningVisitorRate: number; // percentage 0-100
  totalPageViews: number;
  totalContentOpens: number;
  totalSearches: number;
  totalSaves: number;
  totalLikes: number;
  totalDislikes: number;
  totalShares: number;
  totalCommunityRatings: number;
  totalReviews: number;
  totalExternalClicks: number;
  totalAffiliateClicks: number;
  totalEstimatedRevenue: number;
}

export interface ContentPerformanceMetric {
  itemId: string;
  title: string;
  category: string;
  contentType: string;
  opens: number;
  saves: number;
  likes: number;
  shares: number;
  externalClicks: number;
  affiliateClicks: number;
  estimatedRevenue: number;
  communityRatingAvg: number;
  ratingCount: number;
}

export interface CategoryPerformanceMetric {
  category: string;
  itemCount: number;
  totalOpens: number;
  totalSaves: number;
  totalLikes: number;
  totalExternalClicks: number;
  affiliateRevenue: number;
}

export interface SearchQueryMetric {
  query: string;
  searchCount: number;
  lastSearchedAt: string;
  resultsCount: number;
}

export interface LaunchChecklistItem {
  id: string;
  category: 'core_views' | 'discovery_flow' | 'monetization' | 'seo_performance' | 'editorial_cms';
  name: string;
  targetViewOrFeature: string;
  status: 'passed' | 'warning' | 'failed' | 'checking';
  details: string;
  lastVerifiedAt?: string;
}

export interface BrokenLinkItem {
  id: string;
  sourceItemId: string;
  sourceTitle: string;
  linkType: 'external_url' | 'affiliate_link' | 'internal_comparison' | 'internal_category';
  targetUrl: string;
  status: 'valid' | 'broken' | 'redirect' | 'unreachable';
  statusCode?: number;
  suggestedFix?: string;
}

export interface BrokenImageItem {
  id: string;
  sourceItemId: string;
  sourceTitle: string;
  imageType: 'cover_image' | 'screenshot' | 'avatar' | 'media_asset';
  imageUrl: string;
  status: 'valid' | 'broken' | 'empty' | 'malformed';
  dimensions?: string;
  suggestedFix?: string;
}

export interface SEOCheckItem {
  id: string;
  target: string;
  checkName: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  recommendation?: string;
}

export interface PerformanceCheckItem {
  id: string;
  metricName: string;
  value: string;
  threshold: string;
  status: 'good' | 'needs_improvement' | 'poor';
  score: number; // 0-100
  details: string;
}
