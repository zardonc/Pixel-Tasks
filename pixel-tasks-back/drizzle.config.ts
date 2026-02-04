import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // Default to sqlite for local dev, can switch via command line or separate config for prod
  dbCredentials: {
    url: process.env.DATABASE_URL || 'local.db',
  },
});
