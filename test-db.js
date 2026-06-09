const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const libsql = createClient({
  url: 'file:./dev.db',
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const roles = await prisma.role.findMany();
    console.log('Roles:', roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
