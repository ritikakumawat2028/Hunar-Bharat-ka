import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Filter, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppSolidIcon from '../WhatsAppIcon';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Applicant Snapshot Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  // Status Change Dialog
  const [statusDialogApp, setStatusDialogApp] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/applications?${params.toString()}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
      setActionError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleOpenStatusDialog = (app, newStatus) => {
    setStatusDialogApp(app);
    setSelectedNewStatus(newStatus);
    setAdminNoteInput(app.adminNotes || '');
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusDialogApp || !selectedNewStatus) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/applications/${statusDialogApp.id}/status`, {
        status: selectedNewStatus,
        adminNotes: adminNoteInput
      });
      setActionMessage(`Application status updated to "${selectedNewStatus}".`);
      setStatusDialogApp(null);
      setTimeout(() => setActionMessage(''), 4000);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleViewSnapshot = (app) => {
    setSelectedApp(app);
    setShowSnapshotModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="badge badge-verified">Selected (चयनित)</span>;
      case 'Shortlisted':
        return <span className="badge" style={{ backgroundColor: '#111827', color: '#FFFFFF' }}>Shortlisted</span>;
      case 'Under Review':
        return <span className="badge badge-outline">Under Review (समीक्षाधीन)</span>;
      case 'Rejected':
        return <span className="badge badge-outline" style={{ color: '#991B1B', borderColor: '#FCA5A5' }}>Rejected (अस्वीकृत)</span>;
      case 'Withdrawn':
        return <span className="badge badge-outline" style={{ color: '#6B7280' }}>Withdrawn (वापस)</span>;
      default:
        return <span className="badge badge-outline">Applied</span>;
    }
  };

  const filteredApps = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (app.user?.name || '').toLowerCase();
    const phone = (app.user?.phone || '').toLowerCase();
    const workerId = (app.user?.workerId || '').toLowerCase();
    const jobTitle = (app.job?.titleHi || app.job?.titleEn || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || workerId.includes(q) || jobTitle.includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Application Management (आवेदन प्रबंधन)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Screen applicants, view snapshot records, and update application decisions with audit history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick status tabs */}
          {['', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              {st === '' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ minWidth: '280px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search applicant name, worker ID, phone, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ height: '38px', fontSize: '13px' }}
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredApps.length}</strong> of <strong>{applications.length}</strong> applications
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Applicant & Worker ID</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Target Job Post</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Contact & Location</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Applied Date</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Current Decision</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading applications...</td></tr>
            ) : filteredApps.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td></tr>
            ) : (
              filteredApps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{app.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ID: <strong>{app.user?.workerId}</strong> {app.user?.experience ? `• Exp: ${app.user?.experience}` : ''}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600' }}>{app.job?.titleHi}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {app.job?.city} • {app.job?.payment}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div>+91 {app.user?.phone}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {app.user?.villageOrTown || app.user?.city || 'Jhunjhunu'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div>{new Date(app.appliedAt).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(app.status)}
                    {app.adminNotes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Note: {app.adminNotes}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* WhatsApp Direct Contact Button */}
                      {(app.user?.whatsappNumber || app.user?.phone) && (
                        <a
                          href={`https://wa.me/91${(app.user?.whatsappNumber || app.user?.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${app.user?.name || 'कारीगर'} जी, HUNAR BHARAT KA पोर्टल पर आपके आवेदन (${app.job?.titleHi || 'नौकरी'}) के संबंध में व्यवस्थापक द्वारा संपर्क किया जा रहा है।`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Contact Applicant on WhatsApp"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <WhatsAppSolidIcon size={14} color="#25D366" />
                          <span className="hide-on-mobile">WhatsApp</span>
                        </a>
                      )}

                      {/* View Application Profile Snapshot */}
                      <button 
                        onClick={() => handleViewSnapshot(app)} 
                        className="btn btn-secondary btn-sm" 
                        title="View Applicant Profile Snapshot at time of applying"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        <Eye size={12} style={{ marginRight: '3px' }} /> Snapshot
                      </button>

                      {/* View Public Live Worker Profile */}
                      <Link 
                        to={`/worker/${app.user?.workerId}`} 
                        target="_blank" 
                        className="btn btn-secondary btn-sm" 
                        title="View Live Worker Profile"
                        style={{ padding: '4px 8px' }}
                      >
                        <ExternalLink size={12} />
                      </Link>

                      {/* Status Dropdown Trigger */}
                      <select
                        value={app.status}
                        onChange={(e) => handleOpenStatusDialog(app, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '12px', padding: '4px 8px', width: 'auto', fontWeight: '500' }}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* APPLICANT PROFILE SNAPSHOT MODAL */}
      {showSnapshotModal && selectedApp && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '20px' 
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Applicant Profile Snapshot</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Captured at time of application: {new Date(selectedApp.appliedAt).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setShowSnapshotModal(false)} className="btn btn-secondary btn-sm">
                ✕ Close
              </button>
            </div>

            {/* Snapshot Details */}
            {(() => {
              let snap = null;
              try {
                snap = selectedApp.workerSnapshot ? JSON.parse(selectedApp.workerSnapshot) : null;
              } catch (e) {
                snap = null;
              }

              return (
                <div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>{snap?.name || selectedApp.user?.name}</span>
                      <span className="badge badge-verified">{snap?.workerId || selectedApp.user?.workerId}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                      <div><strong>मोबाइल:</strong> +91 {snap?.phone || selectedApp.user?.phone}</div>
                      <div><strong>व्हाट्सएप:</strong> +91 {snap?.whatsappNumber || snap?.phone || selectedApp.user?.phone}</div>
                      <div><strong>कौशल:</strong> {snap?.skills || selectedApp.user?.skills || 'N/A'}</div>
                      <div><strong>अनुभव:</strong> {snap?.experience || selectedApp.user?.experience || 'N/A'}</div>
                      <div><strong>स्थान:</strong> {snap?.villageOrTown || ''}, {snap?.district || selectedApp.user?.district}</div>
                      <div><strong>श्रेणी:</strong> {snap?.category || selectedApp.user?.category?.nameHi || 'सामान्य'}</div>
                    </div>

                    {/* Quick WhatsApp Contact CTA */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={`https://wa.me/91${(snap?.whatsappNumber || snap?.phone || selectedApp.user?.whatsappNumber || selectedApp.user?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${snap?.name || selectedApp.user?.name || 'कारीगर'} जी, HUNAR BHARAT KA पोर्टल पर आपके आवेदन (${selectedApp.job?.titleHi || 'नौकरी'}) के संबंध में व्यवस्थापक द्वारा संपर्क किया जा रहा है।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                      >
                        <WhatsAppSolidIcon size={16} color="#25D366" />
                        <span>Contact Applicant on WhatsApp</span>
                      </a>

                      <a
                        href={`tel:+91${(snap?.phone || selectedApp.user?.phone || '').replace(/\D/g, '')}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                      >
                        <Phone size={14} />
                        <span>Direct Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Application for Job details */}
                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>Target Job Post</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <strong>{selectedApp.job?.titleHi}</strong> ({selectedApp.job?.city}) • {selectedApp.job?.payment}
                    </div>
                  </div>

                  {/* Status & History */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Status Audit History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedApp.statusHistory?.map(sh => (
                        <div key={sh.id} style={{ fontSize: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{sh.status}</strong> by <em>{sh.changedBy}</em>: {sh.comment}
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {new Date(sh.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setShowSnapshotModal(false)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS UPDATE CONFIRMATION MODAL */}
      {statusDialogApp && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '20px' 
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
              Update Application Status
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Updating decision for applicant <strong>{statusDialogApp.user?.name}</strong> ({statusDialogApp.user?.workerId}) to <strong>"{selectedNewStatus}"</strong>.
            </p>

            <form onSubmit={handleConfirmStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Review / Feedback Note (Optional)</label>
                <textarea
                  rows="3"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="form-textarea"
                  placeholder="e.g. Candidate shortlisted based on plumbing experience in Mandawa..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setStatusDialogApp(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
