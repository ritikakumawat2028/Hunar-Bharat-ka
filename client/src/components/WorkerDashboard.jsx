import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Share2, Eye, Edit3, Briefcase, FileCheck, CheckCircle, Clock } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [meRes, jobsRes, appsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/me'),
          axios.get('http://localhost:5000/api/jobs'),
          axios.get('http://localhost:5000/api/jobs/my/applications')
        ]);
        setProfile(meRes.data);
        setJobs(jobsRes.data?.jobs || []);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/worker/${profile?.workerId || user?.workerId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HUNAR BHARAT KA - ${profile?.name}`,
          text: `शेखावाटी में कारीगर प्रोफाइल देखें: ${profile?.name} (${profile?.workerId})`,
          url: shareUrl
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleAvailabilityToggle = async (newStatus) => {
    try {
      const res = await axios.put('http://localhost:5000/api/users/me', { availability: newStatus });
      setProfile(prev => ({ ...prev, availability: res.data.availability }));
    } catch (err) {
      alert('उपलब्धता स्थिति बदलने में त्रुटि');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>डैशबोर्ड लोड हो रहा है...</div>;
  }

  // Profile completion calculation
  const fields = [profile?.name, profile?.phone, profile?.categoryId, profile?.skills, profile?.villageOrTown, profile?.bio];
  const filled = fields.filter(Boolean).length;
  const completionPercentage = Math.round((filled / fields.length) * 100);

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      {/* Welcome Bar */}
      <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px' }}>नमस्ते, {profile?.name || 'कारीगर साथी'} जी 👋</h1>
            {profile?.isVerified ? (
              <span className="badge badge-verified" title="प्रमाणित कारीगर">
                <ShieldCheck size={12} /> सत्यापित (Verified)
              </span>
            ) : (
              <span className="badge badge-outline" title="सत्यापन प्रतीक्षारत">
                सत्यापन प्रतीक्षारत
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            कारीगर पहचान संख्या (Worker ID): <strong>{profile?.workerId || 'HBK-Pending'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleShare} className="btn btn-secondary btn-sm">
            <Share2 size={14} /> {copySuccess ? 'लिंक कॉपी हो गया!' : 'प्रोफाइल शेयर करें'}
          </button>
          <Link to={`/worker/${profile?.workerId}`} className="btn btn-secondary btn-sm">
            <Eye size={14} /> सार्वजनिक प्रोफाइल देखें
          </Link>
          <Link to="/my-profile" className="btn btn-primary btn-sm">
            मेरी पूरी प्रोफाइल (My Profile)
          </Link>
        </div>
      </div>

      {/* Overview Cards: Availability, Profile Completion, Application Status */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Availability */}
        <div className="card">
          <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>कार्य उपलब्धता स्थिति</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>
              {profile?.availability === 'AVAILABLE' ? 'काम के लिए उपलब्ध' : 'व्यस्त / अनुपलब्ध'}
            </span>
            <button
              onClick={() => handleAvailabilityToggle(profile?.availability === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE')}
              className="btn btn-secondary btn-sm"
            >
              बदलें
            </button>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="card">
          <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>प्रोफाइल पूर्णता</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{completionPercentage}%</span>
            <div style={{ width: '120px', backgroundColor: '#E5E7EB', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercentage}%`, backgroundColor: '#111827', height: '100%' }} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Link to="/edit-profile" style={{ textDecoration: 'underline' }}>प्रोफाइल संपादित करें</Link>
          </div>
        </div>

        {/* Application Status Count */}
        <div className="card">
          <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>जमा नौकरी आवेदन</h4>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
            {applications.length} आवेदन
          </div>
          <Link to="/my-applications" style={{ fontSize: '13px', textDecoration: 'underline', color: 'var(--text-primary)', display: 'inline-block', marginTop: '8px', fontWeight: '600' }}>
            आवेदन स्थिति (Job Status) देखें →
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid-2">
        {/* 1. Job Applications Status Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} /> मेरे आवेदन एवं स्थिति (Job Status)
            </h3>
            <Link to="/my-applications" style={{ fontSize: '13px', textDecoration: 'underline' }}>पूर्ण सूची</Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 16px' }}>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>कोई सक्रिय आवेदन नहीं है</p>
              <p style={{ fontSize: '13px' }}>आपने वर्तमान में किसी नौकरी के लिए आवेदन नहीं किया है।</p>
            </div>
          ) : (
            <div>
              {applications.slice(0, 4).map(app => (
                <div key={app.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '15px' }}>{app.job?.titleHi}</h4>
                    <span className="badge badge-verified">{app.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    तारीख: {new Date(app.appliedAt).toLocaleDateString('hi-IN')} | पारिश्रमिक: {app.job?.payment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Admin Posted Jobs Section (Blank Page when no jobs are posted by admin) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} /> व्यवस्थापक द्वारा पोस्ट की गई नौकरियां
            </h3>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 16px', backgroundColor: '#FAFAFA' }}>
              <Briefcase size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto', display: 'block' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                वर्तमान में कोई नौकरी उपलब्ध नहीं है
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                व्यवस्थापक (Admin) द्वारा अभी तक कोई नई नौकरी पोस्ट नहीं की गई है। जैसे ही नौकरी पोस्ट होगी, वह यहाँ दिखाई देगी।
              </p>
            </div>
          ) : (
            <div>
              {jobs.map(job => (
                <div key={job.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '15px' }}>
                      <Link to={`/jobs/${job.id}`}>{job.titleHi}</Link>
                    </h4>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{job.payment}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {job.city}, {job.district} | श्रेणी: {job.category?.nameHi}
                  </div>
                  <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                    विवरण व आवेदन
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
