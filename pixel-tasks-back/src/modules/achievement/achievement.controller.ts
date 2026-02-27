import { Hono } from 'hono';
import { achievementService } from './achievement.service.js';
import { db } from '../../db/index.js';
import { achievements } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const achievementController = new Hono();

// GET /achievements â€?List all visible achievements
achievementController.get('/', async (c) => {
  try {
    // Determine if we should show hidden? For now only visible
    // To support Admin viewing hidden, we might need a separate admin endpoint or param
    // But AdminController handles CRUD.
    const list = await db.select().from(achievements).where(eq(achievements.isVisible, true));
    return c.json(list);
  } catch (err: any) {
    console.error('[AchievementController] List failed:', err);
    return c.json({ error: 'Failed to fetch achievements' }, 500);
  }
});

// POST /achievements/claim â€?Claim an achievement reward (adds XP, idempotent)
achievementController.post('/claim', async (c) => {
  const user = c.get('user');
  const { achievementId } = await c.req.json();

  if (!achievementId) {
    return c.json({ error: 'achievementId is required' }, 400);
  }

  try {
    const result = await achievementService.claimReward(user.id, achievementId);
    return c.json(result);
  } catch (err: any) {
    if (err.message === 'Already claimed') {
      return c.json({ error: 'Achievement already claimed' }, 409);
    }
    if (err.message === 'Achievement not found' || err.message === 'Achievement not active') {
        return c.json({ error: err.message }, 404);
    }
    console.error('[AchievementController] Claim failed:', err);
    return c.json({ error: 'Claim failed' }, 500);
  }
});
