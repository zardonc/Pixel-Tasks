import { api } from '../api/client';

export interface ListItem {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export const listService = {
  getLists: async () => {
    const { data } = await api.get<ListItem[]>('/tasks/lists');
    return data;
  },

  createList: async (name: string, color?: string, icon?: string) => {
    const { data } = await api.post<ListItem>('/tasks/lists', { name, color, icon });
    return data;
  },

  renameList: async (listId: string, name: string) => {
    const { data } = await api.patch<ListItem>(`/tasks/lists/${listId}`, { name });
    return data;
  },

  deleteList: async (listId: string) => {
    await api.delete(`/tasks/lists/${listId}`);
  },
};
