import { Hono } from 'hono';
import { shopService } from './shop.service.js';

export const shopController = new Hono();

// GET /shop/items — List all visible shop items
shopController.get('/items', async (c) => {
  const user = c.get('user');
  try {
    const items = await shopService.getAllItems(user.id);
    return c.json(items);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch items' }, 500);
  }
});

// POST /shop/buy — Purchase an item (deducts XP)
shopController.post('/buy', async (c) => {
  const user = c.get('user');
  const { itemId } = await c.req.json(); // Cost is looked up by service now

  if (!itemId) {
    return c.json({ error: 'itemId is required' }, 400);
  }

  try {
    const result = await shopService.buyItem(user.id, itemId, 0); // Cost handled by service
    return c.json(result);
  } catch (err: any) {
    if (err.message === 'Insufficient XP') {
      return c.json({ error: 'Not enough XP' }, 400);
    }
    if (err.message === 'Item not found' || err.message === 'Item is not available') {
        return c.json({ error: err.message }, 404);
    }
    console.error('[ShopController] Purchase failed:', err);
    return c.json({ error: 'Purchase failed' }, 500);
  }
});

// POST /shop/equip — Update user inventory equipment state
shopController.post('/equip', async (c) => {
  const user = c.get('user');
  const { itemId } = await c.req.json();
  
  if (!itemId) return c.json({ error: 'itemId is required' }, 400);

  try {
    const result = await shopService.equipItem(user.id, itemId);
    return c.json(result);
  } catch (err: any) {
    console.error('[ShopController] Equip failed:', err);
    return c.json({ error: err.message || 'Equip failed' }, 500);
  }
});
