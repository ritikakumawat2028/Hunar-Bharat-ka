# HUNAR BHARAT KA (हुनर भारत का) - Technical Specification & Deployment Guide

## 1. Project Overview
- **Portal Name**: HUNAR BHARAT KA (हुनर भारत का)
- **Target Geography**: Shekhawati region (Jhunjhunu, Nawalgarh, Mandawa, Chirawa, Rajasthan, India)
- **Design Philosophy**: Minimalist, high-contrast Black-and-White theme (pure `#FFFFFF` background, near-black `#111827` text, no gratuitous gradients or luxury redesigns).
- **Architecture**: 
  - **Worker/User Panel**: Hindi-first (`Noto Sans Devanagari`), mobile-friendly, blank states when no jobs are posted by admin.
  - **Admin Panel**: English-first, protected (`role === 'ADMIN'`), full job management, applicant screening, WhatsApp delivery logs, and audit trails.

---

## 2. Technical Stack
- **Frontend**: React 18 with Vite, React Router DOM, Vanilla CSS design system tokens in `client/src/index.css`.
- **Backend**: Node.js, Express.js (REST API), native `fetch` Meta Cloud API integration.
- **ORM & Database**: Prisma ORM with SQLite for local development (`server/prisma/dev.db`), and configured for MongoDB Atlas / PostgreSQL production deployments.
- **Security**: JWT bearer token authentication, bcryptjs (10 salt rounds), rate limiting (OTP, login, registration), security headers, MIME-type and size validation for file uploads.

---

## 3. Database Models (Normalized Schema)
Defined in `server/prisma/schema.prisma`:
1. `User`: Authentication, roles (`WORKER` vs `ADMIN`), contact numbers, trade category, location, skills, experience, availability (`AVAILABLE`, `BUSY`, `UNAVAILABLE`), privacy toggles (`isPublicProfile`, `showPhonePublic`, `showWhatsappPublic`, `whatsappOptIn`).
2. `JobCategory`: Trade categories (Plumber, Electrician, Carpenter, Mason, Painter, etc.).
3. `Job`: Bilingually titled (`titleHi`, `titleEn`), descriptions (`descriptionHi`, `descriptionEn`), payment range, employment type (`Daily Wage`, `Contract`, `Full-time`), openings, application deadline, and lifecycle status (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`).
4. `JobApplication`: Compound unique key `@@unique([jobId, userId])` preventing duplicate applications, immutable profile snapshot (`workerSnapshot` JSON), status (`Applied`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`, `Withdrawn`), and administrative screening notes.
5. `ApplicationStatusHistory`: Audit log of each status transition with author and timestamp.
6. `JobAssignment`: Confirmed worker assignments.
7. `Review`: Ratings (1-5 stars), customer feedback, and moderation toggle (`isModerated`).
8. `Notification`: Delivery records for official WhatsApp alerts with status (`SENT`, `MOCK_SENT`, `SANDBOX_MOCK`, `FAILED`), recipient phone, provider message ID, and retry counters.
9. `OtpRecord`: 6-digit verification codes with rate limiting and 5-minute expiration.
10. `AdminAuditLog`: Immutable history of administrative operations.

---

## 4. API Endpoints Reference

### Authentication & Public Directory
- `POST /api/auth/send-otp`: Sends 6-digit verification code (rate-limited to 5 per 10 mins).
- `POST /api/auth/verify-otp`: Validates OTP code.
- `POST /api/auth/register`: Worker registration with OTP verification (strictly enforces `role: 'WORKER'`).
- `POST /api/auth/login`: Authenticates via password or OTP (rate-limited to 10 per 15 mins).
- `GET /api/users/public/:identifier`: Public worker profile by `workerId` or `id`.
- `GET /api/users/public-directory`: Public directory of verified active workers.

### Worker Profile & Jobs
- `GET /api/users/me`: Authenticated worker profile with applications and reviews.
- `PUT /api/users/me`: Profile updates and privacy toggles.
- `POST /api/users/upload`: Secure file upload for profile photos (validated JPEG, PNG, WEBP, PDF up to 5MB).
- `GET /api/jobs`: Public jobs browse with filters (`skill`, `location`, `experience`, `employmentType`, `categoryId`), search, pagination (only `PUBLISHED` jobs).
- `GET /api/jobs/:id`: Public single job details.
- `POST /api/jobs/:id/apply`: Authenticated worker application (validates job is open, deadline has not passed, captures profile snapshot).
- `GET /api/jobs/my/applications`: Worker application status list with timeline history.
- `POST /api/jobs/my/applications/:id/withdraw`: Worker voluntary withdrawal.

### Admin Management (`role: 'ADMIN'`)
- `GET /api/admin/metrics`: Real-time database metrics.
- `GET /api/admin/workers`: Filter workers by verification, status, availability, experience, or search.
- `GET /api/admin/workers/:id`: Full worker detail modal with application and review history.
- `PUT /api/admin/workers/:id/verification`: Toggle worker verification badge.
- `PUT /api/admin/workers/:id/status`: Suspend or reactivate worker account with recorded reason.
- `GET /api/admin/jobs`: List all jobs across all lifecycle states.
- `GET /api/admin/jobs/:id`: Single job inspection for admin preview.
- `POST /api/admin/jobs`: Create job (Draft or Published, triggers WhatsApp notifications if Published).
- `PUT /api/admin/jobs/:id`: Edit job post.
- `PUT /api/admin/jobs/:id/status`: Transition status (`PUBLISHED`, `CLOSED`, `ARCHIVED`, `DRAFT`).
- `DELETE /api/admin/jobs/:id`: Delete job post.
- `GET /api/admin/applications`: View all applications with candidate snapshot and review history.
- `PUT /api/admin/applications/:id/status`: Update application status with notes.
- `GET /api/admin/notifications`: Delivery logs and WhatsApp integration status.
- `POST /api/admin/notifications/:id/retry`: Safely retry failed notification without duplicate dispatch.
- `GET /api/admin/reports/data`: Complete funnel statistics and audit logs.
- `GET /api/admin/settings`: Portal configuration overview.

---

## 5. MongoDB Atlas Deployment Instructions
To transition from local SQLite to production MongoDB Atlas:
1. In MongoDB Atlas, create a cluster and add a database user with read/write permissions.
2. In **Network Access**, whitelist `0.0.0.0/0` (or your production server IP).
3. In `server/.env`, set:
   ```env
   DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hunar_bharat_ka?retryWrites=true&w=majority"
   ```
4. In `server/prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "mongodb"
     url      = env("DATABASE_URL")
   }
   ```
   *(Ensure models use `@id @default(auto()) @map("_id") @db.ObjectId` as provided in `schema.prisma`)*.
5. Run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
