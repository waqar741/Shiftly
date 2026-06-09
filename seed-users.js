const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Shiftly@123', 10);
  
  // Ensure roles exist
  const roles = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const roleMap = await prisma.role.findMany();
  const getRoleId = (name) => roleMap.find(r => r.name === name).id;

  // Create or Update Users
  const usersToSeed = [
    {
      employeeCode: 'SA001',
      fullName: 'Super Admin',
      email: 'superadmin@shiftly.com',
      mobile: '9999999999',
      password: hash,
      roleId: getRoleId('SUPER_ADMIN'),
    },
    {
      employeeCode: 'AD001',
      fullName: 'System Admin',
      email: 'admin@shiftly.com',
      mobile: '1234567890',
      password: hash,
      roleId: getRoleId('ADMIN'),
    },
    {
      employeeCode: 'BM001',
      fullName: 'Branch Manager',
      email: 'ahmu751@gmail.com',
      mobile: '7021396917',
      password: hash,
      roleId: getRoleId('BRANCH_MANAGER'),
    },
    {
      employeeCode: 'EMP001',
      fullName: 'John Employee',
      email: 'employee@shiftly.com',
      mobile: '8888888888',
      password: hash,
      roleId: getRoleId('EMPLOYEE'),
    }
  ];

  for (const userData of usersToSeed) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { mobile: userData.mobile, password: hash, roleId: userData.roleId },
      create: userData
    });
  }

  // Update .env file
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const commentStart = '\n# --- TEST LOGIN CREDENTIALS ---';
  if (envContent.includes(commentStart)) {
    envContent = envContent.substring(0, envContent.indexOf(commentStart));
  }
  
  envContent += `\n# --- TEST LOGIN CREDENTIALS ---
# SUPER ADMIN -> Mobile: 9999999999 | Password: Shiftly@123
# ADMIN -> Mobile: 1234567890 | Password: Shiftly@123
# BRANCH MANAGER -> Mobile: 7021396917 | Password: Shiftly@123
# EMPLOYEE -> Mobile: 8888888888 | Password: Shiftly@123
`;

  fs.writeFileSync(envPath, envContent);
  console.log('Successfully seeded users and updated .env file');
}

main().finally(() => prisma.$disconnect());
