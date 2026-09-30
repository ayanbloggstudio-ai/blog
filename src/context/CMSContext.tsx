import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CMSContentItem,
  CMSCategoryConfig,
  CMSCollection,
  CMSComparisonPair,
  CMSMediaAsset,
  ContentLifecycleStatus,
  CMSContentType
} from '../types/cms';
import { TrendItem, TrendStatus, AIStudioPrefillData, TrendSuggestedAngle } from '../types/trends';
import {
  getSupabaseConfig,
  getSupabaseClient
} from '../lib/supabase';
import {
  syncItemToSupabase,
  deleteItemFromSupabase,
  syncCategoryToSupabase,
  deleteCategoryFromSupabase,
  syncTrendToSupabase,
  deleteTrendFromSupabase,
  pullAllDataFromSupabase
} from '../services/supabaseService';

const CMS_STORAGE_KEY = 'prism_cms_state_v1';

export const INITIAL_CMS_CATEGORIES: CMSCategoryConfig[] = [
  {
    id: 'cat-ai',
    name: 'AI & Tools',
    slug: 'ai-tools',
    icon: 'Sparkles',
    description: 'Artificial intelligence models, developer workflows, generative media, and productivity engines.',
    userInterest: 'AI',
    directoryCategory: 'ai-tools',
    isActive: true,
    showOnHomepage: true,
    showInNavigation: true,
    showInSearch: true,
    order: 1
  },
  {
    id: 'cat-tech',
    name: 'Tech',
    slug: 'tech',
    icon: 'Cpu',
    description: 'Hardware architecture, modern gadgets, developer setups, and computing breakthroughs.',
    userInterest: 'Tech',
    directoryCategory: 'tech-products',
    isActive: true,
    showOnHomepage: true,
    showInNavigation: true,
    showInSearch: true,
    order: 2
  },
  {
    id: 'cat-movies',
    name: 'Movies & TV',
    slug: 'movies-tv',
    icon: 'Film',
    description: 'Cinematography, narrative craft, production breakdowns, and visual direction in film and television.',
    userInterest: 'Movies',
    directoryCategory: 'movies',
    isActive: true,
    showOnHomepage: true,
    showInNavigation: true,
    showInSearch: true,
    order: 3
  },
  {
    id: 'cat-anime',
    name: 'Manhwa & Anime',
    slug: 'manhwa-anime',
    icon: 'BookOpen',
    description: 'Webtoon pacing, animation sakuga breakdowns, visual storyboards, and episodic narrative arcs.',
    userInterest: 'Manhwa',
    directoryCategory: 'manhwa',
    isActive: true,
    showOnHomepage: true,
    showInNavigation: true,
    showInSearch: true,
    order: 4
  }
];

// Clean production initial CMS items (starts empty waiting for real published content)
const buildInitialCMSItems = (): CMSContentItem[] => [];

const INITIAL_MEDIA_ASSETS: CMSMediaAsset[] = [];
const INITIAL_COLLECTIONS: CMSCollection[] = [];
const INITIAL_COMPARISONS: CMSComparisonPair[] = [];

export type AdminTab =
  | 'dashboard'
  | 'novels'
  | 'community-products'
  | 'moderation'
  | 'rankings'
  | 'links'
  | 'analytics'
  | 'users'
  | 'trends'
  | 'ai-studio'
  | 'supabase'
  | 'content'
  | 'editor'
  | 'categories'
  | 'comparisons'
  | 'media';

interface CMSContextType {
  // State
  items: CMSContentItem[];
  categories: CMSCategoryConfig[];
  collections: CMSCollection[];
  comparisons: CMSComparisonPair[];
  mediaAssets: CMSMediaAsset[];
  trends: TrendItem[];
  aiStudioPrefill: AIStudioPrefillData | null;
  isAdminViewOpen: boolean;
  adminActiveTab: AdminTab;
  editingItemId: string | null;

  // Hydration & Bulk State Setter
  setAllCMSData: (data: {
    items: CMSContentItem[];
    categories: CMSCategoryConfig[];
    collections: CMSCollection[];
    comparisons: CMSComparisonPair[];
    mediaAssets: CMSMediaAsset[];
    trends: TrendItem[];
  }) => void;

  // Navigation / UI Controls
  setIsAdminViewOpen: (open: boolean) => void;
  setAdminActiveTab: (tab: AdminTab) => void;
  setAiStudioPrefill: (data: AIStudioPrefillData | null) => void;
  sendTrendToAIStudio: (trend: TrendItem, angle?: TrendSuggestedAngle) => void;
  startCreateContent: (prefillCategory?: string) => void;
  startEditContent: (id: string) => void;

