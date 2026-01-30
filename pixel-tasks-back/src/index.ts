import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log("Pixel Tasks Backend Initialized");

// Example Supabase Client initialization (Environment variables needed)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Client Configured");
} else {
    console.log("Supabase credentials not found in .env");
}
