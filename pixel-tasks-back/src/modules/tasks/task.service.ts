import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import TSID from 'tsid';

export class TaskService {
  private mapTask(task: typeof tasks.$inferSelect) {
    return {
      ...task,
      completed: task.status === 'DONE',
    };
  }

  async getTasks(userId: string, listId?: string) {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (listId) {
      query = db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.listId, listId)));
    }
    
    const results = await query;
    return results.map(this.mapTask);
  }

  async createTask(userId: string, data: {
    title: string;
    description?: string;
    list?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: 'WORK' | 'HEALTH' | 'FUN' | 'CHORE';
    xpReward?: number;
    isDaily?: boolean;
    dueDate?: string;
  }) {
    const taskId = TSID.next();
    const [newTask] = await db
      .insert(tasks)
      .values({
        id: taskId,
        userId,
        title: data.title,
        description: data.description,
        list: data.list,
        priority: data.priority || 'MEDIUM',
        category: data.category || 'CHORE',
        xpReward: data.xpReward || 100,
        isDaily: data.isDaily || false,
        dueDate: data.dueDate,
        status: 'TODO',
      })
      .returning();
    
    if (!newTask) throw new Error('Failed to create task');
    
    return this.mapTask(newTask);
  }

  async updateTask(userId: string, taskId: string, updates: Partial<typeof tasks.$inferInsert> & { completed?: boolean }) {
    // Handle completed boolean to status mapping
    const { completed, ...rest } = updates;
    const dbUpdates: any = { ...rest };
    if (completed !== undefined) {
      dbUpdates.status = completed ? 'DONE' : 'TODO';
      if (completed) dbUpdates.completedAt = new Date();
      else dbUpdates.completedAt = null;
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({ ...dbUpdates, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return updatedTask ? this.mapTask(updatedTask) : null;
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
    
    return updatedTask ? this.mapTask(updatedTask) : null;
  }

  async deleteTask(userId: string, taskId: string) {
    await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }
}

export const taskService = new TaskService();
