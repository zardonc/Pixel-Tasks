import { db } from '../../db/index.js';
import { lists } from '../../db/schema.pg.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';

export class ListService {
  async getLists(userId: string) {
    return await db.select().from(lists).where(eq(lists.userId, userId));
  }

  async createList(userId: string, name: string, color?: string, icon?: string) {
    const listId = new TSID().toString();
    const [newList] = await db
      .insert(lists)
      .values({
        id: listId,
        userId,
        name,
        color,
        icon,
      })
      .returning();
    return newList;
  }

  async renameList(userId: string, listId: string, updates: { name?: string; color?: string; icon?: string }) {
    const [updated] = await db
      .update(lists)
      .set(updates)
      .where(and(eq(lists.id, listId), eq(lists.userId, userId)))
      .returning();
    return updated;
  }

  async deleteList(userId: string, listId: string) {
    const [deleted] = await db
      .delete(lists)
      .where(and(eq(lists.id, listId), eq(lists.userId, userId)))
      .returning();
    return deleted;
  }
}

export const listService = new ListService();
