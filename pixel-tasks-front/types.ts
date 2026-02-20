
export enum CompanionType {
  DOG = 'DOG',
  CAT = 'CAT',
}

export enum TaskCategory {
  WORK = 'Work',
  HEALTH = 'Health',
  FUN = 'Fun',
  CHORE = 'Chore',
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  xpReward: number;
  completed: boolean;
  dueDate: string; // ISO date string
  isDaily?: boolean;
  list?: string; // Optional custom list assignment
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  points: number;
  level: number;
  // Frontend specific (optional for now)
  name?: string;
  companion?: CompanionType;
  maxXp?: number;
  coins?: number;
  claimedAchievementIds?: string[];
  ownedItemIds?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'THEME' | 'FRAME' | 'CARD';
  cost: number;
  image: string;
  owned: boolean;
  equipped: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'CLAIMABLE' | 'COMPLETED';
  progress: number;
  maxProgress: number;
  reward: number;
  icon: string;
}

export interface GameSession {
  gameId: string;
  score: number;
  active: boolean;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  tag?: string;
  color?: string;
  isVisible?: boolean;
}