  // Trend Operations
  updateTrendStatus: (id: string, status: TrendStatus) => void;
  addTrend: (data: Omit<TrendItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTrend: (id: string) => void;

  // Content Operations
  createContent: (data: Partial<CMSContentItem>) => { success: boolean; id: string; error?: string };
  updateContent: (id: string, data: Partial<CMSContentItem>) => { success: boolean; error?: string };
  deleteContent: (id: string) => { success: boolean };
  archiveContent: (id: string) => void;
  duplicateContent: (id: string) => { success: boolean; newId: string };
  changeStatus: (id: string, status: ContentLifecycleStatus, scheduledAt?: string) => void;
  getContentById: (id: string) => CMSContentItem | undefined;

  // Category Operations
  updateCategory: (id: string, updates: Partial<CMSCategoryConfig>) => void;
  createCategory: (data: Omit<CMSCategoryConfig, 'id'>) => { success: boolean; id: string };
  deleteCategory: (id: string) => { success: boolean; error?: string };

  // Collection & Ranking Operations
  createCollection: (data: Omit<CMSCollection, 'id' | 'updatedAt'>) => void;
  updateCollection: (id: string, updates: Partial<CMSCollection>) => void;
  deleteCollection: (id: string) => void;

  // Comparison Operations
  createComparison: (data: Omit<CMSComparisonPair, 'id'>) => void;
  updateComparison: (id: string, updates: Partial<CMSComparisonPair>) => void;
  deleteComparison: (id: string) => void;

  // Media Operations
  addMediaAsset: (data: Omit<CMSMediaAsset, 'id' | 'uploadedAt'>) => CMSMediaAsset;
  deleteMediaAsset: (id: string) => void;

  // Public Query Selectors (CRITICAL RULES APPLIED)
  getPublicPublishedItems: () => CMSContentItem[];
  getPublicCategories: (filterTarget?: 'homepage' | 'navigation' | 'search' | 'all') => CMSCategoryConfig[];
  getCategoryPublishedCount: (categoryNameOrId: string) => number;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const isMockCmsId = (id: string) => 
  id.startsWith('disc-') || 
  id.startsWith('tool-') || 
  id.startsWith('dir-') || 
  id.startsWith('tech-') || 
  id.startsWith('ai-') || 
  id.startsWith('comp-') || 
  id.startsWith('col-') ||
  id.startsWith('trend-') ||
  id.startsWith('media-');

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or fallback (starts strictly empty for production)
  const [items, setItems] = useState<CMSContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_items`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((it: any) => it && it.id && !isMockCmsId(it.id));
        }
      }
    } catch (e) {
      console.warn('Could not load CMS items from storage:', e);
    }
    return buildInitialCMSItems();
  });

  const [categories, setCategories] = useState<CMSCategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_categories`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load CMS categories from storage:', e);
    }
    return INITIAL_CMS_CATEGORIES;
  });

  const [collections, setCollections] = useState<CMSCollection[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_collections`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !isMockCmsId(c.id));
        }
      }
    } catch (e) {
      console.warn('Could not load CMS collections:', e);
    }
    return INITIAL_COLLECTIONS;
  });

  const [comparisons, setComparisons] = useState<CMSComparisonPair[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_comparisons`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !isMockCmsId(c.id));
        }
      }
    } catch (e) {
      console.warn('Could not load CMS comparisons:', e);
    }
    return INITIAL_COMPARISONS;
  });

  const [mediaAssets, setMediaAssets] = useState<CMSMediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_media`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: any) => m && m.id && !isMockCmsId(m.id));
        }
      }
    } catch (e) {
      console.warn('Could not load CMS media:', e);
    }
    return INITIAL_MEDIA_ASSETS;
  });

  const [trends, setTrends] = useState<TrendItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${CMS_STORAGE_KEY}_trends`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => t && t.id && !isMockCmsId(t.id));
        }
      }
    } catch (e) {
      console.warn('Could not load CMS trends:', e);
    }
    return [];
  });

  const [aiStudioPrefill, setAiStudioPrefill] = useState<AIStudioPrefillData | null>(null);

  // UI state
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '/admin' || path.startsWith('/admin/');
    }
    return false;
  });
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTab>('dashboard');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Sync URL pathname with admin view state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
      if (isAdminViewOpen && !isPathAdmin) {
        window.history.pushState(null, '', '/admin');
      } else if (!isAdminViewOpen && isPathAdmin) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [isAdminViewOpen]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
        setIsAdminViewOpen(isPathAdmin);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set all CMS data from Supabase Pull or restore
  const setAllCMSData = (data: {
    items: CMSContentItem[];
    categories: CMSCategoryConfig[];
    collections: CMSCollection[];
    comparisons: CMSComparisonPair[];
    mediaAssets: CMSMediaAsset[];
    trends: TrendItem[];
  }) => {
    if (data.items && Array.isArray(data.items)) setItems(data.items);
    if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
    if (data.collections && Array.isArray(data.collections)) setCollections(data.collections);
    if (data.comparisons && Array.isArray(data.comparisons)) setComparisons(data.comparisons);
    if (data.mediaAssets && Array.isArray(data.mediaAssets)) setMediaAssets(data.mediaAssets);
    if (data.trends && Array.isArray(data.trends)) setTrends(data.trends);
  };

  // Check Supabase on mount and hydrate if available
  useEffect(() => {
    const hydrateFromSupabase = async () => {
      const config = getSupabaseConfig();
      if (config.url && config.anonKey) {
        try {
          const res = await pullAllDataFromSupabase();
          if (res.success && res.data && res.data.items && res.data.items.length > 0) {
            setAllCMSData(res.data);
          }
        } catch (e) {
          console.warn('Initial Supabase hydration skipped:', e);
        }
      }
    };
    hydrateFromSupabase();
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_collections`, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_comparisons`, JSON.stringify(comparisons));
  }, [comparisons]);

  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_media`, JSON.stringify(mediaAssets));
  }, [mediaAssets]);

  useEffect(() => {
    localStorage.setItem(`${CMS_STORAGE_KEY}_trends`, JSON.stringify(trends));
  }, [trends]);

  // Scheduled publishing check (runs once on mount and periodically)
  useEffect(() => {
    const checkScheduledItems = () => {
      const now = new Date().toISOString();
      setItems((prev) => {
        let hasChanges = false;
        const updated = prev.map((it) => {
          if (it.status === 'scheduled' && it.scheduledAt && it.scheduledAt <= now) {
            hasChanges = true;
            return {
              ...it,
              status: 'published' as ContentLifecycleStatus,
              publishedAt: now.split('T')[0],
              updatedAt: now.split('T')[0]
            };
          }
          return it;
        });
        return hasChanges ? updated : prev;
      });
    };

    checkScheduledItems();
    const interval = setInterval(checkScheduledItems, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Helpers
  const getContentById = (id: string) => (items || []).find((it) => it && it.id === id);

  const getCategoryPublishedCount = (categoryNameOrId: string) => {
    const safeTarget = (categoryNameOrId || '').toLowerCase();
    return (items || []).filter(
      (it) =>
        it &&
        it.status === 'published' &&
        ((it.category || '').toLowerCase() === safeTarget ||
          (categories || []).some(
            (c) =>
              c &&
              c.id === categoryNameOrId &&
              (c.name || '').toLowerCase() === (it.category || '').toLowerCase()
          ))
    ).length;
  };

  /**
   * CRITICAL BUSINESS RULE:
   * Only active categories with published content appear publicly!
   * Do NOT show empty or future categories.
   */
  const getPublicCategories = (filterTarget: 'homepage' | 'navigation' | 'search' | 'all' = 'all') => {
    return (categories || []).filter((cat) => {
      if (!cat) return false;
      // Must be Active
      if (!cat.isActive) return false;

      // Must have at least 1 published item
      const publishedCount = (items || []).filter(
        (it) =>
          it &&
          it.status === 'published' &&
          ((it.category || '').toLowerCase() === (cat.name || '').toLowerCase() ||
            (it.category || '').toLowerCase() === (cat.slug || '').toLowerCase())
      ).length;

      if (publishedCount === 0) return false;

      // Target filter check
      if (filterTarget === 'homepage' && !cat.showOnHomepage) return false;
      if (filterTarget === 'navigation' && !cat.showInNavigation) return false;
      if (filterTarget === 'search' && !cat.showInSearch) return false;

      return true;
    });
  };

  /**
   * CRITICAL RULE:
   * Only returns published items belonging to an active category with >0 items.
   */
  const getPublicPublishedItems = () => {
    const activeCategoryNames = new Set(
      (categories || [])
        .filter((c) => c && c.isActive)
        .map((c) => (c.name || '').toLowerCase())
    );

    return (items || []).filter((it) => {
      if (!it || it.status !== 'published') return false;
      if (!activeCategoryNames.has((it.category || '').toLowerCase())) return false;
      return true;
    });
  };

  // Content Actions
  const startCreateContent = (prefillCategory?: string) => {
    setEditingItemId(null);
    setAdminActiveTab('editor');
    setIsAdminViewOpen(true);
  };

  const startEditContent = (id: string) => {
    setEditingItemId(id);
    setAdminActiveTab('editor');
    setIsAdminViewOpen(true);
  };

  const createContent = (data: Partial<CMSContentItem>) => {
    if (!data.title || !data.title.trim()) {
      return { success: false, id: '', error: 'Content title is required.' };
    }

    const newId = `item-${Date.now()}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const newItem: CMSContentItem = {
      id: newId,
      title: data.title.trim(),
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: data.category || categories[0]?.name || 'AI & Tools',
      subcategory: data.subcategory,
      contentType: data.contentType || 'article',
      status: data.status || 'draft',
      tagline: data.tagline || data.title,
      summary: data.summary || data.tagline || '',
      mainContent: data.mainContent || '',
      whoItsFor: data.whoItsFor || '',
      bestFor: data.bestFor,
      pricing: data.pricing || 'Free & Paid Tiers',
      releaseOrVersion: data.releaseOrVersion || 'v1.0',
      platformOrFormat: data.platformOrFormat || 'Web / Cross-platform',
      whatItIs: data.whatItIs || data.summary || data.tagline || '',
      whyItMatters: data.whyItMatters || '',
      keyPoints: data.keyPoints && data.keyPoints.length > 0 ? data.keyPoints : ['Core feature highlight 1', 'Core feature highlight 2'],
      keyHighlights: data.keyHighlights || [],
      pros: data.pros || [],
      considerations: data.considerations || [],
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      galleryImages: data.galleryImages || [data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'],
      aspectRatio: data.aspectRatio || 'video',
      tags: data.tags || ['Featured'],
      authorName: data.authorName || 'Editorial Staff',
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      authorRole: data.authorRole || 'Curator',
      scanTime: data.scanTime || '35s scan',
      readTime: data.readTime || '3 min read',
      publishedAt: data.publishedAt || nowStr,
      updatedAt: nowStr,
      scheduledAt: data.scheduledAt,
      officialUrl: data.officialUrl || '',
      externalUrl: data.externalUrl || '',
      affiliateUrl: data.affiliateUrl || '',
      affiliateDisclosure: data.affiliateDisclosure || 'Contains verified partner links.',
      seoTitle: data.seoTitle || `${data.title} | PRISM`,
      metaDescription: data.metaDescription || data.summary || data.tagline,
      specs: data.specs || [],
      featured: Boolean(data.featured),
      heatScore: data.heatScore || 85
    };

    setItems((prev) => [newItem, ...prev]);
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey) {
      syncItemToSupabase(newItem);
    }
    return { success: true, id: newId };
  };

  const updateContent = (id: string, data: Partial<CMSContentItem>) => {
    const exists = items.some((it) => it.id === id);
    if (!exists) return { success: false, error: 'Item not found.' };

    const nowStr = new Date().toISOString().split('T')[0];

    let updatedItem: CMSContentItem | null = null;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        updatedItem = {
          ...it,
          ...data,
          updatedAt: nowStr
        };
        return updatedItem;
      })
    );

    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey && updatedItem) {
      syncItemToSupabase(updatedItem);
    }

    return { success: true };
  };

  const deleteContent = (id: string) => {
    setItems((prev) => (prev || []).filter((it) => it && it.id !== id));
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey) {
      deleteItemFromSupabase(id);
    }
    return { success: true };
  };

  const archiveContent = (id: string) => {
    changeStatus(id, 'archived');
  };

  const duplicateContent = (id: string) => {
    const original = getContentById(id);
    if (!original) return { success: false, newId: '' };

    const newId = `item-${Date.now()}`;
    const duplicated: CMSContentItem = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setItems((prev) => [duplicated, ...prev]);
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey) {
      syncItemToSupabase(duplicated);
    }
    return { success: true, newId };
  };

  const changeStatus = (id: string, status: ContentLifecycleStatus, scheduledAt?: string) => {
    let updatedItem: CMSContentItem | null = null;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        updatedItem = {
          ...it,
          status,
          scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return updatedItem;
      })
    );
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey && updatedItem) {
      syncItemToSupabase(updatedItem);
    }
  };

  // Category Actions
  const updateCategory = (id: string, updates: Partial<CMSCategoryConfig>) => {
    let updatedCat: CMSCategoryConfig | null = null;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedCat = { ...c, ...updates };
          return updatedCat;
        }
        return c;
      })
    );
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey && updatedCat) {
      syncCategoryToSupabase(updatedCat);
    }
  };

  const createCategory = (data: Omit<CMSCategoryConfig, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat: CMSCategoryConfig = {
      ...data,
      id: newId
    };
    setCategories((prev) => [...prev, newCat]);
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey) {
      syncCategoryToSupabase(newCat);
    }
    return { success: true, id: newId };
  };

  const deleteCategory = (id: string) => {
    // Check if category has published content
    const cat = categories.find((c) => c.id === id);
    if (!cat) return { success: false, error: 'Category not found.' };

    const count = getCategoryPublishedCount(cat.name);
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete "${cat.name}" because it still has ${count} published item(s). Reassign or archive them first.`
      };
    }

    setCategories((prev) => (prev || []).filter((c) => c && c.id !== id));
    const config = getSupabaseConfig();
    if (config.autoSyncEnabled && config.url && config.anonKey) {
      deleteCategoryFromSupabase(id);
    }
    return { success: true };
  };

  // Collection Actions
  const createCollection = (data: Omit<CMSCollection, 'id' | 'updatedAt'>) => {
    const newId = `col-${Date.now()}`;
    const newCol: CMSCollection = {
      ...data,
      id: newId,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCollections((prev) => [newCol, ...(prev || [])]);
  };

  const updateCollection = (id: string, updates: Partial<CMSCollection>) => {
    setCollections((prev) =>
      (prev || []).map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : c
      )
    );
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => (prev || []).filter((c) => c && c.id !== id));
  };

  // Comparison Actions
  const createComparison = (data: Omit<CMSComparisonPair, 'id'>) => {
    const newId = `comp-${Date.now()}`;
    setComparisons((prev) => [...(prev || []), { ...data, id: newId }]);
  };

  const updateComparison = (id: string, updates: Partial<CMSComparisonPair>) => {
    setComparisons((prev) =>
      (prev || []).map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteComparison = (id: string) => {
    setComparisons((prev) => (prev || []).filter((c) => c && c.id !== id));
  };

  // Media Actions
  const addMediaAsset = (data: Omit<CMSMediaAsset, 'id' | 'uploadedAt'>) => {
    const newAsset: CMSMediaAsset = {
      ...data,
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaAssets((prev) => [newAsset, ...(prev || [])]);
    return newAsset;
  };

  const deleteMediaAsset = (id: string) => {
    setMediaAssets((prev) => (prev || []).filter((m) => m && m.id !== id));
  };

  // Trend Actions
  const updateTrendStatus = (id: string, status: TrendStatus) => {
    setTrends((prev) =>
      (prev || []).map((t) =>
        t && t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const addTrend = (data: Omit<TrendItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrend: TrendItem = {
      ...data,
      id: `trend-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTrends((prev) => [newTrend, ...(prev || [])]);
  };

  const deleteTrend = (id: string) => {
    setTrends((prev) => (prev || []).filter((t) => t && t.id !== id));
  };

  const sendTrendToAIStudio = (trend: TrendItem, angle?: TrendSuggestedAngle) => {
    // Update status to in_production if it was new or watching
    if (trend.status === 'new' || trend.status === 'watching') {
      updateTrendStatus(trend.id, 'in_production');
    }

    const prefill: AIStudioPrefillData = {
      topic: angle?.title || trend.topic,
      category: trend.category,
      contentType: angle?.targetContentType || 'article',
      targetAudience: angle?.suggestedAudience || trend.targetAudience,
      sourceReferenceInfo: trend.sourceNotes,
      tone: angle?.suggestedTone || 'Editorial, sharp, authoritative, and engaging',
      focusAngle: angle?.label || 'In-depth, analytical, and practical'
    };

    setAiStudioPrefill(prefill);
    setAdminActiveTab('ai-studio');
  };

  const value = useMemo(
    () => ({
      items,
      categories,
      collections,
      comparisons,
      mediaAssets,
      trends,
      aiStudioPrefill,
      isAdminViewOpen,
      adminActiveTab,
      editingItemId,
      setAllCMSData,
      setIsAdminViewOpen,
      setAdminActiveTab,
      setAiStudioPrefill,
      sendTrendToAIStudio,
      updateTrendStatus,
      addTrend,
      deleteTrend,
      startCreateContent,
      startEditContent,
      createContent,
      updateContent,
      deleteContent,
      archiveContent,
      duplicateContent,
      changeStatus,
      getContentById,
      updateCategory,
      createCategory,
      deleteCategory,
      createCollection,
      updateCollection,
      deleteCollection,
      createComparison,
      updateComparison,
      deleteComparison,
      addMediaAsset,
      deleteMediaAsset,
      getPublicPublishedItems,
      getPublicCategories,
      getCategoryPublishedCount
    }),
    [items, categories, collections, comparisons, mediaAssets, trends, aiStudioPrefill, isAdminViewOpen, adminActiveTab, editingItemId]
  );

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
