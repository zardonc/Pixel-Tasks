import { Hono } from 'hono';
import { authMiddleware } from '../../middlewares/auth.js';
import { userService } from './user.service.js';

const user = new Hono();

// Apply Auth Middleware to all routes in this module
user.use('*', authMiddleware);

// Get Profile
user.get('/profile', async (c) => {
  const currentUser = c.get('user');
  const profile = await userService.getProfile(currentUser.id);
  return c.json(profile);
});

export default user;
