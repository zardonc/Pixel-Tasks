import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { games } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../../middlewares/auth.js';
import { gamificationService } from '../gamification/gamification.service.js';
import { EventType } from '../gamification/rules/BaseRule.js';
import TSID from 'tsid';

export const gameHubController = new Hono();

// GET /games — List all visible games
gameHubController.get('/', async (c) => {
  try {
    const visibleGames = await db
      .select()
      .from(games)
      .where(eq(games.isVisible, true));
      
    return c.json(visibleGames);
  } catch (err: any) {
    console.error('[GameHub] Failed to fetch games:', err);
    return c.json({ error: 'Failed to fetch games' }, 500);
  }
});

// POST /games/score — Submit a completely game session score and earn XP
gameHubController.post('/score', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        const { gameId, score } = await c.req.json();

        if (!gameId || typeof score !== 'number') {
            return c.json({ error: 'Valid gameId and numeric score are required' }, 400);
        }

        const id = typeof TSID.next() === 'string' ? TSID.next() : String(TSID.next());

        const updatedUser = await gamificationService.processEvent(
            user.id,
            EventType.GAME_SESSION_COMPLETE,
            { gameId, score },
            id
        );

        if (updatedUser) {
             return c.json({ 
                 message: 'Score submitted and XP awarded', 
                 points: updatedUser.points, 
                 level: updatedUser.level 
             });
        }

        return c.json({ message: 'Score submitted', points: null, level: null });

    } catch (err: any) {
        console.error('[GameHub POST /score] Failed:', err);
        return c.json({ error: err.message }, 500);
    }
});
