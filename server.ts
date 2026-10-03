import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter.ts';
import { generateContentStudioOutput } from './src/server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.DEFAULT_APP_PORT || (process.env.PORT === '8080' ? 3000 : (process.env.PORT || 3000));

async function startServer() {
  const app = express();

  // CORS middleware for iframe preview, web embed, and cross-origin fetch
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Supabase Status check
  app.get('/api/supabase/status', async (req, res) => {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const hasKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    res.json({
      configured: Boolean(url && hasKey),
      url: url || null,
      hasKey,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    });
  });

  // Mount unified real backend API router under /api, /api/v1, /api/auth, and /auth
  app.use('/api', apiRouter);
  app.use('/api/v1', apiRouter);
  app.use('/auth', apiRouter);

  // Catch-all for unmatched /api routes to prevent HTML 404 fallback
  app.all(['/api', '/api/*'], (req, res) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    res.status(404).json({
      error: `API route '${req.method} ${req.originalUrl}' not found.`,
      status: 404
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PRISM Full-Stack Server listening on port ${PORT} (prod: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
