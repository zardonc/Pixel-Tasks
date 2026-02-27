import { db } from '../../db/index.js';
import { users, pointsLog, shopItems, userItems, shopTransactions } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';
import { xpEngine } from '../gamification/XPEngine.js';

export class ShopService {
  /**
   * Get all visible shop items and merge inventory for a specific user.
   */
  async getAllItems(userId: string) {
    const items = await db
      .select({
        item: shopItems,
        inventory: userItems
      })
      .from(shopItems)
      .leftJoin(userItems, and(
          eq(shopItems.id, userItems.itemId),
          eq(userItems.userId, userId)
      ))
      .where(eq(shopItems.isVisible, true));

    return items.map(({ item, inventory }: any) => ({
      ...item,
      owned: item.cost === 0 || !!inventory, // Zero cost items are permanently "owned" logically
      equipped: !!inventory?.isEquipped || (item.id === 'default' && !inventory), // default theme fallback
    }));
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
    const txId = TSID.next();
    const inventoryId = TSID.next();

    const [updatedUser] = await db.transaction(async (tx: any) => {
      // Only update user if points changed
        let updated = { points: currentUser.points, level: newLevel /* approx */, version: currentUser.version };
      
      if (pointsToDeduct > 0) {
        const [res] = await tx
          .update(users)
          .set({
            points: newPoints,
            level: newLevel,
            version: currentUser.version + 1,
          })
          .where(and(eq(users.id, userId), eq(users.version, currentUser.version)))
          .returning();
          
        if (!res) throw new Error('Concurrency conflict — please retry');
        updated = res;
      }

      // 4.1 Write Gamification Log
      await tx.insert(pointsLog).values({
        id: logId,
        userId,
        eventType: isAdmin ? 'SHOP_BUY_ADMIN' : 'SHOP_BUY',
        eventId: `shop_${itemId}_${Date.now()}`,
        pointsDelta: -pointsToDeduct,
      });

      // 4.2 Write Transaction Receipt (Audit Table)
      await tx.insert(shopTransactions).values({
        id: txId,
        userId,
        itemId,
        pricePaid: pointsToDeduct,
      });

      // 4.3 Inject into User Inventory (Persistent Storage)
      await tx.insert(userItems).values({
        id: inventoryId,
        userId,
        itemId,
      });

      return [updated];
    });

    console.log(`[Shop] User ${userId} (${currentUser.role}) bought item ${itemId}. Cost: ${pointsToDeduct}. Remaining: ${updatedUser.points}`);
    return { points: updatedUser.points, level: updatedUser.level };
  }

  /**
   * Equips an item (unequips previous items of the same type via transaction)
   */
  async equipItem(userId: string, itemId: string) {
    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, itemId)).limit(1);
    if (!item) throw new Error("Item not found");

    await db.transaction(async (tx: any) => {
      // 1. Find all currently equipped items of the *same type* for this user and unequip them
      // In SQLite + Drizzle, this requires a subquery or a manual update, but since we map logic in JS sometimes,
      // the safest way is to find the IDs of the same type.
      const userInventoryOfSameType = await tx.select({ invId: userItems.id })
        .from(userItems)
        .innerJoin(shopItems, eq(userItems.itemId, shopItems.id))
        .where(and(
          eq(userItems.userId, userId),
          eq(shopItems.type, item.type)
        ));
      
      const invIds = userInventoryOfSameType.map((r: any) => r.invId);

      // Unequip all items of that type
      if (invIds.length > 0) {
         for (const id of invIds) {
             await tx.update(userItems)
               .set({ isEquipped: false })
               .where(eq(userItems.id, id));
         }
      }

      // 2. Equip the new item
      // Note: For "default" items with 0 cost, we might not have a record if they didn't "buy" it. 
      // Ensure there's a record first.
      const [existingInv] = await tx.select().from(userItems).where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
      
      if (!existingInv && item.cost === 0) {
          // Auto-grant 0-cost item dynamically if equipping
          await tx.insert(userItems).values({
              id: TSID.next(),
              userId,
              itemId,
              isEquipped: true
          });
      } else if (existingInv) {
          await tx.update(userItems)
            .set({ isEquipped: true })
            .where(eq(userItems.id, existingInv.id));
      } else {
          throw new Error("Item not owned");
      }
    });

    return { success: true };
  }
}

export const shopService = new ShopService();
