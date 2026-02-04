// import { fetch } from 'hono/client';

const API_URL = 'http://localhost:3000';

async function verifyAuth() {
  console.log('--- Verifying Auth Flow ---');

  // 1. Register
  const email = `user-${Date.now()}@example.com`;
  const password = 'password123';
  console.log(`1. Registering: ${email}`);
  
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'USER' })
  });

  if (regRes.status !== 201) {
    console.error('Registration failed:', await regRes.text());
    process.exit(1);
  }
  const regData = await regRes.json();
  console.log('   Registration Success. Token received.');

  // 2. Login
  console.log(`2. Logging in: ${email}`);
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (loginRes.status !== 200) {
    console.error('Login failed:', await loginRes.text());
    process.exit(1);
  }
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('   Login Success. Token:', token.substring(0, 10) + '...');

  // 3. Protected Route (Me)
  console.log('3. Accessing Protected Route (/auth/me)');
  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (meRes.status !== 200) {
    console.error('Protected route access failed:', await meRes.text());
    process.exit(1);
  }
  const meData = await meRes.json();
  console.log('   Protected Access Success. User ID:', meData.user.id);

  console.log('--- Auth Verification Passed ---');
}

// Brief wait to ensure server is up if running concurrently (though we'll run server in background manually first)
setTimeout(verifyAuth, 1000);
