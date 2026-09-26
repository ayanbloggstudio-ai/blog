/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NovelContentType = 'novel' | 'manga' | 'manhwa';

export type NovelStatus = 'ongoing' | 'completed' | 'hiatus';

export type NovelSubmissionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';

export interface NovelChapter {
  id: string;
  chapterNumber: number;
  title: string;
  publishedAt: string;
  content: string; // rich text or formatted paragraphs
  wordCount?: number;
  views: number;
  likes: number;
  commentsCount: number;
}

export interface NovelComment {
  id: string;
  novelId: string;
  chapterNumber?: number; // optional, can be general novel comment or chapter comment
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  isReported?: boolean;
  reportReason?: string;
  status: 'published' | 'flagged' | 'hidden';
}

export interface NovelItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorRole?: string;
  type: NovelContentType;
  isOriginal: boolean; // PRISM Originals
  editorialNote?: string;
  coverImage: string;
  bannerImage?: string;
  shortDescription: string;
  description: string;
  genres: string[];
  tags: string[];
  status: NovelStatus;
  submissionStatus: NovelSubmissionStatus;
  submissionNotes?: string;
  submittedBy?: string;
  submittedAt?: string;
  chapters: NovelChapter[];
  views: number;
  likes: number;
  saves: number;
  followers: number;
  rating: number;
  ratingCount: number;
  lastUpdatedAt: string;
  featured?: boolean;
  trendingScore?: number;
  weeklyReads?: number;
  completionRate?: number;
  commentsCount: number;
}

export interface ReadingProgress {
  novelId: string;
  chapterNumber: number;
  chapterId: string;
  scrollPercent: number;
  lastReadAt: string;
  totalChapters: number;
}

export type NovelPortalTab = 'web-novels' | 'manga' | 'originals' | 'continue' | 'saved' | 'upload';

export type NovelSortOption = 'trending' | 'popular' | 'latest' | 'top-rated';

export interface ReaderSettings {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  readingWidth: 'narrow' | 'standard' | 'wide';
  theme: 'dark' | 'light' | 'sepia' | 'black';
  fontFamily: 'serif' | 'sans' | 'mono';
  lineHeight: 'normal' | 'relaxed' | 'loose';
}
