import { db } from '../../db/index.js';
import { users, pointsLog } from '../../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from './XPEngine.js';
import { EventType, type GamificationEvent } from './rules/BaseRule.js';

export class GamificationService {
  /**
   * Process a gamification event: calculate XP, log it, and update user.
   * Idempotency is handled by checking if eventId already exists in logs (optional specific check).
   */
  async processEvent(userId: string, type: EventType, payload: Record<string, any>, eventId: string) {
    const event: GamificationEvent = {
      type,
      userId,
      payload,
      timestamp: new Date(),
    };

    // 1. Calculate XP
    const pointsDelta = xpEngine.calculateXP(event);
    if (pointsDelta === 0) return null;

    // 2. Atomic Transaction
    return await db.transaction(async (tx) => {
      // Check for idempotency (simple check)
      const existingLog = await tx
        .select()
        .from(pointsLog)
        .where(eq(pointsLog.eventId, eventId))
        .limit(1);

      if (existingLog.length > 0) {
        console.log(`[Gamification] Event ${eventId} already processed.`);
        return null;
      }

      // Log points
      const logId = TSID.next();
      await tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: type,
        eventId,
        pointsDelta,
      });

      // Fetch current user state for calculation
      const [currentUser] = await tx
        .select({ points: users.points, version: users.version })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!currentUser) throw new Error('User not found');

      const newPoints = currentUser.points + pointsDelta;
      const newLevel = xpEngine.calculateLevel(newPoints);

      const [updatedUser] = await tx
        .update(users)
        .set({
          points: newPoints,
          level: newLevel,
          version: currentUser.version + 1,
        })
        .where(and(eq(users.id, userId), eq(users.version, currentUser.version))) // Optimistic Lock
        .returning();

      if (!updatedUser) {
        throw new Error(`Failed to update points for user ${userId} (Concurrency Error)`);
      }

      console.log(`[Gamification] User ${userId} gained ${pointsDelta} XP. Total: ${updatedUser.points}. Level: ${updatedUser.level}`);
      return updatedUser;
    });
  }
}

export const gamificationService = new GamificationService();
