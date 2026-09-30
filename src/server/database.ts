import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'prism_db.json');

// Helper to hash passwords using standard PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Data Models
export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'creator' | 'member';
  status: 'active' | 'suspended' | 'banned';
  bio?: string;
  joinedDate: string;
  contributionsCount: number;
  warningsCount: number;
}

export interface DBSession {
  token: string;
  userId: string;
  role: 'admin' | 'moderator' | 'creator' | 'member';
  createdAt: string;
  expiresAt: string;
}

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  mainCategory: 'digital' | 'physical';
  category: string;
  image: string;
  logo?: string;
  keyFeatures: string[];
  priceStatus: 'Free' | 'Freemium' | 'Paid' | 'Open Source' | 'Hardware';
  price?: string;
  officialWebsiteUrl?: string;
  affiliateUrl?: string;
  affiliateCtaText?: string;
  affiliateDisclosure?: string;
  featured: boolean;
  status: 'draft' | 'published' | 'unpublished' | 'featured' | 'trending' | 'suspended';
  tags: string[];
  isPinned?: boolean;
  isTrendingManual?: boolean;
  makerName?: string;
  makerAvatar?: string;
  makerVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBComment {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  rating?: number;
  title?: string;
  content: string;
  status: 'published' | 'pending' | 'rejected';
  isApproved: boolean;
  isUserHidden: boolean;
  reportsCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DBReport {
  id: string;
  targetType: 'comment' | 'review' | 'novel_comment' | 'product' | 'novel';
  targetId: string;
  targetTitle?: string;
  content: string;
  authorName: string;
  reporterId?: string;
  reporterName: string;
  reason: string;
  date: string;
  status: 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended';
  actionNotes?: string;
}

export interface DBReferralClick {
  id: string;
  productId: string;
  productTitle: string;
  category: string;
  mainCategory: string;
  targetUrl: string;
  isAffiliate: boolean;
  referrer: string;
  timestamp: string;
  estimatedRevenue: number;
}

export interface DBNovel {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverImage: string;
  author: string;
  artist?: string;
  genres: string[];
  tags: string[];
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'suspended';
  type: 'novel' | 'manga' | 'manhwa';
  isOriginal: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  releaseFrequency?: string;
  submissionNotes?: string;
  rejectionReason?: string;
  creatorUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBNovelChapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  publishDate: string;
  views: number;
  likes: number;
  commentsCount: number;
  isFree: boolean;
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DBNovelComment {
  id: string;
  novelId: string;
  chapterNumber?: number;
  userId?: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  reportsCount: number;
  isReported: boolean;
  isUserHidden?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DBActivityEvent {
  id: string;
  targetType: 'product' | 'novel' | 'article';
  targetId: string;
  eventType: 'view' | 'like' | 'save' | 'comment' | 'share';
  userId?: string;
  timestamp: number; // Unix ms
}

export interface DBReadingProgress {
  userId: string;
  novelId: string;
  chapterNumber: number;
  scrollPercent: number;
  updatedAt: string;
}

export interface DBEngagementRecord {
  id: string;
  userId: string;
  targetType: 'product' | 'novel';
  targetId: string;
  action: 'like' | 'save';
  createdAt: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  sessions: DBSession[];
  products: DBProduct[];
  comments: DBComment[];
  reports: DBReport[];
  referralClicks: DBReferralClick[];
  novels: DBNovel[];
  chapters: DBNovelChapter[];
  novelComments: DBNovelComment[];
  readingProgress: DBReadingProgress[];
  engagements: DBEngagementRecord[];
  activityEvents: DBActivityEvent[];
}

// Initial In-Memory State & Loader
let dbState: DatabaseSchema | null = null;

function getInitialDB(): DatabaseSchema {
  // Pre-seed an initial verified Admin account so the platform admin tools can be audited immediately
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = crypto.pbkdf2Sync('PrismAdmin2026!', adminSalt, 1000, 64, 'sha512').toString('hex');

  const defaultAdmin: DBUser = {
    id: 'user-admin-01',
    name: 'PRISM Lead Administrator',
    email: 'admin@prism.io',
    passwordHash: adminHash,
    passwordSalt: adminSalt,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'admin',
    status: 'active',
    bio: 'PRISM Principal Curator and Editorial Director.',
    joinedDate: new Date().toISOString().split('T')[0],
    contributionsCount: 0,
    warningsCount: 0
  };

  return {
    users: [defaultAdmin],
    sessions: [],
    products: [],
    comments: [],
    reports: [],
    referralClicks: [],
    novels: [],
    chapters: [],
    novelComments: [],
    readingProgress: [],
    engagements: [],
    activityEvents: []
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbState) return dbState;

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      dbState = JSON.parse(raw);
      if (!dbState || !Array.isArray(dbState.users)) {
        dbState = getInitialDB();
        saveDatabase();
      }
    } else {
      dbState = getInitialDB();
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to load database file, initializing fresh store:', err);
    dbState = getInitialDB();
    saveDatabase();
  }

  // Ensure default admin exists
  if (!dbState.users.some(u => u.role === 'admin')) {
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = crypto.pbkdf2Sync('PrismAdmin2026!', adminSalt, 1000, 64, 'sha512').toString('hex');
    dbState.users.unshift({
      id: 'user-admin-01',
      name: 'PRISM Lead Administrator',
      email: 'admin@prism.io',
      passwordHash: adminHash,
      passwordSalt: adminSalt,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'admin',
      status: 'active',
      bio: 'PRISM Principal Curator and Editorial Director.',
      joinedDate: new Date().toISOString().split('T')[0],
      contributionsCount: 0,
      warningsCount: 0
    });
    saveDatabase();
  }

  return dbState;
}

export function saveDatabase(): void {
  if (!dbState) return;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// ----------------------------------------------------------------------
// USER & SESSION OPERATIONS
// ----------------------------------------------------------------------
export function createUser(payload: {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role?: 'admin' | 'moderator' | 'creator' | 'member';
}): { user: Omit<DBUser, 'passwordHash' | 'passwordSalt'>; token: string } {
  const db = loadDatabase();
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('A user with this email address already exists.');
  }

  const { hash, salt } = hashPassword(payload.password);
  const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Assign role: standard signups always receive 'member' role.
  // Administrative privileges must be explicitly provisioned or managed by existing administrators.
  const assignedRole = payload.role || 'member';

  const newUser: DBUser = {
    id: userId,
    name: payload.name.trim(),
    email: normalizedEmail,
    passwordHash: hash,
    passwordSalt: salt,
    avatar: payload.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name)}`,
    role: assignedRole,
    status: 'active',
    bio: payload.bio || '',
    joinedDate: new Date().toISOString().split('T')[0],
    contributionsCount: 0,
    warningsCount: 0
  };

  db.users.push(newUser);

  // Generate session token
  const token = `token-${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  db.sessions.push({
    token,
    userId: newUser.id,
    role: newUser.role,
    createdAt: new Date().toISOString(),
    expiresAt
  });

  saveDatabase();

  const { passwordHash, passwordSalt, ...cleanUser } = newUser;
  return { user: cleanUser, token };
}

export function loginUser(email: string, password: string): { user: Omit<DBUser, 'passwordHash' | 'passwordSalt'>; token: string } {
  const db = loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (user.status === 'banned') {
    throw new Error('Your account has been suspended or banned due to moderation policy violations.');
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const token = `token-${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.sessions.push({
    token,
    userId: user.id,
    role: user.role,
    createdAt: new Date().toISOString(),
    expiresAt
  });

  saveDatabase();

  const { passwordHash, passwordSalt, ...cleanUser } = user;
  return { user: cleanUser, token };
}

export function logoutUser(token: string): boolean {
  const db = loadDatabase();
  const idx = db.sessions.findIndex(s => s.token === token);
  if (idx !== -1) {
    db.sessions.splice(idx, 1);
    saveDatabase();
    return true;
  }
  return false;
}

export function getUserByToken(token: string): Omit<DBUser, 'passwordHash' | 'passwordSalt'> | null {
  const db = loadDatabase();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    return null;
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || user.status === 'banned') return null;

  const { passwordHash, passwordSalt, ...cleanUser } = user;
  return cleanUser;
}

export function updateUserProfile(userId: string, updates: { name?: string; avatar?: string; bio?: string }) {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found.');

  if (updates.name !== undefined) user.name = updates.name.trim();
  if (updates.avatar !== undefined) user.avatar = updates.avatar.trim();
  if (updates.bio !== undefined) user.bio = updates.bio.trim();

  saveDatabase();
  const { passwordHash, passwordSalt, ...cleanUser } = user;
  return cleanUser;
}

export function listAllUsers() {
  const db = loadDatabase();
  return db.users.map(({ passwordHash, passwordSalt, ...u }) => u);
}

export function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned') {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found.');
  user.status = status;
  saveDatabase();
  const { passwordHash, passwordSalt, ...cleanUser } = user;
  return cleanUser;
}

export function updateUserRole(userId: string, role: 'admin' | 'moderator' | 'creator' | 'member') {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found.');
  user.role = role;
  saveDatabase();
  const { passwordHash, passwordSalt, ...cleanUser } = user;
  return cleanUser;
}

export function deleteUserAccount(userId: string) {
  const db = loadDatabase();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found.');
  db.users.splice(idx, 1);
  db.sessions = db.sessions.filter(s => s.userId !== userId);
  saveDatabase();
  return true;
}

// ----------------------------------------------------------------------
// PRODUCTS & COMMUNITY OPERATIONS
// ----------------------------------------------------------------------
export function listProducts(filter?: {
  mainCategory?: string;
  category?: string;
  status?: string;
  search?: string;
  includeAllStatus?: boolean; // For admin
}) {
  const db = loadDatabase();
  let list = [...db.products];

  if (!filter?.includeAllStatus) {
    list = list.filter(p => p.status === 'published' || p.status === 'featured' || p.status === 'trending');
  } else if (filter?.status && filter.status !== 'all') {
    list = list.filter(p => p.status === filter.status);
  }

  if (filter?.mainCategory && filter.mainCategory !== 'all') {
    list = list.filter(p => p.mainCategory === filter.mainCategory);
  }

  if (filter?.category && filter.category !== 'all' && !filter.category.startsWith('All ')) {
    list = list.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
  }

  if (filter?.search?.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return list.map(p => {
    const stats = getProductStats(p.id);
    return {
      ...p,
      initialLikes: stats.likes,
      initialSaves: stats.saves,
      viewsCount: stats.viewsCount,
      referralClicks: stats.referralClicks,
      commentCount: stats.commentCount
    };
  });
}

export function getProductById(id: string) {
  const db = loadDatabase();
  const p = db.products.find(prod => prod.id === id);
  if (!p) return null;
  const stats = getProductStats(p.id);
  return {
    ...p,
    initialLikes: stats.likes,
    initialSaves: stats.saves,
    viewsCount: stats.viewsCount,
    referralClicks: stats.referralClicks,
    commentCount: stats.commentCount
  };
}

export function getProductStats(productId: string) {
  const db = loadDatabase();
  const likesCount = db.engagements.filter(e => e.targetId === productId && e.action === 'like').length;
  const savesCount = db.engagements.filter(e => e.targetId === productId && e.action === 'save').length;
  const productComments = db.comments.filter(c => c.productId === productId && c.status === 'published' && !c.isUserHidden);
  const commentCount = productComments.length;
  
  const rated = productComments.filter(c => typeof c.rating === 'number' && c.rating > 0);
  const averageRating = rated.length > 0
    ? Number((rated.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length).toFixed(1))
    : null;

  const viewsCount = db.activityEvents.filter(a => a.targetId === productId && a.eventType === 'view').length;
  const referralClicks = db.referralClicks.filter(r => r.productId === productId).length;

  return {
    likes: likesCount,
    saves: savesCount,
    commentCount,
    averageRating,
    ratingCount: rated.length,
    viewsCount,
    referralClicks
  };
}

export function createProduct(payload: Partial<DBProduct>) {
  const db = loadDatabase();
  if (!payload.name?.trim()) throw new Error('Product name is required.');
  const desc = payload.description?.trim() || payload.shortDescription?.trim() || payload.name.trim();
  if (!desc) throw new Error('Product description is required.');

  const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const slug = payload.slug?.trim() || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct: DBProduct = {
    id,
    name: payload.name.trim(),
    slug,
    shortDescription: payload.shortDescription?.trim() || desc.slice(0, 160),
    description: desc,
    mainCategory: payload.mainCategory === 'physical' ? 'physical' : 'digital',
    category: payload.category?.trim() || (payload.mainCategory === 'physical' ? 'Smartphones' : 'AI tools'),
    image: payload.image?.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    logo: payload.logo?.trim() || '',
    keyFeatures: Array.isArray(payload.keyFeatures) ? payload.keyFeatures : [],
    priceStatus: payload.priceStatus || 'Free',
    price: payload.price?.trim() || '',
    officialWebsiteUrl: payload.officialWebsiteUrl?.trim() || '',
    affiliateUrl: payload.affiliateUrl?.trim() || '',
    affiliateCtaText: payload.affiliateCtaText?.trim() || 'Try Now',
    affiliateDisclosure: payload.affiliateDisclosure?.trim() || 'PRISM is reader-supported with outbound referral partnerships.',
    featured: Boolean(payload.featured),
    status: payload.status || 'published',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    isPinned: Boolean(payload.isPinned),
    isTrendingManual: Boolean(payload.isTrendingManual),
    makerName: payload.makerName?.trim() || 'PRISM Verified',
    makerAvatar: payload.makerAvatar?.trim() || '',
    makerVerified: payload.makerVerified ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDatabase();
  return {
    ...newProduct,
    initialLikes: 0,
    initialSaves: 0,
    viewsCount: 0,
    referralClicks: 0,
    commentCount: 0
  };
}

export function updateProduct(id: string, updates: Partial<DBProduct>) {
  const db = loadDatabase();
  const product = db.products.find(p => p.id === id);
  if (!product) throw new Error('Product not found.');

  Object.assign(product, updates, { updatedAt: new Date().toISOString() });
  saveDatabase();
  return product;
}

export function deleteProduct(id: string) {
  const db = loadDatabase();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found.');
  db.products.splice(idx, 1);
  // Clean up associated comments and engagements
  db.comments = db.comments.filter(c => c.productId !== id);
  db.engagements = db.engagements.filter(e => e.targetId !== id);
  db.activityEvents = db.activityEvents.filter(a => a.targetId !== id);
  saveDatabase();
  return true;
}

// Engagements (Likes / Saves / Views)
export function toggleProductLike(productId: string, userId: string): { isLiked: boolean; totalLikes: number } {
  const db = loadDatabase();
  const existingIdx = db.engagements.findIndex(
    e => e.targetId === productId && e.targetType === 'product' && e.userId === userId && e.action === 'like'
  );

  let isLiked = false;
  if (existingIdx !== -1) {
    db.engagements.splice(existingIdx, 1);
    isLiked = false;
  } else {
    db.engagements.push({
      id: `eng-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      targetType: 'product',
      targetId: productId,
      action: 'like',
      createdAt: new Date().toISOString()
    });
    isLiked = true;

    // Record activity for real trending calculation
    db.activityEvents.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: 'product',
      targetId: productId,
      eventType: 'like',
      userId,
      timestamp: Date.now()
    });
  }

  saveDatabase();
  const totalLikes = db.engagements.filter(e => e.targetId === productId && e.action === 'like').length;
  return { isLiked, totalLikes };
}

