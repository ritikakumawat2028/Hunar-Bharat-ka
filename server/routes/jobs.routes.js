const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();
const router = express.Router();

// 1. Get Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.jobCategory.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { jobs: { where: { status: 'PUBLISHED' } } }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'श्रेणियां लोड करने में त्रुटि।' });
  }
});

// 2. Public Browse Jobs with search, pagination, filters
router.get('/', async (req, res) => {
  try {
    const { categoryId, location, skill, experience, employmentType, page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { status: 'PUBLISHED' };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (experience) {
      where.requiredExp = { contains: experience };
    }

    if (skill) {
      where.requiredSkills = { contains: skill };
    }

    if (location) {
      where.OR = [
        { city: { contains: location } },
        { district: { contains: location } },
        { address: { contains: location } },
        { area: { contains: location } }
      ];
    }

    if (search) {
      const searchCondition = [
        { titleHi: { contains: search } },
        { titleEn: { contains: search } },
        { descriptionHi: { contains: search } },
        { descriptionEn: { contains: search } },
        { requiredSkills: { contains: search } },
        { city: { contains: search } },
        { district: { contains: search } },
        { address: { contains: search } }
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition }
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: {
          category: true,
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      }
    });
  } catch (error) {
    console.error('Browse jobs error:', error);
    res.status(500).json({ error: 'नौकरियां लोड करने में त्रुटि।' });
  }
});

// 3. Get Single Job Details (Only published jobs available publicly)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { applications: true } }
      }
    });

    if (!job || job.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'नौकरी उपलब्ध नहीं है अथवा बंद कर दी गई है।' });
    }

    res.json(job);
  } catch (error) {
    console.error('Job details error:', error);
    res.status(500).json({ error: 'नौकरी का विवरण लोड करने में त्रुटि।' });
  }
});

// 4. Worker: Apply for job
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate role: only authenticated workers
    if (req.user.role !== 'WORKER') {
      return res.status(403).json({ error: 'केवल पंजीकृत एवं प्रमाणित कारीगर ही नौकरी के लिए आवेदन कर सकते हैं।' });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: 'नौकरी नहीं मिली।' });
    }

    // Validate job is still open and published
    if (job.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'यह नौकरी वर्तमान में खुली नहीं है (Closed or Inactive)।' });
    }

    // Validate application deadline if set
    if (job.deadline) {
      const deadlineDate = new Date(job.deadline);
      // Set to end of day
      deadlineDate.setHours(23, 59, 59, 999);
      if (new Date() > deadlineDate) {
        return res.status(400).json({ error: 'इस नौकरी के लिए आवेदन की अंतिम तिथि समाप्त हो चुकी है।' });
      }
    }

    // Prevent duplicate applications (One application per worker per job)
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId: id,
          userId: req.user.id
        }
      }
    });

    if (existing) {
      if (existing.status === 'Withdrawn') {
        return res.status(400).json({ error: 'आप इस नौकरी के लिए आवेदन पहले वापस ले चुके हैं।' });
      }
      return res.status(400).json({ error: 'आप इस नौकरी के लिए पहले ही आवेदन जमा कर चुके हैं।' });
    }

    // Capture worker snapshot
    const worker = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { category: true }
    });

    const snapshot = {
      workerId: worker.workerId,
      name: worker.name,
      phone: worker.phone,
      whatsappNumber: worker.whatsappNumber,
      skills: worker.skills,
      experience: worker.experience,
      villageOrTown: worker.villageOrTown,
      district: worker.district,
      category: worker.category?.nameHi || worker.category?.nameEn
    };

    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        userId: req.user.id,
        status: 'Applied',
        workerSnapshot: JSON.stringify(snapshot),
        statusHistory: {
          create: {
            status: 'Applied',
            changedBy: 'WORKER',
            comment: 'आवेदन जमा किया गया।'
          }
        }
      },
      include: { job: true }
    });

    res.status(201).json({
      success: true,
      message: 'आवेदन सफलतापूर्वक जमा हो गया है।',
      application
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'आवेदन जमा करने में त्रुटि।' });
  }
});

// 5. Worker: My Applications
router.get('/my/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user.id },
      include: {
        job: {
          include: { category: true }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('My applications error:', error);
    res.status(500).json({ error: 'आवेदन सूची लोड करने में त्रुटि।' });
  }
});

// 6. Worker: Withdraw Application
router.post('/my/applications/:applicationId/withdraw', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, userId: req.user.id }
    });

    if (!application) {
      return res.status(404).json({ error: 'आवेदन नहीं मिला।' });
    }

    if (application.status === 'Withdrawn') {
      return res.status(400).json({ error: 'आवेदन पहले ही वापस लिया जा चुका है।' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: 'Withdrawn',
        statusHistory: {
          create: {
            status: 'Withdrawn',
            changedBy: 'WORKER',
            comment: 'कारीगर द्वारा आवेदन वापस लिया गया।'
          }
        }
      }
    });

    res.json({ success: true, message: 'आवेदन वापस ले लिया गया है।', application: updated });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'आवेदन वापस लेने में त्रुटि।' });
  }
});

module.exports = router;
