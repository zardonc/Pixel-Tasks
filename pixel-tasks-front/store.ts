import { create } from 'zustand';
import { taskService } from './services/task.service';
import { listService, ListItem } from './services/list.service';
import { User, Task, ShopItem, Achievement, CompanionType, Game } from './types';
import { api } from './api/client';

interface AppState {
  user: User | null;
  tasks: Task[];
  customLists: ListItem[];
  shopItems: ShopItem[];
  achievements: Achievement[];
  games: Game[];
  isDarkMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void; 
  login: (name: string, email: string, companion: CompanionType) => void;
  logout: () => void;
  
  fetchTasks: () => Promise<void>;
  fetchLists: () => Promise<void>;
  fetchShopItems: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchGames: () => Promise<void>;

  addTask: (task: Partial<Task>) => Promise<void>;
  addList: (name: string) => Promise<void>;
  renameList: (oldName: string, newName: string) => Promise<void>; 
  deleteList: (name: string) => Promise<void>; 
  deleteCompletedTasks: (listFilter: string) => void; 
  toggleTask: (id: string) => Promise<void>; 
  deleteTask: (id: string) => Promise<void>; 
  updateTask: (task: Task) => Promise<void>; 
  
  buyItem: (id: string) => Promise<void>;
  equipItem: (id: string) => void;
  toggleDarkMode: () => void;
  addXp: (amount: number) => void;
  claimAchievement: (id: string) => Promise<void>; 
  submitGameScore: (gameId: string, score: number) => Promise<void>;
}

const INITIAL_TASKS: Task[] = [];

// ── LocalStorage Persistence Helpers ──
const LS_EQUIPPED_ITEM = 'pixel_equipped_item';
const LS_CLAIMED_ACHIEVEMENTS = 'pixel_claimed_achievements';
const LS_LAST_DAILY_LOGIN = 'pixel_last_daily_login';

function loadEquippedItem(userId?: string): string | null {
  const prefix = userId ? `${userId}_` : '';
  return localStorage.getItem(`${prefix}${LS_EQUIPPED_ITEM}`);
}

function saveEquippedItem(userId: string | undefined, id: string) {
  const prefix = userId ? `${userId}_` : '';
  localStorage.setItem(`${prefix}${LS_EQUIPPED_ITEM}`, id);
}

function loadClaimedAchievements(userId?: string): Set<string> {
  const prefix = userId ? `${userId}_` : '';
  try { return new Set(JSON.parse(localStorage.getItem(`${prefix}${LS_CLAIMED_ACHIEVEMENTS}`) || '[]')); }
  catch { return new Set(); }
}

function saveClaimedAchievements(userId: string | undefined, items: Set<string>) {
  const prefix = userId ? `${userId}_` : '';
  localStorage.setItem(`${prefix}${LS_CLAIMED_ACHIEVEMENTS}`, JSON.stringify(Array.from(items)));
}

function loadLastDailyLogin(userId?: string): string | null {
  const prefix = userId ? `${userId}_` : '';
  return localStorage.getItem(`${prefix}${LS_LAST_DAILY_LOGIN}`);
}

function saveLastDailyLogin(userId: string | undefined, dateStr: string) {
  const prefix = userId ? `${userId}_` : '';
  localStorage.setItem(`${prefix}${LS_LAST_DAILY_LOGIN}`, dateStr);
}

