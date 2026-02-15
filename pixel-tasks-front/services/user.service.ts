import { api } from '../api/client';
import { User } from '../types';

export const userService = {
  getProfile: async () => {
    const { data } = await api.get<User>('/user/profile');
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await api.post<{ message: string }>('/user/password', {
      oldPassword,
      newPassword,
    });
    return data;
  },
};
