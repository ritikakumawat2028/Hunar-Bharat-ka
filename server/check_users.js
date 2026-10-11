const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, email: true, role: true, workerId: true }
  });
  console.log('USERS_LIST:', JSON.stringify(users, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
