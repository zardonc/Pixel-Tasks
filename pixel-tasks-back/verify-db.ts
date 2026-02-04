import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { v4 as uuidv4 } from 'uuid';

async function verify() {
  try {
    const id = uuidv4();
    console.log(`Inserting user with ID: ${id}`);
    
    await db.insert(users).values({
      id,
      email: `test-${id}@example.com`,
      passwordHash: 'dummy-hash',
    });

    const result = await db.select().from(users);
    console.log('Database verification successful. Users found:', result.length);
  } catch (error) {
    console.error('Database verification failed:', error);
    process.exit(1);
  }
}

verify();
