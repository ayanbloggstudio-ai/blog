import { CommunityProduct, CommunityComment, CommunityUser, CommunityReportItem } from '../types/community';

export const DIGITAL_CATEGORIES = [
  'All Digital',
  'AI tools',
  'Websites',
  'Apps',
  'SaaS products',
  'Productivity tools',
  'Design tools',
  'Video editing tools',
  'Developer tools',
  'Other useful digital products'
] as const;

export const PHYSICAL_CATEGORIES = [
  'All Physical',
  'Smartphones',
  'Laptops',
  'Tablets',
  'Headphones',
  'Cameras',
  'Gaming products',
  'Accessories',
  'Other technology products'
] as const;

export const INITIAL_COMMUNITY_PRODUCTS: CommunityProduct[] = [];
export const INITIAL_COMMUNITY_COMMENTS: CommunityComment[] = [];
export const INITIAL_COMMUNITY_USERS: CommunityUser[] = [];
export const INITIAL_COMMUNITY_REPORTS: CommunityReportItem[] = [];
