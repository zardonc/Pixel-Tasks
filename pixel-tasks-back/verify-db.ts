import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import TSID from 'tsid';

async function verify() {
  try {
    const id = TSID.next();
    console.log(`Inserting user with TSID: ${id}`);
    
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
