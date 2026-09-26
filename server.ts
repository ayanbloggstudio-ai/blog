import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateContentStudioOutput } from './src/server/geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve static assets in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
