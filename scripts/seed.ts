import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword } from '@/lib/auth';

async function seed() {
  const adminPassword = await hashPassword('admin123');
  
  await db.insert(users).values({
    email: 'admin@example.com',
    passwordHash: adminPassword,
    role: 'admin',
    name: 'Admin User',
  }).onConflictDoNothing();
  
  console.log('✅ Admin user seeded: admin@example.com / admin123');
}

seed();