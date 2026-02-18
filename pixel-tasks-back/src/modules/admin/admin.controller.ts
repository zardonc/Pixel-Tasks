import { Hono } from 'hono';
import { adminOnly } from '../../middlewares/auth.js';
import { configService } from '../config/config.service.js';
import { db } from '../../db/index.js';
import { gameConfig, shopItems, games, achievements } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import TSID from 'tsid';

export const adminController = new Hono();

// Apply Admin Middleware to all routes
adminController.use('*', adminOnly);

// ── XP Rules Engine ──
adminController.get('/xp-config', async (c) => {
  try {
    const config = await configService.getXpConfig();
    return c.json(config);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch config' }, 500);
  }
});

adminController.post('/xp-config', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  try {
    const result = await configService.updateXpConfig(body, user.id);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// ── Shop Management ──
adminController.get('/shop-items', async (c) => {
  try {
    const items = await db.select().from(shopItems);
    return c.json(items);
  } catch (err) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

adminController.patch('/shop-items/:id', async (c) => {
  const { id } = c.req.param();
  const { isVisible, cost } = await c.req.json();
  
  try {
    await db.update(shopItems)
      .set({ 
        isVisible: isVisible !== undefined ? isVisible : undefined,
        cost: cost !== undefined ? cost : undefined
      })
      .where(eq(shopItems.id, id));
      
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: 'Update failed' }, 500);
  }
});

// ── Game Management ──
adminController.get('/games', async (c) => {
  try {
    const list = await db.select().from(games);
    return c.json(list);
  } catch (err) {
    return c.json({ error: 'Failed to fetch games' }, 500);
  }
});

adminController.patch('/games/:id', async (c) => {
  const id = c.req.param('id');
  const { isVisible } = await c.req.json();
  
  if (typeof isVisible !== 'boolean') return c.json({ error: 'isVisible must be boolean' }, 400);

  const [updated] = await db
    .update(games)
    .set({ isVisible })
    .where(eq(games.id, id))
    .returning();
    
  if (!updated) return c.json({ error: 'Game not found' }, 404);
  return c.json(updated);
});

// ── Hall of Fame// Achievement Management
adminController.get('/achievements', async (c) => {
  try {
    const list = await db.select().from(achievements);
    return c.json(list);
  } catch (err) {
    return c.json({ error: 'Failed to fetch achievements' }, 500);
  }
});

// Create
adminController.post('/achievements', async (c) => {
  const body = await c.req.json();
  const { id, title, description, reward, maxProgress, icon } = body;
  
  // Basic validation
  if (!title || !description || !reward) return c.json({ error: 'Missing fields' }, 400);

  const newId = id || TSID.next(); // Allow custom ID (e.g. daily_login) or generate new

  try {
    const [created] = await db.insert(achievements).values({
      id: newId,
      title,
      description,
      reward,
      maxProgress: maxProgress || 1,
      icon: icon || 'trophy',
      isVisible: true
    }).onConflictDoNothing().returning(); // TODO: Handle conflict better?

    if (!created) return c.json({ error: 'ID already exists' }, 409);
    return c.json(created);
  } catch (err: any) {
    console.error(err);
    return c.json({ error: 'Failed to create' }, 500);
  }
});

// Update
adminController.put('/achievements/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const [updated] = await db.update(achievements).set(body).where(eq(achievements.id, id)).returning();
  
  if (!updated) return c.json({ error: 'Achievement not found' }, 404);
  return c.json(updated);
});

// Delete
adminController.delete('/achievements/:id', async (c) => {
  const id = c.req.param('id');
  // We probably shouldn't fully delete if users have claimed it... but for now:
  await db.delete(achievements).where(eq(achievements.id, id)).run();
  return c.json({ success: true });
});
