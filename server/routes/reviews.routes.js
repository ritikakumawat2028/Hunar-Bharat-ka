const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();
const router = express.Router();

// 1. Get all approved reviews and ratings across verified workers
router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isModerated: true },
      include: {
        worker: {
          select: {
            workerId: true,
            name: true,
            category: true,
            villageOrTown: true,
            district: true,
            isVerified: true
          }
        },
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(reviews);
  } catch (error) {
    console.error('Fetch public reviews error:', error);
    res.status(500).json({ error: 'समीक्षाएं लोड करने में त्रुटि।' });
  }
});

// 2. Post a review for a worker
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { workerId, rating, comment } = req.body;

    if (!workerId || !rating || !comment) {
      return res.status(400).json({ error: 'सभी फ़ील्ड (कारीगर, रेटिंग, समीक्षा) आवश्यक हैं।' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'रेटिंग 1 से 5 स्टार के बीच होनी चाहिए।' });
    }

    // Check if worker exists
    const worker = await prisma.user.findFirst({
      where: {
        OR: [{ id: workerId }, { workerId: workerId }],
        role: 'WORKER'
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'कारीगर नहीं मिला।' });
    }

    // Prevent self-review
    if (worker.id === req.user.id) {
      return res.status(400).json({ error: 'आप स्वयं को समीक्षा नहीं दे सकते।' });
    }

    // Check duplicate review by same author
    const existing = await prisma.review.findFirst({
      where: {
        workerId: worker.id,
        authorId: req.user.id
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'आप इस कारीगर को पहले ही समीक्षा दे चुके हैं।' });
    }

    const review = await prisma.review.create({
      data: {
        workerId: worker.id,
        authorId: req.user.id,
        rating: parseInt(rating),
        comment: comment.trim(),
        isVerifiedJob: true,
        isModerated: true
      },
      include: {
        author: { select: { name: true } },
        worker: { select: { name: true, workerId: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'समीक्षा सफलतापूर्वक दर्ज की गई।',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'समीक्षा दर्ज करने में त्रुटि।' });
  }
});

module.exports = router;
