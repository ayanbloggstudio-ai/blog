import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import {
  CMSContentItem,
  CMSCategoryConfig,
  CMSCollection,
  CMSComparisonPair,
  CMSMediaAsset
} from '../types/cms';
import { TrendItem } from '../types/trends';

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- PRISM CMS POSTGRES SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Categories Table
create table if not exists public.cms_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null default 'Sparkles',
  description text default '',
  user_interest text,
  directory_category text,
  is_active boolean not null default true,
  show_on_homepage boolean not null default true,
  show_in_navigation boolean not null default true,
  show_in_search boolean not null default true,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Content Items Table
create table if not exists public.cms_items (
  id text primary key,
  title text not null,
  slug text not null,
  category text not null,
  subcategory text,
  content_type text not null default 'article',
  status text not null default 'published',
  tagline text default '',
  summary text default '',
  main_content text default '',
  who_its_for text default '',
  best_for text default '',
  pricing text default '',
  release_or_version text default '',
  platform_or_format text default '',
  what_it_is text default '',
  why_it_matters text default '',
  key_points jsonb default '[]'::jsonb,
  key_highlights jsonb default '[]'::jsonb,
  pros jsonb default '[]'::jsonb,
  considerations jsonb default '[]'::jsonb,
  cover_image text not null,
  gallery_images jsonb default '[]'::jsonb,
  aspect_ratio text default 'video',
  tags jsonb default '[]'::jsonb,
  author_name text default 'PRISM Editorial',
  author_avatar text default '',
  author_role text default 'Editor',
  scan_time text default '30s scan',
  read_time text default '3 min read',
  published_at text default '',
  updated_at text default '',
  scheduled_at text,
  official_url text,
  external_url text,
  affiliate_url text,
  affiliate_disclosure text,
  seo_title text,
  meta_description text,
  specs jsonb default '[]'::jsonb,
  featured boolean default false,
  heat_score integer default 90,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Collections / Rankings Table
create table if not exists public.cms_collections (
  id text primary key,
  title text not null,
  subtitle text default '',
  category_id text not null,
  category_name text not null,
  type text not null default 'top-10',
  item_ids jsonb default '[]'::jsonb,
  curator_notes text default '',
  target_audience text default '',
  status text not null default 'published',
  updated_at text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Comparisons Table
create table if not exists public.cms_comparisons (
  id text primary key,
  title text not null,
  category_id text not null,
  item_ids jsonb default '[]'::jsonb,
  notes text default '',
  is_featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Media Assets Table
create table if not exists public.cms_media_assets (
  id text primary key,
  url text not null,
  title text not null,
  tags jsonb default '[]'::jsonb,
  category text not null,
  uploaded_at text not null,
  aspect_ratio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Trend Radar Items Table
create table if not exists public.cms_trends (
  id text primary key,
  topic text not null,
  category text not null,
  freshness text not null,
  freshness_label text not null,
  audience_relevance text not null,
  audience_relevance_score integer not null default 80,
  audience_relevance_rationale text default '',
  commercial_relevance text not null,
  commercial_relevance_score integer not null default 75,
  commercial_relevance_rationale text default '',
  content_opportunity text default '',
  status text not null default 'new',
  source_signals jsonb default '[]'::jsonb,
  source_notes text default '',
  target_audience text default '',
  suggested_angles jsonb default '[]'::jsonb,
  velocity_percent integer default 0,
  search_volume_tier text default '',
  discussion_count integer default 0,
  admin_notes text default '',
  created_at text not null,
  updated_at text not null
);

-- 8. Community Users Table
create table if not exists public.community_users (
  id text primary key,
  name text not null,
  email text not null unique,
  avatar text default '',
  role text not null default 'member',
  status text not null default 'active',
  bio text default '',
  joined_date text not null,
  contributions_count integer default 0,
  warnings_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Community Products Table (Digital & Physical)
create table if not exists public.community_products (
  id text primary key,
  name text not null,
  slug text not null,
  short_description text default '',
  description text not null,
  main_category text not null default 'digital',
  category text not null,
  image text not null,
  logo text default '',
  key_features jsonb default '[]'::jsonb,
  price_status text default 'Free',
  price text default '',
  official_website_url text default '',
  affiliate_url text default '',
  affiliate_cta_text text default 'Try Now',
  affiliate_disclosure text default '',
  featured boolean default false,
  status text not null default 'published',
  tags jsonb default '[]'::jsonb,
  is_pinned boolean default false,
  is_trending_manual boolean default false,
  maker_name text default 'PRISM Verified',
  maker_avatar text default '',
  maker_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Community Comments & Reviews Table
create table if not exists public.community_comments (
  id text primary key,
  product_id text not null references public.community_products(id) on delete cascade,
  user_id text references public.community_users(id) on delete set null,
  author_name text not null,
  author_avatar text default '',
  author_role text default 'Community Member',
  rating numeric,
  title text default '',
  content text not null,
  status text not null default 'published',
  is_approved boolean default true,
  is_user_hidden boolean default false,
  helpful_count integer default 0,
  reports_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Community Reports Table
create table if not exists public.community_reports (
  id text primary key,
  target_type text not null,
  target_id text not null,
  target_title text default '',
  content text default '',
  author_name text default '',
  reporter_id text,
  reporter_name text not null,
  reason text not null,
  date text not null,
  status text not null default 'pending',
  action_notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Referral Clicks Tracking Table
create table if not exists public.referral_clicks (
  id text primary key,
  product_id text not null,
  product_title text not null,
  category text not null,
  main_category text not null,
  target_url text not null,
  is_affiliate boolean not null default true,
  referrer text default '',
  timestamp text not null,
  estimated_revenue numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Web Novels & Manga / Manhwa Table
create table if not exists public.novels (
  id text primary key,
  title text not null,
  slug text not null,
  synopsis text not null,
  cover_image text not null,
  author text not null,
  artist text default '',
  genres jsonb default '["Fantasy"]'::jsonb,
  tags jsonb default '[]'::jsonb,
  status text not null default 'published',
  type text not null default 'novel',
  is_original boolean default false,
  is_featured boolean default false,
  is_trending boolean default false,
  release_frequency text default 'Weekly',
  submission_notes text default '',
  rejection_reason text default '',
  creator_user_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Novel Chapters Table
create table if not exists public.novel_chapters (
  id text primary key,
  novel_id text not null references public.novels(id) on delete cascade,
  chapter_number integer not null,
  title text not null,
  content text not null,
  publish_date text not null,
  views integer default 0,
  likes integer default 0,
  comments_count integer default 0,
  is_free boolean default true,
  scheduled_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. User Engagements Table (Likes, Saves, Bookmarks)
create table if not exists public.user_engagements (
  id text primary key,
  user_id text not null,
  target_type text not null,
  target_id text not null,
  action text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Activity Events Table (Real Trending Time-Decay Engine)
create table if not exists public.activity_events (
  id text primary key,
  target_type text not null,
  target_id text not null,
  event_type text not null,
  user_id text,
  timestamp bigint not null
);

-- 17. Enable Row Level Security (RLS) & Public Read Access
alter table public.cms_categories enable row level security;
alter table public.cms_items enable row level security;
alter table public.cms_collections enable row level security;
alter table public.cms_comparisons enable row level security;
alter table public.cms_media_assets enable row level security;
alter table public.cms_trends enable row level security;
alter table public.community_users enable row level security;
alter table public.community_products enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reports enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.novels enable row level security;
alter table public.novel_chapters enable row level security;
alter table public.user_engagements enable row level security;
alter table public.activity_events enable row level security;

-- Open Select Policies for Public Discovery
create policy "Allow public read access on cms_categories" on public.cms_categories for select using (true);
create policy "Allow public read access on cms_items" on public.cms_items for select using (true);
create policy "Allow public read access on cms_collections" on public.cms_collections for select using (true);
create policy "Allow public read access on cms_comparisons" on public.cms_comparisons for select using (true);
create policy "Allow public read access on cms_media_assets" on public.cms_media_assets for select using (true);
create policy "Allow public read access on cms_trends" on public.cms_trends for select using (true);
create policy "Allow public read access on community_products" on public.community_products for select using (status = 'published' or status = 'featured' or status = 'trending');
create policy "Allow public read access on community_comments" on public.community_comments for select using (status = 'published' and is_user_hidden = false);
create policy "Allow public read access on novels" on public.novels for select using (status = 'published' or status = 'approved');
create policy "Allow public read access on novel_chapters" on public.novel_chapters for select using (true);
create policy "Allow user read access on own engagements" on public.user_engagements for select using (auth.uid()::text = user_id or true);

-- Write Policies
create policy "Allow write access on cms_categories" on public.cms_categories for all using (true) with check (true);
create policy "Allow write access on cms_items" on public.cms_items for all using (true) with check (true);
create policy "Allow write access on cms_collections" on public.cms_collections for all using (true) with check (true);
create policy "Allow write access on cms_comparisons" on public.cms_comparisons for all using (true) with check (true);
create policy "Allow write access on cms_media_assets" on public.cms_media_assets for all using (true) with check (true);
create policy "Allow write access on cms_trends" on public.cms_trends for all using (true) with check (true);
create policy "Allow write access on community_products" on public.community_products for all using (true) with check (true);
create policy "Allow write access on community_comments" on public.community_comments for all using (true) with check (true);
create policy "Allow write access on community_reports" on public.community_reports for all using (true) with check (true);
create policy "Allow write access on referral_clicks" on public.referral_clicks for all using (true) with check (true);
create policy "Allow write access on novels" on public.novels for all using (true) with check (true);
create policy "Allow write access on novel_chapters" on public.novel_chapters for all using (true) with check (true);
create policy "Allow write access on user_engagements" on public.user_engagements for all using (true) with check (true);
create policy "Allow write access on activity_events" on public.activity_events for all using (true) with check (true);

-- 18. Realtime publication
alter publication supabase_realtime add table 
  public.cms_categories, 
  public.cms_items, 
  public.cms_collections, 
  public.cms_comparisons, 
  public.cms_media_assets, 
  public.cms_trends,
  public.community_products,
  public.community_comments,
  public.novels,
  public.novel_chapters;

-- 19. Supabase Storage Bucket for Media & Imagery
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prism-media', 'prism-media', true, 20971520, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do update set public = true;

create policy "Public Access to prism-media" on storage.objects
  for select using (bucket_id = 'prism-media');

create policy "Public Uploads to prism-media" on storage.objects
  for insert with check (bucket_id = 'prism-media');

create policy "Public Updates to prism-media" on storage.objects
  for update using (bucket_id = 'prism-media');
`;

// Adapters: CMS Item to DB row
export const itemToDbRow = (item: CMSContentItem) => ({
  id: item.id,
  title: item.title,
  slug: item.slug || item.id,
  category: item.category,
  subcategory: item.subcategory || null,
  content_type: item.contentType || 'article',
  status: item.status || 'published',
  tagline: item.tagline || '',
  summary: item.summary || '',
  main_content: item.mainContent || '',
  who_its_for: item.whoItsFor || '',
  best_for: item.bestFor || '',
  pricing: item.pricing || '',
  release_or_version: item.releaseOrVersion || '',
  platform_or_format: item.platformOrFormat || '',
  what_it_is: item.whatItIs || '',
  why_it_matters: item.whyItMatters || '',
  key_points: item.keyPoints || [],
  key_highlights: item.keyHighlights || [],
  pros: item.pros || [],
  considerations: item.considerations || [],
  cover_image: item.coverImage,
  gallery_images: item.galleryImages || [],
  aspect_ratio: item.aspectRatio || 'video',
  tags: item.tags || [],
  author_name: item.authorName || 'PRISM Editorial',
  author_avatar: item.authorAvatar || '',
  author_role: item.authorRole || 'Staff',
  scan_time: item.scanTime || '30s scan',
  read_time: item.readTime || '3 min read',
  published_at: item.publishedAt || new Date().toISOString().split('T')[0],
  updated_at: item.updatedAt || new Date().toISOString().split('T')[0],
  scheduled_at: item.scheduledAt || null,
  official_url: item.officialUrl || null,
  external_url: item.externalUrl || null,
  affiliate_url: item.affiliateUrl || null,
  affiliate_disclosure: item.affiliateDisclosure || null,
  seo_title: item.seoTitle || null,
  meta_description: item.metaDescription || null,
  specs: item.specs || [],
  featured: Boolean(item.featured),
  heat_score: item.heatScore ?? 90
});

// Adapters: DB row to CMS Item
export const dbRowToItem = (row: any): CMSContentItem => ({
  id: row.id,
  title: row.title,
  slug: row.slug || row.id,
  category: row.category,
  subcategory: row.subcategory,
  contentType: row.content_type || 'article',
  status: row.status || 'published',
  tagline: row.tagline || '',
  summary: row.summary || '',
  mainContent: row.main_content || '',
  whoItsFor: row.who_its_for || '',
  bestFor: row.best_for,
  pricing: row.pricing,
  releaseOrVersion: row.release_or_version,
  platformOrFormat: row.platform_or_format,
  whatItIs: row.what_it_is || '',
  whyItMatters: row.why_it_matters || '',
  keyPoints: Array.isArray(row.key_points) ? row.key_points : [],
  keyHighlights: Array.isArray(row.key_highlights) ? row.key_highlights : [],
  pros: Array.isArray(row.pros) ? row.pros : [],
  considerations: Array.isArray(row.considerations) ? row.considerations : [],
  coverImage: row.cover_image,
  galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  aspectRatio: row.aspect_ratio || 'video',
  tags: Array.isArray(row.tags) ? row.tags : [],
  authorName: row.author_name || 'PRISM Editorial',
  authorAvatar: row.author_avatar || '',
  authorRole: row.author_role || 'Staff',
  scanTime: row.scan_time || '30s scan',
  readTime: row.read_time || '3 min read',
  publishedAt: row.published_at || '',
  updatedAt: row.updated_at || '',
  scheduledAt: row.scheduled_at,
  officialUrl: row.official_url,
  externalUrl: row.external_url,
  affiliateUrl: row.affiliate_url,
  affiliateDisclosure: row.affiliate_disclosure,
  seoTitle: row.seo_title,
  metaDescription: row.meta_description,
  specs: Array.isArray(row.specs) ? row.specs : [],
  featured: Boolean(row.featured),
  heatScore: row.heat_score ?? 90
});

// Category Adapters
export const categoryToDbRow = (c: CMSCategoryConfig) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  icon: c.icon || 'Sparkles',
  description: c.description || '',
  user_interest: c.userInterest || null,
  directory_category: c.directoryCategory || null,
  is_active: c.isActive,
  show_on_homepage: c.showOnHomepage,
  show_in_navigation: c.showInNavigation,
  show_in_search: c.showInSearch,
  order: c.order ?? 0
});

export const dbRowToCategory = (r: any): CMSCategoryConfig => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  icon: r.icon || 'Sparkles',
  description: r.description || '',
  userInterest: r.user_interest,
  directoryCategory: r.directory_category,
  isActive: Boolean(r.is_active),
  showOnHomepage: Boolean(r.show_on_homepage),
  showInNavigation: Boolean(r.show_in_navigation),
  showInSearch: Boolean(r.show_in_search),
  order: r.order ?? 0
});

// Collection Adapters
export const collectionToDbRow = (c: CMSCollection) => ({
  id: c.id,
  title: c.title,
  subtitle: c.subtitle || '',
  category_id: c.categoryId,
  category_name: c.categoryName,
  type: c.type || 'top-10',
  item_ids: c.itemIds || [],
  curator_notes: c.curatorNotes || '',
  target_audience: c.targetAudience || '',
  status: c.status || 'published',
  updated_at: c.updatedAt || new Date().toISOString().split('T')[0]
});

export const dbRowToCollection = (r: any): CMSCollection => ({
  id: r.id,
  title: r.title,
  subtitle: r.subtitle || '',
  categoryId: r.category_id,
  categoryName: r.category_name,
  type: r.type || 'top-10',
  itemIds: Array.isArray(r.item_ids) ? r.item_ids : [],
  curatorNotes: r.curator_notes || '',
  targetAudience: r.target_audience || '',
  status: r.status || 'published',
  updatedAt: r.updated_at || ''
});

// Comparison Adapters
export const comparisonToDbRow = (comp: CMSComparisonPair) => ({
  id: comp.id,
  title: comp.title,
  category_id: comp.categoryId,
  item_ids: comp.itemIds || [],
  notes: comp.notes || '',
  is_featured: comp.isFeatured
});

export const dbRowToComparison = (r: any): CMSComparisonPair => ({
  id: r.id,
  title: r.title,
  categoryId: r.category_id,
  itemIds: Array.isArray(r.item_ids) ? r.item_ids : [],
  notes: r.notes || '',
  isFeatured: Boolean(r.is_featured)
});

// Media Adapters
export const mediaToDbRow = (m: CMSMediaAsset) => ({
  id: m.id,
  url: m.url,
  title: m.title,
  tags: m.tags || [],
  category: m.category,
  uploaded_at: m.uploadedAt,
  aspect_ratio: m.aspectRatio || null
});

export const dbRowToMedia = (r: any): CMSMediaAsset => ({
  id: r.id,
  url: r.url,
  title: r.title,
  tags: Array.isArray(r.tags) ? r.tags : [],
  category: r.category,
  uploadedAt: r.uploaded_at,
  aspectRatio: r.aspect_ratio
});

// Trend Adapters
export const trendToDbRow = (t: TrendItem) => ({
  id: t.id,
  topic: t.topic,
  category: t.category,
  freshness: t.freshness,
  freshness_label: t.freshnessLabel,
  audience_relevance: t.audienceRelevance,
  audience_relevance_score: t.audienceRelevanceScore,
  audience_relevance_rationale: t.audienceRelevanceRationale || '',
  commercial_relevance: t.commercialRelevance,
  commercial_relevance_score: t.commercialRelevanceScore,
  commercial_relevance_rationale: t.commercialRelevanceRationale || '',
  content_opportunity: t.contentOpportunity || '',
  status: t.status,
  source_signals: t.sourceSignals || [],
  source_notes: t.sourceNotes || '',
  target_audience: t.targetAudience || '',
  suggested_angles: t.suggestedAngles || [],
  velocity_percent: t.velocityPercent || 0,
  search_volume_tier: t.searchVolumeTier || '',
  discussion_count: t.discussionCount || 0,
  admin_notes: t.adminNotes || '',
  created_at: t.createdAt,
  updated_at: t.updatedAt
});

export const dbRowToTrend = (r: any): TrendItem => ({
  id: r.id,
  topic: r.topic,
  category: r.category,
  freshness: r.freshness,
  freshnessLabel: r.freshness_label,
  audienceRelevance: r.audience_relevance,
  audienceRelevanceScore: r.audience_relevance_score ?? 80,
  audienceRelevanceRationale: r.audience_relevance_rationale || '',
  commercialRelevance: r.commercial_relevance,
  commercialRelevanceScore: r.commercial_relevance_score ?? 75,
  commercialRelevanceRationale: r.commercial_relevance_rationale || '',
  contentOpportunity: r.content_opportunity || '',
  status: r.status,
  sourceSignals: Array.isArray(r.source_signals) ? r.source_signals : [],
  sourceNotes: r.source_notes || '',
  targetAudience: r.target_audience || '',
  suggestedAngles: Array.isArray(r.suggested_angles) ? r.suggested_angles : [],
  velocityPercent: r.velocity_percent,
  searchVolumeTier: r.search_volume_tier,
  discussionCount: r.discussion_count,
  adminNotes: r.admin_notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// -------------------------------------------------------------
// CONNECTION BENCHMARK & DIAGNOSTIC
// -------------------------------------------------------------
export interface SupabaseStatusResult {
  connected: boolean;
  configured: boolean;
  tablesInitialized: boolean;
  url: string;
  latencyMs?: number;
  tables: {
    name: string;
    exists: boolean;
    count: number;
  }[];
  error?: string;
}

export const isTableMissingError = (err: any): boolean => {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = String(err.code || '').toLowerCase();
  return (
    code === '42p01' ||
    code === 'pgrst205' ||
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('not found')
  );
};

export const checkSupabaseConnection = async (): Promise<SupabaseStatusResult> => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return {
      connected: false,
      configured: false,
      tablesInitialized: false,
      url: config.url || '',
      tables: [],
      error: 'Supabase URL or Anon Key is missing. Configure your credentials.'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      configured: true,
      tablesInitialized: false,
      url: config.url,
      tables: [],
      error: 'Failed to initialize Supabase client.'
    };
  }

  const startTime = performance.now();
  const tableNames = [
    'cms_items',
    'cms_categories',
    'cms_collections',
    'cms_comparisons',
    'cms_media_assets',
    'cms_trends'
  ];

  let reachable = false;
  const tableResults = await Promise.all(
    tableNames.map(async (tbl) => {
      try {
        const { count, error } = await client
          .from(tbl)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (isTableMissingError(error)) {
            reachable = true; // Got a valid response from PostgREST, credentials work
          }
          return { name: tbl, exists: false, count: 0 };
        }
        reachable = true;
        return { name: tbl, exists: true, count: count ?? 0 };
      } catch {
        return { name: tbl, exists: false, count: 0 };
      }
    })
  );

  const endTime = performance.now();
  const latency = Math.round(endTime - startTime);

  const anyTableExists = tableResults.some((t) => t.exists);

  return {
    connected: reachable || anyTableExists,
    configured: true,
    tablesInitialized: anyTableExists,
    url: config.url,
    latencyMs: latency,
    tables: tableResults,
    error: anyTableExists
      ? undefined
      : 'Supabase connected, but database tables are not yet created. Run supabase_schema.sql in your Supabase SQL Editor.'
  };
};

// -------------------------------------------------------------
// FULL SYNC PUSH & PULL
// -------------------------------------------------------------
export const pushAllDataToSupabase = async (payload: {
  items: CMSContentItem[];
  categories: CMSCategoryConfig[];
  collections: CMSCollection[];
  comparisons: CMSComparisonPair[];
  mediaAssets: CMSMediaAsset[];
  trends: TrendItem[];
}): Promise<{ success: boolean; isTablesMissing?: boolean; message: string; details?: any }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured' };
  }

  try {
    const results: any = {};

    // 1. Categories
    if (payload.categories.length > 0) {
      const catRows = payload.categories.map(categoryToDbRow);
      const { error: catErr } = await client.from('cms_categories').upsert(catRows);
      if (catErr) {
        if (isTableMissingError(catErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Category upsert failed: ${catErr.message}`);
      }
      results.categories = catRows.length;
    }

    // 2. Items
    if (payload.items.length > 0) {
      const itemRows = payload.items.map(itemToDbRow);
      const { error: itemErr } = await client.from('cms_items').upsert(itemRows);
      if (itemErr) {
        if (isTableMissingError(itemErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Items upsert failed: ${itemErr.message}`);
      }
      results.items = itemRows.length;
    }

    // 3. Collections
    if (payload.collections.length > 0) {
      const colRows = payload.collections.map(collectionToDbRow);
      const { error: colErr } = await client.from('cms_collections').upsert(colRows);
      if (colErr) {
        if (isTableMissingError(colErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Collections upsert failed: ${colErr.message}`);
      }
      results.collections = colRows.length;
    }

    // 4. Comparisons
    if (payload.comparisons.length > 0) {
      const compRows = payload.comparisons.map(comparisonToDbRow);
      const { error: compErr } = await client.from('cms_comparisons').upsert(compRows);
      if (compErr) {
        if (isTableMissingError(compErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Comparisons upsert failed: ${compErr.message}`);
      }
      results.comparisons = compRows.length;
    }

    // 5. Media Assets
    if (payload.mediaAssets.length > 0) {
      const mediaRows = payload.mediaAssets.map(mediaToDbRow);
      const { error: mediaErr } = await client.from('cms_media_assets').upsert(mediaRows);
      if (mediaErr) {
        if (isTableMissingError(mediaErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Media upsert failed: ${mediaErr.message}`);
      }
      results.media = mediaRows.length;
    }

    // 6. Trends
    if (payload.trends.length > 0) {
      const trendRows = payload.trends.map(trendToDbRow);
      const { error: trendErr } = await client.from('cms_trends').upsert(trendRows);
      if (trendErr) {
        if (isTableMissingError(trendErr)) {
          return {
            success: false,
            isTablesMissing: true,
            message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
          };
        }
        throw new Error(`Trends upsert failed: ${trendErr.message}`);
      }
      results.trends = trendRows.length;
    }

    return {
      success: true,
      message: `Successfully pushed all CMS content to Supabase!`,
      details: results
    };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      return {
        success: false,
        isTablesMissing: true,
        message: 'Database tables do not exist in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor first.'
      };
    }
    console.warn('Supabase Push Note:', err?.message || err);
    return {
      success: false,
      message: err.message || 'Failed to push records to Supabase'
    };
  }
};

export const pullAllDataFromSupabase = async (): Promise<{
  success: boolean;
  isTablesMissing?: boolean;
  data?: {
    items: CMSContentItem[];
    categories: CMSCategoryConfig[];
    collections: CMSCollection[];
    comparisons: CMSComparisonPair[];
    mediaAssets: CMSMediaAsset[];
    trends: TrendItem[];
  };
  message: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured' };
  }

  try {
    // 1. Fetch Categories
    const { data: catData, error: catErr } = await client.from('cms_categories').select('*').order('order', { ascending: true });
    if (catErr) {
      if (isTableMissingError(catErr)) {
        return {
          success: false,
          isTablesMissing: true,
          message: 'Database tables not found in Supabase. Please run supabase_schema.sql in your Supabase SQL Editor.'
        };
      }
      throw new Error(`Categories fetch failed: ${catErr.message}`);
    }

    // 2. Fetch Items
    const { data: itemData, error: itemErr } = await client.from('cms_items').select('*').order('created_at', { ascending: false });
    if (itemErr) {
      if (isTableMissingError(itemErr)) {
        return {
          success: false,
          isTablesMissing: true,
          message: 'Database tables not found in Supabase. Please run supabase_schema.sql in your Supabase SQL Editor.'
        };
      }
      throw new Error(`Items fetch failed: ${itemErr.message}`);
    }

    // 3. Fetch Collections
    const { data: colData, error: colErr } = await client.from('cms_collections').select('*');
    if (colErr && !isTableMissingError(colErr)) {
      throw new Error(`Collections fetch failed: ${colErr.message}`);
    }

    // 4. Fetch Comparisons
    const { data: compData, error: compErr } = await client.from('cms_comparisons').select('*');
    if (compErr && !isTableMissingError(compErr)) {
      throw new Error(`Comparisons fetch failed: ${compErr.message}`);
    }

    // 5. Fetch Media
    const { data: mediaData, error: mediaErr } = await client.from('cms_media_assets').select('*');
    if (mediaErr && !isTableMissingError(mediaErr)) {
      throw new Error(`Media fetch failed: ${mediaErr.message}`);
    }

    // 6. Fetch Trends
    const { data: trendData, error: trendErr } = await client.from('cms_trends').select('*');
    if (trendErr && !isTableMissingError(trendErr)) {
      throw new Error(`Trends fetch failed: ${trendErr.message}`);
    }

    return {
      success: true,
      message: 'Successfully pulled data from Supabase',
      data: {
        items: (itemData || []).map(dbRowToItem),
        categories: (catData || []).map(dbRowToCategory),
        collections: (colData || []).map(dbRowToCollection),
        comparisons: (compData || []).map(dbRowToComparison),
        mediaAssets: (mediaData || []).map(dbRowToMedia),
        trends: (trendData || []).map(dbRowToTrend)
      }
    };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      return {
        success: false,
        isTablesMissing: true,
        message: 'Database tables not found in Supabase. Please run supabase_schema.sql in your Supabase SQL Editor.'
      };
    }
    console.warn('Supabase Pull Note:', err?.message || err);
    return {
      success: false,
      message: err.message || 'Failed to pull records from Supabase'
    };
  }
};

// -------------------------------------------------------------
// GRANULAR MUTATION SYNCERS
// -------------------------------------------------------------
export const syncItemToSupabase = async (item: CMSContentItem) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_items').upsert(itemToDbRow(item));
  } catch (e) {
    console.warn('Auto-sync item to Supabase failed:', e);
  }
};

export const deleteItemFromSupabase = async (id: string) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_items').delete().eq('id', id);
  } catch (e) {
    console.warn('Auto-sync delete item to Supabase failed:', e);
  }
};

export const syncCategoryToSupabase = async (category: CMSCategoryConfig) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_categories').upsert(categoryToDbRow(category));
  } catch (e) {
    console.warn('Auto-sync category to Supabase failed:', e);
  }
};

export const deleteCategoryFromSupabase = async (id: string) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_categories').delete().eq('id', id);
  } catch (e) {
    console.warn('Auto-sync delete category to Supabase failed:', e);
  }
};

export const syncTrendToSupabase = async (trend: TrendItem) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_trends').upsert(trendToDbRow(trend));
  } catch (e) {
    console.warn('Auto-sync trend to Supabase failed:', e);
  }
};

export const deleteTrendFromSupabase = async (id: string) => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('cms_trends').delete().eq('id', id);
  } catch (e) {
    console.warn('Auto-sync delete trend to Supabase failed:', e);
  }
};
