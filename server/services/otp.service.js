const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory rate limiting and OTP store with expiry & attempt controls
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 */
const generateOtp = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  
  otpStore.set(phone, {
    code,
    expiresAt: expiresAt.getTime(),
    attempts: 0,
    resendCount: (otpStore.get(phone)?.resendCount || 0) + 1,
    lastSentAt: Date.now()
  });

  // Also save to database OtpRecord table if available
  try {
    await prisma.otpRecord.create({
      data: {
        phone,
        otpCode: code,
        expiresAt,
        verified: false
      }
    });
  } catch (err) {
    console.warn('Note: Could not record OTP to database, using memory store:', err.message);
  }

  console.log(`\n========================================`);
  console.log(`[HUNAR BHARAT KA - OTP SERVICE]`);
  console.log(`मोबाइल: +91 ${phone}`);
  console.log(`ओटीपी कोड: ${code}`);
  console.log(`वैधता: 5 मिनट`);
  console.log(`========================================\n`);

  return { code, expiresAt };
};

const verifyOtp = async (phone, inputCode) => {
  if (!inputCode) {
    return { valid: false, error: 'कृपया ओटीपी कोड दर्ज करें।' };
  }

  const cleanInput = inputCode.toString().trim();
  const record = otpStore.get(phone);

  if (record) {
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return { valid: false, error: 'ओटीपी की समय सीमा समाप्त हो गई है। कृपया पुनः भेजें।' };
    }

    if (record.attempts >= 5) {
      otpStore.delete(phone);
      return { valid: false, error: 'अधिकतम प्रयास समाप्त हो गए हैं। कृपया नया ओटीपी प्राप्त करें।' };
    }

    record.attempts += 1;

    if (record.code === cleanInput) {
      otpStore.delete(phone);
      return { valid: true };
    }
  }

  // Fallback check database
  try {
    const dbRecord = await prisma.otpRecord.findFirst({
      where: {
        phone,
        otpCode: cleanInput,
        verified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (dbRecord) {
      await prisma.otpRecord.update({
        where: { id: dbRecord.id },
        data: { verified: true }
      });
      return { valid: true };
    }
  } catch (err) {
    // Database query fallback error
  }

  return { valid: false, error: 'दर्ज किया गया ओटीपी गलत है या समाप्त हो चुका है।' };
};

module.exports = {
  generateOtp,
  verifyOtp
};
