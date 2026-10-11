const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
  console.log('--- CLEANING ALL DEMO DATA FOR FRESH START ---');

  // 1. Delete all applications & application status history
  const deletedHistory = await prisma.applicationStatusHistory.deleteMany({});
  console.log(`Deleted application status history records: ${deletedHistory.count}`);

  const deletedAssignments = await prisma.jobAssignment.deleteMany({});
  console.log(`Deleted job assignments: ${deletedAssignments.count}`);

  const deletedApplications = await prisma.jobApplication.deleteMany({});
  console.log(`Deleted job applications: ${deletedApplications.count}`);

  // 2. Delete all reviews
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`Deleted reviews: ${deletedReviews.count}`);

  // 3. Delete all notification records
  const deletedNotifications = await prisma.notification.deleteMany({});
  console.log(`Deleted notifications: ${deletedNotifications.count}`);

  // 4. Delete all audit logs
  const deletedAudit = await prisma.adminAuditLog.deleteMany({});
  console.log(`Deleted admin audit logs: ${deletedAudit.count}`);

  // 5. Delete all OTP records
  const deletedOtps = await prisma.otpRecord.deleteMany({});
  console.log(`Deleted OTP records: ${deletedOtps.count}`);

  // 6. Delete all jobs
  const deletedJobs = await prisma.job.deleteMany({});
  console.log(`Deleted jobs: ${deletedJobs.count}`);

  // 7. Delete all workers (keep only ADMIN accounts)
  const deletedWorkers = await prisma.user.deleteMany({
    where: { role: 'WORKER' }
  });
  console.log(`Deleted demo worker accounts: ${deletedWorkers.count}`);

  // 8. Verify database state
  const remainingWorkers = await prisma.user.count({ where: { role: 'WORKER' } });
  const remainingAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
  const remainingJobs = await prisma.job.count();
  const remainingApps = await prisma.jobApplication.count();
  const remainingReviews = await prisma.review.count();
  const remainingCats = await prisma.jobCategory.count();

  console.log('\n--- VERIFIED CLEAN FRESH DATABASE STATUS ---');
  console.log(`Active Workers: ${remainingWorkers} (Clean fresh state)`);
  console.log(`Active Jobs: ${remainingJobs} (Clean fresh state)`);
  console.log(`Active Applications: ${remainingApps} (Clean fresh state)`);
  console.log(`Active Reviews: ${remainingReviews} (Clean fresh state)`);
  console.log(`Categories Available: ${remainingCats} (Ready for worker selection)`);
  console.log(`Admin Accounts: ${remainingAdmins}`);
  console.log('--- FRESH START COMPLETE ---');
}

cleanData()
  .catch((e) => console.error('Error during data cleanup:', e))
  .finally(() => prisma.$disconnect());
