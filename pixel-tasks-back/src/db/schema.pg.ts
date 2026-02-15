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
