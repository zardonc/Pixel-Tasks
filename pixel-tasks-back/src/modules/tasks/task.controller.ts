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
  // Body should match TaskService expectation
  const task = await taskService.createTask(user.id, body);
  return c.json(task, 201);
});

taskController.patch('/:id', async (c) => {
  const user = c.get('user');
  const taskId = c.req.param('id');
  const body = await c.req.json();
  const task = await taskService.updateTask(user.id, taskId, body);
  return c.json(task);
});

taskController.delete('/:id', async (c) => {
  const user = c.get('user');
  const taskId = c.req.param('id');
  await taskService.deleteTask(user.id, taskId);
  return c.json({ success: true });
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
      { taskId: task.id, difficulty: task.priority }, // Map priority to difficulty rule
      task.id 
    );
  } catch (err) {
    console.error('[TaskController] Failed to process gamification event:', err);
  }
  
  // Re-fetch user to get updated points/level
  const { authService } = await import('../auth/auth.service.js');
  const updatedUser = await authService.getProfile(user.id);

  return c.json({ 
    task, 
    points: updatedUser?.points || 0, 
    level: updatedUser?.level || 1 
  });
});
