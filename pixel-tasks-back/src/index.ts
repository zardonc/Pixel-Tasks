import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import auth from './modules/auth/auth.controller.js';
import user from './modules/user/user.controller.js';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/auth', auth);
app.route('/user', user);

// Tasks
import { taskController } from './modules/tasks/task.controller.js';
import { authMiddleware } from './middlewares/auth.js';
app.use('/tasks/*', authMiddleware);
app.route('/tasks', taskController);

// Config (XP rules — admin-managed)
import { configController } from './modules/config/config.controller.js';
app.use('/config/*', authMiddleware);
app.route('/config', configController);

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

export type AppType = typeof app;
export default app;
