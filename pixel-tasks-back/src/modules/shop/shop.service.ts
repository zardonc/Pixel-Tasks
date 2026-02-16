import { db } from '../../db/index.js';
import { users, pointsLog } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from '../gamification/XPEngine.js';

export class ShopService {
  /**
   * Buy an item: deduct XP atomically, log to points_log.
   * Returns updated user points or throws on insufficient XP.
   */
  async buyItem(userId: string, itemId: string, cost: number) {
    if (cost <= 0) throw new Error('Invalid cost');

    // 1. Fetch current user (async)
    const [currentUser] = await db
      .select({ points: users.points, version: users.version })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) throw new Error('User not found');
    if (currentUser.points < cost) throw new Error('Insufficient XP');

    // 2. Calculate new level (async — must be done before sync transaction)
    const newPoints = currentUser.points - cost;
    const newLevel = await xpEngine.calculateLevel(newPoints);

    // 3. Synchronous transaction for DB writes (better-sqlite3 requirement)
    const logId = TSID.next();

    const [updatedUser] = db.transaction((tx: any) => {
      const [updated] = tx
        .update(users)
        .set({
          points: newPoints,
          level: newLevel,
          version: currentUser.version + 1,
        })
        .where(and(eq(users.id, userId), eq(users.version, currentUser.version)))
        .returning()
        .all();

      if (!updated) throw new Error('Concurrency conflict — please retry');

      tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: 'SHOP_BUY',
        eventId: `shop_${itemId}_${Date.now()}`,
        pointsDelta: -cost,
      }).run();

      return [updated];
    });

    console.log(`[Shop] User ${userId} bought item ${itemId} for ${cost} XP. Remaining: ${updatedUser.points}`);
    return { points: updatedUser.points, level: updatedUser.level };
  }
}

export const shopService = new ShopService();
