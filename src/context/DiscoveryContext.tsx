import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DiscoveryItem, CategoryType, FeedTab, ViewMode, PageRoute, UserInterest } from '../types/discovery';
import { DirectoryItem, CuratedList, DirectoryCategory } from '../types/directory';
import { useCMS } from './CMSContext';
import { useAnalytics } from './AnalyticsContext';
import { cmsToDiscoveryItem, cmsToDirectoryItem } from '../utils/cmsAdapters';

export const PUBLIC_CATEGORIES: CategoryType[] = [
  'AI & Tools',
  'Tech',
  'Movies & TV',
  'Manhwa & Anime'
];

export const DIRECTORY_SECTIONS: { id: DirectoryCategory; name: string; route: PageRoute; icon: string; count: number }[] = [
  { id: 'ai-tools', name: 'AI Tools', route: 'directory-ai', icon: '⚡', count: 3 },
  { id: 'tech-products', name: 'Tech Products', route: 'directory-tech', icon: '📟', count: 2 },
  { id: 'movies', name: 'Movies', route: 'directory-movies', icon: '🎬', count: 2 },
  { id: 'manhwa', name: 'Manhwa', route: 'directory-manhwa', icon: '📜', count: 2 },
  { id: 'anime', name: 'Anime', route: 'directory-anime', icon: '✨', count: 2 }
];

export const AVAILABLE_INTERESTS: { id: UserInterest; label: string; description: string; emoji: string; category: CategoryType }[] = [
  { id: 'AI', label: 'AI', description: '3D Splatting, Neural Radiance & Spatial IDEs', emoji: '⚡', category: 'AI & Tools' },
  { id: 'Tech', label: 'Tech', description: 'Cyberdecks, Photonics & Quantum Hardware', emoji: '📟', category: 'Tech' },
  { id: 'Movies', label: 'Movies', description: 'Cinematography, Severance & IMAX Optics', emoji: '🎬', category: 'Movies & TV' },
  { id: 'Manhwa', label: 'Manhwa', description: 'Solo Leveling, Webtoon Pacing & ORV', emoji: '📜', category: 'Manhwa & Anime' },
  { id: 'Anime', label: 'Anime', description: 'Sakuga Animation, MAPPA & Scenic Art', emoji: '✨', category: 'Manhwa & Anime' }
];

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'undo';
  undoAction?: () => void;
}

interface DiscoveryContextType {
  items: DiscoveryItem[];
  filteredItems: DiscoveryItem[];
  currentRoute: PageRoute;
  navigateTo: (route: PageRoute, itemId?: string) => void;
  activeDetailItem: DiscoveryItem | null;
  
  // Structured Directory State
  directoryItems: DirectoryItem[];
  curatedLists: CuratedList[];
  activeDirectoryItemId: string | null;
  activeCuratedListId: string | null;
  compareItemIds: string[];
  openDirectoryItem: (id: string) => void;
  openCuratedList: (id: string) => void;
  openComparison: (ids: string[]) => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  getDirectoryItem: (id: string) => DirectoryItem | undefined;
  getCuratedList: (id: string) => CuratedList | undefined;

  // Category & Feed controls
  activeCategory: CategoryType | 'All';
  setActiveCategory: (cat: CategoryType | 'All') => void;
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Personalization & Interests
  selectedInterests: UserInterest[];
  toggleInterest: (interest: UserInterest) => void;
  setInterests: (interests: UserInterest[]) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (interests: UserInterest[]) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isInterestsManagerOpen: boolean;
  setIsInterestsManagerOpen: (open: boolean) => void;
  
  // Engagement tracking (localStorage backed)
  viewedIds: string[];
  markAsViewed: (id: string) => void;
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  savedItems: DiscoveryItem[];
  
  // Likes / Sparks
  sparksMap: Record<string, number>;
  userSparkedIds: string[];
  toggleSpark: (id: string) => void;
  isSparked: (id: string) => boolean;
  
  // Negative signals & instant feed tuning
  notInterestedIds: string[];
  markAsNotInterested: (id: string) => void;
  undoNotInterested: (id: string) => void;
  boostedTags: string[];
  showMoreLikeThis: (item: DiscoveryItem) => void;
  clearPersonalizationHistory: () => void;
  
