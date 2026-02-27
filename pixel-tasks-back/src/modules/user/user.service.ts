import { db } from '../../db/index.js';
import { users } from '../../db/schema.pg.js';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcryptjs';

const { hash, compare } = bcrypt;

class UserService {
  async getProfile(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        name: users.name,
        companion: users.companion,
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

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // 1. Fetch user with passwordHash
    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // 2. Verify old password
    const isValid = await compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new HTTPException(401, { message: 'Current password is incorrect' });
    }

    // 3. Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new HTTPException(400, { message: 'New password must be at least 6 characters' });
    }

    // 4. Hash and update
    const newHash = await hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, userId));

    return { message: 'Password changed successfully' };
  }
}

export const userService = new UserService();
