/**
 * Simple in-memory sliding window rate limiter
 * Protects login, registration, OTP generation against brute force attacks
 */
const rateLimitStore = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a rate-limiting middleware function
 * @param {Object} options
 * @param {number} options.windowMs Window in milliseconds (e.g. 15 * 60 * 1000 for 15 mins)
 * @param {number} options.max Maximum requests per window
 * @param {string} options.message Error message returned upon exceeding limit
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'अत्यधिक अनुरोध। कृपया कुछ समय बाद पुनः प्रयास करें।' }) {
  return (req, res, next) => {
    // Determine client identifier (IP address + path prefix)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${clientIp}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: remainingSeconds
      });
    }

    next();
  };
}

// 1. Strict rate limiter for OTP requests (Max 5 attempts per 10 minutes per IP)
const otpRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'ओटीपी अनुरोध सीमा पार हो गई है। कृपया 10 मिनट बाद पुनः प्रयास करें (Too many OTP requests. Please try again after 10 minutes).'
});

// 2. Rate limiter for Login attempts (Max 10 attempts per 15 minutes per IP)
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'गलत लॉगिन प्रयासों की संख्या अधिक है। सुरक्षा कारणों से कृपया 15 मिनट बाद प्रयास करें (Too many login attempts. Please try again in 15 minutes).'
});

// 3. Rate limiter for Registration attempts (Max 8 registrations per hour per IP)
const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: 'पंजीकरण अनुरोध सीमा पार हो गई है। कृपया बाद में प्रयास करें (Too many registration attempts. Please try again later).'
});

// 4. General API rate limiter (Max 150 requests per minute)
const generalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 150,
  message: 'अत्यधिक अनुरोध दर। कृपया धीमे प्रयास करें (Rate limit exceeded. Please slow down).'
});

module.exports = {
  createRateLimiter,
  otpRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  generalApiRateLimiter
};
