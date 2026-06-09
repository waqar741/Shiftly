require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current users:', users.length);
  
  if (users.length === 0) {
    console.log('Creating default ADMIN user...');
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      console.error('Admin role not found! Did the seed script run properly?');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        employeeCode: 'ADMIN-001',
        fullName: 'System Admin',
        email: 'admin@shiftly.com',
        mobile: '1234567890',
        password: hashedPassword,
        status: 'ACTIVE',
        roleId: adminRole.id
      }
    });
    console.log('Admin user created successfully:', adminUser.email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
