import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Star,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import WhatsAppSolidIcon from '../WhatsAppIcon';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading real-time admin metrics...</div>;
  }

  const counts = metrics?.counts || {};

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Database-derived metrics calculated in real-time from active SQLite records. No hardcoded statistics.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Total Workers */}
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Registered Workers</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{counts.totalWorkers || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            New (last 30d): <strong>{counts.newRegistrations || 0}</strong>
          </div>
        </div>

        {/* Verification Status */}
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Verification Status</span>
            <ShieldCheck size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#166534' }}>{counts.verifiedWorkers || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Unverified / Pending: <strong>{counts.unverifiedWorkers || 0}</strong>
          </div>
        </div>

        {/* Jobs Status */}
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Job Posts Overview</span>
            <Briefcase size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{counts.activeJobs || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Published: <strong>{counts.activeJobs || 0}</strong> | Closed: <strong>{counts.closedJobs || 0}</strong>
          </div>
        </div>

        {/* Applications */}
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Job Applications</span>
            <FileCheck size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{counts.totalApplications || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Awaiting Review: <strong>{counts.pendingApplications || 0}</strong>
          </div>
        </div>
      </div>

      {/* WhatsApp Alerts Summary Row */}
      <div className="card" style={{ marginBottom: '28px', padding: '18px 24px', backgroundColor: '#F9FAFB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={24} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>WhatsApp Automated Notification Statistics</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Direct job alerts dispatched to workers with matching trade skills and explicit opt-in consent
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dispatched: </span>
              <strong style={{ fontSize: '16px' }}>{counts.totalNotifications || 0}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delivered: </span>
              <strong style={{ fontSize: '16px', color: '#166534' }}>{counts.sentNotifications || 0}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Failed: </span>
              <strong style={{ fontSize: '16px', color: counts.failedNotifications > 0 ? '#991B1B' : '#111827' }}>
                {counts.failedNotifications || 0}
              </strong>
            </div>
            <Link to="/admin/notifications" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
              View Logs →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sections Grid */}
      <div className="grid-2">
        {/* Recent Registered Workers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recently Registered Workers</h3>
            <Link to="/admin/workers" style={{ fontSize: '13px', textDecoration: 'underline' }}>View All ({counts.totalWorkers})</Link>
          </div>

          {metrics?.recentRegistrations?.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>No workers registered yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics?.recentRegistrations?.map(worker => (
                <div key={worker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{worker.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ID: <strong>{worker.workerId || 'Pending'}</strong> • Phone: +91 {worker.phone} • {worker.city || 'Jhunjhunu'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${worker.isVerified ? 'badge-verified' : 'badge-outline'}`}>
                      {worker.isVerified ? 'Verified' : 'Pending'}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(worker.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Job Applications</h3>
            <Link to="/admin/applications" style={{ fontSize: '13px', textDecoration: 'underline' }}>View All ({counts.totalApplications})</Link>
          </div>

          {metrics?.recentApplications?.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>No applications yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics?.recentApplications?.map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {app.user?.name} → {app.job?.titleHi}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Applicant ID: {app.user?.workerId} • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(app.user?.whatsappNumber || app.user?.phone) && (
                      <a
                        href={`https://wa.me/91${(app.user?.whatsappNumber || app.user?.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${app.user?.name || 'कारीगर'} जी, HUNAR BHARAT KA पोर्टल पर आपके आवेदन (${app.job?.titleHi || 'नौकरी'}) के संबंध में व्यवस्थापक द्वारा संपर्क किया जा रहा है।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Contact Applicant on WhatsApp"
                      >
                        <WhatsAppSolidIcon size={13} color="#25D366" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <span className="badge">{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
