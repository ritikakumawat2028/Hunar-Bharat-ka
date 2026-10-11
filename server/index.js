const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
const { generalApiRateLimiter } = require('./middlewares/rateLimit.middleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit body payload to 10mb for upload safety

// Static directory for uploaded persistent media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Apply general API rate limiter to all api routes
app.use('/api', generalApiRateLimiter);

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const jobRoutes = require('./routes/jobs.routes');
const reviewRoutes = require('./routes/reviews.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HUNAR BHARAT KA API', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HUNAR BHARAT KA Server running on port ${PORT}`);
});
