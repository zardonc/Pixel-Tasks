import { hc } from 'hono/client';
import type { AppType } from './src/index';

const client = hc<AppType>('http://localhost:3000');

async function main() {
  console.log('--- Starting Task Verification ---');

  // 1. Register/Login User
  const email = `tasktest_${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log(`\n1. Registering user: ${email}`);
  const registerRes = await client.auth.register.$post({
    json: { email, password, name: 'TaskMaster', companion: 'CAT' }
  });

  if (!registerRes.ok) {
    console.error('Registration failed:', await registerRes.text());
    return;
  }
  
  const { token, user } = await registerRes.json();
  console.log('User registered:', user.id);

  // 2. Create Task
  console.log('\n2. Creating a task...');
  const createRes = await client.tasks.$post({
    json: {
      title: 'Test Task 1',
      description: 'Testing task creation',
      priority: 'HIGH',
      category: 'WORK',
      xpReward: 500,
      isDaily: false,
      list: 'Work Projects'
    }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!createRes.ok) {
    console.error('Create task failed:', await createRes.text());
    return;
  }

  const task = await createRes.json();
  console.log('Task created:', task);

  // 3. Fetch Tasks
  console.log('\n3. Fetching tasks...');
  const fetchRes = await client.tasks.$get({}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!fetchRes.ok) {
    console.error('Fetch tasks failed');
    return;
  }

  const tasks = await fetchRes.json();
  console.log(`Fetched ${tasks.length} tasks`);
  console.log('Task 1:', tasks[0]);

  // 4. Complete Task
  console.log('\n4. Completing task...');
  const completeRes = await client.tasks[':id'].complete.$post({
    param: { id: task.id }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!completeRes.ok) {
     console.error('Complete task failed:', await completeRes.text());
     return;
  }

  const completeData = await completeRes.json();
  console.log('Task completed. Result:', completeData);
  
  if (completeData.task.completed) {
      console.log('✅ Task marked as completed');
  } else {
      console.error('❌ Task status not updated');
  }

  if (completeData.points > 0) {
      console.log(`✅ User points updated: ${completeData.points}`);
  } else {
      console.warn('⚠️ User points check failed (Gamification might be disabled or rule missing)');
  }

  // 5. Delete Task
  console.log('\n5. Deleting task...');
  const deleteRes = await client.tasks[':id'].$delete({
      param: { id: task.id }
  }, {
      headers: { Authorization: `Bearer ${token}` }
  });
  
  if (deleteRes.ok) {
      console.log('✅ Task deleted');
  } else {
      console.error('❌ Delete failed');
  }

  console.log('\n--- Verification Complete ---');
}

main().catch(console.error);
