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

// Shop (XP purchases)
import { shopController } from './modules/shop/shop.controller.js';
app.use('/shop/*', authMiddleware);
app.route('/shop', shopController);

// Achievements (XP rewards)
import { achievementController } from './modules/achievement/achievement.controller.js';
app.use('/achievements/*', authMiddleware);
app.route('/achievements', achievementController);

// Game Hub (Public or Auth?) - Currently Auth in frontend, but listing can be public?
// Let's keep it behind Auth for now to match other features, or make it public. 
// Frontend GameHub page is protected.
import { gameHubController } from './modules/gamehub/gamehub.controller.js';
app.use('/games/*', authMiddleware);
app.route('/games', gameHubController);

// Admin (Protected by adminOnly in controller, but also needs authMiddleware to populate user)
import { adminController } from './modules/admin/admin.controller.js';
app.use('/admin/*', authMiddleware);
app.route('/admin', adminController);

// Health Check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'pixel-tasks-back' });
});

// Root
app.get('/', (c) => {
  return c.text('Pixel Tasks Backend is running (Phase 1)');
});

// Debug
import { db } from './db/index.js';
app.get('/debug', async (c) => {
  try {
    const isPostgres = !!process.env.DB_MODE && process.env.DB_MODE.toLowerCase() === 'postgres';
    
    // Attempt to do a raw query relying on the injected db
    let dbType = 'unknown';
    if (db && db.$client) {
        dbType = db.$client.constructor.name || 'postgres-client';
    } else if (db && typeof db.run === 'function') {
        dbType = 'sqlite';
    }

    return c.json({
      db_mode_env: process.env.DB_MODE || 'undefined',
      db_mode_env_lower: process.env.db_mode || 'undefined',
      dbType,
      supabaseUrlSet: !!process.env.SUPABASE_DB_URL,
      // If postgres, get counts, else print "not postgres"
      gamesCount: isPostgres ? (await db.execute('SELECT COUNT(*) FROM games'))[0]?.count : 'N/A'
    });
  } catch (err: any) {
    return c.json({ error: err.message, stack: err.stack }, 500);
  }
});

if (!process.env.VERCEL) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  console.log(`Server is running on port ${port}`);

  serve({
    fetch: app.fetch,
    port
  });
}

export type AppType = typeof app;
export default app;
