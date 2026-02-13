/**
 * Supabase Connection Test
 * 
 * Verifies the connection to Supabase using the credentials in .env.
 * Usage: npm run test:supabase
 */
import { supabase } from './src/db/supabase.js';

async function testConnection() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Pixel Tasks - Supabase Connection    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log();

    console.log(`🔗 URL: ${process.env.SUPABASE_URL}`);
    console.log();

    // 1. Test basic connectivity by querying Supabase health
    console.log('1️⃣  Testing API connectivity...');
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.log(`   ⚠  Auth response: ${error.message}`);
        } else {
            console.log('   ✅ Supabase Auth API reachable');
        }
    } catch (err: any) {
        console.error(`   ❌ Connection failed: ${err.message}`);
        process.exit(1);
    }

    // 2. Test database access (check if any tables exist)
    console.log();
    console.log('2️⃣  Testing database access...');
    try {
        // Try to read from a table — even if it doesn't exist, a proper
        // error message confirms the DB layer is working
        const { data, error, status } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('   ✅ Database is reachable (table "users" not yet created on Supabase)');
                console.log('   ℹ  You need to create tables on Supabase. See README for migration steps.');
            } else if (error.code === 'PGRST116') {
                console.log('   ✅ Database is reachable (no rows yet)');
            } else {
                console.log(`   ⚠  DB query returned: [${error.code}] ${error.message}`);
                console.log(`      HTTP Status: ${status}`);
            }
        } else {
            console.log(`   ✅ Database query successful! Found ${data?.length || 0} user(s).`);
        }
    } catch (err: any) {
        console.error(`   ❌ Database test failed: ${err.message}`);
    }

    // 3. Test storage (optional)
    console.log();
    console.log('3️⃣  Testing storage access...');
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.log(`   ⚠  Storage: ${error.message}`);
        } else {
            console.log(`   ✅ Storage reachable — ${data.length} bucket(s) found`);
        }
    } catch (err: any) {
        console.log(`   ⚠  Storage check skipped: ${err.message}`);
    }

    console.log();
    console.log('════════════════════════════════════════');
    console.log('✨ Supabase connection test complete!');
    console.log('════════════════════════════════════════');
}

testConnection().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
