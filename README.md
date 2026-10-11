# HUNAR BHARAT KA (हुनर भारत का)
### Local Worker Registration & Job Portal (शेखावाटी, राजस्थान)

**HUNAR BHARAT KA** is a regional employment and worker management platform connecting skilled local artisans and blue-collar workers (राजमिस्त्री, इलेक्ट्रीशियन, प्लंबर, बढ़ई, पेंटर, आदि) in the Shekhawati region (Jhunjhunu, Sikar, Churu), Rajasthan, India, with verified local job opportunities.

---

## 🚀 Key Features

### 1. Worker & Public Experience (Hindi-First)
- **Hindi-First Interface**: Accessible, clear vernacular design with Noto Sans Devanagari typography.
- **Worker Registration & Profiles**: Multi-step registration, trade classification, contact preferences, and public portfolio pages.
- **Job Discovery & Applications**: Filter jobs by trade, daily wage / contract type, and location. Single-click job application with permanent profile snapshot locking.
- **Application Status Tracking**: Real-time tracking of applications (`Applied`, `Reviewing`, `Shortlisted`, `Selected`, `Rejected`).
- **Community Ratings & Reviews**: Transparent verification and ratings for quality assurance.

### 2. Administrative Control Panel (English-First)
- **Role-Based Access Control (RBAC)**: Dedicated `/admin/login` restricted to verified platform administrators.
- **Worker Management**: Real-time search, trade filtering, verification badge approvals, and CSV export.
- **Job Lifecycle Pipeline**: Draft, Published, Closed, and Archived states with automated deadline enforcement.
- **Applicant Screening**: Review complete worker profile snapshots at the time of application to guarantee audit compliance.
- **WhatsApp Notification Tracking**: Meta WhatsApp Business Platform integration with sandbox fallback logs and delivery receipts.
- **Audit Trails**: Security logs recording all administrative decisions and status changes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS Design System (Strict Minimalist Black & White).
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: MongoDB Atlas Cluster (`cluster0.1feagrf.mongodb.net/hunar_bharat_ka`).
- **Authentication**: JWT Bearer Tokens, Bcrypt password hashing (10 salt rounds), secure role verification.
- **Security**: Sliding-window rate limiters on OTP, registration, and login routes; input validation, MIME-type file upload filtering.

---

## 📁 Repository Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Hindi worker views and English admin views
│   │   │   ├── admin/      # Full Admin Panel suite
│   │   ├── context/        # Auth and notification context
│   │   ├── App.jsx         # App router
│   │   └── index.css       # Clean Black & White design tokens
│   └── package.json
├── server/                 # Express REST API backend
│   ├── prisma/             # Prisma schema & MongoDB client
│   ├── routes/             # Auth, jobs, admin, and upload routes
│   ├── middlewares/        # JWT auth, RBAC, and rate limiters
│   ├── services/           # WhatsApp Cloud API & file upload services
│   ├── index.js            # Server entrypoint
│   └── package.json
├── DEPLOYMENT_GUIDE.md     # Production deployment instructions
└── README.md               # Project documentation
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas connection string

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and insert your MongoDB Atlas DATABASE_URL & JWT_SECRET
npx prisma generate
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend will run at `http://localhost:5000`.

---

## 🔒 Security Best Practices
- Environment variables (`.env`) are never committed to version control.
- Rate limiting prevents brute force attacks on sensitive endpoints.
- Non-admin users cannot register as or escalate privileges to administrator.
