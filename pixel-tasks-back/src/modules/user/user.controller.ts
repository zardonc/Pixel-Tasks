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

// Change Password
user.post('/password', async (c) => {
  const currentUser = c.get('user');
  const body = await c.req.json();

  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return c.json({ error: 'Both oldPassword and newPassword are required' }, 400);
  }

  const result = await userService.changePassword(currentUser.id, oldPassword, newPassword);
  return c.json(result);
});

export default user;
