const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hunar_bharat_ka_jwt_secret_key_production_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'अनधिकृत: कृपया पहले लॉगिन करें।' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Also try legacy fallback secret key just in case token was created with older fallback
      return jwt.verify(token, 'fallback_secret_key', (legacyErr, legacyUser) => {
        if (legacyErr) {
          return jwt.verify(token, 'hunar_bharat_ka_jwt_secret_key_2026', (v2Err, v2User) => {
            if (v2Err) {
              return res.status(403).json({ error: 'सत्र समाप्त या अमान्य टोकन। कृपया पुनः लॉगिन करें।' });
            }
            req.user = v2User;
            return next();
          });
        }
        req.user = legacyUser;
        return next();
      });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'केवल व्यवस्थापक (Admin) ही इस अनुभाग तक पहुंच सकते हैं।' });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin };
