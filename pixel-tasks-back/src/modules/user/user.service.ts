import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

class UserService {
  async getProfile(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        points: users.points,
        level: users.level,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return user;
  }
}

export const userService = new UserService();
