import { Hono } from 'hono';
import { taskService } from './task.service.js';
import { listService } from './list.service.js';

export const taskController = new Hono();

// Lists
taskController.get('/lists', async (c) => {
  const user = c.get('user');
  const lists = await listService.getLists(user.id);
  return c.json(lists);
});

taskController.post('/lists', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const list = await listService.createList(user.id, body.name, body.color, body.icon);
  return c.json(list, 201);
});

// Tasks
taskController.get('/', async (c) => {
  const user = c.get('user');
  const listId = c.req.query('listId');
  const tasks = await taskService.getTasks(user.id, listId);
  return c.json(tasks);
});

taskController.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const task = await taskService.createTask(user.id, body.title, body.listId, body.difficulty);
  return c.json(task, 201);
});

taskController.post('/:id/complete', async (c) => {
  const user = c.get('user');
  const taskId = c.req.param('id');
  const task = await taskService.completeTask(user.id, taskId);
  
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  // Trigger XP Engine
  try {
    const { gamificationService } = await import('../gamification/gamification.service.js');
    const { EventType } = await import('../gamification/rules/BaseRule.js');
    
    await gamificationService.processEvent(
      user.id,
      EventType.TASK_COMPLETE,
      { taskId: task.id, difficulty: task.difficulty },
      task.id // Use taskId as eventId to prevent double-dipping for the same task
    );
  } catch (err) {
    console.error('[TaskController] Failed to process gamification event:', err);
    // Don't fail the request if gamification fails
  }
  
  return c.json(task);
});
