const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existing) {
    console.log('Super admin already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      mobile: process.env.SUPER_ADMIN_MOBILE || '9999999999',
      password: hashed,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`✅ Super admin created: ${admin.mobile}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
