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
  
  status: text('status', { enum: ['TODO', 'DONE'] }).default('TODO').notNull(),
  difficulty: text('difficulty', { enum: ['EASY', 'MEDIUM', 'HARD'] }).default('EASY').notNull(),
  
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
