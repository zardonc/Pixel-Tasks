/**
 * Database Initialization Script
 * 
 * Creates the SQLite database file and pushes the Drizzle schema.
 * Usage: npm run db:init
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const DB_PATH = process.env.DATABASE_URL || 'local.db';

async function initDatabase() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     Pixel Tasks - Database Setup       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log();

    const dbExists = fs.existsSync(DB_PATH);

    if (dbExists) {
        console.log(`⚠  Database already exists at: ${DB_PATH}`);
        console.log('   Checking schema and applying updates...');
    } else {
        console.log(`📂 Creating new database at: ${DB_PATH}`);
    }

    // Open/Create the SQLite database
    const sqlite = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrent performance
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });

    // Create tables using raw SQL derived from schema
    // (drizzle-kit push is the canonical way, but this provides a code-based fallback)
    console.log();
    console.log('🔨 Creating tables...');

    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            name TEXT,
            companion TEXT,
            points INTEGER NOT NULL DEFAULT 0,
            level INTEGER NOT NULL DEFAULT 1,
            version INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS points_log (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            event_type TEXT NOT NULL,
            event_id TEXT NOT NULL,
            points_delta INTEGER NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            name TEXT NOT NULL,
            color TEXT DEFAULT '#FFFFFF',
            icon TEXT DEFAULT 'list',
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            list_id TEXT REFERENCES lists(id),
            user_id TEXT NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'TODO',
            priority TEXT NOT NULL DEFAULT 'MEDIUM',
            category TEXT NOT NULL DEFAULT 'CHORE',
            xp_reward INTEGER NOT NULL DEFAULT 100,
            is_daily INTEGER NOT NULL DEFAULT 0,
            due_date TEXT,
            list TEXT,
            completed_at INTEGER,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
    `);

    console.log('   ✅ users');
    console.log('   ✅ points_log');
    console.log('   ✅ lists');
    console.log('   ✅ tasks');

    // Verify tables exist
    const tables = sqlite.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as { name: string }[];

    console.log();
    console.log(`📊 Database initialized with ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);

    // Verify with a test query
    const userCount = db.select({ count: sql<number>`count(*)` }).from(schema.users).get();
    console.log(`👤 Current users: ${userCount?.count || 0}`);

    sqlite.close();

    console.log();
    console.log('✨ Database setup complete!');
    console.log();
    console.log('Next steps:');
    console.log('  1. npm run dev          - Start the development server');
    console.log('  2. npm run db:push      - Push schema changes (after editing schema.ts)');
    console.log('  3. npm run db:studio    - Open Drizzle Studio to browse data');
}

initDatabase().catch((err) => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});
