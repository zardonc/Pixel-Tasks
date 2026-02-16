import { Hono } from 'hono';
import { shopService } from './shop.service.js';

export const shopController = new Hono();

// POST /shop/buy — Purchase an item (deducts XP)
shopController.post('/buy', async (c) => {
  const user = c.get('user');
  const { itemId, cost } = await c.req.json();

  if (!itemId || typeof cost !== 'number' || cost <= 0) {
    return c.json({ error: 'itemId and positive cost are required' }, 400);
  }

  try {
    const result = await shopService.buyItem(user.id, itemId, cost);
    return c.json(result);
  } catch (err: any) {
    if (err.message === 'Insufficient XP') {
      return c.json({ error: 'Not enough XP' }, 400);
    }
    console.error('[ShopController] Purchase failed:', err);
    return c.json({ error: 'Purchase failed' }, 500);
  }
});
