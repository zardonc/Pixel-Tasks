import { create } from 'zustand';
import { taskService } from './services/task.service';
import { listService, ListItem } from './services/list.service';
import { User, Task, ShopItem, Achievement, CompanionType } from './types';
import { api } from './api/client';

interface AppState {
  user: User | null;
  tasks: Task[];
  customLists: ListItem[]; // Store custom list objects from backend
  shopItems: ShopItem[];
  achievements: Achievement[];
  isDarkMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void; 
  login: (name: string, email: string, companion: CompanionType) => void;
  logout: () => void;
  
  fetchTasks: () => Promise<void>;
  fetchLists: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  addList: (name: string) => Promise<void>;
  renameList: (oldName: string, newName: string) => Promise<void>; 
  deleteList: (name: string) => Promise<void>; 
  deleteCompletedTasks: (listFilter: string) => void; 
  toggleTask: (id: string) => Promise<void>; // Async
  deleteTask: (id: string) => Promise<void>; // Async
  updateTask: (task: Task) => Promise<void>; // Async
  buyItem: (id: string) => Promise<void>;
  equipItem: (id: string) => void;
  toggleDarkMode: () => void;
  addXp: (amount: number) => void;
  claimAchievement: (id: string) => Promise<void>; 
}

const INITIAL_TASKS: Task[] = [];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'No Frame', type: 'FRAME', cost: 0, image: '', owned: true, equipped: true },
  { id: '2', name: 'Fire Aura', type: 'FRAME', cost: 450, image: '', owned: false, equipped: false },
  { id: '3', name: 'Ice Crown', type: 'FRAME', cost: 1250, image: '', owned: true, equipped: false },
  { id: '4', name: 'Golden Frame', type: 'FRAME', cost: 2000, image: '', owned: false, equipped: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Novice Slayer', description: 'Complete your first 10 tasks.', status: 'CLAIMABLE', progress: 10, maxProgress: 10, reward: 200, icon: 'swords' },
  { id: '2', title: 'Early Bird', description: 'Complete a task before 8:00 AM.', status: 'COMPLETED', progress: 1, maxProgress: 1, reward: 100, icon: 'sun' },
  { id: '3', title: 'Streak Master', description: 'Maintain a 7-day login streak.', status: 'IN_PROGRESS', progress: 5, maxProgress: 7, reward: 500, icon: 'fire' },
];

// ── LocalStorage Persistence Helpers ──
const LS_OWNED_ITEMS = 'pixel_owned_items';
const LS_EQUIPPED_ITEM = 'pixel_equipped_item';
const LS_CLAIMED_ACHIEVEMENTS = 'pixel_claimed_achievements';

function loadOwnedItems(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_OWNED_ITEMS) || '[]')); }
  catch { return new Set(); }
}
function saveOwnedItems(ids: string[]) {
  localStorage.setItem(LS_OWNED_ITEMS, JSON.stringify(ids));
}
function loadEquippedItem(): string | null {
  return localStorage.getItem(LS_EQUIPPED_ITEM);
}
function saveEquippedItem(id: string) {
  localStorage.setItem(LS_EQUIPPED_ITEM, id);
}
function loadClaimedAchievements(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_CLAIMED_ACHIEVEMENTS) || '[]')); }
  catch { return new Set(); }
}
function saveClaimedAchievements(ids: string[]) {
  localStorage.setItem(LS_CLAIMED_ACHIEVEMENTS, JSON.stringify(ids));
}

function hydrateShopItems(): ShopItem[] {
  const owned = loadOwnedItems();
  const equipped = loadEquippedItem();
  return INITIAL_SHOP_ITEMS.map(item => ({
    ...item,
    owned: item.owned || owned.has(item.id),
    equipped: equipped ? item.id === equipped : item.equipped,
  }));
}

