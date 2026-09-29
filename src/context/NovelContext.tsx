/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  NovelItem,
  NovelChapter,
  NovelComment,
  ReadingProgress,
  ReaderSettings,
  NovelSubmissionStatus
} from '../types/novel';
import { calculateNovelTrendingScore } from '../utils/novelRanking';
import { apiClient } from '../services/apiClient';

interface NovelContextType {
  // Catalog
  novels: NovelItem[];
  allSubmissions: NovelItem[];
  selectedNovelId: string | null;
  selectedChapterNumber: number | null;
  
  // Navigation & View Actions
  openNovel: (novelId: string, chapterNumber?: number) => void;
  openReader: (novelId: string, chapterNumber: number) => void;
  closeReader: () => void;
  closeNovelDetail: () => void;
  getNovel: (idOrSlug: string) => NovelItem | undefined;
  
  // Reading Progress & Bookmarks (LocalStorage Backed)
  readingProgress: Record<string, ReadingProgress>;
  updateReadingProgress: (novelId: string, chapterNumber: number, scrollPercent: number) => void;
  getReadingProgress: (novelId: string) => ReadingProgress | undefined;
  
  // User Engagements
  savedNovelIds: string[];
  toggleSaveNovel: (novelId: string) => void;
  isNovelSaved: (novelId: string) => boolean;
  
  followedNovelIds: string[];
  toggleFollowNovel: (novelId: string) => void;
  isNovelFollowed: (novelId: string) => boolean;
  
  likedNovelIds: string[];
  toggleLikeNovel: (novelId: string) => void;
  isNovelLiked: (novelId: string) => boolean;
  
  // Comments
  getNovelComments: (novelId: string, chapterNumber?: number) => NovelComment[];
  addNovelComment: (novelId: string, content: string, chapterNumber?: number, authorName?: string) => void;
  likeComment: (commentId: string) => void;
  reportComment: (commentId: string, reason: string) => void;
  
  // Creator Submissions Workflow
  submitNovel: (data: Partial<NovelItem>, asDraft?: boolean) => NovelItem;
  adminApproveSubmission: (submissionId: string) => void;
  adminRejectSubmission: (submissionId: string, reason: string) => void;
  adminSuspendSubmission: (submissionId: string) => void;
  adminDeleteSubmission: (submissionId: string) => void;
  adminRequestChangesSubmission: (submissionId: string, notes: string) => void;

  // Admin Novel & Manga Catalog Management
  adminAddNovel: (novelData: Partial<NovelItem>) => NovelItem;
  adminUpdateNovel: (novelId: string, updates: Partial<NovelItem>) => void;
  adminDeleteNovel: (novelId: string) => void;
  adminToggleFeatureNovel: (novelId: string) => void;
  adminToggleTrendingNovel: (novelId: string) => void;
  adminTogglePublishNovel: (novelId: string) => void;
  adminAddChapter: (novelId: string, chapter: Omit<NovelChapter, 'id' | 'views' | 'likes' | 'commentsCount'>) => NovelChapter;
  adminUpdateChapter: (novelId: string, chapterId: string, updates: Partial<NovelChapter>) => void;
  adminDeleteChapter: (novelId: string, chapterId: string) => void;
  adminReorderChapters: (novelId: string, orderedChapterIds: string[]) => void;
  adminDeleteComment: (novelId: string, commentId: string) => void;
  adminDismissCommentReport: (novelId: string, commentId: string) => void;
  
  // Reader Customizer Settings
  readerSettings: ReaderSettings;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
}

const NovelContext = createContext<NovelContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'prism_novels_';

const isMockNovelId = (id: string) =>
  id.startsWith('prism-orig-') ||
  id.startsWith('novel-') ||
  id.startsWith('user-sub-');

