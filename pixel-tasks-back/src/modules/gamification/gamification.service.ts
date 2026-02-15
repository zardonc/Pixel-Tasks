import { db } from '../../db/index.js';
import { users, pointsLog } from '../../db/schema.js';
import { eq, and, sql, gte } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from './XPEngine.js';
import { EventType, type GamificationEvent } from './rules/BaseRule.js';
import { configService } from '../config/config.service.js';

export class GamificationService {
  /**
   * Process a gamification event: calculate XP, enforce daily cap, log it, and update user.
   */
  async processEvent(userId: string, type: EventType, payload: Record<string, any>, eventId: string) {
    const event: GamificationEvent = {
      type,
      userId,
      payload,
      timestamp: new Date(),
    };

    // 1. Calculate XP (now async — reads from config)
    let pointsDelta = await xpEngine.calculateXP(event);
    if (pointsDelta === 0) return null;

    // 2. Enforce daily High XP cap
    if (type === EventType.TASK_COMPLETE && payload.difficulty === 'HIGH') {
      const config = await configService.getXpConfig();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Sum today's HIGH task XP
      const [todayHighXp] = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointsLog.pointsDelta}), 0)` })
        .from(pointsLog)
        .where(
          and(
            eq(pointsLog.userId, userId),
            eq(pointsLog.eventType, 'TASK_COMPLETE_HIGH'),
            gte(pointsLog.createdAt, todayStart)
          )
        );

      const currentTotal = todayHighXp?.total ?? 0;
      const remaining = config.dailyHighXpCap - currentTotal;

      if (remaining <= 0) {
        console.log(`[Gamification] Daily High XP cap reached for user ${userId}. Skipping.`);
        pointsDelta = 0;
      } else if (pointsDelta > remaining) {
        console.log(`[Gamification] Clamping High XP: ${pointsDelta} → ${remaining} (cap: ${config.dailyHighXpCap})`);
        pointsDelta = remaining;
      }

      if (pointsDelta === 0) return null;
    }

    // 3. Atomic Transaction
    return await db.transaction(async (tx: any) => {
      // Check for idempotency
      const existingLog = await tx
        .select()
        .from(pointsLog)
        .where(eq(pointsLog.eventId, eventId))
        .limit(1);

      if (existingLog.length > 0) {
        console.log(`[Gamification] Event ${eventId} already processed.`);
        return null;
      }

      // Tag HIGH tasks separately for cap tracking
      const logEventType = (type === EventType.TASK_COMPLETE && payload.difficulty === 'HIGH')
        ? 'TASK_COMPLETE_HIGH'
        : type;

      // Log points
      const logId = TSID.next();
      await tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: logEventType,
        eventId,
        pointsDelta,
      });

      // Fetch current user state
      const [currentUser] = await tx
        .select({ points: users.points, version: users.version })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!currentUser) throw new Error('User not found');

      const newPoints = currentUser.points + pointsDelta;
      const newLevel = await xpEngine.calculateLevel(newPoints);

      const [updatedUser] = await tx
        .update(users)
        .set({
          points: newPoints,
          level: newLevel,
          version: currentUser.version + 1,
        })
        .where(and(eq(users.id, userId), eq(users.version, currentUser.version)))
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
