const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth.middleware');
const { validateAndSaveUpload } = require('../services/upload.service');

const prisma = new PrismaClient();
const router = express.Router();

// Secure file upload endpoint for authenticated users
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    const { base64, fileName } = req.body;
    const result = validateAndSaveUpload({ base64, fileName: fileName || req.user.id });

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      sizeBytes: result.sizeBytes
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'फ़ाइल अपलोड करने में त्रुटि हुई।' });
  }
});

// 1. Get logged-in user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        category: true,
        applications: {
          include: { job: true },
          orderBy: { appliedAt: 'desc' }
        },
        reviewsReceived: {
          where: { isModerated: true },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'उपयोगकर्ता नहीं मिला।' });

    // Exclude password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'प्रोफाइल लोड करने में त्रुटि।' });
  }
});

// 2. Update logged-in user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      whatsappNumber,
      email,
      villageOrTown,
      district,
      state,
      pincode,
      categoryId,
      skills,
      experience,
      bio,
      availability,
      isPublicProfile,
      showPhonePublic,
      showWhatsappPublic,
      whatsappOptIn,
      portfolioLinks,
      profilePhoto
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        whatsappNumber,
        email,
        villageOrTown,
        district,
        state,
        pincode,
        categoryId,
        skills,
        experience,
        bio,
        availability,
        isPublicProfile,
        showPhonePublic,
        showWhatsappPublic,
        whatsappOptIn,
        portfolioLinks,
        profilePhoto
      },
      include: { category: true }
    });

    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'प्रोफाइल अपडेट करने में त्रुटि।' });
  }
});

// 3. Public Worker Profile (by Worker ID or ID)
router.get('/public/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    const worker = await prisma.user.findFirst({
      where: {
        OR: [
          { workerId: identifier },
          { id: identifier }
        ],
        role: 'WORKER',
        status: 'ACTIVE',
        isPublicProfile: true
      },
      include: {
        category: true,
        reviewsReceived: {
          where: { isModerated: true },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'कारीगर प्रोफाइल नहीं मिली अथवा निजी है।' });
    }

    // Calculate rating
    const reviews = worker.reviewsReceived || [];
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      workerId: worker.workerId,
      name: worker.name,
      category: worker.category,
      skills: worker.skills,
      experience: worker.experience,
      bio: worker.bio,
      villageOrTown: worker.villageOrTown,
      district: worker.district,
      state: worker.state,
      availability: worker.availability,
      isVerified: worker.isVerified,
      profilePhoto: worker.profilePhoto,
      portfolioLinks: worker.portfolioLinks,
      publicPhone: worker.showPhonePublic ? worker.phone : null,
      publicWhatsapp: worker.showWhatsappPublic ? (worker.whatsappNumber || worker.phone) : null,
      rating: avgRating,
      reviewsCount: reviews.length,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        authorName: r.author?.name || 'सत्यापित ग्राहक',
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Public worker profile error:', error);
    res.status(500).json({ error: 'प्रोफाइल लोड नहीं हो सकी।' });
  }
});

// 4. Public verified workers directory
router.get('/public-directory', async (req, res) => {
  try {
    const { skill, district, categoryId } = req.query;

    const where = {
      role: 'WORKER',
      status: 'ACTIVE',
      isPublicProfile: true
    };

    if (categoryId) where.categoryId = categoryId;
    if (district) where.district = { contains: district };
    if (skill) where.skills = { contains: skill };

    const workers = await prisma.user.findMany({
      where,
      include: {
        category: true,
        reviewsReceived: { where: { isModerated: true } }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    const list = workers.map(w => {
      const revs = w.reviewsReceived || [];
      const avg = revs.length > 0 ? (revs.reduce((a, b) => a + b.rating, 0) / revs.length).toFixed(1) : null;
      return {
        workerId: w.workerId,
        name: w.name,
        category: w.category,
        skills: w.skills,
        experience: w.experience,
        villageOrTown: w.villageOrTown,
        district: w.district,
        isVerified: w.isVerified,
        availability: w.availability,
        rating: avg,
        reviewsCount: revs.length,
        publicPhone: w.showPhonePublic ? w.phone : null,
        publicWhatsapp: w.showWhatsappPublic ? (w.whatsappNumber || w.phone) : null
      };
    });

    res.json(list);
  } catch (error) {
    console.error('Workers directory error:', error);
    res.status(500).json({ error: 'कारीगर सूची लोड करने में त्रुटि।' });
  }
});

module.exports = router;
