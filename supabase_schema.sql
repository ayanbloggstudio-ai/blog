-- =========================================================================
-- PRISM POSTGRESQL SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
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

-- 3. Content Items Table (Articles, Tech Reviews, AI Tools, Guides)
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

-- 17. Enable Row Level Security (RLS)
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

-- 18. Row Level Security Policies
-- Open Select Policies for Public Discovery
create policy "Allow public read access on cms_categories" on public.cms_categories for select using (true);
create policy "Allow public read access on cms_items" on public.cms_items for select using (true);
create policy "Allow public read access on cms_collections" on public.cms_collections for select using (true);
create policy "Allow public read access on cms_comparisons" on public.cms_comparisons for select using (true);
create policy "Allow public read access on cms_media_assets" on public.cms_media_assets for select using (true);
create policy "Allow public read access on cms_trends" on public.cms_trends for select using (true);
create policy "Allow public read access on community_products" on public.community_products for select using (true);
create policy "Allow public read access on community_comments" on public.community_comments for select using (true);
create policy "Allow public read access on novels" on public.novels for select using (true);
create policy "Allow public read access on novel_chapters" on public.novel_chapters for select using (true);
create policy "Allow user read access on own engagements" on public.user_engagements for select using (true);

-- Write Policies (Admin & Service operations)
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
