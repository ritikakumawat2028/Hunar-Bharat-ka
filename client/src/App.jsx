import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Website Pages (All 15 Required Pages)
import HomePage from './components/HomePage';                          // 1. Hindi Home Page
import Register from './components/Register';                          // 2. Worker Registration
import Login from './components/Login';                                // 3. Worker Login and OTP Verification
import WorkerDashboard from './components/WorkerDashboard';            // 4. Worker Dashboard
import Profile from './components/Profile';                            // 5. My Profile
import EditProfile from './components/EditProfile';                    // 6. Edit Profile
import BrowseJobs from './components/BrowseJobs';                      // 7. Browse Jobs
import JobDetails from './components/JobDetails';                      // 8. Job Details
import MyApplications from './components/MyApplications';              // 9. My Applications
import PublicWorkerProfile from './components/PublicWorkerProfile';    // 10. Public Worker Profile
import ReviewsPage from './components/ReviewsPage';                    // 11. Reviews and Ratings
import { PrivacyPolicy, TermsConditions, ContactHelp, NotFound } from './components/StaticPages';
// 12. Privacy Policy, 13. Terms and Conditions, 14. Contact and Help, 15. Not Found page

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminWorkers from './components/admin/AdminWorkers';
import AdminJobs from './components/admin/AdminJobs';
import AdminApplications from './components/admin/AdminApplications';
import AdminReviews from './components/admin/AdminReviews';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';
import AdminLogin from './components/admin/AdminLogin';

import { AuthContext } from './context/AuthContext';

// Protected Route for Worker
const ProtectedWorkerRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 250px)' }}>{children}</div>
      <Footer />
    </>
  );
};

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

// Public Layout Wrapper with Hindi Navigation
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 250px)' }}>{children}</div>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Website Pages */}
        {/* 1. Hindi Home Page */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

        {/* 2. Worker Registration */}
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

        {/* 3. Worker Login and OTP Verification */}
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

        {/* 4. Worker Dashboard */}
        <Route path="/dashboard" element={<ProtectedWorkerRoute><WorkerDashboard /></ProtectedWorkerRoute>} />

        {/* 5. My Profile */}
        <Route path="/my-profile" element={<ProtectedWorkerRoute><Profile /></ProtectedWorkerRoute>} />

        {/* 6. Edit Profile */}
        <Route path="/edit-profile" element={<ProtectedWorkerRoute><EditProfile /></ProtectedWorkerRoute>} />

        {/* 7. Browse Jobs */}
        <Route path="/jobs" element={<PublicLayout><BrowseJobs /></PublicLayout>} />

        {/* 8. Job Details */}
        <Route path="/jobs/:id" element={<PublicLayout><JobDetails /></PublicLayout>} />

        {/* 9. My Applications */}
        <Route path="/my-applications" element={<ProtectedWorkerRoute><MyApplications /></ProtectedWorkerRoute>} />

        {/* 10. Public Worker Profile */}
        <Route path="/worker/:identifier" element={<PublicLayout><PublicWorkerProfile /></PublicLayout>} />

        {/* 11. Reviews and Ratings */}
        <Route path="/reviews" element={<PublicLayout><ReviewsPage /></PublicLayout>} />

        {/* 12. Privacy Policy */}
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />

        {/* 13. Terms and Conditions */}
        <Route path="/terms" element={<PublicLayout><TermsConditions /></PublicLayout>} />

        {/* 14. Contact and Help */}
        <Route path="/help" element={<PublicLayout><ContactHelp /></PublicLayout>} />

        {/* Admin Authentication & Dashboard Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/workers" element={<ProtectedAdminRoute><AdminWorkers /></ProtectedAdminRoute>} />
        <Route path="/admin/jobs" element={<ProtectedAdminRoute><AdminJobs /></ProtectedAdminRoute>} />
        <Route path="/admin/applications" element={<ProtectedAdminRoute><AdminApplications /></ProtectedAdminRoute>} />
        <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
        <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminNotifications /></ProtectedAdminRoute>} />
        <Route path="/admin/reports" element={<ProtectedAdminRoute><AdminReports /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />

        {/* 15. Not Found page */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
