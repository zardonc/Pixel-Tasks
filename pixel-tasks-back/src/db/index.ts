import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Local Development Library
const sqlite = new Database('local.db');
export const db = drizzle(sqlite, { schema });

// Placeholder for Postgres (Supabase) logic:
// if (process.env.NODE_ENV === 'production') {
//    const client = postgres(process.env.DATABASE_URL!);
//    export const db = drizzle(client, { schema });
// }
