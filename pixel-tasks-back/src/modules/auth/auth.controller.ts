import { Hono } from 'hono';
import { authService } from './auth.service.js';
import { authMiddleware } from '../../middlewares/auth.js';

const auth = new Hono();

// Register
auth.post('/register', async (c) => {
  const { email, password, name, companion, role } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: 'Email and password required' }, 400);
  }
  
  const result = await authService.register(email, password, name, companion, role);
  return c.json(result, 201);
});

// Login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: 'Email and password required' }, 400);
  }

  const result = await authService.login(email, password);
  return c.json(result);
});

// Me (Protected)
auth.get('/me', authMiddleware, async (c) => {
  const userPayload = c.get('user');
  const user = await authService.getProfile(userPayload.id);
  return c.json(user); // Returns flat user object directly
});

export default auth;
