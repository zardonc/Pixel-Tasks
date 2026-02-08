import { api } from '../api/client';
import { Task } from '../types';

export const taskService = {
  getTasks: async () => {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
  },

  createTask: async (task: Partial<Task>) => {
    const { data } = await api.post<Task>('/tasks', task);
    return data;
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, updates);
    return data;
  },

  completeTask: async (id: string) => {
    const { data } = await api.post<{ task: Task; points: number; level: number }>(`/tasks/${id}/complete`);
    return data;
  },

  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  }
};
