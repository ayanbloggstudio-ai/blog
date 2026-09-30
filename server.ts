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

  // AI Content Studio Generator Route
  app.post('/api/gemini/generate-content', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      const result = await generateContentStudioOutput(payload);
      return res.json(result);
    } catch (error: any) {
      console.error('Server error generating AI content:', error);
      return res.status(500).json({ error: error?.message || 'Failed to generate content' });
    }
  });

  // Mount unified real backend API router
  app.use('/api', apiRouter);

  // Catch-all for unmatched /api routes to prevent HTML 404 fallback
  app.all('/api/*', (req, res) => {
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
