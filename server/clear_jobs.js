const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.notification.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobAssignment.deleteMany();
  await prisma.job.deleteMany();
  console.log('ALL_JOBS_AND_APPLICATIONS_CLEARED_SUCCESSFULLY');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
