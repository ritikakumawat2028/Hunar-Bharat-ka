import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart2, 
  Users, 
  Briefcase, 
  FileCheck, 
  MessageSquare, 
  ShieldCheck, 
  Download, 
  Activity, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/reports/data')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Generating database-derived reports & metrics...</div>;
  }

  const { workers, jobs, applications, notifications, categories, auditLogs } = data || {};

  const exportReportSummary = () => {
    const reportText = `HUNAR BHARAT KA - MANAGEMENT REPORT
Generated: ${new Date().toISOString()}

1. WORKER METRICS:
Total Registered Workers: ${workers?.total || 0}
Verified Workers: ${workers?.verified || 0}
Unverified Workers: ${workers?.unverified || 0}
Suspended Workers: ${workers?.suspended || 0}
Verification Ratio: ${workers?.verificationRate || 0}%

2. JOB POSTING METRICS:
Total Jobs Recorded: ${jobs?.total || 0}
Published Active Jobs: ${jobs?.published || 0}
Closed Jobs: ${jobs?.closed || 0}
Archived Jobs: ${jobs?.archived || 0}
Draft Jobs: ${jobs?.draft || 0}

3. APPLICATION METRICS:
Total Applications: ${applications?.total || 0}
Applied: ${applications?.applied || 0}
Under Review: ${applications?.underReview || 0}
Shortlisted: ${applications?.shortlisted || 0}
Selected: ${applications?.selected || 0}
Rejected: ${applications?.rejected || 0}
Withdrawn: ${applications?.withdrawn || 0}

4. NOTIFICATION METRICS:
Total Notifications Logged: ${notifications?.total || 0}
Sent / Delivered: ${notifications?.sent || 0}
Failed: ${notifications?.failed || 0}
Delivery Rate: ${notifications?.deliveryRate || 0}%
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hbk_platform_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Platform Reports & Metrics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Comprehensive reporting for registrations, jobs, applications, verification, and notification delivery.
          </p>
        </div>

        <button onClick={exportReportSummary} className="btn btn-secondary btn-sm">
          <Download size={14} /> Export Report Summary
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Workers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Worker Verification</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800' }}>{workers?.verificationRate || 0}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {workers?.verified || 0} of {workers?.total || 0} workers verified
          </div>
        </div>

        {/* Jobs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Published Active Jobs</span>
            <Briefcase size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800' }}>{jobs?.published || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {jobs?.closed || 0} closed • {jobs?.draft || 0} drafts
          </div>
        </div>

        {/* Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Application Fulfillment</span>
            <FileCheck size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800' }}>{applications?.total || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {applications?.selected || 0} selected • {applications?.shortlisted || 0} shortlisted
          </div>
        </div>

        {/* WhatsApp Alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Notification Delivery</span>
            <MessageSquare size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800' }}>{notifications?.deliveryRate || 0}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {notifications?.sent || 0} sent • {notifications?.failed || 0} failed
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Applications Funnel */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            Application Status Funnel Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Applied (New Submissions)', count: applications?.applied || 0 },
              { label: 'Under Review', count: applications?.underReview || 0 },
              { label: 'Shortlisted', count: applications?.shortlisted || 0 },
              { label: 'Selected / Hired', count: applications?.selected || 0 },
              { label: 'Rejected', count: applications?.rejected || 0 },
              { label: 'Withdrawn by Worker', count: applications?.withdrawn || 0 }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            Registered Workers by Trade Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories?.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '4px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.nameEn}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>({cat.nameHi})</span>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>{cat._count?.users || 0}</strong> workers • <strong>{cat._count?.jobs || 0}</strong> jobs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Audit Trail */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Administrative Audit Trail</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Immutable administrative records tracking status updates, worker verifications, and publishing events.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>Action Performed</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>Target Entity</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>Admin Operator</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>Details / Note</th>
              <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs?.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs recorded yet.</td></tr>
            ) : (
              auditLogs?.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: '600' }}>{log.action}</td>
                  <td style={{ padding: '10px 16px' }}>{log.targetType}</td>
                  <td style={{ padding: '10px 16px' }}>{log.admin?.name || log.admin?.phone || 'Admin'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details || 'System operation'}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
