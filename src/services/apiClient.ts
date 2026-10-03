import { CommunityProduct, CommunityComment, CommunityReportItem, CommunityUser } from '../types/community';
import { NovelItem, NovelChapter } from '../types/novel';

const AUTH_TOKEN_KEY = 'prism_auth_token_v1';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Could not update auth token in localStorage', e);
  }
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers
    });

    // If 404 on an auth route, attempt transparent fallback between /api/auth/ and /auth/
    if (response.status === 404) {
      let altEndpoint = '';
      if (endpoint.startsWith('/api/auth/')) {
        altEndpoint = endpoint.replace('/api/auth/', '/auth/');
      } else if (endpoint.startsWith('/auth/')) {
        altEndpoint = '/api' + endpoint;
      }
      if (altEndpoint) {
        try {
          const fallbackRes = await fetch(altEndpoint, { ...options, headers });
          if (fallbackRes.ok) {
            response = fallbackRes;
          }
        } catch {
          // ignore fallback fetch error
        }
      }
    }
  } catch {
    throw new Error('Unable to connect to the PRISM server. Please verify your internet connection.');
  }

  if (!response.ok) {
    let errorMsg = '';
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        if (errorData && typeof errorData.error === 'string') {
          errorMsg = errorData.error;
        } else if (errorData && typeof errorData.message === 'string') {
          errorMsg = errorData.message;
        }
      }
    } catch {
      // ignore JSON parse failure
    }

    if (!errorMsg) {
      switch (response.status) {
        case 400:
          errorMsg = 'Bad request. Please verify the information entered and try again.';
          break;
        case 401:
          errorMsg = 'Invalid email or password. Please verify your credentials.';
          break;
        case 403:
          errorMsg = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMsg = 'Authentication service is initializing or endpoint was not found. Please try again.';
          break;
        case 409:
          errorMsg = 'An account with this email address already exists. Please log in instead.';
          break;
        case 429:
          errorMsg = 'Too many requests. Please wait a few moments and try again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMsg = 'Authentication server is currently unavailable. Please try again in a moment.';
          break;
        default:
          errorMsg = `Server response error (${response.status}). Please try again.`;
      }
    }

    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------
  async signup(data: { name: string; email: string; password: string; avatar?: string; bio?: string }) {
    const res = await apiRequest<{ user: CommunityUser; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiRequest<{ user: CommunityUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async quickAdminLogin() {
    try {
      const res = await apiRequest<{ user: CommunityUser; token: string }>('/api/auth/quick-admin-login', {
        method: 'POST'
      });
      setAuthToken(res.token);
      return res;
    } catch {
      // Fallback: Attempt standard login with default admin credentials
      const res = await apiRequest<{ user: CommunityUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@prism.io', password: 'PrismAdmin2026!' })
      });
      setAuthToken(res.token);
      return res;
    }
  },

  async claimAdmin() {
    return apiRequest<{ user: CommunityUser; success: boolean }>('/api/auth/claim-admin', {
      method: 'POST'
    });
  },

  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async getMe() {
    return apiRequest<{ user: CommunityUser }>('/api/auth/me');
  },

  async updateProfile(updates: { name?: string; avatar?: string; bio?: string }) {
    return apiRequest<{ user: CommunityUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // -------------------------------------------------------------
  // ADMIN USERS
  // -------------------------------------------------------------
  async listUsers() {
    return apiRequest<{ users: CommunityUser[] }>('/api/users');
  },

  async updateUserStatus(id: string, status: string) {
    return apiRequest<{ user: CommunityUser }>(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async updateUserRole(id: string, role: string) {
    return apiRequest<{ user: CommunityUser }>(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  async deleteUser(id: string) {
    return apiRequest<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // PRODUCTS (DIGITAL & PHYSICAL)
  // -------------------------------------------------------------
  async fetchProducts(params: {
    mainCategory?: string;
    category?: string;
    status?: string;
    search?: string;
    admin?: boolean;
  } = {}) {
    const query = new URLSearchParams();
    if (params.mainCategory) query.set('mainCategory', params.mainCategory);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.admin) query.set('admin', 'true');

    return apiRequest<{ products: CommunityProduct[] }>(`/api/products?${query.toString()}`);
  },

  async getProduct(id: string) {
    return apiRequest<{ product: CommunityProduct; stats: any }>(`/api/products/${id}`);
  },

  async createProduct(product: Partial<CommunityProduct>) {
    return apiRequest<{ product: CommunityProduct }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  async updateProduct(id: string, updates: Partial<CommunityProduct>) {
    return apiRequest<{ product: CommunityProduct }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteProduct(id: string) {
    return apiRequest<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleLikeProduct(productId: string) {
    return apiRequest<{ isLiked: boolean; totalLikes: number }>(`/api/products/${productId}/like`, {
      method: 'POST'
    });
  },

  async toggleSaveProduct(productId: string) {
    return apiRequest<{ isSaved: boolean; totalSaves: number }>(`/api/products/${productId}/save`, {
      method: 'POST'
    });
  },

  async recordProductView(productId: string) {
    return apiRequest<{ success: boolean }>(`/api/products/${productId}/view`, {
      method: 'POST'
    });
  },

  async recordProductShare(productId: string) {
    return apiRequest<{ success: boolean }>(`/api/products/${productId}/share`, {
      method: 'POST'
    });
  },

  // Comments
  async fetchProductComments(productId: string) {
    return apiRequest<{ comments: CommunityComment[] }>(`/api/products/${productId}/comments`);
  },

  async addProductComment(productId: string, data: { rating?: number; title?: string; content: string }) {
    return apiRequest<{ comment: CommunityComment }>(`/api/products/${productId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProductComment(commentId: string, data: { content: string; title?: string; rating?: number }) {
    return apiRequest<{ comment: CommunityComment }>(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProductComment(commentId: string) {
    return apiRequest<{ success: boolean }>(`/api/comments/${commentId}`, {
      method: 'DELETE'
    });
  },

  async moderateProductComment(commentId: string, action: 'approve' | 'hide' | 'unhide') {
    return apiRequest<{ comment: CommunityComment }>(`/api/comments/${commentId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  async voteCommentHelpful(commentId: string) {
    return apiRequest<{ helpfulCount: number }>(`/api/comments/${commentId}/helpful`, {
      method: 'POST'
    });
  },

  // -------------------------------------------------------------
  // REPORTS
  // -------------------------------------------------------------
  async fetchReports() {
    return apiRequest<{ reports: CommunityReportItem[] }>('/api/reports');
  },

  async submitReport(report: Partial<CommunityReportItem>) {
    return apiRequest<{ report: CommunityReportItem }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  },

  async updateReport(reportId: string, status: string, actionNotes?: string) {
    return apiRequest<{ report: CommunityReportItem }>(`/api/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, actionNotes })
    });
  },

  async deleteReport(reportId: string) {
    return apiRequest<{ success: boolean }>(`/api/reports/${reportId}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // REFERRAL CLICKS (REAL DATABASE ONLY)
  // -------------------------------------------------------------
  async recordReferralClick(data: {
    productId: string;
    productTitle?: string;
    category?: string;
    mainCategory?: string;
    targetUrl: string;
    isAffiliate?: boolean;
    referrer?: string;
  }) {
    return apiRequest<{ success: boolean; click: any }>('/api/referrals/click', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async fetchReferralClicks() {
    return apiRequest<{ clicks: any[] }>('/api/referrals');
  },

  // -------------------------------------------------------------
  // WEB NOVELS & MANGA / MANHWA
  // -------------------------------------------------------------
  async fetchNovels(params: {
    type?: string;
    genre?: string;
    status?: string;
    search?: string;
    admin?: boolean;
  } = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.genre) query.set('genre', params.genre);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.admin) query.set('admin', 'true');

    return apiRequest<{ novels: NovelItem[] }>(`/api/novels?${query.toString()}`);
  },

  async getNovel(id: string) {
    return apiRequest<{ novel: NovelItem; chapters: NovelChapter[] }>(`/api/novels/${id}`);
  },

  async createNovel(novel: Partial<NovelItem>) {
    return apiRequest<{ novel: NovelItem }>('/api/novels', {
      method: 'POST',
      body: JSON.stringify(novel)
    });
  },

  async updateNovel(id: string, updates: Partial<NovelItem>) {
    return apiRequest<{ novel: NovelItem }>(`/api/novels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteNovel(id: string) {
    return apiRequest<{ success: boolean }>(`/api/novels/${id}`, {
      method: 'DELETE'
    });
  },

  // Chapters
  async fetchNovelChapters(novelId: string) {
    return apiRequest<{ chapters: NovelChapter[] }>(`/api/novels/${novelId}/chapters`);
  },

  async getNovelChapter(novelId: string, chapterNum: number) {
    return apiRequest<{ chapter: NovelChapter }>(`/api/novels/${novelId}/chapters/${chapterNum}`);
  },

  async addNovelChapter(novelId: string, chapter: {
    chapterNumber?: number;
    title: string;
    content: string;
    publishDate?: string;
    isFree?: boolean;
  }) {
    return apiRequest<{ chapter: NovelChapter }>(`/api/novels/${novelId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapter)
    });
  },

  async updateNovelChapter(novelId: string, chapterId: string, updates: Partial<NovelChapter>) {
    return apiRequest<{ chapter: NovelChapter }>(`/api/novels/${novelId}/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteNovelChapter(novelId: string, chapterId: string) {
    return apiRequest<{ success: boolean }>(`/api/novels/${novelId}/chapters/${chapterId}`, {
      method: 'DELETE'
    });
  },

  async reorderNovelChapters(novelId: string, orderedChapterIds: string[]) {
    return apiRequest<{ chapters: NovelChapter[] }>(`/api/novels/${novelId}/chapters/reorder`, {
      method: 'POST',
      body: JSON.stringify({ orderedChapterIds })
    });
  },

  async toggleNovelLike(novelId: string) {
    return apiRequest<{ isLiked: boolean; totalLikes: number }>(`/api/novels/${novelId}/like`, {
      method: 'POST'
    });
  },

  async toggleNovelBookmark(novelId: string) {
    return apiRequest<{ isBookmarked: boolean; totalBookmarks: number }>(`/api/novels/${novelId}/bookmark`, {
      method: 'POST'
    });
  },

  async getNovelReadingProgress(novelId: string) {
    return apiRequest<{ progress: any | null }>(`/api/novels/${novelId}/progress`);
  },

  async updateNovelReadingProgress(novelId: string, chapterNumber: number, scrollPercent: number) {
    return apiRequest<{ progress: any }>(`/api/novels/${novelId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ chapterNumber, scrollPercent })
    });
  },

  // -------------------------------------------------------------
  // USER NOVEL SUBMISSIONS WORKFLOW
  // -------------------------------------------------------------
  async submitUserNovel(payload: Partial<NovelItem>, asDraft = false) {
    return apiRequest<{ submission: NovelItem }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ ...payload, asDraft })
    });
  },

  async fetchSubmissions() {
    return apiRequest<{ submissions: NovelItem[] }>('/api/submissions');
  },

  async reviewSubmission(submissionId: string, action: 'approve' | 'reject' | 'request_changes' | 'suspend', notes?: string) {
    return apiRequest<{ submission: NovelItem }>(`/api/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
  },

  // -------------------------------------------------------------
  // REAL TRENDING DYNAMIC RANKING
  // -------------------------------------------------------------
  async fetchRealTrendingScores() {
    return apiRequest<{
      productScores: Record<string, number>;
      novelScores: Record<string, number>;
    }>('/api/trending/real');
  },

  // -------------------------------------------------------------
  // UNIFIED SEARCH
  // -------------------------------------------------------------
  async searchAll(query: string) {
    return apiRequest<{
      query: string;
      products: CommunityProduct[];
      novels: NovelItem[];
    }>(`/api/search?q=${encodeURIComponent(query)}`);
  }
};
