import { hc } from 'hono/client';
import type { AppType } from './src/index';

const client = hc<AppType>('http://localhost:3000');

async function main() {
  console.log('--- Starting Gamification Verification ---');

  // 1. Register User
  const email = `gametest_${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log(`\n1. Registering user: ${email}`);
  const registerRes = await client.auth.register.$post({
    json: { email, password, name: 'Leveler', companion: 'DOG' }
  });

  if (!registerRes.ok) {
    console.error('Registration failed:', await registerRes.text());
    return;
  }
  
  const { token, user } = await registerRes.json();
  console.log(`User registered: ${user.id} (Level: ${user.level || 1}, XP: ${user.points || 0})`);

  // 2. Create High XP Task (200 XP)
  console.log('\n2. Creating a HUGE task (200 XP)...');
  const createRes = await client.tasks.$post({
    json: {
      title: 'Save the World',
      description: 'Big mission',
      priority: 'HIGH',
      category: 'WORK',
      xpReward: 200, // Direct XP setting not fully supported in simple create, usually determined by priority/difficulty?
      // Wait, TaskService.createTask allows xpReward override!
      isDaily: false,
      list: 'Main Quest'
    }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const task = await createRes.json();
  console.log('Task created with XP:', task.xpReward);

  // 3. Complete Task
  console.log('\n3. Completing task...');
  const completeRes = await client.tasks[':id'].complete.$post({
    param: { id: task.id }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const completeData = await completeRes.json();
  console.log('Task completed.');
  
  // 4. Verify Level Up
  console.log('\n4. Verifying Level Up...');
  console.log(`Old Level: ${user.level || 1}`);
  console.log(`New Level: ${completeData.level}`);
  console.log(`New Points: ${completeData.points}`);

  if (completeData.level === 3) {
      console.log('✅ LEVEL UP SUCCESSFUL! (Expected Level 3)');
  } else if (completeData.level > 1) {
      console.log('✅ Level increased!');
  } else {
      console.error('❌ Level did not increase as expected.');
      console.log('Did XPEngine calculate correctly?');
  }

  console.log('\n--- Verification Complete ---');
}

main().catch(console.error);
