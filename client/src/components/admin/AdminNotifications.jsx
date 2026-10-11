import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  RotateCw, 
  Send, 
  ShieldAlert, 
  Check, 
  Server, 
  Info, 
  ExternalLink 
} from 'lucide-react';

const AdminNotifications = () => {
  const [data, setData] = useState({ notifications: [], config: {} });
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/notifications');
      setData(res.data || { notifications: [], config: {} });
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch WhatsApp notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetry = async (notifId) => {
    setRetryingId(notifId);
    setActionMessage('');
    setActionError('');
    try {
      const res = await axios.post(`/api/admin/notifications/${notifId}/retry`);
      setActionMessage('Notification re-queued and processed safely.');
      setTimeout(() => setActionMessage(''), 4000);
      fetchLogs();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to retry notification.');
    } finally {
      setRetryingId(null);
    }
  };

  const notifications = data.notifications || [];
  const config = data.config || {};

  const totalLogs = notifications.length;
  const sentCount = notifications.filter(l => l.status === 'SENT').length;
  const sandboxCount = notifications.filter(l => l.status === 'SANDBOX_MOCK' || l.status === 'MOCK_SENT').length;
  const failedCount = notifications.filter(l => l.status === 'FAILED').length;

  const filteredLogs = notifications.filter(l => {
    if (!statusFilter) return true;
    if (statusFilter === 'SANDBOX_MOCK') return l.status === 'SANDBOX_MOCK' || l.status === 'MOCK_SENT';
    return l.status === statusFilter;
  });

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>WhatsApp Job Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Official WhatsApp Business Platform integration status, delivery tracking, and dispatch logs.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Official Provider Configuration Banner */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Server size={18} />
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                WhatsApp Business Platform Configuration Status
              </h3>
              {config.isConfigured ? (
                <span className="badge badge-verified">LIVE API CONNECTED</span>
              ) : (
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                  SANDBOX / TEST MODE
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '720px' }}>
              {config.isConfigured ? (
                <span>Connected to Meta Graph API (v19.0) with Phone ID: <code>{config.phoneNumberId}</code>. Dispatches live messages through approved WhatsApp Business templates.</span>
              ) : (
                <span>
                  Meta WhatsApp credentials (<code>WHATSAPP_API_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>) are not configured in <code>.env</code>. The system is operating in a safe <strong>Sandbox Test Mode</strong>. Dispatches are tracked with sandbox message IDs and recorded in the database, but <em>never fabricated as live deliveries</em>.
                </span>
              )}
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div>Provider: Meta Cloud API</div>
            <div>Template: <code>job_alert_hindi_v1</code></div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Notification Events</div>
          <div style={{ fontSize: '26px', fontWeight: '800' }}>{totalLogs}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>All queued dispatches</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Live Delivered (Meta API)</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#166534' }}>{sentCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Confirmed live delivered</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Sandbox / Mock Deliveries</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#374151' }}>{sandboxCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Test events logged</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Failed Dispatches</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: failedCount > 0 ? '#991B1B' : '#111827' }}>{failedCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Errors requiring retry</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All Notifications' },
          { key: 'SENT', label: 'Live Sent' },
          { key: 'SANDBOX_MOCK', label: 'Sandbox / Mock' },
          { key: 'FAILED', label: 'Failed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dispatches Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Worker Name & ID</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>WhatsApp Mobile</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Target Job Post</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Delivery Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Provider Message ID</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Timestamp</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Loading notification records...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No notification records matching filter.</td></tr>
            ) : (
              filteredLogs.map(log => {
                const isSent = log.status === 'SENT';
                const isSandbox = log.status === 'SANDBOX_MOCK' || log.status === 'MOCK_SENT';
                const isFailed = log.status === 'FAILED';

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{log.user?.name || 'Worker'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.user?.workerId || 'N/A'}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      +91 {log.recipientPhone}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '500' }}>{log.job?.titleHi || 'General Job Alert'}</div>
                      {log.job?.titleEn && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.job?.titleEn}</div>}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {isSent && (
                        <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={11} /> LIVE SENT
                        </span>
                      )}
                      {isSandbox && (
                        <span className="badge" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' }}>
                          SANDBOX_MOCK
                        </span>
                      )}
                      {isFailed && (
                        <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                          FAILED
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div><code>{log.providerMessageId || 'N/A'}</code></div>
                      {log.failureReason && (
                        <div style={{ fontSize: '11px', color: isFailed ? '#991B1B' : 'var(--text-muted)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.failureReason}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id || isSent}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        title={isSent ? 'Already delivered' : 'Retry notification safely'}
                      >
                        <RotateCw size={11} style={{ marginRight: '4px' }} className={retryingId === log.id ? 'animate-spin' : ''} />
                        {retryingId === log.id ? 'Retrying...' : (isSent ? 'Sent' : 'Safe Retry')}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminNotifications;
