import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CommunityProduct,
  CommunityComment,
  CommunityProductStats,
  CommunitySortFilter,
  CommunityMainCategory,
  ReportReason,
  ItemCommunityStats,
  UserVote,
  CommunityProductStatus,
  CommunityUser,
  CommunityUserRole,
  CommunityUserStatus,
  CommunityReportItem
} from '../types/community';
import { calculateProductStats, sortCommunityProducts } from '../utils/communityRanking';
import { apiClient } from '../services/apiClient';

interface CommunityContextType {
  // Products
  products: CommunityProduct[];
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedProduct: CommunityProduct | null;
  getProduct: (id: string) => CommunityProduct | undefined;
  getRelatedProducts: (product: CommunityProduct, limit?: number) => CommunityProduct[];
  getProductStats: (productId: string) => CommunityProductStats;

  // Admin Product Operations
  addProduct: (product: Partial<CommunityProduct>) => CommunityProduct;
  updateProduct: (id: string, updates: Partial<CommunityProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductPin: (id: string) => void;
  toggleProductTrending: (id: string) => void;
  toggleProductFeatured: (id: string) => void;
  setProductStatus: (id: string, status: CommunityProductStatus) => void;
  recordProductClick: (id: string, isAffiliate?: boolean, targetUrl?: string) => void;
  recordProductShare: (id: string) => void;
  recordProductView: (id: string) => void;

  // Filters & State
  mainCategory: 'all' | 'digital' | 'physical';
  setMainCategory: (category: 'all' | 'digital' | 'physical') => void;
  subCategory: string;
  setSubCategory: (subcategory: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortFilter: CommunitySortFilter;
  setSortFilter: (filter: CommunitySortFilter) => void;
  filteredProducts: CommunityProduct[];

  // User Actions on Products
  toggleLikeProduct: (productId: string) => boolean;
  toggleSaveProduct: (productId: string) => boolean;
  isProductLiked: (productId: string) => boolean;
  isProductSaved: (productId: string) => boolean;

  // Comments & Reviews
  comments: CommunityComment[];
  getProductComments: (productId: string) => CommunityComment[];
  addComment: (data: {
    productId: string;
    authorName: string;
    rating?: number;
    title?: string;
    content: string;
    honeypot?: string;
  }) => { success: boolean; error?: string };
  updateComment: (commentId: string, updates: { content: string; title?: string; rating?: number }) => Promise<{ success: boolean; error?: string }>;
  reportComment: (commentId: string, reason: ReportReason) => { success: boolean; message: string };
  hideComment: (commentId: string) => void;
  unhideComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  approveComment: (commentId: string) => void;
  markCommentHelpful: (commentId: string) => { success: boolean; message: string };

  // Moderation Queue & Reports
  reviews: (CommunityComment & { itemId: string })[];
  approveReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  dismissReviewReports: (reviewId: string) => void;
  hideReview: (reviewId: string) => void;
  unhideReview: (reviewId: string) => void;
  reports: CommunityReportItem[];
  addReport: (report: Partial<CommunityReportItem>) => void;
  updateReportStatus: (id: string, status: 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended', notes?: string) => void;
  deleteReport: (id: string) => void;

  // User Moderation
  users: CommunityUser[];
  updateUserStatus: (id: string, status: CommunityUserStatus) => void;
  updateUserRole: (id: string, role: CommunityUserRole) => void;
  deleteUser: (id: string) => void;

  // Legacy compatibility helpers
  getCommunityStats: (itemId: string) => ItemCommunityStats;
  voteItem: (itemId: string, vote: 'like' | 'dislike') => { success: boolean; message: string };
  rateItem: (itemId: string, rating: number) => { success: boolean; message: string };
  getItemReviews: (itemId: string) => any[];
  addReview: (
    itemId: string,
    itemType: any,
    authorName: string,
    rating: number,
    title: string,
    content: string,
    honeypot?: string
  ) => { success: boolean; error?: string };
  markReviewHelpful: (reviewId: string) => { success: boolean; message: string };
  reportReview: (reviewId: string, reason: ReportReason, details?: string) => { success: boolean; message: string };
  communitySortFilter: CommunitySortFilter;
  setCommunitySortFilter: (filter: CommunitySortFilter) => void;
  isRateLimited: boolean;
  rateLimitRemainingSeconds: number;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Local storage persistence keys
const STORAGE_PRODUCTS_KEY = 'prism_community_products_v2';
const STORAGE_COMMENTS_KEY = 'prism_community_comments_v2';
const STORAGE_LIKED_PRODUCTS_KEY = 'prism_user_liked_products_v2';
const STORAGE_SAVED_PRODUCTS_KEY = 'prism_user_saved_products_v2';
const STORAGE_REPORTED_COMMENTS_KEY = 'prism_user_reported_comments_v2';
const STORAGE_HELPFUL_COMMENTS_KEY = 'prism_user_helpful_comments_v2';
const STORAGE_USER_HIDDEN_KEY = 'prism_user_hidden_comments_v2';
const STORAGE_LAST_COMMENT_TIME_KEY = 'prism_last_comment_timestamp_v2';

const COMMENT_COOLDOWN_SECONDS = 10;

const isMockCommunityId = (id: string) =>
  id.startsWith('prod-dig-') ||
  id.startsWith('prod-phy-') ||
  id.startsWith('comm-') ||
  id.startsWith('usr-') ||
  id.startsWith('rep-');

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products Store (Starts empty for production, waiting for real items)
  const [products, setProducts] = useState<CommunityProduct[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => p && p.id && !isMockCommunityId(p.id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 2. Comments Store
  const [comments, setComments] = useState<CommunityComment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !isMockCommunityId(c.id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 3. User Likes
  const [userLikes, setUserLikes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LIKED_PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 4. User Saves
  const [userSaves, setUserSaves] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 5. User Reported Comments
  const [userReportedComments, setUserReportedComments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REPORTED_COMMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 6. User Helpful Votes
  const [userHelpfulComments, setUserHelpfulComments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HELPFUL_COMMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 7. Client-side hidden comments
  const [userHiddenComments, setUserHiddenComments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_HIDDEN_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 8. Moderation Reports Store
  const [reports, setReports] = useState<CommunityReportItem[]>(() => {
    try {
      const stored = localStorage.getItem('prism_community_reports_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => r && r.id && !isMockCommunityId(r.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // 9. Community Users Store
  const [users, setUsers] = useState<CommunityUser[]>(() => {
    try {
      const stored = localStorage.getItem('prism_community_users_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((u: any) => u && u.id && !isMockCommunityId(u.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('prism_community_reports_v1', JSON.stringify(reports));
    } catch (e) {
      console.warn(e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('prism_community_users_v1', JSON.stringify(users));
    } catch (e) {
      console.warn(e);
    }
  }, [users]);

  // Sync initial data from real database backend
  useEffect(() => {
    let isMounted = true;
    apiClient.fetchProducts({ admin: true }).then(res => {
      if (isMounted && res && Array.isArray(res.products)) {
        setProducts(res.products);
      }
    }).catch(err => {
      console.warn('Could not load products from backend:', err);
    });

    apiClient.fetchReports().then(res => {
      if (isMounted && res && Array.isArray(res.reports)) {
        setReports(res.reports);
      }
    }).catch(() => {});

    apiClient.listUsers().then(res => {
      if (isMounted && res && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    }).catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Product Admin Actions
  const addProduct = useCallback((productData: Partial<CommunityProduct>): CommunityProduct => {
    const newId = `prod-${Date.now()}`;
    const slug = productData.slug || (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: CommunityProduct = {
      id: newId,
      name: productData.name || 'New Product',
      slug,
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      mainCategory: productData.mainCategory || 'digital',
      category: productData.category || (productData.mainCategory === 'physical' ? 'Smartphones' : 'AI tools'),
      image: productData.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      logo: productData.logo || productData.image,
      keyFeatures: productData.keyFeatures || [],
      priceStatus: productData.priceStatus || 'Free',
      officialWebsiteUrl: productData.officialWebsiteUrl || '',
      affiliateUrl: productData.affiliateUrl || '',
      affiliateCtaText: productData.affiliateCtaText || 'Try Now',
      affiliateDisclosure: productData.affiliateDisclosure || 'PRISM is reader-supported with verified outbound partner links.',
      featured: Boolean(productData.featured),
      tags: productData.tags || [],
      createdAt: new Date().toISOString(),
      initialLikes: productData.initialLikes || 0,
      initialSaves: productData.initialSaves || 0,
      recentActivityScore: productData.recentActivityScore || 50,
      status: productData.status || 'published',
      isPinned: Boolean(productData.isPinned),
      isTrendingManual: productData.isTrendingManual,
      sharesCount: productData.sharesCount || 0,
      referralClicks: productData.referralClicks || 0,
      viewsCount: productData.viewsCount || 0
    };

    setProducts(prev => [newProduct, ...prev]);

    // Persist to real database
    apiClient.createProduct(productData).then(res => {
      if (res && res.product) {
        setProducts(prev => [res.product, ...prev.filter(p => p.id !== newId && p.id !== res.product.id)]);
      }
    }).catch(err => {
      console.error('Failed to create product in real database:', err);
    });

    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<CommunityProduct>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    apiClient.updateProduct(id, updates).catch(err => {
      console.error('Failed to update product in database:', err);
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    apiClient.deleteProduct(id).catch(err => {
      console.error('Failed to delete product in database:', err);
    });
  }, []);

  const toggleProductPin = useCallback((id: string) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      const nextPin = !target?.isPinned;
      apiClient.updateProduct(id, { isPinned: nextPin }).catch(() => {});
      return prev.map(p => p.id === id ? { ...p, isPinned: nextPin } : p);
    });
  }, []);

  const toggleProductTrending = useCallback((id: string) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      const nextTrending = target?.isTrendingManual === undefined ? true : !target.isTrendingManual;
      const nextStatus = target?.status === 'trending' ? 'published' : 'trending';
      apiClient.updateProduct(id, { isTrendingManual: nextTrending, status: nextStatus }).catch(() => {});
      return prev.map(p => p.id === id ? { 
        ...p, 
        isTrendingManual: nextTrending,
        status: nextStatus
      } : p);
    });
  }, []);

  const toggleProductFeatured = useCallback((id: string) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      const nextFeatured = !target?.featured;
      const nextStatus = nextFeatured ? 'featured' : (target?.status === 'featured' ? 'published' : target?.status);
      apiClient.updateProduct(id, { featured: nextFeatured, status: nextStatus }).catch(() => {});
      return prev.map(p => p.id === id ? { 
        ...p, 
        featured: nextFeatured,
        status: nextStatus
      } : p);
    });
  }, []);

  const setProductStatus = useCallback((id: string, status: CommunityProductStatus) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    apiClient.updateProduct(id, { status }).catch(() => {});
  }, []);

  const recordProductClick = useCallback((id: string, isAffiliate = true, targetUrl?: string) => {
    setProducts(prev => {
      const prod = prev.find(p => p.id === id);
      apiClient.recordReferralClick({
        productId: id,
        productTitle: prod?.name || 'Product',
        category: prod?.category || 'General',
        mainCategory: prod?.mainCategory || 'digital',
        targetUrl: targetUrl || prod?.affiliateUrl || prod?.officialWebsiteUrl || 'https://prism.io',
        isAffiliate,
        referrer: document.referrer || window.location.href
      }).catch(e => console.warn('Referral click tracking error:', e));
      return prev.map(p => p.id === id ? { ...p, referralClicks: (p.referralClicks || 0) + 1 } : p);
    });
  }, []);

  const recordProductShare = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p));
    apiClient.recordProductShare(id).catch(() => {});
  }, []);

  const recordProductView = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p));
    apiClient.recordProductView(id).catch(() => {});
  }, []);

  // Reports
  const addReport = useCallback((report: Partial<CommunityReportItem>) => {
    const newReport: CommunityReportItem = {
      id: `rep-${Date.now()}`,
      targetType: report.targetType || 'comment',
      targetId: report.targetId || '',
      targetTitle: report.targetTitle || '',
      content: report.content || '',
      authorName: report.authorName || 'Anonymous',
      reporterName: report.reporterName || 'Community Member',
      reason: report.reason || 'spam',
      date: new Date().toISOString(),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);
    apiClient.submitReport(report).then(res => {
      if (res && res.report) {
        setReports(prev => [res.report, ...prev.filter(r => r.id !== newReport.id && r.id !== res.report.id)]);
      }
    }).catch(e => console.warn('Report submit error:', e));
  }, []);

  const updateReportStatus = useCallback((id: string, status: 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended', notes?: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status, actionNotes: notes || r.actionNotes } : r));
    apiClient.updateReport(id, status, notes).catch(e => console.warn('Report update error:', e));
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    apiClient.deleteReport(id).catch(e => console.warn('Report delete error:', e));
  }, []);

  // Users
  const updateUserStatus = useCallback((id: string, status: CommunityUserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    apiClient.updateUserStatus(id, status).catch(e => console.warn('User status update error:', e));
  }, []);

  const updateUserRole = useCallback((id: string, role: CommunityUserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    apiClient.updateUserRole(id, role).catch(e => console.warn('User role update error:', e));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    apiClient.deleteUser(id).catch(e => console.warn('User delete error:', e));
  }, []);

  // Navigation & Filtering State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mainCategory, setMainCategory] = useState<'all' | 'digital' | 'physical'>('all');
  const [subCategory, setSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortFilter, setSortFilter] = useState<CommunitySortFilter>('trending');

  // Rate Limiter
  const [lastCommentTimestamp, setLastCommentTimestamp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LAST_COMMENT_TIME_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedSeconds = Math.floor((currentTime - lastCommentTimestamp) / 1000);
  const isRateLimited = elapsedSeconds < COMMENT_COOLDOWN_SECONDS;
  const rateLimitRemainingSeconds = Math.max(0, COMMENT_COOLDOWN_SECONDS - elapsedSeconds);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
    } catch (e) {
      console.warn(e);
    }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIKED_PRODUCTS_KEY, JSON.stringify(userLikes));
    } catch (e) {
      console.warn(e);
    }
  }, [userLikes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_PRODUCTS_KEY, JSON.stringify(userSaves));
    } catch (e) {
      console.warn(e);
    }
  }, [userSaves]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REPORTED_COMMENTS_KEY, JSON.stringify(userReportedComments));
    } catch (e) {
      console.warn(e);
    }
  }, [userReportedComments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HELPFUL_COMMENTS_KEY, JSON.stringify(userHelpfulComments));
    } catch (e) {
      console.warn(e);
    }
  }, [userHelpfulComments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_HIDDEN_KEY, JSON.stringify(userHiddenComments));
    } catch (e) {
      console.warn(e);
    }
  }, [userHiddenComments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_COMMENT_TIME_KEY, lastCommentTimestamp.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [lastCommentTimestamp]);

  // Selected product lookup
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  const getProduct = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const getProductStats = useCallback(
    (productId: string): CommunityProductStats => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) {
        return {
          likes: 0,
          saves: 0,
          commentCount: 0,
          recentActivityScore: 0,
          engagementQualityScore: 50,
          trendingScore: 0,
          isTrending: false,
          averageRating: null,
          ratingCount: 0,
          isLikedByUser: false,
          isSavedByUser: false
        };
      }
      return calculateProductStats(
        prod,
        comments,
        userLikes.includes(productId),
        userSaves.includes(productId)
      );
    },
    [products, comments, userLikes, userSaves]
  );

  const getRelatedProducts = useCallback(
    (product: CommunityProduct, limit: number = 4): CommunityProduct[] => {
      return products
        .filter((p) => p.id !== product.id && (p.mainCategory === product.mainCategory || p.category === product.category))
        .slice(0, limit);
    },
    [products]
  );

  // User product interactions
  const toggleLikeProduct = useCallback((productId: string): boolean => {
    let nowLiked = false;
    setUserLikes((prev) => {
      if (prev.includes(productId)) {
        nowLiked = false;
        return prev.filter((id) => id !== productId);
      } else {
        nowLiked = true;
        return [...prev, productId];
      }
    });

    apiClient.toggleLikeProduct(productId).then(res => {
      if (res && typeof res.totalLikes === 'number') {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, initialLikes: res.totalLikes } : p));
      }
    }).catch(e => {
      console.warn('Backend like sync error:', e);
    });

    return nowLiked;
  }, []);

  const toggleSaveProduct = useCallback((productId: string): boolean => {
    let nowSaved = false;
    setUserSaves((prev) => {
      if (prev.includes(productId)) {
        nowSaved = false;
        return prev.filter((id) => id !== productId);
      } else {
        nowSaved = true;
        return [...prev, productId];
      }
    });

    apiClient.toggleSaveProduct(productId).then(res => {
      if (res && typeof res.totalSaves === 'number') {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, initialSaves: res.totalSaves } : p));
      }
    }).catch(e => {
      console.warn('Backend save sync error:', e);
    });

    return nowSaved;
  }, []);

  const isProductLiked = useCallback((productId: string) => userLikes.includes(productId), [userLikes]);
  const isProductSaved = useCallback((productId: string) => userSaves.includes(productId), [userSaves]);

  // Comments operations
  const getProductComments = useCallback(
    (productId: string): CommunityComment[] => {
      return comments
        .filter((c) => c.productId === productId)
        .map((c) => ({
          ...c,
          isReportedByCurrentUser: userReportedComments.includes(c.id),
          isHelpfulByCurrentUser: userHelpfulComments.includes(c.id),
          isUserHidden: userHiddenComments.includes(c.id) || c.status === 'hidden'
        }))
        .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [comments, userReportedComments, userHelpfulComments, userHiddenComments]
  );

  const addComment = useCallback(
    (data: {
      productId: string;
      authorName: string;
      rating?: number;
      title?: string;
      content: string;
      honeypot?: string;
    }) => {
      if (data.honeypot && data.honeypot.trim().length > 0) {
        return { success: false, error: 'Spam submission blocked.' };
      }

      const now = Date.now();
      const elapsed = Math.floor((now - lastCommentTimestamp) / 1000);
      if (elapsed < COMMENT_COOLDOWN_SECONDS) {
        return {
          success: false,
          error: `Please wait ${COMMENT_COOLDOWN_SECONDS - elapsed}s before posting again.`
        };
      }

      const author = data.authorName.trim() || 'Community Member';
      const cleanContent = data.content.trim();

      if (cleanContent.length < 5) {
        return { success: false, error: 'Review/comment must be at least 5 characters.' };
      }

      if (cleanContent.length > 2000) {
        return { success: false, error: 'Review/comment must not exceed 2000 characters.' };
      }

      const newComment: CommunityComment = {
        id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: data.productId,
        authorName: author,
        rating: data.rating && data.rating >= 1 && data.rating <= 5 ? data.rating : undefined,
        title: data.title?.trim() || undefined,
        content: cleanContent,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        reportedCount: 0,
        status: 'published'
      };

      setComments((prev) => [newComment, ...prev]);
      setLastCommentTimestamp(now);

      // Persist to real backend
      apiClient.addProductComment(data.productId, {
        rating: data.rating,
        title: data.title,
        content: cleanContent
      }).then(res => {
        if (res && res.comment) {
          setComments(prev => [res.comment, ...prev.filter(c => c.id !== newComment.id && c.id !== res.comment.id)]);
        }
      }).catch(err => {
        console.warn('Backend comment error:', err);
      });

      // Boost recent activity score on product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId
            ? { ...p, recentActivityScore: Math.min(100, p.recentActivityScore + 5) }
            : p
        )
      );

      return { success: true };
    },
    [lastCommentTimestamp]
  );

  const updateComment = useCallback(
    async (commentId: string, updates: { content: string; title?: string; rating?: number }) => {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      try {
        const res = await apiClient.updateProductComment(commentId, updates);
        if (res && res.comment) {
          setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...res.comment } : c));
        }
        return { success: true };
      } catch (err: any) {
        console.warn('Backend comment update warning:', err);
        return { success: true };
      }
    },
    []
  );

  const reportComment = useCallback(
    (commentId: string, reason: ReportReason) => {
      if (userReportedComments.includes(commentId)) {
        return { success: false, message: 'You have already reported this comment.' };
      }

      setUserReportedComments((prev) => [...prev, commentId]);

      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const nextCount = c.reportedCount + 1;
          const updatedReasons = [...(c.reportReasons || []), reason];
          const nextStatus = nextCount >= 2 ? 'flagged' : 'under_review';
          return {
            ...c,
            reportedCount: nextCount,
            reportReasons: updatedReasons,
            status: nextStatus
          };
        })
      );

      apiClient.submitReport({
        targetType: 'comment',
        targetId: commentId,
        reason,
        content: `Reported for: ${reason}`
      }).catch(() => {});

      return {
        success: true,
        message: 'Thank you. The comment has been flagged for moderation review.'
      };
    },
    [userReportedComments]
  );

  const hideComment = useCallback((commentId: string) => {
    setUserHiddenComments((prev) => {
      if (prev.includes(commentId)) return prev;
      return [...prev, commentId];
    });
  }, []);

  const unhideComment = useCallback((commentId: string) => {
    setUserHiddenComments((prev) => prev.filter((id) => id !== commentId));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'published' } : c))
    );
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    apiClient.deleteProductComment(commentId).catch(err => {
      console.warn('Backend comment delete warning:', err);
    });
  }, []);

  const approveComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, status: 'published', reportedCount: 0, reportReasons: [] }
          : c
      )
    );
    apiClient.moderateProductComment(commentId, 'approve').catch(() => {});
  }, []);

  const markCommentHelpful = useCallback(
    (commentId: string) => {
      if (userHelpfulComments.includes(commentId)) {
        setUserHelpfulComments((prev) => prev.filter((id) => id !== commentId));
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, helpfulCount: Math.max(0, c.helpfulCount - 1) } : c))
        );
        return { success: true, message: 'Helpful vote removed' };
      } else {
        setUserHelpfulComments((prev) => [...prev, commentId]);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, helpfulCount: c.helpfulCount + 1 } : c))
        );
        apiClient.voteCommentHelpful(commentId).catch(() => {});
        return { success: true, message: 'Marked as helpful!' };
      }
    },
    [userHelpfulComments]
  );

  // Admin moderation reviews proxy
  const reviews = useMemo(() => {
    return comments.map((c) => ({
      ...c,
      itemId: c.productId
    }));
  }, [comments]);

  const approveReview = approveComment;
  const deleteReview = deleteComment;
  const dismissReviewReports = approveComment;
  const hideReview = useCallback((reviewId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === reviewId ? { ...c, status: 'hidden' } : c))
    );
  }, []);
  const unhideReview = useCallback((reviewId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === reviewId ? { ...c, status: 'published' } : c))
    );
  }, []);

  // Filtered & Ranked Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Main category filter
    if (mainCategory === 'digital') {
      result = result.filter((p) => p.mainCategory === 'digital');
    } else if (mainCategory === 'physical') {
      result = result.filter((p) => p.mainCategory === 'physical');
    }

    // Subcategory filter
    if (subCategory && subCategory !== 'all' && !subCategory.startsWith('All ')) {
      result = result.filter((p) => p.category.toLowerCase() === subCategory.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort according to multi-factor algorithm
    return sortCommunityProducts(result, comments, userLikes, userSaves, sortFilter);
  }, [products, comments, userLikes, userSaves, mainCategory, subCategory, searchQuery, sortFilter]);

  // Legacy fallback implementations to ensure nothing in old components breaks
  const getCommunityStats = useCallback(
    (itemId: string): ItemCommunityStats => {
      const prodStats = getProductStats(itemId);
      return {
        likes: prodStats.likes,
        dislikes: 0,
        userVote: prodStats.isLikedByUser ? 'like' : null,
        ratingCount: prodStats.ratingCount,
        averageRating: prodStats.averageRating,
        userRating: null,
        reviewCount: prodStats.commentCount,
        saveCount: prodStats.saves
      };
    },
    [getProductStats]
  );

  const voteItem = useCallback(
    (itemId: string, vote: 'like' | 'dislike') => {
      if (vote === 'like') {
        const liked = toggleLikeProduct(itemId);
        return { success: true, message: liked ? 'Liked!' : 'Like removed' };
      }
      return { success: true, message: 'Vote recorded' };
    },
    [toggleLikeProduct]
  );

  const rateItem = useCallback(
    (itemId: string, rating: number) => {
      return { success: true, message: `Rated ${rating} stars!` };
    },
    []
  );

  const getItemReviews = useCallback(
    (itemId: string) => {
      return getProductComments(itemId);
    },
    [getProductComments]
  );

  const addReview = useCallback(
    (itemId: string, _type: any, authorName: string, rating: number, title: string, content: string, honeypot?: string) => {
      return addComment({
        productId: itemId,
        authorName,
        rating,
        title,
        content,
        honeypot
      });
    },
    [addComment]
  );

  const markReviewHelpful = markCommentHelpful;
  const reportReview = reportComment;

  return (
    <CommunityContext.Provider
      value={{
        products,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        getProduct,
        getRelatedProducts,
        getProductStats,
        // Product Admin
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductPin,
        toggleProductTrending,
        toggleProductFeatured,
        setProductStatus,
        recordProductClick,
        recordProductShare,
        recordProductView,
        mainCategory,
        setMainCategory,
        subCategory,
        setSubCategory,
        searchQuery,
        setSearchQuery,
        sortFilter,
        setSortFilter,
        filteredProducts,
        toggleLikeProduct,
        toggleSaveProduct,
        isProductLiked,
        isProductSaved,
        comments,
        getProductComments,
        addComment,
        updateComment,
        reportComment,
        hideComment,
        unhideComment,
        deleteComment,
        approveComment,
        markCommentHelpful,
        reviews,
        approveReview,
        deleteReview,
        dismissReviewReports,
        hideReview,
        unhideReview,
        // Reports
        reports,
        addReport,
        updateReportStatus,
        deleteReport,
        // Users
        users,
        updateUserStatus,
        updateUserRole,
        deleteUser,
        getCommunityStats,
        voteItem,
        rateItem,
        getItemReviews,
        addReview,
        markReviewHelpful,
        reportReview,
        communitySortFilter: sortFilter,
        setCommunitySortFilter: setSortFilter,
        isRateLimited,
        rateLimitRemainingSeconds
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
