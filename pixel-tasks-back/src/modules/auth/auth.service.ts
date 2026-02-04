import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const { sign } = jwt;
const { hash, compare } = bcrypt;
import TSID from 'tsid';
import { HTTPException } from 'hono/http-exception';

const SECRET = (process.env.JWT_SECRET || 'dev-secret') as string;

class AuthService {
  private generateToken(user: typeof users.$inferSelect) {
    return sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(email: string, password: string, role: 'USER' | 'ADMIN' = 'USER') {
    // Check existing
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new HTTPException(409, { message: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await hash(password, 10);
    const id = TSID.next();

    // Create user
    const [newUser] = await db.insert(users).values({
      id,
      email,
      passwordHash,
      role,
    }).returning();

    if (!newUser) {
      throw new HTTPException(500, { message: 'Failed to create user' });
    }

    return {
      token: this.generateToken(newUser),
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    };
  }

  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    return {
      token: this.generateToken(user),
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}

export const authService = new AuthService();
