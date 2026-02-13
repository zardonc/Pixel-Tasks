/**
 * Database Initialization Script
 * 
 * Creates the SQLite database file, pushes the Drizzle schema,
 * and seeds the admin account from env config.
 * Usage: npm run db:init
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';
import dotenv from 'dotenv';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import TSID from 'tsid';

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

    // Create tables
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

    // ── Admin Account Seeding ──────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    console.log();
    if (adminEmail && adminPassword) {
        const existing = db.select().from(schema.users).where(eq(schema.users.email, adminEmail)).get();

        if (existing) {
            console.log(`👑 Admin account already exists: ${adminEmail} (skipped)`);
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminId = TSID.next();

            db.insert(schema.users).values({
                id: adminId,
                email: adminEmail,
                passwordHash: hashedPassword,
                role: 'ADMIN',
                name: adminName,
                points: 0,
                level: 1,
                version: 1,
            }).run();

            console.log(`👑 Admin account created: ${adminEmail} (role: ADMIN)`);
        }
    } else {
        console.log('ℹ  No ADMIN_EMAIL/ADMIN_PASSWORD in .env — skipping admin seed.');
    }

    // ── Verification ───────────────────────────────────────
    const tables = sqlite.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as { name: string }[];

    console.log();
    console.log(`📊 Database initialized with ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);

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
