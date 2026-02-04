
const API_URL = 'http://localhost:3000';

async function verifyUserFlow() {
  console.log('--- Verifying User Profile Flow ---');

  // 1. Register a new user
  const email = `test-profile-${Date.now()}@example.com`;
  const password = 'password123';
  console.log(`1. Registering: ${email}`);
  
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'USER' })
  });

  if (regRes.status !== 201) return console.error('Registration failed');
  const { token, user: createdUser } = await regRes.json();
  console.log('   Success. Token obtained.');

  // 2. Fetch Profile using Token
  console.log('2. Fetching Profile (GET /user/profile)');
  const profRes = await fetch(`${API_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (profRes.status !== 200) {
    console.error('Fetch profile failed:', await profRes.text());
    process.exit(1);
  }

  const profile = await profRes.json();
  console.log('   Profile Fetched:');
  console.log(`   - ID: ${profile.id}`);
  console.log(`   - Email: ${profile.email}`);
  console.log(`   - Points: ${profile.points}`);
  console.log(`   - Level: ${profile.level}`);

  if (profile.id !== createdUser.id || profile.points !== 0) {
    console.error('Profile mismatch error');
    process.exit(1);
  }

  console.log('--- User Profile Verification Passed ---');
}

setTimeout(verifyUserFlow, 1000);