  // Sharing helper
  shareItem: (item: DiscoveryItem | DirectoryItem) => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'undo', undoAction?: () => void) => void;
  
  // Modals & Overlays
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSavedOpen: boolean;
  setIsSavedOpen: (open: boolean) => void;
  
  // Recommendation helpers
  getRelatedItems: (item: DiscoveryItem, limit?: number) => DiscoveryItem[];
  getMoreLikeThis: (item: DiscoveryItem, limit?: number) => DiscoveryItem[];
  
  resetFeed: () => void;
}

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(undefined);

// Storage keys
const ONBOARDING_KEY = 'prism_onboarding_completed_v1';
const INTERESTS_KEY = 'prism_user_interests_v1';
const SAVED_STORAGE_KEY = 'prism_saved_items_v2';
const SPARKED_STORAGE_KEY = 'prism_sparked_items_v2';
const VIEWED_STORAGE_KEY = 'prism_viewed_items_v1';
const NOT_INTERESTED_KEY = 'prism_not_interested_v1';
const BOOSTED_TAGS_KEY = 'prism_boosted_tags_v1';
const COMPARE_KEY = 'prism_compare_ids_v1';

export const DiscoveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getPublicPublishedItems, collections: cmsCollections } = useCMS();
  const { trackPageView, trackSave, trackLike, trackShare, trackContentOpen } = useAnalytics();

  // Dynamically derive public discovery items and directory items from CMS
  const items = useMemo(() => {
    const published = getPublicPublishedItems();
    return published.map(cmsToDiscoveryItem);
  }, [getPublicPublishedItems]);

  const directoryItems = useMemo(() => {
    const published = getPublicPublishedItems();
    return published.map(cmsToDirectoryItem);
  }, [getPublicPublishedItems]);

  const curatedLists = useMemo<CuratedList[]>(() => {
    return cmsCollections.map((col) => ({
      id: col.id,
      title: col.title,
      subtitle: col.subtitle,
      category: (col.categoryId === 'cat-ai' ? 'ai-tools' : col.categoryId === 'cat-tech' ? 'tech-products' : col.categoryId === 'cat-movies' ? 'movies' : col.categoryId === 'cat-anime' ? 'manhwa' : 'all') as any,
      categoryName: col.categoryName,
      type: col.type,
      itemIds: col.itemIds,
      curatorNotes: col.curatorNotes,
      targetAudience: col.targetAudience,
      updatedAt: col.updatedAt
    }));
  }, [cmsCollections]);

  const [currentRoute, setCurrentRoute] = useState<PageRoute>('for-you');
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [activeDirectoryItemId, setActiveDirectoryItemId] = useState<string | null>(null);
  const [activeCuratedListId, setActiveCuratedListId] = useState<string | null>(null);

  // Side-by-side comparison state
  const [compareItemIds, setCompareItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      return stored ? JSON.parse(stored) : ['tool-01', 'tool-02'];
    } catch {
      return ['tool-01', 'tool-02'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(compareItemIds));
    } catch (e) {
      console.warn(e);
    }
  }, [compareItemIds]);

  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [isInterestsManagerOpen, setIsInterestsManagerOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'undo' = 'success', undoAction?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev.slice(-3), { id, message, type, undoAction }]);
    if (!undoAction) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3200);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- PERSONALIZATION STATE (localStorage) ---
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [selectedInterests, setSelectedInterests] = useState<UserInterest[]>(() => {
    try {
      const stored = localStorage.getItem(INTERESTS_KEY);
      return stored ? JSON.parse(stored) : ['AI', 'Tech', 'Movies', 'Manhwa', 'Anime'];
    } catch {
      return ['AI', 'Tech', 'Movies', 'Manhwa', 'Anime'];
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['ai-01', 'mov-01'];
    } catch {
      return ['ai-01', 'mov-01'];
    }
  });

  const [userSparkedIds, setUserSparkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SPARKED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['ai-01'];
    } catch {
      return ['ai-01'];
    }
  });

  const [viewedIds, setViewedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(VIEWED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notInterestedIds, setNotInterestedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(NOT_INTERESTED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [boostedTags, setBoostedTags] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BOOSTED_TAGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [sparksMap, setSparksMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    return initial;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, hasCompletedOnboarding ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    try {
      localStorage.setItem(INTERESTS_KEY, JSON.stringify(selectedInterests));
    } catch (e) {
      console.warn(e);
    }
  }, [selectedInterests]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(SPARKED_STORAGE_KEY, JSON.stringify(userSparkedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [userSparkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(viewedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [viewedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(NOT_INTERESTED_KEY, JSON.stringify(notInterestedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [notInterestedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOSTED_TAGS_KEY, JSON.stringify(boostedTags));
    } catch (e) {
      console.warn(e);
    }
  }, [boostedTags]);

  // Complete onboarding
  const completeOnboarding = useCallback((chosen: UserInterest[]) => {
    const finalInterests = chosen.length > 0 ? chosen : (['AI', 'Tech', 'Movies', 'Manhwa', 'Anime'] as UserInterest[]);
    setSelectedInterests(finalInterests);
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
    showToast(`Personalized your feed for: ${finalInterests.join(', ')}`, 'success');
  }, [showToast]);

  const toggleInterest = useCallback((interest: UserInterest) => {
    setSelectedInterests(prev => {
      const exists = prev.includes(interest);
      if (exists && prev.length === 1) {
        showToast('Please keep at least one interest selected', 'info');
        return prev;
      }
      const updated = exists ? prev.filter(i => i !== interest) : [...prev, interest];
      showToast(exists ? `Removed ${interest} from interests` : `Added ${interest} to interests`, 'info');
      return updated;
    });
  }, [showToast]);

  const setInterests = useCallback((interests: UserInterest[]) => {
    setSelectedInterests(interests);
    showToast('Updated your interest preferences', 'success');
  }, [showToast]);

  // Track item view
  const markAsViewed = useCallback((id: string) => {
    setViewedIds(prev => prev.includes(id) ? prev : [...prev.slice(-30), id]);
  }, []);

  // Save / Bookmark
  const toggleSave = useCallback((id: string) => {
    const item = items.find(i => i.id === id) || directoryItems.find(d => d.id === id);
    setSavedIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      showToast(exists ? 'Removed from saved' : 'Saved to your collection', 'success');
      if (item) {
        trackSave({ id: item.id, title: item.title, category: item.category }, !exists);
      }
      return updated;
    });
  }, [items, directoryItems, showToast, trackSave]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  // Spark / Like
  const toggleSpark = useCallback((id: string) => {
    const item = items.find(i => i.id === id) || directoryItems.find(d => d.id === id);
    setUserSparkedIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      setSparksMap(current => ({
        ...current,
        [id]: (current[id] ?? 0) + (exists ? -1 : 1)
      }));
      showToast(exists ? 'Unsparked' : 'Sparked discovery! ✨', 'success');
      if (item) {
        trackLike({ id: item.id, title: item.title, category: item.category }, exists ? 'dislike' : 'like');
      }
      return updated;
    });
  }, [items, directoryItems, showToast, trackLike]);

  const isSparked = useCallback((id: string) => userSparkedIds.includes(id), [userSparkedIds]);

  // "Not Interested" action
  const markAsNotInterested = useCallback((id: string) => {
    const item = items.find(i => i.id === id) || directoryItems.find(d => d.id === id);
    setNotInterestedIds(prev => [...new Set([...prev, id])]);

    showToast(
      `Removed "${item?.title?.substring(0, 24) || 'item'}..." from your feed`,
      'undo',
      () => {
        setNotInterestedIds(prev => prev.filter(x => x !== id));
        showToast('Restored item to feed', 'info');
      }
    );
  }, [items, directoryItems, showToast]);

  const undoNotInterested = useCallback((id: string) => {
    setNotInterestedIds(prev => prev.filter(x => x !== id));
    showToast('Restored item to feed', 'info');
  }, [showToast]);

  // "Show More Like This" action
  const showMoreLikeThis = useCallback((item: DiscoveryItem) => {
    const newTags = item.tags.slice(0, 2);
    setBoostedTags(prev => [...new Set([...prev, ...newTags])]);
    showToast(`Tuned feed: showing more like "${item.title.substring(0, 20)}..."`, 'success');
  }, [showToast]);

  // Share action
  const shareItem = useCallback(async (item: DiscoveryItem | DirectoryItem) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#item-${item.id}`;
    const shareData = {
      title: item.title,
      text: `${item.title} — ${item.tagline}`,
      url: shareUrl
    };

    trackShare({ id: item.id, title: item.title, category: item.category }, 'copy_link');

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully', 'success');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard! 📋', 'success');
    } catch {
      showToast('Could not copy link', 'info');
    }
  }, [showToast, trackShare]);

  // Clear Personalization history
  const clearPersonalizationHistory = useCallback(() => {
    setViewedIds([]);
    setNotInterestedIds([]);
    setBoostedTags([]);
    showToast('Cleared view history and negative signals', 'info');
  }, [showToast]);

  // Directory Helpers
  const getDirectoryItem = useCallback((id: string) => {
    return directoryItems.find(item => item.id === id || item.slug === id);
  }, [directoryItems]);

  const getCuratedList = useCallback((id: string) => {
    return curatedLists.find(list => list.id === id);
  }, [curatedLists]);

  const openDirectoryItem = useCallback((id: string) => {
    setActiveDirectoryItemId(id);
    setCurrentRoute('directory-item');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openCuratedList = useCallback((id: string) => {
    setActiveCuratedListId(id);
    setCurrentRoute('curated-list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openComparison = useCallback((ids: string[]) => {
    setCompareItemIds(ids);
    setCurrentRoute('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToCompare = useCallback((id: string) => {
    setCompareItemIds(prev => {
      if (prev.includes(id)) {
        showToast('Already in comparison list', 'info');
        return prev;
      }
      if (prev.length >= 3) {
        showToast('Comparison is limited to 3 items at a time', 'info');
        return prev;
      }
      const updated = [...prev, id];
      showToast('Added to comparison matrix', 'success');
      return updated;
    });
  }, [showToast]);

  const removeFromCompare = useCallback((id: string) => {
    setCompareItemIds(prev => prev.filter(x => x !== id));
    showToast('Removed from comparison', 'info');
  }, [showToast]);

  const clearCompare = useCallback(() => {
    setCompareItemIds([]);
    showToast('Cleared comparison matrix', 'info');
  }, [showToast]);

  // General Navigation
  const navigateTo = useCallback((route: PageRoute, itemId?: string) => {
    setCurrentRoute(route);
    trackPageView(route);
    if (itemId) {
      const item = items.find(i => i.id === itemId) || directoryItems.find(d => d.id === itemId);
      if (item) {
        trackContentOpen({ id: item.id, title: item.title, category: item.category, contentType: item.contentType });
      }
      if (route === 'detail') {
        setActiveDetailId(itemId);
        markAsViewed(itemId);
      } else if (route === 'directory-item') {
        setActiveDirectoryItemId(itemId);
      } else if (route === 'curated-list') {
        setActiveCuratedListId(itemId);
      }
    }
    if (route === 'category-ai') {
      setActiveCategory('AI & Tools');
    } else if (route === 'category-tech') {
      setActiveCategory('Tech');
    } else if (route === 'category-movies') {
      setActiveCategory('Movies & TV');
    } else if (route === 'category-anime') {
      setActiveCategory('Manhwa & Anime');
    } else if (route === 'for-you' || route === 'trending' || route === 'latest') {
      setActiveCategory('All');
      setActiveTab(route as FeedTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [items, directoryItems, markAsViewed, trackPageView, trackContentOpen]);

  const resetFeed = useCallback(() => {
    setActiveCategory('All');
    setSelectedTag(null);
    setSearchQuery('');
    setActiveTab('for-you');
    setCurrentRoute('for-you');
    setActiveDetailId(null);
    setActiveDirectoryItemId(null);
    setActiveCuratedListId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeDetailItem = useMemo(() => {
    if (!activeDetailId) return null;
    return items.find(item => item.id === activeDetailId) || null;
  }, [items, activeDetailId]);

  // Smart Related Content
  const getRelatedItems = useCallback((targetItem: DiscoveryItem, limit = 3): DiscoveryItem[] => {
    if (!targetItem) return [];
    const targetTags = targetItem.tags || [];
    return (items || [])
      .filter(item => item && item.id !== targetItem.id && item.category === targetItem.category && !(notInterestedIds || []).includes(item.id))
      .sort((a, b) => {
        const aTags = a.tags || [];
        const bTags = b.tags || [];
        const aShared = aTags.filter(t => targetTags.includes(t)).length;
        const bShared = bTags.filter(t => targetTags.includes(t)).length;
        return bShared - aShared || (b.heatScore || 0) - (a.heatScore || 0);
      })
      .slice(0, limit);
  }, [items, notInterestedIds]);

  // "More Like This"
  const getMoreLikeThis = useCallback((targetItem: DiscoveryItem, limit = 4): DiscoveryItem[] => {
    if (!targetItem) return [];
    const targetTags = targetItem.tags || [];
    return (items || [])
      .filter(item => item && item.id !== targetItem.id && !(notInterestedIds || []).includes(item.id))
      .sort((a, b) => {
        const aTags = a.tags || [];
        const bTags = b.tags || [];
        let aScore = aTags.filter(t => targetTags.includes(t)).length * 3;
        let bScore = bTags.filter(t => targetTags.includes(t)).length * 3;
        if (a.aspectRatio === targetItem.aspectRatio) aScore += 1;
        if (b.aspectRatio === targetItem.aspectRatio) bScore += 1;
        if (a.category === targetItem.category) aScore += 2;
        if (b.category === targetItem.category) bScore += 2;
        return (bScore + (b.heatScore || 0) / 20) - (aScore + (a.heatScore || 0) / 20);
      })
      .slice(0, limit);
  }, [items, notInterestedIds]);

  // Personalized Scoring
  const filteredItems = useMemo(() => {
    let result = [...(items || [])];

    if (currentRoute === 'for-you') {
      result = result.filter(item => item && !(notInterestedIds || []).includes(item.id));
    }

    if (activeCategory !== 'All') {
      result = result.filter(item => item && item.category === activeCategory);
    }

    if (selectedTag) {
      result = result.filter(item =>
        item && (item.tags || []).some(t => t && t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        if (!item) return false;
        const title = item.title || '';
        const tagline = item.tagline || '';
        const summary = item.summary || '';
        const category = item.category || '';
        const tags = item.tags || [];
        const authorName = item.author?.name || '';
        const whatItIs = item.quickScan?.whatItIs || '';
        const whyItMatters = item.quickScan?.whyItMatters || '';
        const keyPoints = item.quickScan?.keyPoints || [];
        return (
          title.toLowerCase().includes(q) ||
          tagline.toLowerCase().includes(q) ||
          summary.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q) ||
          tags.some(t => (t || '').toLowerCase().includes(q)) ||
          authorName.toLowerCase().includes(q) ||
          whatItIs.toLowerCase().includes(q) ||
          whyItMatters.toLowerCase().includes(q) ||
          keyPoints.some(kp => (kp || '').toLowerCase().includes(q))
        );
      });
    }

    if (currentRoute === 'trending' || activeTab === 'trending') {
      result.sort((a, b) => {
        const aSparks = sparksMap[a.id] ?? (a.metrics?.sparks || 0);
        const bSparks = sparksMap[b.id] ?? (b.metrics?.sparks || 0);
        return ((b.heatScore || 0) + bSparks / 40) - ((a.heatScore || 0) + aSparks / 40);
      });
    } else if (currentRoute === 'latest' || activeTab === 'latest') {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (currentRoute === 'for-you') {
      const safeSavedIds = savedIds || [];
      const safeSparkedIds = userSparkedIds || [];
      const safeViewedIds = viewedIds || [];
      const safeInterests = selectedInterests || [];

      const savedItemsList = (items || []).filter(i => i && safeSavedIds.includes(i.id));
      const sparkedItemsList = (items || []).filter(i => i && safeSparkedIds.includes(i.id));
      const viewedItemsList = (items || []).filter(i => i && safeViewedIds.includes(i.id));

      const affinityScores = new Map<string, number>();

      result.forEach(item => {
        if (!item) return;
        let score = (item.featured ? 25 : 0) + ((item.heatScore || 0) / 4);

        if (item.subcategory && safeInterests.includes(item.subcategory)) {
          score += 65;
        }

        const itemTags = item.tags || [];

        savedItemsList.forEach(savedItem => {
          if (!savedItem) return;
          if (savedItem.id === item.id) {
            score += 15;
          } else {
            if (savedItem.category === item.category) score += 12;
            const savedTags = savedItem.tags || [];
            const sharedTags = itemTags.filter(t => savedTags.includes(t)).length;
            score += sharedTags * 8;
          }
        });

        sparkedItemsList.forEach(sparkedItem => {
          if (!sparkedItem) return;
          if (sparkedItem.id === item.id) {
            score += 20;
          } else {
            if (sparkedItem.category === item.category) score += 15;
            const sparkedTags = sparkedItem.tags || [];
            const sharedTags = itemTags.filter(t => sparkedTags.includes(t)).length;
            score += sharedTags * 10;
          }
        });

        viewedItemsList.forEach(viewedItem => {
          if (!viewedItem) return;
          if (viewedItem.category === item.category) score += 4;
          const viewedTags = viewedItem.tags || [];
          const sharedTags = itemTags.filter(t => viewedTags.includes(t)).length;
          score += sharedTags * 3;
        });

        if (boostedTags && boostedTags.length > 0) {
          const boostedMatches = itemTags.filter(t => boostedTags.includes(t)).length;
          score += boostedMatches * 45;
        }

        affinityScores.set(item.id, score);
      });

      result.sort((a, b) => (affinityScores.get(b.id) ?? 0) - (affinityScores.get(a.id) ?? 0));
    }

    return result;
  }, [
    items,
    currentRoute,
    activeTab,
    activeCategory,
    selectedTag,
    searchQuery,
    sparksMap,
    notInterestedIds,
    selectedInterests,
    savedIds,
    userSparkedIds,
    viewedIds,
    boostedTags
  ]);

  const savedItems = useMemo(() => {
    const safeSavedIds = savedIds || [];
    return (items || []).filter(item => item && safeSavedIds.includes(item.id));
  }, [items, savedIds]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsSavedOpen(false);
        setIsInterestsManagerOpen(false);
        if (hasCompletedOnboarding) {
          setIsOnboardingOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasCompletedOnboarding]);

  return (
    <DiscoveryContext.Provider
      value={{
        items,
        filteredItems,
        currentRoute,
        navigateTo,
        activeDetailItem,
        directoryItems,
        curatedLists,
        activeDirectoryItemId,
        activeCuratedListId,
        compareItemIds,
        openDirectoryItem,
        openCuratedList,
        openComparison,
        addToCompare,
        removeFromCompare,
        clearCompare,
        getDirectoryItem,
        getCuratedList,
        activeCategory,
        setActiveCategory,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        viewMode,
        setViewMode,
        selectedInterests,
        toggleInterest,
        setInterests,
        hasCompletedOnboarding,
        completeOnboarding,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isInterestsManagerOpen,
        setIsInterestsManagerOpen,
        viewedIds,
        markAsViewed,
        savedIds,
        toggleSave,
        isSaved,
        savedItems,
        sparksMap,
        userSparkedIds,
        toggleSpark,
        isSparked,
        notInterestedIds,
        markAsNotInterested,
        undoNotInterested,
        boostedTags,
        showMoreLikeThis,
        clearPersonalizationHistory,
        shareItem,
        toasts,
        removeToast,
        showToast,
        isSearchOpen,
        setIsSearchOpen,
        isSavedOpen,
        setIsSavedOpen,
        getRelatedItems,
        getMoreLikeThis,
        resetFeed
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export const useDiscovery = () => {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider');
  }
  return context;
};
