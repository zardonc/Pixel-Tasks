import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { games } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

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
