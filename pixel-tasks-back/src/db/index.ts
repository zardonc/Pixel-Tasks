import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DATABASE_URL || 'local.db';

// Local Development Library
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });

// Placeholder for Postgres (Supabase) logic:
// if (process.env.NODE_ENV === 'production') {
//    const client = postgres(process.env.DATABASE_URL!);
//    export const db = drizzle(client, { schema });
// }
