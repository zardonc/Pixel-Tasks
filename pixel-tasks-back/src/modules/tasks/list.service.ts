import { db } from '../../db/index.js';
import { lists } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
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

  async deleteList(userId: string, listId: string) {
    const [deleted] = await db
      .delete(lists)
      .where(eq(lists.id, listId))
      .returning();
    return deleted;
  }
}

export const listService = new ListService();