function hydrateAchievements(): Achievement[] {
  const claimed = loadClaimedAchievements();
  return INITIAL_ACHIEVEMENTS.map(ach => ({
    ...ach,
    status: claimed.has(ach.id) ? 'COMPLETED' : ach.status,
  }));
}

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start null to show login
  tasks: INITIAL_TASKS,
  customLists: [], // Fetched from backend
  shopItems: hydrateShopItems(),
  achievements: hydrateAchievements(),
  isDarkMode: false,

  setUser: (user) => set({ user }),

  login: (name, email, companion) => set({
    user: {
      name,
      email,
      companion,
      level: 5,
      role: 'USER',
      id: 'local-id',
      points: 1250,
      maxXp: 2000,
      coins: 500
    }
  }),

  logout: () => set({ user: null }),

  addTask: async (task) => {
      try {
          const newTask = await taskService.createTask(task);
          set((state) => ({ tasks: [...state.tasks, newTask] }));
      } catch (error) {
          console.error('Failed to add task:', error);
      }
  },
  
  fetchTasks: async () => {
      try {
          const tasks = await taskService.getTasks();
          set({ tasks });
      } catch (error) {
          console.error('Failed to fetch tasks:', error);
      }
  },

  fetchLists: async () => {
      try {
          const lists = await listService.getLists();
          set({ customLists: lists });
      } catch (error) {
          console.error('Failed to fetch lists:', error);
      }
  },

  addList: async (name) => {
      try {
          const newList = await listService.createList(name);
          set((state) => ({ customLists: [...state.customLists, newList] }));
      } catch (error) {
          console.error('Failed to create list:', error);
      }
  },

  renameList: async (oldName, newName) => {
      const list = get().customLists.find(l => l.name === oldName);
      if (!list) return;
      try {
          const updated = await listService.renameList(list.id, newName);
          set((state) => ({
              customLists: state.customLists.map(l => l.id === list.id ? updated : l),
              tasks: state.tasks.map(t => t.list === oldName ? { ...t, list: newName } : t)
          }));
      } catch (error) {
          console.error('Failed to rename list:', error);
      }
  },

  deleteList: async (name) => {
      const list = get().customLists.find(l => l.name === name);
      if (!list) return;
      try {
          await listService.deleteList(list.id);
          set((state) => ({
              customLists: state.customLists.filter(l => l.id !== list.id),
              tasks: state.tasks.filter(t => t.list !== name)
          }));
      } catch (error) {
          console.error('Failed to delete list:', error);
      }
  },

  deleteCompletedTasks: (listFilter) => set((state) => ({
      tasks: state.tasks.filter(t => {
          // If task is NOT completed, keep it
          if (!t.completed) return true;
          
          const defaultListName = state.user ? `${state.user.name}'s List` : "Hero's List";

          // If task IS completed, check if it belongs to the list being cleaned
          
          // Default List (Tasks that are not daily and have no list assigned)
          if (listFilter === defaultListName) {
              if (!t.isDaily && !t.list) return false;
              return true;
          }

          if (listFilter === 'DAILY' && t.isDaily) return false;
          
          // Custom Lists
          if (t.list === listFilter) return false;

          // Otherwise keep it (completed but in a different list)
          return true;
      })
  })),

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic Update
    set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    }));

    try {
        if (!task.completed) {
            // Complete it
            const response = await taskService.completeTask(id);
            // Sync state with backend result (server might add points etc)
            set((state) => {
                 // Update user points/level from response
                 const updatedUser = state.user ? { ...state.user, points: response.points, level: response.level, version: (state.user as any).version + 1 } : state.user;
                 return {
                     user: updatedUser,
                     tasks: state.tasks.map((t) => t.id === id ? response.task : t) // Replace with server task state
                 };
            });
        } else {
             // Re-open it (Not fully implemented on backend yet for un-complete, so we just update status locally or re-fetch)
             // For now assuming we just patch it.
             await taskService.updateTask(id, { completed: false });
        }
    } catch (error) {
        console.error('Failed to toggle task:', error);
        // Revert on error
         set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: task.completed } : t),
        }));
    }
  },

  deleteTask: async (id) => {
      // Optimistic
      const oldTasks = get().tasks;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      try {
        await taskService.deleteTask(id);
      } catch (error) {
        console.error('Failed to delete task:', error);
        set({ tasks: oldTasks });
      }
  },

  updateTask: async (updatedTask) => {
      // Optimistic
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === updatedTask.id ? updatedTask : t)
      }));
      try {
        await taskService.updateTask(updatedTask.id, updatedTask);
      } catch (error) {
          console.error("Failed to update task", error);
      }
  },

  buyItem: async (id) => {
    const state = get();
    const item = state.shopItems.find(i => i.id === id);
    if (!item || !state.user || state.user.points < item.cost) return;

    // Optimistic update
    set(s => ({
        user: s.user ? { ...s.user, points: s.user.points - item.cost } : s.user,
        shopItems: s.shopItems.map(i => i.id === id ? { ...i, owned: true } : i)
    }));

    try {
      const { data } = await api.post<{ points: number; level: number }>('/shop/buy', {
        itemId: id,
        cost: item.cost,
      });
      // Sync with server-authoritative values
      set(s => ({
        user: s.user ? { ...s.user, points: data.points, level: data.level } : s.user,
      }));
      // Persist to localStorage
      const ownedIds = get().shopItems.filter(i => i.owned).map(i => i.id);
      saveOwnedItems(ownedIds);
    } catch (err) {
      console.error('[Store] Shop purchase failed:', err);
      // Revert optimistic update
      set(s => ({
        user: s.user ? { ...s.user, points: s.user.points + item.cost } : s.user,
        shopItems: s.shopItems.map(i => i.id === id ? { ...i, owned: false } : i)
      }));
    }
  },

  equipItem: (id) => {
    set((state) => ({
      shopItems: state.shopItems.map(i => {
          if (i.type !== 'FRAME') return i;
          return i.id === id ? { ...i, equipped: true } : { ...i, equipped: false }
      })
    }));
    saveEquippedItem(id);
  },

  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newMode };
  }),

  addXp: (amount) => set((state) => {
      if(!state.user) return state;
      const currentPoints = state.user.points || 0;
      const currentMax = state.user.maxXp || 1000;
      const newPoints = currentPoints + amount;
      
      // Simple level up logic
      if (newPoints >= currentMax) {
          return {
              user: {
                  ...state.user,
                  level: state.user.level + 1,
                  points: newPoints - currentMax,
                  maxXp: Math.floor(currentMax * 1.2)
              }
          }
      }
      return { user: { ...state.user, points: newPoints } }
  }),

  claimAchievement: async (id) => {
      const state = get();
      const ach = state.achievements.find(a => a.id === id);
      if (!ach || ach.status !== 'CLAIMABLE' || !state.user) return;

      // Optimistic update
      set(s => ({
          achievements: s.achievements.map(a => 
              a.id === id ? { ...a, status: 'COMPLETED' as const } : a
          )
      }));

      try {
        const { data } = await api.post<{ points: number; level: number }>('/achievements/claim', {
          achievementId: id,
          reward: ach.reward,
        });
        // Sync server-authoritative XP
        set(s => ({
          user: s.user ? { ...s.user, points: data.points, level: data.level } : s.user,
        }));
        // Persist to localStorage
        const claimedIds = get().achievements.filter(a => a.status === 'COMPLETED').map(a => a.id);
        saveClaimedAchievements(claimedIds);
      } catch (err: any) {
        if (err?.response?.status === 409) {
          // Already claimed on server — keep COMPLETED status, just sync user
          console.log('[Store] Achievement already claimed on server');
          return;
        }
        console.error('[Store] Achievement claim failed:', err);
        // Revert optimistic update
        set(s => ({
          achievements: s.achievements.map(a => 
              a.id === id ? { ...a, status: 'CLAIMABLE' as const } : a
          )
        }));
      }
  }

}));
