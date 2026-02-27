import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { games } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../../middlewares/auth.js';
import { gamificationService } from '../gamification/gamification.service.js';
import { gameHubService } from './gamehub.service.js';
import { EventType } from '../gamification/rules/BaseRule.js';
import TSID from 'tsid';

export const gameHubController = new Hono();

// GET /games â€?List all visible games
gameHubController.get('/', async (c) => {
  try {
    console.log('[GameHub] Attempting to fetch games from DB...');
    const visibleGames = await db
      .select()
      .from(games)
      .where(eq(games.isVisible, true));
      
    console.log(`[GameHub] Fetched ${visibleGames.length} games.`);
    return c.json(visibleGames);
  } catch (err: any) {
    console.error('[GameHub] Failed to fetch games:', err);
    return c.json({ error: 'Failed to fetch games' }, 500);
  }
});

// POST /games/score â€?Submit a completely game session score and earn XP
gameHubController.post('/score', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        const { gameId, score } = await c.req.json();

        if (!gameId || typeof score !== 'number') {
            return c.json({ error: 'Valid gameId and numeric score are required' }, 400);
        }

        const id = typeof TSID.next() === 'string' ? TSID.next() : String(TSID.next());

        await gameHubService.updateHighScoreIfGreater(user.id, gameId, score);

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

// GET /games/score/:gameId â€?Get the current user's high score for a specific game
gameHubController.get('/score/:gameId', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        const gameId = c.req.param('gameId');
        const highScore = await gameHubService.getUserHighScore(user.id, gameId);
        return c.json({ highScore });
    } catch (err: any) {
        console.error('[GameHub GET /score/:gameId] Failed:', err);
        return c.json({ error: 'Failed to fetch user high score' }, 500);
    }
});

// GET /games/leaderboard/:gameId â€?Get top 10 high scores for a specific game
gameHubController.get('/leaderboard/:gameId', async (c) => {
    try {
        const gameId = c.req.param('gameId');
        const leaderboard = await gameHubService.getTop10HighScores(gameId);
        return c.json(leaderboard);
    } catch (err: any) {
        console.error('[GameHub GET /leaderboard/:gameId] Failed:', err);
        return c.json({ error: 'Failed to fetch leaderboard' }, 500);
    }
});
