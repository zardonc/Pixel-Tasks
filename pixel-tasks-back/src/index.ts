import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use('*', cors());

// Health Check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'pixel-tasks-back' });
});

// Root
app.get('/', (c) => {
  return c.text('Pixel Tasks Backend is running (Phase 1)');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

export default app;
