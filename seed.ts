import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const roles = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role, description: `${role} role` }
    });
  }

  await prisma.branch.upsert({
    where: { name: 'Main Branch' },
    update: {},
    create: { name: 'Main Branch', city: 'Headquarters', status: 'ACTIVE' }
  });

  console.log('Database seeded successfully');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
