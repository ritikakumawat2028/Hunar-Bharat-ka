const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateOtp, verifyOtp } = require('../services/otp.service');
const { otpRateLimiter, loginRateLimiter, registerRateLimiter } = require('../middlewares/rateLimit.middleware');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Generate permanent unique Worker ID: HBK-1001, HBK-1002, ...
 */
async function generateWorkerId() {
  const count = await prisma.user.count({ where: { role: 'WORKER' } });
  return `HBK-${1001 + count}`;
}

// 1. Send OTP (Rate-limited, checks purpose and warns if already registered during registration)
router.post('/send-otp', otpRateLimiter, async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    if (!phone || phone.toString().trim().length < 10) {
      return res.status(400).json({ error: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' });
    }

    const cleanPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);

    // If purpose is 'register', check if already registered
    if (purpose === 'register') {
      const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existing) {
        return res.status(400).json({
          error: `यह मोबाइल नंबर (${cleanPhone}) पहले से पंजीकृत है। कृपया लॉगिन पृष्ठ पर जाएं।`,
          isRegistered: true
        });
      }
    }

    const { code, expiresAt } = await generateOtp(cleanPhone);

    res.json({
      success: true,
      message: 'ओटीपी सफलतापूर्वक भेजा गया।',
      phone: cleanPhone,
      otp: code,
      expiresAt
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'ओटीपी भेजने में त्रुटि हुई।' });
  }
});

// 2. Verify OTP standalone endpoint (Rate-limited)
router.post('/verify-otp', otpRateLimiter, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'मोबाइल नंबर और ओटीपी कोड दोनों आवश्यक हैं।' });
    }

    const cleanPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);
    const result = await verifyOtp(cleanPhone, otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'ओटीपी सफलतापूर्वक सत्यापित हो गया।' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'ओटीपी सत्यापन में त्रुटि हुई।' });
  }
});

// 3. Register Worker with OTP (Strictly creates WORKER role only; Public registration CANNOT create ADMIN accounts)
router.post('/register', registerRateLimiter, async (req, res) => {
  try {
    const {
      name,
      phone,
      whatsappNumber,
      email,
      password,
      otp,
      villageOrTown,
      district,
      state,
      pincode,
      categoryId,
      skills,
      experience,
      bio,
      availability,
      termsAccepted,
      whatsappOptIn,
      role // Any injected role attempt is strictly ignored or rejected
    } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ error: 'नाम और मोबाइल नंबर आवश्यक हैं।' });
    }

    // Security check: NEVER allow public self-registration to create an administrator account
    if (role && role.toUpperCase() === 'ADMIN') {
      return res.status(403).json({ error: 'सुरक्षा त्रुटि: सार्वजनिक पंजीकरण द्वारा व्यवस्थापक (Admin) खाता नहीं बनाया जा सकता।' });
    }

    const cleanPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(email ? [{ email: email.trim().toLowerCase() }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: `यह मोबाइल नंबर (${cleanPhone}) पहले से पंजीकृत है। कृपया लॉगिन करें।`,
        isRegistered: true
      });
    }

    // Verify OTP
    if (!otp) {
      return res.status(400).json({ error: 'कृपया पहले "ओटीपी भेजें" बटन दबाकर ओटीपी प्राप्त करें।' });
    }

    const otpCheck = await verifyOtp(cleanPhone, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ error: otpCheck.error });
    }

    // Strong password hashing with bcrypt (salt rounds = 10)
    const rawPassword = password || 'worker123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const workerId = await generateWorkerId();

    const user = await prisma.user.create({
      data: {
        workerId,
        role: 'WORKER', // Enforce immutable WORKER role
        name: name.trim(),
        phone: cleanPhone,
        whatsappNumber: whatsappNumber ? whatsappNumber.toString().trim().replace(/\D/g, '').slice(-10) : cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        passwordHash: hashedPassword,
        villageOrTown: villageOrTown || null,
        city: villageOrTown || 'Jhunjhunu',
        district: district || 'Jhunjhunu',
        state: state || 'Rajasthan',
        pincode: pincode || '333001',
        categoryId: categoryId || null,
        skills: skills || null,
        experience: experience || '0 वर्ष',
        bio: bio || null,
        availability: availability || 'AVAILABLE',
        termsAccepted: Boolean(termsAccepted),
        whatsappOptIn: Boolean(whatsappOptIn)
      },
      include: { category: true }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, workerId: user.workerId },
      process.env.JWT_SECRET || 'hunar_bharat_ka_jwt_secret_key_production_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        workerId: user.workerId,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        availability: user.availability,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'पंजीकरण प्रक्रिया में त्रुटि हुई। कृपया पुनः प्रयास करें।' });
  }
});

// 4. Login with Password OR OTP (Rate-limited against brute force)
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { phone, password, otp } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'कृपया मोबाइल नंबर दर्ज करें।' });
    }

    const cleanPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);
    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { category: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'यह मोबाइल नंबर पंजीकृत नहीं है।' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: `आपका खाता निलंबित है। कारण: ${user.suspendedReason || 'अमान्य गतिविधि'}` });
    }

    // Authenticate via OTP if provided, else via Password
    if (otp) {
      const otpCheck = await verifyOtp(cleanPhone, otp);
      if (!otpCheck.valid) {
        return res.status(400).json({ error: otpCheck.error });
      }
    } else if (password) {
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'गलत पासवर्ड दर्ज किया गया है।' });
      }
    } else {
      return res.status(400).json({ error: 'कृपया पासवर्ड अथवा ओटीपी दर्ज करें।' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, workerId: user.workerId },
      process.env.JWT_SECRET || 'hunar_bharat_ka_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        workerId: user.workerId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        availability: user.availability,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'लॉगिन करने में त्रुटि हुई।' });
  }
});

module.exports = router;
