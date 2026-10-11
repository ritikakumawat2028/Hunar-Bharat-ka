const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteRitika() {
  const deleted = await prisma.user.deleteMany({
    where: { phone: '7778020756' }
  });
  console.log('DELETED_USERS_COUNT:', deleted.count);
}

deleteRitika()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
