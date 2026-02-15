import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not set in .env');
}

export default defineConfig({
  schema: './src/db/schema.pg.ts',
  out: './drizzle-pg',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL,
  },
});
