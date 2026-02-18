
// Native fetch is available in Node 18+ and tsx environment
// I'll just use native fetch.

async function verify() {
    const BASE_URL = 'http://localhost:3000';
    
    console.log('1. Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@pixeltasks.com', password: 'admin' })
    });
    
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        process.exit(1);
    }
    
    const { token } = await loginRes.json();
    console.log('Login successful. Token obtained.');
    
    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log('2. Fetching XP Config...');
    const xpRes = await fetch(`${BASE_URL}/admin/xp-config`, { headers });
    if (xpRes.ok) console.log('XP Config: OK');
    else console.error('XP Config Failed:', await xpRes.text());

    console.log('3. Fetching Shop Items (Admin View)...');
    const shopRes = await fetch(`${BASE_URL}/admin/shop-items`, { headers });
    if (shopRes.ok) {
        const items = await shopRes.json();
        console.log(`Shop Items: OK (${items.length} items found)`);
    } else console.error('Shop Items Failed:', await shopRes.text());

    console.log('4. Fetching Achievements (Admin View)...');
    const achRes = await fetch(`${BASE_URL}/admin/achievements`, { headers });
    if (achRes.ok) {
        const achs = await achRes.json();
        console.log(`Achievements: OK (${achs.length} items found)`);
    } else console.error('Achievements Failed:', await achRes.text());
}

verify().catch(console.error);
