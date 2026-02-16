import { Hono } from 'hono';
import { achievementService } from './achievement.service.js';

export const achievementController = new Hono();

// POST /achievements/claim — Claim an achievement reward (adds XP, idempotent)
achievementController.post('/claim', async (c) => {
  const user = c.get('user');
  const { achievementId, reward } = await c.req.json();

  if (!achievementId || typeof reward !== 'number' || reward <= 0) {
    return c.json({ error: 'achievementId and positive reward are required' }, 400);
  }

  try {
    const result = await achievementService.claimReward(user.id, achievementId, reward);
    return c.json(result);
  } catch (err: any) {
    if (err.message === 'Already claimed') {
      return c.json({ error: 'Achievement already claimed' }, 409);
    }
    console.error('[AchievementController] Claim failed:', err);
    return c.json({ error: 'Claim failed' }, 500);
  }
});
