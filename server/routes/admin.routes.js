const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth.middleware');
const { sendWhatsAppJobAlert, retryWhatsAppNotification, getWhatsAppConfig } = require('../services/whatsapp.service');

const prisma = new PrismaClient();
const router = express.Router();

// Apply auth + admin check on all admin routes
router.use(authenticateToken, authorizeAdmin);

// 1. Dashboard Metrics (Real database derived)
router.get('/metrics', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalWorkers,
      newRegistrations,
      verifiedWorkers,
      unverifiedWorkers,
      activeJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      totalNotifications,
      sentNotifications,
      failedNotifications
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'WORKER' } }),
      prisma.user.count({ where: { role: 'WORKER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: 'WORKER', isVerified: true } }),
      prisma.user.count({ where: { role: 'WORKER', isVerified: false } }),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: { in: ['CLOSED', 'ARCHIVED'] } } }),
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: { in: ['Applied', 'Under Review'] } } }),
      prisma.notification.count(),
      prisma.notification.count({ where: { status: { in: ['SENT', 'MOCK_SENT'] } } }),
      prisma.notification.count({ where: { status: 'FAILED' } })
    ]);

    const recentRegistrations = await prisma.user.findMany({
      where: { role: 'WORKER' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        workerId: true,
        name: true,
        phone: true,
        city: true,
        district: true,
        skills: true,
        experience: true,
        isVerified: true,
        status: true,
        createdAt: true,
        category: true
      }
    });

    const recentApplications = await prisma.jobApplication.findMany({
      take: 6,
      orderBy: { appliedAt: 'desc' },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            workerId: true,
            name: true,
            phone: true,
            skills: true,
            city: true
          }
        }
      }
    });

    res.json({
      counts: {
        totalWorkers,
        newRegistrations,
        verifiedWorkers,
        unverifiedWorkers,
        activeJobs,
        closedJobs,
        totalApplications,
        pendingApplications,
        totalNotifications,
        sentNotifications,
        failedNotifications
      },
      recentRegistrations,
      recentApplications
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// 2. Worker Management
router.get('/workers', async (req, res) => {
  try {
    const { search, isVerified, status, categoryId, experience, availability } = req.query;
    const where = { role: 'WORKER' };

    if (isVerified !== undefined && isVerified !== '') {
      where.isVerified = isVerified === 'true';
    }

    if (status) {
      where.status = status;
    }

    if (availability) {
      where.availability = availability;
    }

    if (experience) {
      where.experience = { contains: experience };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { workerId: { contains: search } },
        { city: { contains: search } },
        { district: { contains: search } },
        { skills: { contains: search } }
      ];
    }

    const workers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        workerId: true,
        role: true,
        name: true,
        phone: true,
        whatsappNumber: true,
        email: true,
        address: true,
        villageOrTown: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        skills: true,
        experience: true,
        bio: true,
        availability: true,
        profilePhoto: true,
        portfolioLinks: true,
        language: true,
        isVerified: true,
        verificationNote: true,
        status: true,
        suspendedReason: true,
        isPublicProfile: true,
        showPhonePublic: true,
        showWhatsappPublic: true,
        whatsappOptIn: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        _count: { select: { applications: true, reviewsReceived: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(workers);
  } catch (error) {
    console.error('Admin workers list error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Single Worker Full Details for Admin
router.get('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await prisma.user.findFirst({
      where: {
        id,
        role: 'WORKER'
      },
      select: {
        id: true,
        workerId: true,
        role: true,
        name: true,
        phone: true,
        whatsappNumber: true,
        email: true,
        address: true,
        villageOrTown: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        skills: true,
        experience: true,
        bio: true,
        availability: true,
        profilePhoto: true,
        portfolioLinks: true,
        language: true,
        isVerified: true,
        verificationNote: true,
        status: true,
        suspendedReason: true,
        isPublicProfile: true,
        showPhonePublic: true,
        showWhatsappPublic: true,
        whatsappOptIn: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        applications: {
          include: { job: true },
          orderBy: { appliedAt: 'desc' }
        },
        reviewsReceived: {
          include: { author: { select: { name: true, phone: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Admin get single worker error:', error);
    res.status(500).json({ error: 'Failed to fetch worker details' });
  }
});

// Worker Verification Toggle
router.put('/workers/:id/verification', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, verificationNote } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isVerified: Boolean(isVerified),
        verificationNote: verificationNote || (isVerified ? 'Verified by Admin' : 'Unverified by Admin')
      }
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: isVerified ? 'VERIFY_WORKER' : 'UNVERIFY_WORKER',
        targetType: 'User',
        targetId: id,
        details: verificationNote
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Verification update error:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Worker Suspend / Reactivate
router.put('/workers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, suspendedReason } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        status,
        suspendedReason: status === 'SUSPENDED' ? suspendedReason : null
      }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: `SET_STATUS_${status}`,
        targetType: 'User',
        targetId: id,
        details: suspendedReason
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Worker status error:', error);
    res.status(500).json({ error: 'Failed to update worker status' });
  }
});

// 3. Job Management (Create, Edit, Preview, Publish, Close, Reopen, Archive, Delete)
router.get('/jobs', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { titleHi: { contains: search } },
        { titleEn: { contains: search } },
        { city: { contains: search } },
        { requiredSkills: { contains: search } }
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        category: true,
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error('Admin jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Single job details for Admin (Preview / Inspection)
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        applications: {
          include: {
            user: { select: { id: true, name: true, phone: true, workerId: true, skills: true } }
          },
          orderBy: { appliedAt: 'desc' }
        },
        _count: { select: { applications: true } }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Admin get single job error:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const {
      titleHi,
      titleEn,
      descriptionHi,
      descriptionEn,
      categoryId,
      address,
      area,
      city,
      district,
      state,
      pincode,
      payment,
      workersRequired,
      requiredSkills,
      requiredExp,
      employerName,
      employerContact,
      jobDate,
      startTime,
      duration,
      deadline,
      employmentType,
      status = 'PUBLISHED'
    } = req.body;

    // Server-side Validation: Cannot create jobs with past job date or past deadline
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const today = new Date(todayStr);

    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ error: 'अमान्य अंतिम तिथि प्रारूप (Invalid deadline date format).' });
      }
      const deadlineDay = new Date(parsedDeadline.toISOString().slice(0, 10));
      if (deadlineDay < today) {
        return res.status(400).json({ 
          error: 'आवेदन की अंतिम तिथि (Deadline) भूतकाल (Past Date) में नहीं हो सकती है। कृपया आज या भविष्य की तिथि चुनें।' 
        });
      }
    }

    if (jobDate) {
      // Check if jobDate is a standard YYYY-MM-DD date or parseable date
      const parsedJobDate = new Date(jobDate);
      if (!isNaN(parsedJobDate.getTime()) && jobDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const jobDay = new Date(parsedJobDate.toISOString().slice(0, 10));
        if (jobDay < today) {
          return res.status(400).json({ 
            error: 'कार्य तिथि (Job Date) भूतकाल (Past Date) में नहीं हो सकती है। कृपया आज या भविष्य की तिथि चुनें।' 
          });
        }
      }
    }

    const normalizedStatus = status.toUpperCase();

    const job = await prisma.job.create({
      data: {
        titleHi: titleHi || titleEn || 'अवर्गीकृत कार्य',
        titleEn: titleEn || titleHi || 'Unclassified Job',
        descriptionHi: descriptionHi || descriptionEn || '',
        descriptionEn: descriptionEn || descriptionHi || '',
        categoryId,
        address: address || 'शेखावाटी क्षेत्र',
        area: area || '',
        city: city || 'Jhunjhunu',
        district: district || 'Jhunjhunu',
        state: state || 'Rajasthan',
        pincode: pincode || '333001',
        payment: payment || 'लागू नहीं / Negotiable',
        workersRequired: parseInt(workersRequired) || 1,
        requiredSkills: requiredSkills || '',
        requiredExp: requiredExp || '',
        employerName: employerName || null,
        employerContact: employerContact || null,
        jobDate: jobDate || null,
        startTime: startTime || null,
        duration: duration || null,
        deadline: deadline || null,
        employmentType: employmentType || 'Daily Wage',
        status: normalizedStatus,
        createdBy: req.user.id
      },
      include: { category: true }
    });

    // If published, trigger WhatsApp Job Notifications to ALL registered workers
    let notificationResult = null;
    if (normalizedStatus === 'PUBLISHED') {
      const frontendUrl = process.env.FRONTEND_URL || 'https://hunarbharatka.vercel.app';
      const jobUrl = `${frontendUrl}/jobs/${job.id}`;
      // Fire-and-forget: don't block the response
      setImmediate(() => {
        sendWhatsAppJobAlert({
          jobId: job.id,
          jobTitleHi: job.titleHi,
          jobTitleEn: job.titleEn,
          location: `${job.city}, ${job.district}`,
          skills: job.requiredSkills,
          payment: job.payment,
          jobUrl
        }).then(result => {
          notificationResult = result;
          console.log(`[Job Alert] Dispatched to ${result.dispatchedCount}/${result.totalWorkers} workers for job: ${job.titleHi}`);
        }).catch(err => console.error('[Job Alert Error]:', err.message));
      });
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: normalizedStatus === 'PUBLISHED' ? 'PUBLISH_JOB' : 'CREATE_JOB_DRAFT',
        targetType: 'Job',
        targetId: job.id,
        details: `Created job (${normalizedStatus}): ${job.titleHi}`
      }
    });

    res.status(201).json({ job, notificationResult });
  } catch (error) {
    console.error('Admin create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updateData = { ...req.body };

    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    if (updateData.deadline) {
      const parsedDeadline = new Date(updateData.deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ error: 'अमान्य अंतिम तिथि प्रारूप (Invalid deadline date format).' });
      }
      const deadlineDay = new Date(parsedDeadline.toISOString().slice(0, 10));
      if (deadlineDay < today) {
        return res.status(400).json({ 
          error: 'आवेदन की अंतिम तिथि (Deadline) भूतकाल (Past Date) में नहीं हो सकती है। कृपया आज या भविष्य की तिथि चुनें।' 
        });
      }
    }

    if (updateData.jobDate && updateData.jobDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedJobDate = new Date(updateData.jobDate);
      if (!isNaN(parsedJobDate.getTime())) {
        const jobDay = new Date(parsedJobDate.toISOString().slice(0, 10));
        if (jobDay < today) {
          return res.status(400).json({ 
            error: 'कार्य तिथि (Job Date) भूतकाल (Past Date) में नहीं हो सकती है। कृपया आज या भविष्य की तिथि चुनें।' 
          });
        }
      }
    }

    if (updateData.workersRequired) {
      updateData.workersRequired = parseInt(updateData.workersRequired) || 1;
    }
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    const updated = await prisma.job.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });

    // If transitioned to PUBLISHED from non-published, trigger WhatsApp alerts
    let notificationResult = null;
    if (updated.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      const frontendUrl = process.env.FRONTEND_URL || 'https://hunarbharatka.vercel.app';
      const jobUrl = `${frontendUrl}/jobs/${updated.id}`;
      setImmediate(() => {
        sendWhatsAppJobAlert({
          jobId: updated.id,
          jobTitleHi: updated.titleHi,
          jobTitleEn: updated.titleEn,
          location: `${updated.city}, ${updated.district}`,
          skills: updated.requiredSkills,
          payment: updated.payment,
          jobUrl
        }).then(result => {
          console.log(`[Job Alert] Dispatched to ${result.dispatchedCount}/${result.totalWorkers} workers for job: ${updated.titleHi}`);
        }).catch(err => console.error('[Job Alert Error]:', err.message));
      });
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_JOB',
        targetType: 'Job',
        targetId: id,
        details: `Updated job ${updated.titleHi}`
      }
    });

    res.json({ job: updated, notificationResult });
  } catch (error) {
    console.error('Admin update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Dedicated Status Transition: Publish, Close, Reopen, Archive
router.put('/jobs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const normalizedStatus = status.toUpperCase();
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { status: normalizedStatus },
      include: { category: true }
    });

    let notificationResult = null;
    if (normalizedStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      const frontendUrl = process.env.FRONTEND_URL || 'https://hunarbharatka.vercel.app';
      const jobUrl = `${frontendUrl}/jobs/${updated.id}`;
      setImmediate(() => {
        sendWhatsAppJobAlert({
          jobId: updated.id,
          jobTitleHi: updated.titleHi,
          jobTitleEn: updated.titleEn,
          location: `${updated.city}, ${updated.district}`,
          skills: updated.requiredSkills,
          payment: updated.payment,
          jobUrl
        }).then(result => {
          console.log(`[Job Alert] Dispatched to ${result.dispatchedCount}/${result.totalWorkers} workers for job: ${updated.titleHi}`);
        }).catch(err => console.error('[Job Alert Error]:', err.message));
      });
    }

    let actionName = 'UPDATE_JOB_STATUS';
    if (normalizedStatus === 'PUBLISHED' && existing.status === 'DRAFT') actionName = 'PUBLISH_JOB';
    else if (normalizedStatus === 'PUBLISHED' && existing.status === 'CLOSED') actionName = 'REOPEN_JOB';
    else if (normalizedStatus === 'CLOSED') actionName = 'CLOSE_JOB';
    else if (normalizedStatus === 'ARCHIVED') actionName = 'ARCHIVE_JOB';

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: actionName,
        targetType: 'Job',
        targetId: id,
        details: `Status transitioned from ${existing.status} to ${normalizedStatus}`
      }
    });

    res.json({ job: updated, notificationResult });
  } catch (error) {
    console.error('Job status transition error:', error);
    res.status(500).json({ error: 'Failed to change job status' });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'DELETE_JOB',
        targetType: 'Job',
        targetId: id
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Admin delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// 4. Application Management
router.get('/applications', async (req, res) => {
  try {
    const { status, jobId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        job: true,
        user: { include: { category: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Admin applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.put('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` 
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: true, user: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : application.adminNotes,
        statusHistory: {
          create: {
            status,
            changedBy: 'ADMIN',
            comment: adminNotes || `Status updated from ${application.status} to ${status} by admin`
          }
        }
      },
      include: {
        job: true,
        user: true,
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_APPLICATION_STATUS',
        targetType: 'JobApplication',
        targetId: id,
        details: `Updated from ${application.status} to ${status}. Notes: ${adminNotes || 'None'}`
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// 5. WhatsApp Notification Logs & Stats
router.get('/notifications', async (req, res) => {
  try {
    const config = getWhatsAppConfig();
    const notifications = await prisma.notification.findMany({
      include: {
        user: { select: { name: true, phone: true, workerId: true } },
        job: { select: { titleHi: true, titleEn: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({
      config,
      notifications
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notification logs' });
  }
});

// Retry failed or test notification safely
router.post('/notifications/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await retryWhatsAppNotification(id);
    res.json({ success: true, notification: result });
  } catch (error) {
    console.error('Notification retry error:', error);
    res.status(500).json({ error: error.message || 'Failed to retry notification' });
  }
});

// 6. Reviews moderation
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        worker: { select: { name: true, workerId: true } },
        author: { select: { name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Reviews list error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.put('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isModerated } = req.body;
    const updated = await prisma.review.update({
      where: { id },
      data: { isModerated: Boolean(isModerated) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// 7. Comprehensive Reports Data Endpoint
router.get('/reports/data', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      workersTotal,
      workersVerified,
      workersUnverified,
      workersSuspended,
      jobsTotal,
      jobsPublished,
      jobsClosed,
      jobsArchived,
      jobsDraft,
      appsTotal,
      appsApplied,
      appsUnderReview,
      appsShortlisted,
      appsSelected,
      appsRejected,
      appsWithdrawn,
      notifsTotal,
      notifsSent,
      notifsFailed,
      categoriesWithCount
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'WORKER' } }),
      prisma.user.count({ where: { role: 'WORKER', isVerified: true } }),
      prisma.user.count({ where: { role: 'WORKER', isVerified: false } }),
      prisma.user.count({ where: { role: 'WORKER', status: 'SUSPENDED' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.job.count({ where: { status: 'ARCHIVED' } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: 'Applied' } }),
      prisma.jobApplication.count({ where: { status: 'Under Review' } }),
      prisma.jobApplication.count({ where: { status: 'Shortlisted' } }),
      prisma.jobApplication.count({ where: { status: 'Selected' } }),
      prisma.jobApplication.count({ where: { status: 'Rejected' } }),
      prisma.jobApplication.count({ where: { status: 'Withdrawn' } }),
      prisma.notification.count(),
      prisma.notification.count({ where: { status: { in: ['SENT', 'MOCK_SENT'] } } }),
      prisma.notification.count({ where: { status: 'FAILED' } }),
      prisma.jobCategory.findMany({
        select: {
          id: true,
          nameEn: true,
          nameHi: true,
          _count: { select: { users: true, jobs: true } }
        }
      })
    ]);

    const auditLogs = await prisma.adminAuditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { name: true, phone: true } }
      }
    });

    res.json({
      workers: {
        total: workersTotal,
        verified: workersVerified,
        unverified: workersUnverified,
        suspended: workersSuspended,
        verificationRate: workersTotal > 0 ? Math.round((workersVerified / workersTotal) * 100) : 0
      },
      jobs: {
        total: jobsTotal,
        published: jobsPublished,
        closed: jobsClosed,
        archived: jobsArchived,
        draft: jobsDraft
      },
      applications: {
        total: appsTotal,
        applied: appsApplied,
        underReview: appsUnderReview,
        shortlisted: appsShortlisted,
        selected: appsSelected,
        rejected: appsRejected,
        withdrawn: appsWithdrawn,
        selectionRate: appsTotal > 0 ? Math.round((appsSelected / appsTotal) * 100) : 0
      },
      notifications: {
        total: notifsTotal,
        sent: notifsSent,
        failed: notifsFailed,
        deliveryRate: notifsTotal > 0 ? Math.round((notifsSent / notifsTotal) * 100) : 0
      },
      categories: categoriesWithCount,
      auditLogs
    });
  } catch (error) {
    console.error('Reports data error:', error);
    res.status(500).json({ error: 'Failed to generate reports data' });
  }
});

// 8. Admin Settings / System Info
router.get('/settings', async (req, res) => {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true }
    });

    res.json({
      portalName: 'HUNAR BHARAT KA (हुनर भारत का)',
      region: 'Shekhawati, Jhunjhunu, Rajasthan',
      defaultLanguage: 'hi',
      adminLanguage: 'en',
      theme: 'Minimalist Black & White',
      adminUser
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

module.exports = router;
