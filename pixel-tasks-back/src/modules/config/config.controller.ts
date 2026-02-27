import { Hono } from 'hono';
import { configService } from './config.service.js';
import { adminOnly } from '../../middlewares/auth.js';

export const configController = new Hono();

// GET /config/xp â€?Any authenticated user can read the XP config
configController.get('/xp', async (c) => {
  const config = await configService.getXpConfig();
  return c.json(config);
});

// PUT /config/xp â€?Admin only: update XP rules
configController.put('/xp', adminOnly, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const result = await configService.updateXpConfig(body, user.id);
    return c.json({ message: 'XP config updated', version: result.version });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});
