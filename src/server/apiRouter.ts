import express, { type Request, type Response, type NextFunction } from 'express';
import * as db from './database.ts';
import * as geminiService from './geminiService.ts';

export const apiRouter = express.Router();

// Middleware: Authenticate Bearer token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (req as any).user = null;
    return next();
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);
  (req as any).user = user;
  (req as any).token = token;
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin authorization required.' });
  }
  next();
}

apiRouter.use(authMiddleware);

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
apiRouter.post(['/auth/signup', '/signup'], (req: Request, res: Response) => {
  try {
    const { name, email, password, avatar, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Force public registration to member role (never assign admin via signup)
    const result = db.createUser({ name, email, password, avatar, bio, role: 'member' });
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('already exists')) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in instead.' });
    }
    return res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

apiRouter.post(['/auth/login', '/login'], (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = db.loginUser(email, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Invalid email or password.' });
  }
});

apiRouter.post(['/auth/logout', '/logout'], (req: Request, res: Response) => {
  const token = (req as any).token;
  if (token) {
    db.logoutUser(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get(['/auth/me', '/me'], (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user });
});

apiRouter.put(['/auth/profile', '/profile'], requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, avatar, bio } = req.body;
    const updated = db.updateUserProfile(user.id, { name, avatar, bio });
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Admin Users Management
apiRouter.get('/users', requireAdmin, (req: Request, res: Response) => {
  return res.json({ users: db.listAllUsers() });
});

apiRouter.put('/users/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = db.updateUserStatus(req.params.id, status);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/users/:id/role', requireAdmin, (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const updated = db.updateUserRole(req.params.id, role);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteUserAccount(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// COMMUNITY PRODUCTS (DIGITAL & PHYSICAL)
// -------------------------------------------------------------
apiRouter.get('/products', (req: Request, res: Response) => {
  const user = (req as any).user;
  const isAdmin = user?.role === 'admin' && req.query.admin === 'true';

  const products = db.listProducts({
    mainCategory: req.query.mainCategory as string,
    category: req.query.category as string,
    status: req.query.status as string,
    search: req.query.search as string,
    includeAllStatus: isAdmin
  });

  return res.json({ products });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const stats = db.getProductStats(product.id);
  return res.json({ product, stats });
});

apiRouter.post('/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const newProduct = db.createProduct(req.body);
    return res.status(201).json({ product: newProduct });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    return res.json({ product: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteProduct(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Product Engagements (Likes / Saves / Views / Shares)
apiRouter.post('/products/:id/like', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = db.toggleProductLike(req.params.id, user.id);
  return res.json(result);
});

apiRouter.post('/products/:id/save', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = db.toggleProductSave(req.params.id, user.id);
  return res.json(result);
});

apiRouter.post('/products/:id/view', (req: Request, res: Response) => {
  const user = (req as any).user;
  db.recordProductView(req.params.id, user?.id);
  return res.json({ success: true });
});

apiRouter.post('/products/:id/share', (req: Request, res: Response) => {
  const user = (req as any).user;
  db.recordProductShare(req.params.id, user?.id);
  return res.json({ success: true });
});

// Product Comments
apiRouter.get('/products/:id/comments', (req: Request, res: Response) => {
  const user = (req as any).user;
  const isAdmin = user?.role === 'admin';
  const comments = db.listProductComments(req.params.id, isAdmin);
  return res.json({ comments });
});

apiRouter.post('/products/:id/comments', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { rating, title, content } = req.body;
    const newComment = db.addProductComment({
      productId: req.params.id,
      userId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role === 'admin' ? 'Editorial Director' : 'Community Member',
      rating,
      title,
      content
    });
    return res.status(201).json({ comment: newComment });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Comment Editing, Deletion & Moderation
apiRouter.put('/comments/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { content, title, rating } = req.body;
    const updated = db.updateProductComment(req.params.id, user.id, content, title, rating);
    return res.json({ comment: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/comments/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    db.deleteProductComment(req.params.id, user.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/comments/:id/moderate', requireAdmin, (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const moderated = db.moderateProductComment(req.params.id, action);
    return res.json({ comment: moderated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/comments/:id/helpful', (req: Request, res: Response) => {
  try {
    const helpfulCount = db.voteCommentHelpful(req.params.id);
    return res.json({ helpfulCount });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// REPORTS & MODERATION
// -------------------------------------------------------------
apiRouter.get('/reports', requireAdmin, (req: Request, res: Response) => {
  return res.json({ reports: db.listReports() });
});

apiRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const report = db.createReport({
      ...req.body,
      reporterId: user?.id,
      reporterName: user?.name || req.body.reporterName
    });
    return res.status(201).json({ report });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/reports/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status, actionNotes } = req.body;
    const updated = db.updateReportStatus(req.params.id, status, actionNotes);
    return res.json({ report: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/reports/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteReport(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// REFERRAL CLICKS (REAL DATABASE TRACKING)
// -------------------------------------------------------------
apiRouter.post('/referrals/click', (req: Request, res: Response) => {
  try {
    const { productId, productTitle, category, mainCategory, targetUrl, isAffiliate, referrer } = req.body;
    if (!productId || !targetUrl) {
      return res.status(400).json({ error: 'Product ID and target URL are required' });
    }
    const click = db.recordReferralClick({
      productId,
      productTitle,
      category,
      mainCategory,
      targetUrl,
      isAffiliate,
      referrer
    });
    return res.status(201).json({ success: true, click });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/referrals', requireAdmin, (req: Request, res: Response) => {
  const clicks = db.listReferralClicks();
  return res.json({ clicks });
});

// -------------------------------------------------------------
// WEB NOVELS & MANGA / MANHWA
// -------------------------------------------------------------
apiRouter.get('/novels', (req: Request, res: Response) => {
  const user = (req as any).user;
  const isAdmin = user?.role === 'admin' && req.query.admin === 'true';

  const novels = db.listNovels({
    type: req.query.type as any,
    genre: req.query.genre as string,
    status: req.query.status as string,
    includeUnpublished: isAdmin,
    search: req.query.search as string
  });

  return res.json({ novels });
});

apiRouter.get('/novels/:id', (req: Request, res: Response) => {
  const novel = db.getNovelById(req.params.id);
  if (!novel) {
    return res.status(404).json({ error: 'Novel or manga not found' });
  }
  const chapters = db.listNovelChapters(novel.id);
  return res.json({ novel, chapters });
});

apiRouter.post('/novels', requireAdmin, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const newNovel = db.createNovel(req.body, user?.id);
    return res.status(201).json({ novel: newNovel });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/novels/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateNovel(req.params.id, req.body);
    return res.json({ novel: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/novels/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteNovel(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Chapters
apiRouter.get('/novels/:id/chapters', (req: Request, res: Response) => {
  const chapters = db.listNovelChapters(req.params.id);
  return res.json({ chapters });
});

apiRouter.get('/novels/:id/chapters/:num', (req: Request, res: Response) => {
  const num = parseInt(req.params.num, 10);
  const chapter = db.getNovelChapter(req.params.id, num);
  if (!chapter) {
    return res.status(404).json({ error: 'Chapter not found' });
  }
  return res.json({ chapter });
});

apiRouter.post('/novels/:id/chapters', requireAdmin, (req: Request, res: Response) => {
  try {
    const chapter = db.addNovelChapter(req.params.id, req.body);
    return res.status(201).json({ chapter });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/novels/:id/chapters/:chapterId', requireAdmin, (req: Request, res: Response) => {
  try {
    const chapter = db.updateNovelChapter(req.params.id, req.params.chapterId, req.body);
    return res.json({ chapter });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/novels/:id/chapters/:chapterId', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteNovelChapter(req.params.id, req.params.chapterId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/novels/:id/chapters/reorder', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderedChapterIds } = req.body;
    const chapters = db.reorderNovelChapters(req.params.id, orderedChapterIds);
    return res.json({ chapters });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Novel Engagements (Likes, Bookmarks, Reading Progress)
apiRouter.post('/novels/:id/like', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = db.toggleNovelLike(req.params.id, user.id);
  return res.json(result);
});

apiRouter.post('/novels/:id/bookmark', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = db.toggleNovelBookmark(req.params.id, user.id);
  return res.json(result);
});

apiRouter.get('/novels/:id/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const progress = db.getReadingProgress(user.id, req.params.id);
  return res.json({ progress: progress || null });
});

apiRouter.post('/novels/:id/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { chapterNumber, scrollPercent } = req.body;
  const progress = db.updateReadingProgress(user.id, req.params.id, chapterNumber, scrollPercent || 0);
  return res.json({ progress });
});

// -------------------------------------------------------------
// USER NOVEL SUBMISSIONS WORKFLOW
// -------------------------------------------------------------
apiRouter.post('/submissions', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { asDraft, ...payload } = req.body;
    const submission = db.submitUserNovel(payload, asDraft, user.id);
    return res.status(201).json({ submission });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/submissions', requireAdmin, (req: Request, res: Response) => {
  // Admin sees all submissions across queue
  const submissions = db.listNovels({ includeUnpublished: true });
  return res.json({ submissions });
});

apiRouter.post('/submissions/:id/review', requireAdmin, (req: Request, res: Response) => {
  try {
    const { action, notes } = req.body;
    const reviewed = db.reviewNovelSubmission(req.params.id, action, notes);
    return res.json({ submission: reviewed });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// TRENDING CALCULATION (REAL DYNAMIC ENGAGEMENT VELOCITY)
// -------------------------------------------------------------
apiRouter.get('/trending/real', (req: Request, res: Response) => {
  const scores = db.calculateRealTrendingScores();
  return res.json(scores);
});

// -------------------------------------------------------------
// UNIFIED SEARCH (REAL DATABASE ONLY)
// -------------------------------------------------------------
apiRouter.get('/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  if (!q) {
    return res.json({ products: [], novels: [] });
  }

  const products = db.listProducts({ search: q });
  const novels = db.listNovels({ search: q });

  return res.json({
    query: q,
    products,
    novels
  });
});

// -------------------------------------------------------------
// GEMINI AI INTEGRATION (AUTHENTIC SERVER-SIDE WORKFLOW)
// -------------------------------------------------------------
apiRouter.get('/gemini/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const status = geminiService.checkGeminiStatus();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to check Gemini status' });
  }
});

apiRouter.post('/gemini/generate-content', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ error: 'Topic is required for AI generation.' });
    }

    const result = await geminiService.generateContentStudioOutput(req.body);
    return res.json(result);
  } catch (err: any) {
    const msg = err.message || 'Gemini generation failed';
    console.error('API /gemini/generate-content error:', msg);

    if (msg.includes('GEMINI_API_KEY is not configured') || msg.includes('API key not valid')) {
      return res.status(503).json({ error: msg });
    }
    if (msg.includes('Resource has been exhausted') || msg.includes('429') || msg.includes('Quota')) {
      return res.status(429).json({ error: 'Gemini API rate limit exceeded. Please wait a moment and try again.' });
    }
    return res.status(500).json({ error: msg });
  }
});

apiRouter.post('/gemini/refine-text', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { action, text } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action is required.' });
    }
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Text is required for refinement.' });
    }

    const result = await geminiService.refineContentText(req.body);
    return res.json(result);
  } catch (err: any) {
    const msg = err.message || 'Gemini text refinement failed';
    console.error('API /gemini/refine-text error:', msg);

    if (msg.includes('GEMINI_API_KEY is not configured') || msg.includes('API key not valid')) {
      return res.status(503).json({ error: msg });
    }
    if (msg.includes('Resource has been exhausted') || msg.includes('429')) {
      return res.status(429).json({ error: 'Gemini API rate limit exceeded. Please wait a moment and try again.' });
    }
    return res.status(500).json({ error: msg });
  }
});

apiRouter.post('/gemini/generate-novel', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type, novelTitle } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Generation type is required (e.g. idea, character, chapter).' });
    }
    if (!novelTitle || !String(novelTitle).trim()) {
      return res.status(400).json({ error: 'Novel title is required.' });
    }

    const result = await geminiService.generateNovelContent(req.body);
    return res.json(result);
  } catch (err: any) {
    const msg = err.message || 'Gemini novel generation failed';
    console.error('API /gemini/generate-novel error:', msg);

    if (msg.includes('GEMINI_API_KEY is not configured') || msg.includes('API key not valid')) {
      return res.status(503).json({ error: msg });
    }
    if (msg.includes('Resource has been exhausted') || msg.includes('429')) {
      return res.status(429).json({ error: 'Gemini API rate limit exceeded. Please wait a moment and try again.' });
    }
    return res.status(500).json({ error: msg });
  }
});

// 404 Handler for undefined API routes
apiRouter.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: `API endpoint '${req.method} ${req.originalUrl}' was not found. Please verify the endpoint URL.`,
    status: 404
  });
});
