import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  ArrowLeft, 
  Users, 
  ShieldCheck, 
  Building 
} from 'lucide-react';
import WhatsAppSolidIcon from './WhatsAppIcon';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => setError(err.response?.data?.error || 'यह नौकरी उपलब्ध नहीं है अथवा बंद कर दी गई है।'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'WORKER') {
      setError('केवल पंजीकृत कारीगर ही इस पोर्टल से नौकरी के लिए आवेदन कर सकते हैं।');
      return;
    }

    setApplying(true);
    setError('');

    try {
      await axios.post(`/api/jobs/${id}/apply`);
      setApplySuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'आवेदन जमा करने में विफल।');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        नौकरी का प्रामाणिक विवरण लोड हो रहा है...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '60px 16px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', display: 'block' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>नौकरी उपलब्ध नहीं है</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '20px' }}>
            {error || 'यह नौकरी व्यवस्थापक द्वारा बंद कर दी गई है या अभी तक प्रकाशित नहीं की गई है।'}
          </p>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            सभी उपलब्ध नौकरियां देखें
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '40px 16px' }}>
      {/* Back button */}
      <Link 
        to="/jobs" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '14px', 
          marginBottom: '20px', 
          color: 'var(--text-secondary)', 
          textDecoration: 'none' 
        }}
      >
        <ArrowLeft size={16} /> सभी नौकरियों पर वापस जाएं (Back to Jobs)
      </Link>

      <div className="card" style={{ padding: '36px 32px' }}>
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge">{job.category?.nameHi || job.category?.nameEn}</span>
              <span className="badge badge-outline">{job.employmentType || 'Daily Wage'}</span>
              <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> सत्यापित कार्य
              </span>
            </div>
            
            <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
              {job.titleHi}
            </h1>
            
            {job.titleEn && job.titleEn !== job.titleHi && (
              <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                {job.titleEn}
              </div>
            )}
            
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
              प्रकाशित: {new Date(job.createdAt).toLocaleDateString('hi-IN')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {job.payment}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              कुल आवश्यकता: <strong>{job.workersRequired}</strong> कारीगर
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Apply CTA Block */}
        {applySuccess ? (
          <div className="alert alert-success" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <CheckCircle size={36} style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              आवेदन सफलतापूर्वक जमा हो गया!
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
              व्यवस्थापक व नियोक्ता द्वारा आपके आवेदन की समीक्षा की जाएगी। आप आवेदन की स्थिति देख सकते हैं।
            </p>
            <Link to="/my-applications" className="btn btn-primary btn-sm">
              मेरे आवेदन एवं स्थिति देखें
            </Link>
          </div>
        ) : (
          <div style={{ marginBottom: '28px' }}>
            <button
              onClick={handleApply}
              disabled={applying || job.status !== 'PUBLISHED'}
              className="btn btn-primary btn-block"
              style={{ padding: '14px', fontSize: '16px', fontWeight: '600' }}
            >
              {applying ? 'आवेदन भेजा जा रहा है...' : 'इस काम के लिए तुरंत आवेदन करें (Apply Now)'}
            </button>
          </div>
        )}

        {/* Key Specification Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>कार्य स्थल (Location)</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {job.address}, {job.city}, {job.district} - {job.pincode || '333001'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>कार्य तिथि व समय</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {job.jobDate || 'तत्काल आवश्यकता'} {job.startTime ? `(${job.startTime})` : ''}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>कार्य अवधि (Duration)</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {job.duration || 'पूर्ण कार्य होने तक'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>आवेदन अंतिम तिथि (Deadline)</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {job.deadline ? new Date(job.deadline).toLocaleDateString('hi-IN') : 'जब तक रिक्तियां हैं'}
            </div>
          </div>
        </div>

        {/* Full Hindi Description */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>
            काम का पूरा विवरण (Job Description)
          </h2>
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {job.descriptionHi}
          </div>
        </div>

        {/* English Description if provided */}
        {job.descriptionEn && job.descriptionEn !== job.descriptionHi && (
          <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              English Description
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {job.descriptionEn}
            </div>
          </div>
        )}

        {/* Required Skills & Experience */}
        {(job.requiredSkills || job.requiredExp) && (
          <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>
              आवश्यक हुनर एवं अनुभव (Skills & Experience)
            </h2>
            {job.requiredSkills && (
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <strong>आवश्यक कौशल:</strong> {job.requiredSkills}
              </div>
            )}
            {job.requiredExp && (
              <div style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                <strong>आवश्यक अनुभव:</strong> {job.requiredExp}
              </div>
            )}
          </div>
        )}

        {/* Optional Employer or Contact Details (Only if given by Admin) */}
        {job.employerName && (
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              नियोक्ता / संपर्क व्यक्ति (Employer / Contact)
            </h3>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <Building size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                <strong>{job.employerName}</strong>
              </div>
              {job.employerContact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>
                    <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    +91 {job.employerContact}
                  </span>
                  <a
                    href={`https://wa.me/91${job.employerContact.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते, मैंने HUNAR BHARAT KA पोर्टल पर आपकी जॉब पोस्ट (${job.titleHi}) देखी है।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Contact Employer on WhatsApp"
                  >
                    <WhatsAppSolidIcon size={14} color="#25D366" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification and Authenticity notice */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>सत्यापित आईडी: {job.id.slice(0, 8)}...</span>
          <span>अंतिम अद्यतन: {new Date(job.updatedAt).toLocaleDateString('hi-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