export const NovelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Novel catalog state (Starts empty for production)
  const [novels, setNovels] = useState<NovelItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}catalog`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: any) => n && n.id && !isMockNovelId(n.id));
        }
      }
    } catch (e) {
      console.error('Failed to load saved novels', e);
    }
    return [];
  });

  // 2. Creator Submissions (User submissions & Admin queue)
  const [allSubmissions, setAllSubmissions] = useState<NovelItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}submissions`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: any) => n && n.id && !isMockNovelId(n.id));
        }
      }
    } catch (e) {
      console.error('Failed to load saved submissions', e);
    }
    return [];
  });

  // 3. Selection & Reader Routing
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | null>(null);

  // 4. Reading Progress
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}progress`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load reading progress', e);
    }
    return {};
  });

  // 5. User Saves / Bookmarks
  const [savedNovelIds, setSavedNovelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}saved`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !isMockNovelId(id));
        }
      }
    } catch (e) {
      console.error('Failed to load saved novel IDs', e);
    }
    return [];
  });

  // 6. User Follows
  const [followedNovelIds, setFollowedNovelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}followed`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !isMockNovelId(id));
        }
      }
    } catch (e) {
      console.error('Failed to load followed novel IDs', e);
    }
    return [];
  });

  // 7. User Likes
  const [likedNovelIds, setLikedNovelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}likes`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => !isMockNovelId(id));
        }
      }
    } catch (e) {
      console.error('Failed to load liked novel IDs', e);
    }
    return [];
  });

  // 8. Comments map
  const [commentsMap, setCommentsMap] = useState<Record<string, NovelComment[]>>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}comments`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          const cleaned: Record<string, NovelComment[]> = {};
          Object.keys(parsed).forEach(k => {
            if (!isMockNovelId(k)) cleaned[k] = parsed[k];
          });
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Failed to load comments', e);
    }
    return {};
  });

  // 9. Reader Settings
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reader_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load reader settings', e);
    }
    return {
      fontSize: 'md',
      readingWidth: 'standard',
      theme: 'dark',
      fontFamily: 'serif',
      lineHeight: 'relaxed'
    };
  });

  // Sync initial novels from real backend database
  useEffect(() => {
    let isMounted = true;
    apiClient.fetchNovels({ admin: true }).then(res => {
      if (isMounted && res && Array.isArray(res.novels)) {
        setNovels(res.novels.filter(n => n.submissionStatus === 'approved' || (n as any).status === 'published' || (n as any).status === 'approved'));
        setAllSubmissions(res.novels);
      }
    }).catch(err => {
      console.warn('Backend novels fetch error:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Persist items on changes
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}catalog`, JSON.stringify(novels));
  }, [novels]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}submissions`, JSON.stringify(allSubmissions));
  }, [allSubmissions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}progress`, JSON.stringify(readingProgress));
  }, [readingProgress]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}saved`, JSON.stringify(savedNovelIds));
  }, [savedNovelIds]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}followed`, JSON.stringify(followedNovelIds));
  }, [followedNovelIds]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}likes`, JSON.stringify(likedNovelIds));
  }, [likedNovelIds]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}comments`, JSON.stringify(commentsMap));
  }, [commentsMap]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reader_settings`, JSON.stringify(readerSettings));
  }, [readerSettings]);

  // Dynamic SEO & URL Sync
  useEffect(() => {
    if (selectedNovelId && selectedChapterNumber) {
      const novel = novels.find(n => n.id === selectedNovelId);
      const chapter = novel?.chapters?.find(c => c.chapterNumber === selectedChapterNumber);
      if (novel && chapter) {
        document.title = `${chapter.title} - ${novel.title} | PRISM Web Novels`;
        window.history.replaceState(null, '', `#novel/${novel.slug}/chapter/${selectedChapterNumber}`);
        return;
      }
    } else if (selectedNovelId) {
      const novel = novels.find(n => n.id === selectedNovelId);
      if (novel) {
        document.title = `${novel.title} | Read on PRISM Web Novels & Manga`;
        window.history.replaceState(null, '', `#novel/${novel.slug}`);
        return;
      }
    }
  }, [selectedNovelId, selectedChapterNumber, novels]);

  // Navigation handlers
  const openNovel = useCallback((novelId: string, chapterNumber?: number) => {
    setSelectedNovelId(novelId);
    if (chapterNumber !== undefined) {
      setSelectedChapterNumber(chapterNumber);
    } else {
      setSelectedChapterNumber(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openReader = useCallback((novelId: string, chapterNumber: number) => {
    setSelectedNovelId(novelId);
    setSelectedChapterNumber(chapterNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeReader = useCallback(() => {
    setSelectedChapterNumber(null);
    if (selectedNovelId) {
      const novel = novels.find(n => n.id === selectedNovelId);
      if (novel) {
        window.history.replaceState(null, '', `#novel/${novel.slug}`);
      }
    }
  }, [selectedNovelId, novels]);

  const closeNovelDetail = useCallback(() => {
    setSelectedNovelId(null);
    setSelectedChapterNumber(null);
    window.history.replaceState(null, '', '#novels');
  }, []);

  const getNovel = useCallback((idOrSlug: string): NovelItem | undefined => {
    return novels.find(n => n.id === idOrSlug || n.slug === idOrSlug) ||
           allSubmissions.find(n => n.id === idOrSlug || n.slug === idOrSlug);
  }, [novels, allSubmissions]);

  // Reading progress update
  const updateReadingProgress = useCallback((novelId: string, chapterNumber: number, scrollPercent: number) => {
    const novel = getNovel(novelId);
    const chapter = novel?.chapters?.find(c => c.chapterNumber === chapterNumber);
    if (!novel || !chapter) return;

    setReadingProgress(prev => ({
      ...prev,
      [novelId]: {
        novelId,
        chapterNumber,
        chapterId: chapter.id,
        scrollPercent: Math.min(100, Math.max(0, Math.round(scrollPercent))),
        lastReadAt: new Date().toISOString(),
        totalChapters: novel.chapters?.length || 0
      }
    }));

    apiClient.updateNovelReadingProgress(novelId, chapterNumber, scrollPercent).catch(() => {});
  }, [getNovel]);

  const getReadingProgress = useCallback((novelId: string): ReadingProgress | undefined => {
    return readingProgress[novelId];
  }, [readingProgress]);

  // Saves / Bookmarks
  const toggleSaveNovel = useCallback((novelId: string) => {
    setSavedNovelIds(prev => {
      const exists = prev.includes(novelId);
      const next = exists ? prev.filter(id => id !== novelId) : [...prev, novelId];
      // update novel save count
      setNovels(all => all.map(n => {
        if (n.id === novelId) {
          return { ...n, saves: Math.max(0, n.saves + (exists ? -1 : 1)) };
        }
        return n;
      }));
      return next;
    });

    apiClient.toggleNovelBookmark(novelId).then(res => {
      if (res && typeof res.totalBookmarks === 'number') {
        setNovels(all => all.map(n => n.id === novelId ? { ...n, saves: res.totalBookmarks } : n));
      }
    }).catch(() => {});
  }, []);

  const isNovelSaved = useCallback((novelId: string) => {
    return savedNovelIds.includes(novelId);
  }, [savedNovelIds]);

  // Follows
  const toggleFollowNovel = useCallback((novelId: string) => {
    setFollowedNovelIds(prev => {
      const exists = prev.includes(novelId);
      const next = exists ? prev.filter(id => id !== novelId) : [...prev, novelId];
      setNovels(all => all.map(n => {
        if (n.id === novelId) {
          return { ...n, followers: Math.max(0, n.followers + (exists ? -1 : 1)) };
        }
        return n;
      }));
      return next;
    });
  }, []);

  const isNovelFollowed = useCallback((novelId: string) => {
    return followedNovelIds.includes(novelId);
  }, [followedNovelIds]);

  // Likes
  const toggleLikeNovel = useCallback((novelId: string) => {
    setLikedNovelIds(prev => {
      const exists = prev.includes(novelId);
      const next = exists ? prev.filter(id => id !== novelId) : [...prev, novelId];
      setNovels(all => all.map(n => {
        if (n.id === novelId) {
          return { ...n, likes: Math.max(0, n.likes + (exists ? -1 : 1)) };
        }
        return n;
      }));
      return next;
    });

    apiClient.toggleNovelLike(novelId).then(res => {
      if (res && typeof res.totalLikes === 'number') {
        setNovels(all => all.map(n => n.id === novelId ? { ...n, likes: res.totalLikes } : n));
      }
    }).catch(() => {});
  }, []);

  const isNovelLiked = useCallback((novelId: string) => {
    return likedNovelIds.includes(novelId);
  }, [likedNovelIds]);

  // Comments
  const getNovelComments = useCallback((novelId: string, chapterNumber?: number): NovelComment[] => {
    const list = commentsMap[novelId] || [];
    if (chapterNumber !== undefined) {
      return list.filter(c => c.chapterNumber === chapterNumber && c.status !== 'hidden');
    }
    return list.filter(c => c.status !== 'hidden');
  }, [commentsMap]);

  const addNovelComment = useCallback((
    novelId: string,
    content: string,
    chapterNumber?: number,
    authorName = 'Prism Reader'
  ) => {
    const newComment: NovelComment = {
      id: `nc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      novelId,
      chapterNumber,
      authorName,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      status: 'published'
    };

    setCommentsMap(prev => {
      const existing = prev[novelId] || [];
      return {
        ...prev,
        [novelId]: [newComment, ...existing]
      };
    });

    setNovels(all => all.map(n => {
      if (n.id === novelId) {
        return { ...n, commentsCount: (n.commentsCount || 0) + 1 };
      }
      return n;
    }));
  }, []);

  const likeComment = useCallback((commentId: string) => {
    setCommentsMap(prev => {
      const updated: Record<string, NovelComment[]> = {};
      Object.keys(prev).forEach(key => {
        updated[key] = prev[key].map(c => {
          if (c.id === commentId) {
            const isLiked = !c.isLiked;
            return {
              ...c,
              isLiked,
              likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
            };
          }
          return c;
        });
      });
      return updated;
    });
  }, []);

  const reportComment = useCallback((commentId: string, reason: string) => {
    setCommentsMap(prev => {
      const updated: Record<string, NovelComment[]> = {};
      Object.keys(prev).forEach(key => {
        updated[key] = prev[key].map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              isReported: true,
              reportReason: reason,
              status: 'flagged' as const
            };
          }
          return c;
        });
      });
      return updated;
    });
  }, []);

  // Submissions Flow
  const submitNovel = useCallback((data: Partial<NovelItem>, asDraft = false): NovelItem => {
    const slug = (data.title || 'untitled-submission')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newSubmission: NovelItem = {
      id: `sub-${Date.now()}`,
      title: data.title || 'Untitled Work',
      slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
      author: data.author || 'Anonymous Creator',
      type: data.type || 'novel',
      isOriginal: false,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      shortDescription: data.shortDescription || 'A new original work submitted to PRISM.',
      description: data.description || 'Full synopsis pending.',
      genres: data.genres && data.genres.length > 0 ? data.genres : ['Fantasy'],
      tags: data.tags && data.tags.length > 0 ? data.tags : ['User Submitted', 'New Release'],
      status: 'ongoing',
      submissionStatus: asDraft ? 'draft' : 'pending_review',
      submissionNotes: data.submissionNotes || 'Submitted by approved platform creator.',
      submittedBy: data.submittedBy || 'creator@prism.network',
      submittedAt: new Date().toISOString(),
      chapters: data.chapters && data.chapters.length > 0 ? data.chapters : [
        {
          id: `ch-sub-${Date.now()}-1`,
          chapterNumber: 1,
          title: 'Chapter 1: The Beginning',
          publishedAt: new Date().toISOString(),
          wordCount: 1200,
          views: 0,
          likes: 0,
          commentsCount: 0,
          content: 'Story content was submitted for editorial review.'
        }
      ],
      views: 0,
      likes: 0,
      saves: 0,
      followers: 0,
      rating: 5.0,
      ratingCount: 1,
      lastUpdatedAt: new Date().toISOString(),
      commentsCount: 0
    };

    setAllSubmissions(prev => [newSubmission, ...prev]);

    apiClient.submitUserNovel(data, asDraft).then(res => {
      if (res && res.submission) {
        setAllSubmissions(prev => [res.submission, ...prev.filter(s => s.id !== newSubmission.id && s.id !== res.submission.id)]);
      }
    }).catch(err => {
      console.warn('Backend submission error:', err);
    });

    return newSubmission;
  }, []);

  // Admin Actions for Submissions
  const adminApproveSubmission = useCallback((submissionId: string) => {
    let approvedItem: NovelItem | null = null;
    
    setAllSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        approvedItem = { ...sub, submissionStatus: 'approved' as const };
        return approvedItem;
      }
      return sub;
    }));

    if (approvedItem) {
      // Add or update in public catalog
      setNovels(prev => {
        const existingIndex = prev.findIndex(n => n.id === submissionId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = approvedItem!;
          return updated;
        }
        return [approvedItem!, ...prev];
      });
    }

    apiClient.reviewSubmission(submissionId, 'approve').catch(e => console.warn('Approve submission error:', e));
  }, []);

  const adminRejectSubmission = useCallback((submissionId: string, reason: string) => {
    setAllSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          submissionStatus: 'rejected' as const,
          submissionNotes: `Editorial Rejection Reason: ${reason}`
        };
      }
      return sub;
    }));

    // Remove from public catalog if it was there
    setNovels(prev => prev.filter(n => n.id !== submissionId));
    apiClient.reviewSubmission(submissionId, 'reject', reason).catch(e => console.warn('Reject submission error:', e));
  }, []);

  const adminSuspendSubmission = useCallback((submissionId: string) => {
    setAllSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return { ...sub, submissionStatus: 'suspended' as const };
      }
      return sub;
    }));
    setNovels(prev => prev.filter(n => n.id !== submissionId));
    apiClient.reviewSubmission(submissionId, 'suspend').catch(e => console.warn('Suspend submission error:', e));
  }, []);

  const adminDeleteSubmission = useCallback((submissionId: string) => {
    setAllSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    setNovels(prev => prev.filter(n => n.id !== submissionId));
    apiClient.deleteNovel(submissionId).catch(e => console.warn('Delete submission error:', e));
  }, []);

  const adminRequestChangesSubmission = useCallback((submissionId: string, notes: string) => {
    setAllSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          submissionStatus: 'draft' as const,
          submissionNotes: `Editorial Changes Requested: ${notes}`
        };
      }
      return sub;
    }));
    apiClient.reviewSubmission(submissionId, 'request_changes', notes).catch(e => console.warn('Request changes error:', e));
  }, []);

  // Admin Catalog Management: PRISM Originals, Web Novels, Manga, Manhwa
  const adminAddNovel = useCallback((novelData: Partial<NovelItem>): NovelItem => {
    const newId = `novel-${Date.now()}`;
    const slug = novelData.slug || (novelData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newNovel: NovelItem = {
      id: newId,
      title: novelData.title || 'Untitled Series',
      slug,
      author: novelData.author || 'PRISM Author',
      authorRole: novelData.authorRole || 'Author',
      type: novelData.type || 'novel',
      isOriginal: Boolean(novelData.isOriginal),
      editorialNote: novelData.editorialNote || '',
      coverImage: novelData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      bannerImage: novelData.bannerImage,
      shortDescription: novelData.shortDescription || '',
      description: novelData.description || '',
      genres: novelData.genres && novelData.genres.length > 0 ? novelData.genres : ['Fantasy'],
      tags: novelData.tags && novelData.tags.length > 0 ? novelData.tags : ['Original', 'Web Novel'],
      status: novelData.status || 'ongoing',
      submissionStatus: 'approved',
      chapters: novelData.chapters && novelData.chapters.length > 0 ? novelData.chapters : [],
      views: novelData.views || 0,
      likes: novelData.likes || 0,
      saves: novelData.saves || 0,
      followers: novelData.followers || 0,
      rating: novelData.rating || 5.0,
      ratingCount: novelData.ratingCount || 0,
      lastUpdatedAt: new Date().toISOString().split('T')[0],
      featured: Boolean(novelData.featured),
      trendingScore: novelData.trendingScore || 50,
      weeklyReads: novelData.weeklyReads || 0,
      completionRate: novelData.completionRate || 0,
      commentsCount: novelData.commentsCount || 0
    };

    setNovels(prev => [newNovel, ...prev]);
    setAllSubmissions(prev => [newNovel, ...prev]);

    apiClient.createNovel(novelData).then(res => {
      if (res && res.novel) {
        setNovels(prev => [res.novel, ...prev.filter(n => n.id !== newId && n.id !== res.novel.id)]);
        setAllSubmissions(prev => [res.novel, ...prev.filter(n => n.id !== newId && n.id !== res.novel.id)]);
      }
    }).catch(err => {
      console.warn('Backend novel create error:', err);
    });

    return newNovel;
  }, []);

  const adminUpdateNovel = useCallback((novelId: string, updates: Partial<NovelItem>) => {
    setNovels(prev => prev.map(n => n.id === novelId ? { ...n, ...updates, lastUpdatedAt: new Date().toISOString().split('T')[0] } : n));
    setAllSubmissions(prev => prev.map(s => s.id === novelId ? { ...s, ...updates } : s));
    apiClient.updateNovel(novelId, updates).catch(e => console.warn('Novel update error:', e));
  }, []);

  const adminDeleteNovel = useCallback((novelId: string) => {
    setNovels(prev => prev.filter(n => n.id !== novelId));
    setAllSubmissions(prev => prev.filter(s => s.id !== novelId));
    apiClient.deleteNovel(novelId).catch(e => console.warn('Novel delete error:', e));
  }, []);

  const adminToggleFeatureNovel = useCallback((novelId: string) => {
    setNovels(prev => {
      const target = prev.find(n => n.id === novelId);
      const nextFeat = !target?.featured;
      apiClient.updateNovel(novelId, { featured: nextFeat }).catch(() => {});
      return prev.map(n => n.id === novelId ? { ...n, featured: nextFeat } : n);
    });
  }, []);

  const adminToggleTrendingNovel = useCallback((novelId: string) => {
    setNovels(prev => {
      const target = prev.find(n => n.id === novelId);
      const nextTrending = (target?.trendingScore || 50) > 80 ? 40 : 95;
      apiClient.updateNovel(novelId, { trendingScore: nextTrending }).catch(() => {});
      return prev.map(n => n.id === novelId ? { ...n, trendingScore: nextTrending } : n);
    });
  }, []);

  const adminTogglePublishNovel = useCallback((novelId: string) => {
    setNovels(prev => {
      const exists = prev.some(n => n.id === novelId);
      if (exists) {
        apiClient.updateNovel(novelId, { status: 'hiatus' }).catch(() => {});
        return prev.filter(n => n.id !== novelId);
      } else {
        const sub = allSubmissions.find(s => s.id === novelId);
        if (sub) {
          apiClient.reviewSubmission(novelId, 'approve').catch(() => {});
          return [{ ...sub, submissionStatus: 'approved' as const }, ...prev];
        }
        return prev;
      }
    });
  }, [allSubmissions]);

  const adminAddChapter = useCallback((novelId: string, chapter: Omit<NovelChapter, 'id' | 'views' | 'likes' | 'commentsCount'>): NovelChapter => {
    const newChapterId = `chap-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newChapter: NovelChapter = {
      id: newChapterId,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      publishedAt: chapter.publishedAt || new Date().toISOString().split('T')[0],
      content: chapter.content,
      wordCount: chapter.wordCount || chapter.content.split(/\s+/).length,
      views: 0,
      likes: 0,
      commentsCount: 0
    };

    setNovels(prev => prev.map(n => {
      if (n.id === novelId) {
        const chapters = [...n.chapters, newChapter].sort((a, b) => a.chapterNumber - b.chapterNumber);
        return {
          ...n,
          chapters,
          lastUpdatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return n;
    }));

    apiClient.addNovelChapter(novelId, {
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      content: chapter.content,
      publishDate: chapter.publishedAt
    }).then(res => {
      if (res && res.chapter) {
        setNovels(prev => prev.map(n => {
          if (n.id !== novelId) return n;
          const filtered = (n.chapters || []).filter(c => c.id !== newChapterId && c.id !== res.chapter.id);
          return {
            ...n,
            chapters: [...filtered, res.chapter].sort((a, b) => a.chapterNumber - b.chapterNumber)
          };
        }));
      }
    }).catch(e => console.warn('Chapter add error:', e));

    return newChapter;
  }, []);

  const adminUpdateChapter = useCallback((novelId: string, chapterId: string, updates: Partial<NovelChapter>) => {
    setNovels(prev => prev.map(n => {
      if (n.id === novelId) {
        const chapters = n.chapters.map(c => c.id === chapterId ? { ...c, ...updates } : c);
        return { ...n, chapters, lastUpdatedAt: new Date().toISOString().split('T')[0] };
      }
      return n;
    }));
    apiClient.updateNovelChapter(novelId, chapterId, updates).catch(e => console.warn('Chapter update error:', e));
  }, []);

  const adminDeleteChapter = useCallback((novelId: string, chapterId: string) => {
    setNovels(prev => prev.map(n => {
      if (n.id === novelId) {
        const chapters = n.chapters.filter(c => c.id !== chapterId);
        return { ...n, chapters };
      }
      return n;
    }));
    apiClient.deleteNovelChapter(novelId, chapterId).catch(e => console.warn('Chapter delete error:', e));
  }, []);

  const adminReorderChapters = useCallback((novelId: string, orderedChapterIds: string[]) => {
    setNovels(prev => prev.map(n => {
      if (n.id === novelId) {
        const chapterMap = new Map<string, NovelChapter>();
        n.chapters.forEach(c => chapterMap.set(c.id, c));
        const reordered: NovelChapter[] = [];
        orderedChapterIds.forEach((id, index) => {
          const chap = chapterMap.get(id);
          if (chap) {
            reordered.push({
              id: chap.id,
              chapterNumber: index + 1,
              title: chap.title,
              content: chap.content,
              publishedAt: chap.publishedAt,
              views: chap.views,
              likes: chap.likes,
              commentsCount: chap.commentsCount
            });
          }
        });
        return { ...n, chapters: reordered };
      }
      return n;
    }));
    apiClient.reorderNovelChapters(novelId, orderedChapterIds).catch(e => console.warn('Reorder chapters error:', e));
  }, []);

  const adminDeleteComment = useCallback((novelId: string, commentId: string) => {
    setCommentsMap(prev => {
      const existing = prev[novelId] || [];
      return {
        ...prev,
        [novelId]: existing.filter(c => c.id !== commentId)
      };
    });
  }, []);

  const adminDismissCommentReport = useCallback((novelId: string, commentId: string) => {
    setCommentsMap(prev => {
      const existing = prev[novelId] || [];
      return {
        ...prev,
        [novelId]: existing.map(c => c.id === commentId ? { ...c, isReported: false, reportReason: undefined } : c)
      };
    });
  }, []);

  // Reader Settings
  const updateReaderSettings = useCallback((newSettings: Partial<ReaderSettings>) => {
    setReaderSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = useMemo(() => ({
    novels,
    allSubmissions,
    selectedNovelId,
    selectedChapterNumber,
    openNovel,
    openReader,
    closeReader,
    closeNovelDetail,
    getNovel,
    readingProgress,
    updateReadingProgress,
    getReadingProgress,
    savedNovelIds,
    toggleSaveNovel,
    isNovelSaved,
    followedNovelIds,
    toggleFollowNovel,
    isNovelFollowed,
    likedNovelIds,
    toggleLikeNovel,
    isNovelLiked,
    getNovelComments,
    addNovelComment,
    likeComment,
    reportComment,
    submitNovel,
    adminApproveSubmission,
    adminRejectSubmission,
    adminSuspendSubmission,
    adminDeleteSubmission,
    adminRequestChangesSubmission,
    adminAddNovel,
    adminUpdateNovel,
    adminDeleteNovel,
    adminToggleFeatureNovel,
    adminToggleTrendingNovel,
    adminTogglePublishNovel,
    adminAddChapter,
    adminUpdateChapter,
    adminDeleteChapter,
    adminReorderChapters,
    adminDeleteComment,
    adminDismissCommentReport,
    readerSettings,
    updateReaderSettings
  }), [
    novels,
    allSubmissions,
    selectedNovelId,
    selectedChapterNumber,
    openNovel,
    openReader,
    closeReader,
    closeNovelDetail,
    getNovel,
    readingProgress,
    updateReadingProgress,
    getReadingProgress,
    savedNovelIds,
    toggleSaveNovel,
    isNovelSaved,
    followedNovelIds,
    toggleFollowNovel,
    isNovelFollowed,
    likedNovelIds,
    toggleLikeNovel,
    isNovelLiked,
    getNovelComments,
    addNovelComment,
    likeComment,
    reportComment,
    submitNovel,
    adminApproveSubmission,
    adminRejectSubmission,
    adminSuspendSubmission,
    adminDeleteSubmission,
    adminRequestChangesSubmission,
    adminAddNovel,
    adminUpdateNovel,
    adminDeleteNovel,
    adminToggleFeatureNovel,
    adminToggleTrendingNovel,
    adminTogglePublishNovel,
    adminAddChapter,
    adminUpdateChapter,
    adminDeleteChapter,
    adminReorderChapters,
    adminDeleteComment,
    adminDismissCommentReport,
    readerSettings,
    updateReaderSettings
  ]);

  return (
    <NovelContext.Provider value={value}>
      {children}
    </NovelContext.Provider>
  );
};

export const useNovels = () => {
  const context = useContext(NovelContext);
  if (!context) {
    throw new Error('useNovels must be used within a NovelProvider');
  }
  return context;
};
