import { db } from '../../db/index.js';
import { users, pointsLog } from '../../db/schema.pg.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from '../gamification/XPEngine.js';

import { achievements } from '../../db/schema.pg.js';

export class AchievementService {
  /**
   * Claim an achievement reward: add XP with idempotency check.
   * Returns updated user points/level, or throws if already claimed.
   */
  async claimReward(userId: string, achievementId: string) { // Removed reward param
    // 1. Fetch Achievement from DB
    const [ach] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, achievementId))
        .limit(1);

    if (!ach) throw new Error('Achievement not found');
    if (!ach.isVisible) throw new Error('Achievement not active');

    // 1b. Determine Event ID (handle daily recurring)
    let eventId = achievementId;
    if (achievementId === 'daily_login') {
      const today = new Date().toISOString().split('T')[0];
      eventId = `daily_login_${today}`;
    }

    // 2. Idempotency â€?check if this achievement was already claimed
    const existing = await db
      .select()
      .from(pointsLog)
      .where(
        and(
          eq(pointsLog.userId, userId),
          eq(pointsLog.eventType, 'ACHIEVEMENT_CLAIM'),
          eq(pointsLog.eventId, eventId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Already claimed');
    }

    const reward = ach.reward; // Use DB reward

    // 2. Fetch current user
    const [currentUser] = await db
      .select({ points: users.points, version: users.version })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) throw new Error('User not found');

    // 3. Calculate new level (async â€?must be done before sync transaction)
    const newPoints = currentUser.points + reward;
    const newLevel = await xpEngine.calculateLevel(newPoints);

    // 4. Synchronous transaction for DB writes (better-sqlite3 requirement)
    const logId = TSID.next();

    const [updatedUser] = await db.transaction(async (tx: any) => {
      const [updated] = await tx
        .update(users)
        .set({
          points: newPoints,
          level: newLevel,
          version: currentUser.version + 1,
        })
        .where(and(eq(users.id, userId), eq(users.version, currentUser.version)))
        .returning();

      if (!updated) throw new Error('Concurrency conflict â€?please retry');

      await tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: 'ACHIEVEMENT_CLAIM',
        eventId: eventId,
        pointsDelta: reward,
      });

      return [updated];
    });

    console.log(`[Achievement] User ${userId} claimed "${achievementId}" for ${reward} XP. Total: ${updatedUser.points}`);
    return { points: updatedUser.points, level: updatedUser.level };
  }
}

export const achievementService = new AchievementService();
