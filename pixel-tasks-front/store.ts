import { create } from 'zustand';
import { Task, User, CompanionType, ShopItem, Achievement, TaskCategory, TaskPriority } from './types';

interface AppState {
  user: User | null;
  tasks: Task[];
  customLists: string[]; // Store custom list names
  shopItems: ShopItem[];
  achievements: Achievement[];
  isDarkMode: boolean;
  
  // Actions
  login: (name: string, email: string, companion: CompanionType) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  addList: (name: string) => void;
  renameList: (oldName: string, newName: string) => void; // New
  deleteList: (name: string) => void; // New
  deleteCompletedTasks: (listFilter: string) => void; // New
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  buyItem: (id: string) => void;
  equipItem: (id: string) => void;
  toggleDarkMode: () => void;
  addXp: (amount: number) => void;
  claimAchievement: (id: string) => void; // New Action
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Walk the Dog',
    description: "Don't forget the frisbee!",
    category: TaskCategory.HEALTH,
    priority: TaskPriority.MEDIUM,
    xpReward: 150,
    completed: false,
    dueDate: new Date().toISOString(),
    isDaily: true,
  },
  {
    id: '2',
    title: 'Complete Project UI',
    description: "Finish the pixel art dashboard design.",
    category: TaskCategory.WORK,
    priority: TaskPriority.HIGH,
    xpReward: 500,
    completed: false,
    dueDate: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Water Plants',
    description: "The monstera needs some love.",
    category: TaskCategory.CHORE,
    priority: TaskPriority.LOW,
    xpReward: 100,
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    list: 'Backlog'
  },
];

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

export const useStore = create<AppState>((set) => ({
  user: null, // Start null to show login
  tasks: INITIAL_TASKS,
  customLists: ['Backlog', 'Shopping'], // Initial custom lists
  shopItems: INITIAL_SHOP_ITEMS,
  achievements: INITIAL_ACHIEVEMENTS,
  isDarkMode: false,

  login: (name, email, companion) => set({
    user: {
      name,
      email,
      companion,
      level: 5,
      xp: 1250,
      maxXp: 2000,
      coins: 500
    }
  }),

  logout: () => set({ user: null }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  addList: (name) => set((state) => {
      if (state.customLists.includes(name)) return state;
      return { customLists: [...state.customLists, name] };
  }),

  renameList: (oldName, newName) => set((state) => ({
      customLists: state.customLists.map(l => l === oldName ? newName : l),
      tasks: state.tasks.map(t => t.list === oldName ? { ...t, list: newName } : t)
  })),

  deleteList: (name) => set((state) => ({
      customLists: state.customLists.filter(l => l !== name),
      tasks: state.tasks.filter(t => t.list !== name)
  })),

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

  toggleTask: (id) => set((state) => {
    const task = state.tasks.find(t => t.id === id);
    const wasCompleted = task?.completed;
    
    // Add XP if completing
    if (task && !wasCompleted) {
        state.addXp(task.xpReward);
    }

    return {
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    };
  }),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === updatedTask.id ? updatedTask : t)
  })),

  buyItem: (id) => set((state) => {
    const item = state.shopItems.find(i => i.id === id);
    if (!item || !state.user || state.user.xp < item.cost) return state;

    return {
        user: { ...state.user, xp: state.user.xp - item.cost },
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
      const newXp = state.user.xp + amount;
      // Simple level up logic
      if (newXp >= state.user.maxXp) {
          return {
              user: {
                  ...state.user,
                  level: state.user.level + 1,
                  xp: newXp - state.user.maxXp,
                  maxXp: Math.floor(state.user.maxXp * 1.2)
              }
          }
      }
      return { user: { ...state.user, xp: newXp } }
  }),

  claimAchievement: (id) => set((state) => {
      const ach = state.achievements.find(a => a.id === id);
      if (!ach || ach.status !== 'CLAIMABLE' || !state.user) return state;

      // Logic to add XP (duplicated from addXp to run atomically inside this action)
      const amount = ach.reward;
      const newXp = state.user.xp + amount;
      let newUser = { ...state.user, xp: newXp };

      if (newXp >= state.user.maxXp) {
           newUser = {
               ...newUser,
               level: newUser.level + 1,
               xp: newXp - newUser.maxXp,
               maxXp: Math.floor(newUser.maxXp * 1.2)
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
