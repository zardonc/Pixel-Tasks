
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import TSID from 'tsid';

async function createAdmin() {
    const email = 'admin@pixeltasks.com';
    const password = 'admin'; // Simple password for testing
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Checking for user: ${email}...`);
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
        console.log('User exists. Updating role to ADMIN and resetting password...');
        await db.update(users)
            .set({ 
                role: 'ADMIN', 
                passwordHash: passwordHash,
                name: 'Admin User' 
            })
            .where(eq(users.email, email));
        console.log('Admin user updated successfully.');
    } else {
        console.log('User does not exist. Creating new ADMIN user...');
        await db.insert(users).values({
            id: TSID.next(),
            email,
            passwordHash,
            role: 'ADMIN',
            name: 'Admin User',
            points: 1000,
        });
        console.log('Admin user created successfully.');
    }
}

createAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Failed to create admin:', err);
        process.exit(1);
    });
