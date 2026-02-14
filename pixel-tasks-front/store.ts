import { create } from 'zustand';
import { taskService } from './services/task.service';
import { listService, ListItem } from './services/list.service';
import { User, Task, ShopItem, Achievement, CompanionType } from './types';

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
  buyItem: (id: string) => void;
  equipItem: (id: string) => void;
  toggleDarkMode: () => void;
  addXp: (amount: number) => void;
  claimAchievement: (id: string) => void; 
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

export const useStore = create<AppState>((set, get) => ({
  user: null, // Start null to show login
  tasks: INITIAL_TASKS,
  customLists: [], // Fetched from backend
  shopItems: INITIAL_SHOP_ITEMS,
  achievements: INITIAL_ACHIEVEMENTS,
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

  buyItem: (id) => set((state) => {
    const item = state.shopItems.find(i => i.id === id);
    if (!item || !state.user || state.user.points < item.cost) return state;

    return {
        user: { ...state.user, points: state.user.points - item.cost },
        shopItems: state.shopItems.map(i => i.id === id ? { ...i, owned: true } : i)
    };
  }),

  equipItem: (id) => set((state) => ({
    shopItems: state.shopItems.map(i => {
        if (i.type !== 'FRAME') return i; // Only handling frames for now logic
        return i.id === id ? { ...i, equipped: true } : { ...i, equipped: false }
    })
  })),

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

  claimAchievement: (id) => set((state) => {
      const ach = state.achievements.find(a => a.id === id);
      if (!ach || ach.status !== 'CLAIMABLE' || !state.user) return state;

      // Logic to add XP (duplicated from addXp to run atomically inside this action)
      const amount = ach.reward;
      const currentPoints = state.user.points || 0;
      const currentMax = state.user.maxXp || 1000;
      const newPoints = currentPoints + amount;
      let newUser = { ...state.user, points: newPoints };

      if (newPoints >= currentMax) {
           newUser = {
               ...newUser,
               level: newUser.level + 1,
               points: newPoints - currentMax,
               maxXp: Math.floor(currentMax * 1.2)
           };
      }

      return {
          user: newUser,
          achievements: state.achievements.map(a => 
              a.id === id ? { ...a, status: 'COMPLETED' } : a
          )
      };
  })

}));
