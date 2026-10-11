import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs/my/applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('क्या आप सचमुच अपना आवेदन वापस लेना चाहते हैं?')) return;
    try {
      await axios.post(`http://localhost:5000/api/jobs/my/applications/${applicationId}/withdraw`);
      fetchApplications();
    } catch (err) {
      setActionError(err.response?.data?.error || 'आवेदन वापस लेने में त्रुटि हुई।');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="badge badge-verified"><CheckCircle size={12} /> चयनित (Selected)</span>;
      case 'Shortlisted':
        return <span className="badge" style={{ backgroundColor: '#111827', color: '#fff' }}>शॉर्टलिस्टेड</span>;
      case 'Under Review':
        return <span className="badge badge-outline">समीक्षाधीन (Under Review)</span>;
      case 'Rejected':
        return <span className="badge badge-outline" style={{ color: '#991B1B', borderColor: '#FCA5A5' }}><XCircle size={12} /> अस्वीकृत</span>;
      case 'Withdrawn':
        return <span className="badge badge-outline" style={{ color: '#6B7280' }}>वापस लिया गया</span>;
      default:
        return <span className="badge badge-outline">आवेदन जमा (Applied)</span>;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '40px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px' }}>मेरे आवेदन (My Applications)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            आपके द्वारा किए गए सभी नौकरी आवेदनों की वर्तमान स्थिति
          </p>
        </div>
        <Link to="/jobs" className="btn btn-secondary btn-sm">
          और नौकरियां खोजें
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-error">
          {actionError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>आवेदन लोड हो रहे हैं...</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <h3>आपने अभी तक कोई आवेदन नहीं किया है</h3>
          <p>उपलब्ध नौकरियां देखें और अपने हुनर के अनुसार आवेदन करें।</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '16px' }}>
            नौकरियां ब्राउज़ करें
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ marginBottom: '6px' }}>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 style={{ fontSize: '18px' }}>
                    <Link to={`/jobs/${app.job?.id}`}>{app.job?.titleHi}</Link>
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    स्थान: {app.job?.city}, {app.job?.district} | पारिश्रमिक: {app.job?.payment}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    आवेदन तिथि: {new Date(app.appliedAt).toLocaleDateString('hi-IN')}
                  </div>
                  {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '8px', fontSize: '12px' }}
                    >
                      आवेदन वापस लें
                    </button>
                  )}
                </div>
              </div>

              {/* Status history timeline */}
              {app.statusHistory && app.statusHistory.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>स्थिति प्रगति (Status History)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {app.statusHistory.map(h => (
                      <div key={h.id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          <strong>{h.status}:</strong> {h.comment || 'स्थिति अपडेट'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(h.createdAt).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
