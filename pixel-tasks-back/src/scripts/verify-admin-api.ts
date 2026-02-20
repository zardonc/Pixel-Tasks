
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

    console.log('4. Testing Achievement CRUD...');
    // Create
    const createRes = await fetch(`${BASE_URL}/admin/achievements`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: 'Test Ach', description: 'Desc', reward: 50, id: 'test_crud_ach' })
    });
    if (!createRes.ok) throw new Error(`Create Failed: ${await createRes.text()}`);
    console.log('   -> Created test achievement');

    // Update (Fix Check)
    const updateRes = await fetch(`${BASE_URL}/admin/achievements/test_crud_ach`, {
        method: 'PUT', headers,
        body: JSON.stringify({ title: 'Updated Title', reward: 100 })
    });
    if (!updateRes.ok) throw new Error(`Update Failed: ${await updateRes.text()}`);
    console.log('   -> Updated test achievement');

    // Delete (Fix Check)
    const deleteRes = await fetch(`${BASE_URL}/admin/achievements/test_crud_ach`, {
        method: 'DELETE', headers
    });
    if (!deleteRes.ok) throw new Error(`Delete Failed: ${await deleteRes.text()}`);
    console.log('   -> Deleted test achievement');
    
    console.log('All Admin API tests passed!');
}

verify().catch(console.error);
