export type CommunityMainCategory = 'digital' | 'physical';

export type DigitalSubcategory =
  | 'AI tools'
  | 'Websites'
  | 'Apps'
  | 'SaaS products'
  | 'Productivity tools'
  | 'Design tools'
  | 'Video editing tools'
  | 'Developer tools'
  | 'Other useful digital products';

export type PhysicalSubcategory =
  | 'Smartphones'
  | 'Laptops'
  | 'Tablets'
  | 'Headphones'
  | 'Cameras'
  | 'Gaming products'
  | 'Accessories'
  | 'Other technology products';

export type CommunityCategory = DigitalSubcategory | PhysicalSubcategory | string;

export type UserVote = 'like' | 'dislike' | null;

export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';

export interface CommunityComment {
  id: string;
  productId: string;
  authorName: string;
  rating?: number; // 1 to 5 stars for review
  title?: string;
  content: string;
  createdAt: string;
  helpfulCount: number;
  reportedCount: number;
  reportReasons?: ReportReason[];
  status: 'published' | 'hidden' | 'flagged' | 'under_review';
  isUserHidden?: boolean; // Client side hidden by reader
  isReportedByCurrentUser?: boolean;
  isHelpfulByCurrentUser?: boolean;
}

// Backward compatibility alias for any existing imports
export type CommunityReview = CommunityComment;

export type CommunityProductStatus =
  | 'draft'
  | 'published'
  | 'unpublished'
  | 'featured'
  | 'trending'
  | 'suspended';

export type CommunityUserRole = 'admin' | 'moderator' | 'creator' | 'member';
export type CommunityUserStatus = 'active' | 'suspended' | 'banned';

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: CommunityUserRole;
  status: CommunityUserStatus;
  joinedDate: string;
  contributionsCount: number;
  warningsCount: number;
  bio?: string;
}

export interface CommunityReportItem {
  id: string;
  targetType: 'comment' | 'review' | 'novel_comment' | 'product' | 'novel';
  targetId: string;
  targetTitle?: string;
  content: string;
  authorName: string;
  reporterName: string;
  reason: ReportReason | string;
  date: string;
  status: 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended';
  actionNotes?: string;
}

export interface CommunityProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  mainCategory: CommunityMainCategory;
  category: CommunityCategory;
  image: string;
  logo?: string;
  keyFeatures: string[];
  priceStatus: string; // e.g. "Free", "$20/mo", "$1,199"
  officialWebsiteUrl: string;
  affiliateUrl?: string;
  affiliateCtaText?: 'Try Now' | 'Buy Now' | 'Visit Website' | string;
  affiliateDisclosure?: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
  initialLikes: number;
  initialSaves: number;
  recentActivityScore: number;
  // Extended fields for admin management
  status?: CommunityProductStatus;
  isPinned?: boolean;
  isTrendingManual?: boolean;
  sharesCount?: number;
  referralClicks?: number;
  viewsCount?: number;
}

export interface CommunityProductStats {
  likes: number;
  saves: number;
  commentCount: number;
  recentActivityScore: number;
  engagementQualityScore: number;
  trendingScore: number;
  isTrending: boolean;
  averageRating: number | null;
  ratingCount: number;
  isLikedByUser: boolean;
  isSavedByUser: boolean;
}

export type CommunitySortFilter =
  | 'trending'
  | 'featured'
  | 'most-liked'
  | 'recently-added'
  | 'most-discussed'
  | 'highest-rated';

export interface ItemCommunityStats {
  likes: number;
  dislikes: number;
  userVote: UserVote;
  ratingCount: number;
  averageRating: number | null;
  userRating: number | null;
  reviewCount: number;
  saveCount: number;
}
