import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { HTTPException } from 'hono/http-exception';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

const SECRET = (process.env.JWT_SECRET || 'dev-secret') as string;

// Middleware to protect routes (require valid JWT)
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorized: Malformed token' });
  }

  try {
    const payload = verify(token, SECRET) as unknown as AuthUser;
    c.set('user', payload);
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to restrict access to ADMIN only
export const adminOnly = async (c: Context, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'ADMIN') {
    throw new HTTPException(403, { message: 'Forbidden: Admin access required' });
  }
  await next();
};