export const useStore = create<AppState>((set, get) => ({
  user: null, 
  tasks: INITIAL_TASKS,
  customLists: [],
  shopItems: [], 
  achievements: [],
  games: [],
  isDarkMode: false,

  setUser: (user) => set({ user }),

  login: (name, email, companion) => {
      // Login logic is handled by AuthContext
  },

  logout: () => {
      set({ user: null, tasks: [], customLists: [] });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
  },

  fetchTasks: async () => {
    try {
        const tasks = await taskService.getTasks();
        set({ tasks });
    } catch (e) {
        console.error('Failed to fetch tasks', e);
    }
  },

  fetchLists: async () => {
      try {
          const customLists = await listService.getLists();
          set({ customLists });
      } catch (e) {
          console.error("Failed to fetch lists", e);
      }
  },

  fetchShopItems: async () => {
      try {
          const { data: items } = await api.get<ShopItem[]>('/shop/items');
          // The backend now natively computes "owned" and "equipped" flags per user via SQL Left Join
          
          set({ shopItems: items });
      } catch (e) {
          console.error("Failed to fetch shop items", e);
      }
  },

  fetchAchievements: async () => {
      try {
          const { data: achievements } = await api.get<Achievement[]>('/achievements'); 
          const userId = get().user?.id;
          const claimed = loadClaimedAchievements(userId);
          
          // Re-calc daily login status
          const lastDaily = loadLastDailyLogin(userId);
          const today = new Date().toISOString().split('T')[0];
          const isDailyClaimed = lastDaily === today || claimed.has(`daily_login`); 

          const merged = achievements.map(ach => {
               let isClaimed = claimed.has(ach.id);
               if (ach.id === 'daily_login') {
                   isClaimed = isDailyClaimed;
               }
               return {
                  ...ach,
                  status: (isClaimed ? 'COMPLETED' : 'CLAIMABLE') as Achievement['status'], 
                  progress: 0,
              };
          });
          set({ achievements: merged });
      } catch (e) {
          console.error("Failed to fetch achievements", e);
      }
  },

  fetchGames: async () => {
      try {
          const { data: games } = await api.get<Game[]>('/games');
          set({ games });
      } catch (e) {
          console.error("Failed to fetch games", e);
      }
  },

  addTask: async (taskData) => {
      const newTask = await taskService.createTask(taskData);
      set(state => ({ tasks: [...state.tasks, newTask] }));
  },

  addList: async (name) => {
      const newList = await listService.createList(name);
      set(state => ({ customLists: [...state.customLists, newList] }));
  },

  renameList: async (oldName, newName) => {
      const list = get().customLists.find(l => l.name === oldName);
      if (!list) return;
      await listService.renameList(list.id, newName);
      set(state => ({ customLists: state.customLists.map(l => l.id === list.id ? { ...l, name: newName } : l) }));
  },
  
  deleteList: async (name) => {
    const list = get().customLists.find(l => l.name === name);
    if (!list) return;
    await listService.deleteList(list.id);
    set(state => ({ customLists: state.customLists.filter(l => l.id !== list.id) }));
  },

  deleteCompletedTasks: (listFilter) => {
     set(state => ({
         tasks: state.tasks.filter(t => !t.completed || (t.list !== listFilter)) 
     }));
  },

  toggleTask: async (id) => {
     const task = get().tasks.find(t => t.id === id);
     if (task) {
         set(state => ({
             tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
         }));
         await taskService.updateTask(id, { completed: !task.completed });
     }
  },

  deleteTask: async (id) => {
      await taskService.deleteTask(id);
      set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  updateTask: async (updatedTask) => {
     await taskService.updateTask(updatedTask.id, updatedTask);
     set(state => ({ tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) }));
  },

  buyItem: async (id) => {
      try {
        const { data } = await api.post<{ points: number, level: number }>('/shop/buy', { itemId: id });

        const { user } = get();
        if (user) {
          set({ user: { ...user, points: data.points, level: data.level } });
        }

        // Trust backend transaction success: mark locally owned
        set(state => ({
          shopItems: state.shopItems.map(item => 
            item.id === id ? { ...item, owned: true } : item
          )
        }));
      } catch (error) {
        console.error('Purchase failed:', error);
        throw error;
      }
  },

  equipItem: async (id) => {
      try {
          // Verify with Backend API first
          await api.post('/shop/equip', { itemId: id });

          const state = get();
          const item = state.shopItems.find(i => i.id === id);
          
          if (item && item.type === 'THEME') {
              document.documentElement.setAttribute('data-theme', id);
          } else if (!item) {
              document.documentElement.setAttribute('data-theme', id); 
          }

          saveEquippedItem(state.user?.id, id);
          set(state => ({
              shopItems: state.shopItems.map(item => ({
                  ...item, 
                  equipped: item.id === id
              }))
          }));
      } catch (e) {
          console.error('Equip failed:', e);
      }
  },

  toggleDarkMode: () => set(state => {
      const newMode = !state.isDarkMode;
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { isDarkMode: newMode };
  }),

  addXp: (amount) => {
  },
  
  claimAchievement: async (id) => {
      try {
        const { data } = await api.post<{ points: number, level: number }>('/achievements/claim', { achievementId: id });
        
        const { user } = get();
        if (user) {
            set({ user: { ...user, points: data.points, level: data.level } });
        }
        
        const claimed = loadClaimedAchievements(user?.id);
        claimed.add(id);
        if (id !== 'daily_login') saveClaimedAchievements(user?.id, claimed);
        else saveLastDailyLogin(user?.id, new Date().toISOString().split('T')[0]);
        
        set(state => ({
            achievements: state.achievements.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a)
        }));
      } catch (e) {
          console.error("Claim failed", e);
          throw e;
      }
  },

  submitGameScore: async (gameId, score) => {
      try {
          const { data } = await api.post<{ message: string, points?: number, level?: number }>('/games/score', { gameId, score });
          
          const { user } = get();
          if (user && data.points !== undefined && data.level !== undefined) {
             // Only update if points differ from current
             if (user.points !== data.points) {
                 set({ user: { ...user, points: data.points, level: data.level } });
             }
          }
      } catch (e) {
          console.error("Failed to submit game score", e);
      }
  }
}));
