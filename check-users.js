const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(users.map(u => ({ id: u.id, role: u.role.name, mobile: u.mobile, email: u.email })));
}

main().finally(() => prisma.$disconnect());
