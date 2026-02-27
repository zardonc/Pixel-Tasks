import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // TSID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('USER').notNull(),
  
  // Profile
  name: text('name'),
  companion: text('companion'), // DOG, CAT
  
  // Gamification Stats
  points: integer('points').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  
  // Optimistic Locking
  version: integer('version').default(1).notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Points Log Table (Audit Trail & Idempotency)
export const pointsLog = pgTable('points_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  
  eventType: text('event_type').notNull(), // TASK_COMPLETE, SHOP_BUY, ADMIN_GRANT
  eventId: text('event_id').notNull(),    // Task ID or Transaction ID
  pointsDelta: integer('points_delta').notNull(),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Lists Table
export const lists = pgTable('lists', {
  id: text('id').primaryKey(), // TSID
  userId: text('user_id').notNull().references(() => users.id),
  
  name: text('name').notNull(),
  color: text('color').default('#FFFFFF'),
  icon: text('icon').default('list'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tasks Table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(), // TSID
  listId: text('list_id').references(() => lists.id),
  userId: text('user_id').notNull().references(() => users.id),
  
  title: text('title').notNull(),
  description: text('description'),
  
  // Frontend alignment
  status: text('status').default('TODO').notNull(), 
  priority: text('priority').default('MEDIUM').notNull(),
  category: text('category').default('CHORE').notNull(),
  
  xpReward: integer('xp_reward').default(100).notNull(),
  isDaily: boolean('is_daily').default(false).notNull(),
  
  dueDate: text('due_date'), 
  list: text('list'), 
  
  completedAt: timestamp('completed_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Game Config Table (Admin-Managed XP Rules)
export const gameConfig = pgTable('game_config', {
  key: text('key').primaryKey(),             // e.g. 'xp_rules'
  value: text('value').notNull(),            // JSON blob
  version: integer('version').default(1).notNull(),
  updatedBy: text('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Games Table
export const games = pgTable('games', {
  id: text('id').primaryKey(), // TSID
  name: text('name').notNull(),
  description: text('description'),
  tag: text('tag'),
  color: text('color'),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Shop Items Table
export const shopItems = pgTable('shop_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  cost: integer('cost').notNull(),
  image: text('image'),
  isVisible: boolean('is_visible').default(true).notNull(),
  check: text('check').default('LOCKED'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});


// Achievements Table
export const achievements = pgTable('achievements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').default('trophy'),
  reward: integer('reward').notNull(),
  maxProgress: integer('max_progress').default(1).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Shop Transactions Table
export const shopTransactions = pgTable('shop_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  itemId: text('item_id').notNull().references(() => shopItems.id),
  pricePaid: integer('price_paid').notNull(),
  purchasedAt: timestamp('purchased_at', { mode: 'date' }).defaultNow(),
});

// User Items Table
export const userItems = pgTable('user_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  itemId: text('item_id').notNull().references(() => shopItems.id),
  isEquipped: boolean('is_equipped').default(false).notNull(),
  purchasedAt: timestamp('purchased_at', { mode: 'date' }).defaultNow(),
});

// Game High Scores Table
export const gameHighScores = pgTable('game_high_scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  gameId: text('game_id').notNull(),
  highScore: integer('high_score').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
