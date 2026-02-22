import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // TSID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['USER', 'ADMIN'] }).default('USER').notNull(),
  
  // Profile
  name: text('name'),
  companion: text('companion'), // DOG, CAT
  
  // Gamification Stats
  points: integer('points').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  
  // Optimistic Locking
  version: integer('version').default(1).notNull(),
  
  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Points Log Table (Audit Trail & Idempotency)
export const pointsLog = sqliteTable('points_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  
  eventType: text('event_type').notNull(), // TASK_COMPLETE, SHOP_BUY, ADMIN_GRANT
  eventId: text('event_id').notNull(),    // Task ID or Transaction ID
  pointsDelta: integer('points_delta').notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Lists Table
export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(), // TSID
  userId: text('user_id').notNull().references(() => users.id),
  
  name: text('name').notNull(),
  color: text('color').default('#FFFFFF'),
  icon: text('icon').default('list'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Tasks Table
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // TSID
  listId: text('list_id').references(() => lists.id),
  userId: text('user_id').notNull().references(() => users.id),
  
  title: text('title').notNull(),
  description: text('description'),
  
  // Frontend alignment
  status: text('status', { enum: ['TODO', 'DONE'] }).default('TODO').notNull(), 
  priority: text('priority', { enum: ['LOW', 'MEDIUM', 'HIGH'] }).default('MEDIUM').notNull(),
  category: text('category', { enum: ['WORK', 'HEALTH', 'FUN', 'CHORE'] }).default('CHORE').notNull(),
  
  xpReward: integer('xp_reward').default(100).notNull(),
  isDaily: integer('is_daily', { mode: 'boolean' }).default(false).notNull(),
  
  dueDate: text('due_date'), 
  list: text('list'), 
  
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Game Config Table (Admin-Managed XP Rules)
export const gameConfig = sqliteTable('game_config', {
  key: text('key').primaryKey(),             // e.g. 'xp_rules'
  value: text('value').notNull(),            // JSON blob
  version: integer('version').default(1).notNull(),
  updatedBy: text('updated_by').references(() => users.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Shop Items Table
export const shopItems = sqliteTable('shop_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['FRAME', 'PET', 'THEME'] }).notNull(),
  cost: integer('cost').notNull(),
  image: text('image'),
  
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true).notNull(),
  
  check: text('check', { enum: ['OWNED', 'LOCKED'] }).default('LOCKED'), // Optional: Requirements?
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Games Table
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tag: text('tag'),
  color: text('color'), // Support frontend styling
  
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true).notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Achievements Table
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').default('trophy'),
  
  reward: integer('reward').notNull(),
  maxProgress: integer('max_progress').default(1).notNull(),
  
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true).notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// User Items Table (Persistent Inventory)
export const userItems = sqliteTable('user_items', {
  id: text('id').primaryKey(), // TSID
  userId: text('user_id').notNull().references(() => users.id),
  itemId: text('item_id').notNull().references(() => shopItems.id),
  isEquipped: integer('is_equipped', { mode: 'boolean' }).default(false).notNull(),
  purchasedAt: integer('purchased_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Shop Transactions Table (Audit & History)
export const shopTransactions = sqliteTable('shop_transactions', {
  id: text('id').primaryKey(), // TSID
  userId: text('user_id').notNull().references(() => users.id),
  itemId: text('item_id').notNull().references(() => shopItems.id),
  pricePaid: integer('price_paid').notNull(), // Actual XP deducted (0 for admin)
  purchasedAt: integer('purchased_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