export function toggleProductSave(productId: string, userId: string): { isSaved: boolean; totalSaves: number } {
  const db = loadDatabase();
  const existingIdx = db.engagements.findIndex(
    e => e.targetId === productId && e.targetType === 'product' && e.userId === userId && e.action === 'save'
  );

  let isSaved = false;
  if (existingIdx !== -1) {
    db.engagements.splice(existingIdx, 1);
    isSaved = false;
  } else {
    db.engagements.push({
      id: `eng-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      targetType: 'product',
      targetId: productId,
      action: 'save',
      createdAt: new Date().toISOString()
    });
    isSaved = true;

    db.activityEvents.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: 'product',
      targetId: productId,
      eventType: 'save',
      userId,
      timestamp: Date.now()
    });
  }

  saveDatabase();
  const totalSaves = db.engagements.filter(e => e.targetId === productId && e.action === 'save').length;
  return { isSaved, totalSaves };
}

export function recordProductView(productId: string, userId?: string) {
  const db = loadDatabase();
  db.activityEvents.push({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetType: 'product',
    targetId: productId,
    eventType: 'view',
    userId,
    timestamp: Date.now()
  });
  saveDatabase();
}

export function recordProductShare(productId: string, userId?: string) {
  const db = loadDatabase();
  db.activityEvents.push({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetType: 'product',
    targetId: productId,
    eventType: 'share',
    userId,
    timestamp: Date.now()
  });
  saveDatabase();
}

// ----------------------------------------------------------------------
// COMMENTS & MODERATION
// ----------------------------------------------------------------------
export function listProductComments(productId: string, includeUnpublished = false) {
  const db = loadDatabase();
  return db.comments.filter(c => {
    if (c.productId !== productId) return false;
    if (includeUnpublished) return true;
    return c.status === 'published' && !c.isUserHidden;
  });
}

export function addProductComment(payload: {
  productId: string;
  userId?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  rating?: number;
  title?: string;
  content: string;
}) {
  const db = loadDatabase();
  if (!payload.content?.trim()) throw new Error('Comment content cannot be empty.');

  const newComment: DBComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId: payload.productId,
    userId: payload.userId,
    authorName: payload.authorName.trim() || 'Anonymous Reader',
    authorAvatar: payload.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.authorName)}`,
    authorRole: payload.authorRole || 'Community Member',
    rating: payload.rating,
    title: payload.title?.trim() || '',
    content: payload.content.trim(),
    status: 'published',
    isApproved: true,
    isUserHidden: false,
    reportsCount: 0,
    helpfulCount: 0,
    createdAt: new Date().toISOString()
  };

  db.comments.unshift(newComment);

  // Activity event for trending
  db.activityEvents.push({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetType: 'product',
    targetId: payload.productId,
    eventType: 'comment',
    userId: payload.userId,
    timestamp: Date.now()
  });

  saveDatabase();
  return newComment;
}

export function updateProductComment(commentId: string, userId: string, content: string, title?: string, rating?: number) {
  const db = loadDatabase();
  const comment = db.comments.find(c => c.id === commentId);
  if (!comment) throw new Error('Comment not found.');

  // Check permission: author or admin
  const user = db.users.find(u => u.id === userId);
  if (comment.userId !== userId && user?.role !== 'admin') {
    throw new Error('You do not have permission to edit this comment.');
  }

  comment.content = content.trim();
  if (title !== undefined) comment.title = title.trim();
  if (rating !== undefined) comment.rating = rating;
  comment.updatedAt = new Date().toISOString();

  saveDatabase();
  return comment;
}

export function deleteProductComment(commentId: string, userId?: string) {
  const db = loadDatabase();
  const idx = db.comments.findIndex(c => c.id === commentId);
  if (idx === -1) throw new Error('Comment not found.');

  if (userId) {
    const user = db.users.find(u => u.id === userId);
    if (db.comments[idx].userId !== userId && user?.role !== 'admin') {
      throw new Error('Permission denied.');
    }
  }

  db.comments.splice(idx, 1);
  saveDatabase();
  return true;
}

export function moderateProductComment(commentId: string, action: 'approve' | 'hide' | 'unhide') {
  const db = loadDatabase();
  const comment = db.comments.find(c => c.id === commentId);
  if (!comment) throw new Error('Comment not found.');

  if (action === 'approve') {
    comment.status = 'published';
    comment.isApproved = true;
  } else if (action === 'hide') {
    comment.isUserHidden = true;
  } else if (action === 'unhide') {
    comment.isUserHidden = false;
  }

  saveDatabase();
  return comment;
}

export function voteCommentHelpful(commentId: string) {
  const db = loadDatabase();
  const comment = db.comments.find(c => c.id === commentId);
  if (!comment) throw new Error('Comment not found.');
  comment.helpfulCount = (comment.helpfulCount || 0) + 1;
  saveDatabase();
  return comment.helpfulCount;
}

// ----------------------------------------------------------------------
// REPORTS
// ----------------------------------------------------------------------
export function listReports() {
  const db = loadDatabase();
  return db.reports;
}

export function createReport(payload: Partial<DBReport>) {
  const db = loadDatabase();
  if (!payload.targetId || !payload.reason) throw new Error('Target ID and reason are required.');

  const newReport: DBReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetType: payload.targetType || 'comment',
    targetId: payload.targetId,
    targetTitle: payload.targetTitle || '',
    content: payload.content || '',
    authorName: payload.authorName || 'Unknown',
    reporterId: payload.reporterId,
    reporterName: payload.reporterName || 'Concerned Member',
    reason: payload.reason,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    actionNotes: payload.actionNotes || ''
  };

  db.reports.unshift(newReport);
  saveDatabase();
  return newReport;
}

export function updateReportStatus(reportId: string, status: 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended', notes?: string) {
  const db = loadDatabase();
  const report = db.reports.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found.');
  report.status = status;
  if (notes !== undefined) report.actionNotes = notes;
  saveDatabase();
  return report;
}

export function deleteReport(reportId: string) {
  const db = loadDatabase();
  const idx = db.reports.findIndex(r => r.id === reportId);
  if (idx === -1) throw new Error('Report not found.');
  db.reports.splice(idx, 1);
  saveDatabase();
  return true;
}

// ----------------------------------------------------------------------
// REFERRAL CLICKS TRACKING
// ----------------------------------------------------------------------
export function recordReferralClick(payload: {
  productId: string;
  productTitle?: string;
  category?: string;
  mainCategory?: string;
  targetUrl: string;
  isAffiliate?: boolean;
  referrer?: string;
}) {
  const db = loadDatabase();
  const product = db.products.find(p => p.id === payload.productId);

  const click: DBReferralClick = {
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId: payload.productId,
    productTitle: payload.productTitle || product?.name || 'Direct Resource',
    category: payload.category || product?.category || 'General',
    mainCategory: payload.mainCategory || product?.mainCategory || 'digital',
    targetUrl: payload.targetUrl,
    isAffiliate: payload.isAffiliate ?? Boolean(product?.affiliateUrl),
    referrer: payload.referrer || 'PRISM Discovery Web',
    timestamp: new Date().toISOString(),
    estimatedRevenue: payload.isAffiliate ? 0.35 : 0
  };

  db.referralClicks.unshift(click);
  saveDatabase();
  return click;
}

export function listReferralClicks() {
  const db = loadDatabase();
  return db.referralClicks;
}

// ----------------------------------------------------------------------
// NOVELS & MANGA / MANHWA
// ----------------------------------------------------------------------
export function listNovels(filter?: {
  type?: 'novel' | 'manga' | 'manhwa' | 'all';
  genre?: string;
  status?: string;
  includeUnpublished?: boolean; // For admin
  search?: string;
}) {
  const db = loadDatabase();
  let list = [...db.novels];

  if (!filter?.includeUnpublished) {
    // Public only sees published / approved
    list = list.filter(n => n.status === 'published' || n.status === 'approved');
  } else if (filter?.status && filter.status !== 'all') {
    list = list.filter(n => n.status === filter.status);
  }

  if (filter?.type && filter.type !== 'all') {
    list = list.filter(n => n.type === filter.type);
  }

  if (filter?.genre && filter.genre !== 'All Genres') {
    list = list.filter(n => n.genres.includes(filter.genre!));
  }

  if (filter?.search?.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.synopsis.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return list.map(n => {
    const chapters = db.chapters.filter(c => c.novelId === n.id).sort((a, b) => a.chapterNumber - b.chapterNumber);
    const likes = db.engagements.filter(e => e.targetId === n.id && e.action === 'like').length;
    const saves = db.engagements.filter(e => e.targetId === n.id && e.action === 'save').length;
    const comments = db.novelComments.filter(nc => nc.novelId === n.id && !nc.isUserHidden);
    const views = chapters.reduce((sum, c) => sum + (c.views || 0), 0) + db.activityEvents.filter(a => a.targetId === n.id && a.eventType === 'view').length;

    return {
      ...n,
      description: n.synopsis,
      shortDescription: n.synopsis.slice(0, 160),
      submissionStatus: n.status === 'pending' ? 'pending_review' : n.status,
      chapters,
      likes,
      saves,
      followers: saves,
      commentsCount: comments.length,
      views,
      rating: 5.0,
      ratingCount: 0,
      lastUpdatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
      featured: n.isFeatured,
      trendingScore: views * 0.5 + likes * 2 + saves * 3
    };
  });
}

export function getNovelById(id: string) {
  const db = loadDatabase();
  const n = db.novels.find(novel => novel.id === id || novel.slug === id);
  if (!n) return null;
  const chapters = db.chapters.filter(c => c.novelId === n.id).sort((a, b) => a.chapterNumber - b.chapterNumber);
  const likes = db.engagements.filter(e => e.targetId === n.id && e.action === 'like').length;
  const saves = db.engagements.filter(e => e.targetId === n.id && e.action === 'save').length;
  const comments = db.novelComments.filter(nc => nc.novelId === n.id && !nc.isUserHidden);
  const views = chapters.reduce((sum, c) => sum + (c.views || 0), 0) + db.activityEvents.filter(a => a.targetId === n.id && a.eventType === 'view').length;

  return {
    ...n,
    description: n.synopsis,
    shortDescription: n.synopsis.slice(0, 160),
    submissionStatus: n.status === 'pending' ? 'pending_review' : n.status,
    chapters,
    likes,
    saves,
    followers: saves,
    commentsCount: comments.length,
    views,
    rating: 5.0,
    ratingCount: 0,
    lastUpdatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
    featured: n.isFeatured,
    trendingScore: views * 0.5 + likes * 2 + saves * 3
  };
}

export function createNovel(payload: Partial<DBNovel> & { description?: string; shortDescription?: string; submissionStatus?: string }, creatorUserId?: string) {
  const db = loadDatabase();
  if (!payload.title?.trim()) throw new Error('Novel title is required.');
  const synopsis = payload.synopsis?.trim() || payload.description?.trim() || payload.shortDescription?.trim() || payload.title.trim();
  if (!synopsis) throw new Error('Novel synopsis is required.');

  const id = `novel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const slug = payload.slug?.trim() || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let status: DBNovel['status'] = payload.status || 'published';
  if (payload.submissionStatus) {
    if (payload.submissionStatus === 'pending_review') status = 'pending';
    else if (['draft', 'pending', 'approved', 'published', 'rejected', 'suspended'].includes(payload.submissionStatus)) {
      status = payload.submissionStatus as any;
    }
  }

  const newNovel: DBNovel = {
    id,
    title: payload.title.trim(),
    slug,
    synopsis: synopsis,
    coverImage: payload.coverImage?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    author: payload.author?.trim() || 'Anonymous Author',
    artist: payload.artist?.trim() || '',
    genres: Array.isArray(payload.genres) && payload.genres.length > 0 ? payload.genres : ['Fantasy'],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    status,
    type: payload.type || 'novel',
    isOriginal: Boolean(payload.isOriginal),
    isFeatured: Boolean(payload.isFeatured),
    isTrending: Boolean(payload.isTrending),
    releaseFrequency: payload.releaseFrequency?.trim() || 'Weekly',
    submissionNotes: payload.submissionNotes?.trim() || '',
    rejectionReason: '',
    creatorUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.novels.unshift(newNovel);
  saveDatabase();
  return {
    ...newNovel,
    description: newNovel.synopsis,
    shortDescription: newNovel.synopsis.slice(0, 160),
    submissionStatus: newNovel.status === 'pending' ? 'pending_review' : newNovel.status,
    chapters: [],
    likes: 0,
    saves: 0,
    commentsCount: 0,
    views: 0
  };
}

export function updateNovel(id: string, updates: Partial<DBNovel>) {
  const db = loadDatabase();
  const novel = db.novels.find(n => n.id === id);
  if (!novel) throw new Error('Novel not found.');

  Object.assign(novel, updates, { updatedAt: new Date().toISOString() });
  saveDatabase();
  return novel;
}

export function deleteNovel(id: string) {
  const db = loadDatabase();
  const idx = db.novels.findIndex(n => n.id === id);
  if (idx === -1) throw new Error('Novel not found.');
  db.novels.splice(idx, 1);
  // Clean up associated chapters & comments
  db.chapters = db.chapters.filter(c => c.novelId !== id);
  db.novelComments = db.novelComments.filter(nc => nc.novelId !== id);
  db.engagements = db.engagements.filter(e => e.targetId !== id);
  saveDatabase();
  return true;
}

// Novel Chapters
export function listNovelChapters(novelId: string) {
  const db = loadDatabase();
  return db.chapters
    .filter(c => c.novelId === novelId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export function getNovelChapter(novelId: string, chapterNumber: number) {
  const db = loadDatabase();
  return db.chapters.find(c => c.novelId === novelId && c.chapterNumber === chapterNumber);
}

export function addNovelChapter(novelId: string, payload: {
  chapterNumber?: number;
  title: string;
  content: string;
  publishDate?: string;
  isFree?: boolean;
}) {
  const db = loadDatabase();
  const novel = db.novels.find(n => n.id === novelId);
  if (!novel) throw new Error('Novel not found.');

  const existingChapters = db.chapters.filter(c => c.novelId === novelId);
  const nextNum = payload.chapterNumber || (existingChapters.length > 0 ? Math.max(...existingChapters.map(c => c.chapterNumber)) + 1 : 1);

  const newChapter: DBNovelChapter = {
    id: `chap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    novelId,
    chapterNumber: nextNum,
    title: payload.title.trim() || `Chapter ${nextNum}`,
    content: payload.content.trim(),
    publishDate: payload.publishDate || new Date().toISOString().split('T')[0],
    views: 0,
    likes: 0,
    commentsCount: 0,
    isFree: payload.isFree ?? true,
    createdAt: new Date().toISOString()
  };

  db.chapters.push(newChapter);
  novel.updatedAt = new Date().toISOString();
  saveDatabase();
  return newChapter;
}

export function updateNovelChapter(novelId: string, chapterId: string, updates: Partial<DBNovelChapter>) {
  const db = loadDatabase();
  const chapter = db.chapters.find(c => c.id === chapterId && c.novelId === novelId);
  if (!chapter) throw new Error('Chapter not found.');

  Object.assign(chapter, updates, { updatedAt: new Date().toISOString() });
  saveDatabase();
  return chapter;
}

export function deleteNovelChapter(novelId: string, chapterId: string) {
  const db = loadDatabase();
  const idx = db.chapters.findIndex(c => c.id === chapterId && c.novelId === novelId);
  if (idx === -1) throw new Error('Chapter not found.');
  db.chapters.splice(idx, 1);
  saveDatabase();
  return true;
}

export function reorderNovelChapters(novelId: string, orderedChapterIds: string[]) {
  const db = loadDatabase();
  orderedChapterIds.forEach((id, index) => {
    const chap = db.chapters.find(c => c.id === id && c.novelId === novelId);
    if (chap) {
      chap.chapterNumber = index + 1;
    }
  });
  saveDatabase();
  return listNovelChapters(novelId);
}

// User Novel Submissions (Draft -> Pending Review -> Approved -> Published)
export function submitUserNovel(payload: Partial<DBNovel>, asDraft = false, creatorUserId?: string) {
  const status = asDraft ? 'draft' : 'pending';
  return createNovel({
    ...payload,
    status
  }, creatorUserId);
}

export function reviewNovelSubmission(
  submissionId: string,
  action: 'approve' | 'reject' | 'request_changes' | 'suspend',
  notes?: string
) {
  const db = loadDatabase();
  const novel = db.novels.find(n => n.id === submissionId);
  if (!novel) throw new Error('Submission not found.');

  if (action === 'approve') {
    novel.status = 'published';
  } else if (action === 'reject') {
    novel.status = 'rejected';
    novel.rejectionReason = notes || 'Does not adhere to PRISM publication guidelines.';
  } else if (action === 'request_changes') {
    novel.status = 'draft';
    novel.submissionNotes = notes || 'Editorial team requested revisions before publishing.';
  } else if (action === 'suspend') {
    novel.status = 'suspended';
  }

  novel.updatedAt = new Date().toISOString();
  saveDatabase();
  return novel;
}

// Novel Engagements (Likes, Bookmarks, Reading Progress)
export function toggleNovelLike(novelId: string, userId: string) {
  const db = loadDatabase();
  const existingIdx = db.engagements.findIndex(
    e => e.targetId === novelId && e.targetType === 'novel' && e.userId === userId && e.action === 'like'
  );

  let isLiked = false;
  if (existingIdx !== -1) {
    db.engagements.splice(existingIdx, 1);
    isLiked = false;
  } else {
    db.engagements.push({
      id: `eng-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      targetType: 'novel',
      targetId: novelId,
      action: 'like',
      createdAt: new Date().toISOString()
    });
    isLiked = true;

    db.activityEvents.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: 'novel',
      targetId: novelId,
      eventType: 'like',
      userId,
      timestamp: Date.now()
    });
  }

  saveDatabase();
  const totalLikes = db.engagements.filter(e => e.targetId === novelId && e.action === 'like').length;
  return { isLiked, totalLikes };
}

export function toggleNovelBookmark(novelId: string, userId: string) {
  const db = loadDatabase();
  const existingIdx = db.engagements.findIndex(
    e => e.targetId === novelId && e.targetType === 'novel' && e.userId === userId && e.action === 'save'
  );

  let isBookmarked = false;
  if (existingIdx !== -1) {
    db.engagements.splice(existingIdx, 1);
    isBookmarked = false;
  } else {
    db.engagements.push({
      id: `eng-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      targetType: 'novel',
      targetId: novelId,
      action: 'save',
      createdAt: new Date().toISOString()
    });
    isBookmarked = true;

    db.activityEvents.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: 'novel',
      targetId: novelId,
      eventType: 'save',
      userId,
      timestamp: Date.now()
    });
  }

  saveDatabase();
  const totalBookmarks = db.engagements.filter(e => e.targetId === novelId && e.action === 'save').length;
  return { isBookmarked, totalBookmarks };
}

