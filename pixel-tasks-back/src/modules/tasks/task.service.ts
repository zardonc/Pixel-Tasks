import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';

export class TaskService {
  async getTasks(userId: string, listId?: string) {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (listId) {
      query = db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.listId, listId)));
    }
    
    return await query;
  }

  async createTask(userId: string, title: string, listId?: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY') {
    const taskId = new TSID().toString();
    const [newTask] = await db
      .insert(tasks)
      .values({
        id: taskId,
        userId,
        listId,
        title,
        status: 'TODO',
        difficulty,
      })
      .returning();
    return newTask;
  }

  async completeTask(userId: string, taskId: string) {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'DONE',
        completedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    return updatedTask;
  }
}

export const taskService = new TaskService();
