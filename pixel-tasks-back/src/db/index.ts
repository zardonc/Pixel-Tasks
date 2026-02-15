import dotenv from 'dotenv';

dotenv.config();

const DB_MODE = process.env.DB_MODE || 'sqlite';

let db: any;

if (DB_MODE === 'postgres') {
    // ── Postgres / Supabase ──────────────────────────────
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = (await import('postgres')).default;
    const schema = await import('./schema.pg.js');

    const connectionString = process.env.SUPABASE_DB_URL;
    if (!connectionString) {
        throw new Error('SUPABASE_DB_URL is required when DB_MODE=postgres');
    }

    const client = postgres(connectionString, { prepare: false });
    db = drizzle(client, { schema });

    console.log('🐘 Connected to Postgres (Supabase)');
} else {
    // ── SQLite (Local Dev) ───────────────────────────────
    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    const Database = (await import('better-sqlite3')).default;
    const schema = await import('./schema.js');

    const DB_PATH = process.env.DATABASE_URL || 'local.db';
    const sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    db = drizzle(sqlite, { schema });

    console.log(`📁 Connected to SQLite (${DB_PATH})`);
}

export { db };
