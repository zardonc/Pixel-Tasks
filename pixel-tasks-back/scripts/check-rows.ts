import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.pg.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkRows() {
    const dbUrl = process.env.SUPABASE_DB_URL;
    const client = postgres(dbUrl!.replace(':6543/', ':5432/'));
    const db = drizzle(client, { schema });

    console.log("Checking row counts in Supabase directly...");
    
    // Using simple raw queries for an absolute sanity check
    const games = await client`SELECT COUNT(*) FROM games`;
    const shop = await client`SELECT COUNT(*) FROM shop_items`;
    const ach = await client`SELECT COUNT(*) FROM achievements`;
    const conf = await client`SELECT COUNT(*) FROM game_config`;
    const users = await client`SELECT COUNT(*) FROM users`;

    console.log("Games:", games[0]?.__count || games[0]?.count);
    console.log("Shop Items:", shop[0]?.__count || shop[0]?.count);
    console.log("Achievements:", ach[0]?.__count || ach[0]?.count);
    console.log("Game Config:", conf[0]?.__count || conf[0]?.count);
    console.log("Users:", users[0]?.__count || users[0]?.count);

    await client.end();
}
checkRows();
