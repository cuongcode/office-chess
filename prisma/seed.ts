import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_USERS = [
    { email: 'dev@test.com', password: 'password123', name: 'Dev User' },
    { email: 'player2@test.com', password: 'password123', name: 'Player Two' },
];

async function main() {
    console.log('🌱 Seeding development database...');

    for (const userData of DEV_USERS) {
        const existing = await prisma.user.findUnique({ where: { email: userData.email } });
        if (existing) {
            console.log(`  ⏭️  Skipping ${userData.email} (already exists)`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                // Pre-verified so you can log in immediately in dev
                emailVerified: new Date(),
            },
        });
        console.log(`  ✅ Created & verified: ${userData.email} / ${userData.password}`);
    }

    // Also mark any existing unverified users as verified
    const result = await prisma.user.updateMany({
        where: { emailVerified: null },
        data: { emailVerified: new Date() },
    });
    if (result.count > 0) {
        console.log(`  ✅ Auto-verified ${result.count} existing unverified user(s)`);
    }

    console.log('\n🎉 Seed complete. You can now log in with:');
    DEV_USERS.forEach(u => console.log(`   ${u.email} / ${u.password}`));
}

main()
    .catch(console.error)
    .finally(() => pool.end());