export function updateReadingProgress(userId: string, novelId: string, chapterNumber: number, scrollPercent: number) {
  const db = loadDatabase();
  let item = db.readingProgress.find(p => p.userId === userId && p.novelId === novelId);
  if (item) {
    item.chapterNumber = chapterNumber;
    item.scrollPercent = scrollPercent;
    item.updatedAt = new Date().toISOString();
  } else {
    item = {
      userId,
      novelId,
      chapterNumber,
      scrollPercent,
      updatedAt: new Date().toISOString()
    };
    db.readingProgress.push(item);
  }
  saveDatabase();
  return item;
}

export function getReadingProgress(userId: string, novelId: string) {
  const db = loadDatabase();
  return db.readingProgress.find(p => p.userId === userId && p.novelId === novelId);
}

// ----------------------------------------------------------------------
// REAL TRENDING CALCULATION (Weighted Recency & Engagement Velocity)
// ----------------------------------------------------------------------
export function calculateRealTrendingScores() {
  const db = loadDatabase();
  const now = Date.now();

  // Decay factor: half-life is approx 48 hours (~172,800,000 ms)
  const lambda = Math.LN2 / (48 * 60 * 60 * 1000);

  const productScores = new Map<string, number>();
  const novelScores = new Map<string, number>();

  db.activityEvents.forEach(event => {
    const ts = typeof event.timestamp === 'number' ? event.timestamp : new Date(event.timestamp).getTime();
    const age = isNaN(ts) ? 0 : Math.max(0, now - ts);
    if (age > 14 * 24 * 60 * 60 * 1000) return; // ignore older than 14 days

    const recencyWeight = Math.exp(-lambda * age);
    let eventPoints = 1;
    switch (event.eventType) {
      case 'view': eventPoints = 1; break;
      case 'like': eventPoints = 4; break;
      case 'save': eventPoints = 6; break;
      case 'comment': eventPoints = 8; break;
      case 'share': eventPoints = 10; break;
    }

    const points = eventPoints * recencyWeight;

    if (event.targetType === 'product') {
      productScores.set(event.targetId, (productScores.get(event.targetId) || 0) + points);
    } else if (event.targetType === 'novel') {
      novelScores.set(event.targetId, (novelScores.get(event.targetId) || 0) + points);
    }
  });

  return {
    productScores: Object.fromEntries(productScores.entries()),
    novelScores: Object.fromEntries(novelScores.entries())
  };
}
