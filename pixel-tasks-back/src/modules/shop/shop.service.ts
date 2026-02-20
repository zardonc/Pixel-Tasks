import { db } from '../../db/index.js';
import { users, pointsLog } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from '../gamification/XPEngine.js';

import { shopItems } from '../../db/schema.js';

export class ShopService {
  /**
   * Get all visible shop items (or all for admin - TODO: separate admin endpoint or param?)
   * For now, public endpoint returns only visible.
   */
  async getAllItems() {
    return db.select().from(shopItems).where(eq(shopItems.isVisible, true));
  }

  /**
   * Buy an item: deduct XP atomically, log to points_log.
   * Returns updated user points or throws on insufficient XP.
   */
  async buyItem(userId: string, itemId: string, clientCost: number) {
    // 1. Fetch Item from DB to validate cost and existence
    const [item] = await db
      .select()
      .from(shopItems)
      .where(eq(shopItems.id, itemId))
      .limit(1);

    if (!item) throw new Error('Item not found');
    if (!item.isVisible) throw new Error('Item is not available');

    // 2. Fetch current user (async)
    const [currentUser] = await db
      .select({ points: users.points, version: users.version, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) throw new Error('User not found');

    const isAdmin = currentUser.role === 'ADMIN';
    const cost = item.cost; // Use DB cost, ignore clientCost (or validate they match)
    
    // Admin Bypass Logic
    if (!isAdmin) {
      if (currentUser.points < cost) throw new Error('Insufficient XP');
    }

    // 3. Calculate new level (async — must be done before sync transaction)
    // If admin buys, cost is effectively 0 for them (or we deduct 0).
    const pointsToDeduct = isAdmin ? 0 : cost;
    const newPoints = currentUser.points - pointsToDeduct;
    
    // Only recalc level if points changed (optimization)
    const newLevel = pointsToDeduct > 0 
      ? await xpEngine.calculateLevel(newPoints) 
      : currentUser.points; // Level unlikely to change if 0 points deducted (unless level formula changes dynamic)
      // Actually, if admins have 0 deduction, level doesn't change.
      // But if we want to be safe, just recalc or leave as is.
      // Wait, if isAdmin, points don't change, so level is same.
    
    // 4. Synchronous transaction for DB writes
    const logId = TSID.next();

    const [updatedUser] = db.transaction((tx: any) => {
      // Only update user if points changed
      let updated = { points: currentUser.points, level: newLevel /* approx */, version: currentUser.version };
      
      if (pointsToDeduct > 0) {
        const [res] = tx
          .update(users)
          .set({
            points: newPoints,
            level: newLevel,
            version: currentUser.version + 1,
          })
          .where(and(eq(users.id, userId), eq(users.version, currentUser.version)))
          .returning()
          .all();
          
        if (!res) throw new Error('Concurrency conflict — please retry');
        updated = res;
      }

      tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: isAdmin ? 'SHOP_BUY_ADMIN' : 'SHOP_BUY',
        eventId: `shop_${itemId}_${Date.now()}`,
        pointsDelta: -pointsToDeduct,
      }).run();

      return [updated];
    });

    console.log(`[Shop] User ${userId} (${currentUser.role}) bought item ${itemId}. Cost: ${pointsToDeduct}. Remaining: ${updatedUser.points}`);
    return { points: updatedUser.points, level: updatedUser.level };
  }
}

export const shopService = new ShopService();
