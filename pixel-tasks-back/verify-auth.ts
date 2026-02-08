// import { fetch } from 'hono/client';

const API_URL = 'http://localhost:3000';

async function verifyAuth() {
  console.log('--- Verifying Auth with Name/Companion ---');

  // 1. Register User with Profile
  const email = `hero-${Date.now()}@pixel.com`;
  const password = 'password123';
  const name = 'Pixel Hero';
  const companion = 'DOG';

  console.log(`1. Registering user: ${email}`);
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, companion })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Registration failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    console.log('   Registration Response:', data);

    if (data.user.name !== name || data.user.companion !== companion) {
      throw new Error(`Mismatch! Expected name=${name}, companion=${companion}. Got name=${data.user.name}, companion=${data.user.companion}`);
    }

    console.log('   ✅ Profile data saved correctly.');

    // 2. Login and check profile
    console.log('2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    console.log('   Login Response:', loginData);

    if (loginData.user.name !== name) {
         throw new Error('Login response missing correct name');
    }
    console.log('   ✅ Login returned correct profile.');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

verifyAuth();
