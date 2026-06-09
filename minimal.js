const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

console.log('1. Creating libsql client...');
const libsql = createClient({ url: 'file:dev.db' });

console.log('2. Creating adapter...');
const adapter = new PrismaLibSql(libsql);

console.log('3. Creating PrismaClient...');
const prisma = new PrismaClient({ 
  adapter,
  datasourceUrl: 'file:dev.db' 
});

async function main() {
  console.log('4. Executing query...');
  const users = await prisma.user.findMany();
  console.log('Success! Users:', users.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
