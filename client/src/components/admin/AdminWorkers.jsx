import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  ShieldCheck, 
  UserX, 
  Download, 
  Eye, 
  ExternalLink, 
  Filter, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Phone,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppSolidIcon from '../WhatsAppIcon';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected Worker Detail Modal
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Suspension / Verification Modals
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (verifiedFilter !== '') params.append('isVerified', verifiedFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (availabilityFilter) params.append('availability', availabilityFilter);
      if (experienceFilter) params.append('experience', experienceFilter);
      if (categoryFilter) params.append('categoryId', categoryFilter);

      const [workersRes, catsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/workers?${params.toString()}`),
        axios.get('http://localhost:5000/api/jobs/categories')
      ]);
      setWorkers(workersRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error(err);
      setActionError('Failed to load workers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [verifiedFilter, statusFilter, availabilityFilter, experienceFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setVerifiedFilter('');
    setStatusFilter('');
    setAvailabilityFilter('');
    setExperienceFilter('');
    setCategoryFilter('');
    axios.get('http://localhost:5000/api/admin/workers')
      .then(res => setWorkers(res.data || []));
  };

  const handleOpenWorkerDetail = async (workerId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/workers/${workerId}`);
      setSelectedWorker(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Failed to load full worker details.');
    }
  };

  const handleToggleVerification = async (workerId, currentVal) => {
    const note = prompt(`Enter verification note (current: ${currentVal ? 'Verified' : 'Unverified'}):`, currentVal ? 'Unverified by Admin' : 'Aadhaar & Trade verification approved by Admin');
    if (note === null) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/workers/${workerId}/verification`, {
        isVerified: !currentVal,
        verificationNote: note
      });
      setActionMessage(`Worker verification updated to: ${!currentVal ? 'Verified' : 'Unverified'}`);
      setTimeout(() => setActionMessage(''), 3500);
      fetchWorkers();
      if (selectedWorker && selectedWorker.id === workerId) {
        setSelectedWorker(prev => ({ ...prev, isVerified: !currentVal, verificationNote: note }));
      }
    } catch (err) {
      alert('Failed to update verification');
    }
  };

  const handleToggleStatus = async (workerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    let reason = null;
    if (newStatus === 'SUSPENDED') {
      reason = prompt('Enter recorded reason for suspending this account:');
      if (!reason) return;
    } else {
      if (!window.confirm('Reactivate this worker account?')) return;
    }

    try {
      await axios.put(`http://localhost:5000/api/admin/workers/${workerId}/status`, {
        status: newStatus,
        suspendedReason: reason
      });
      setActionMessage(`Worker account status updated to: ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3500);
      fetchWorkers();
      if (selectedWorker && selectedWorker.id === workerId) {
        setSelectedWorker(prev => ({ ...prev, status: newStatus, suspendedReason: reason }));
      }
    } catch (err) {
      alert('Failed to update account status');
    }
  };

  const exportToCSV = () => {
    const headers = 'Worker ID,Full Name,Phone,WhatsApp,District,Town/City,Category,Experience,Skills,Availability,Verified,Status,Registered Date,Last Updated\n';
    const rows = workers.map(w => [
      `"${w.workerId || ''}"`,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      `"${w.phone || ''}"`,
      `"${w.whatsappNumber || ''}"`,
      `"${w.district || ''}"`,
      `"${w.villageOrTown || w.city || ''}"`,
      `"${w.category?.nameEn || ''}"`,
      `"${w.experience || ''}"`,
      `"${(w.skills || '').replace(/"/g, '""')}"`,
      `"${w.availability || 'AVAILABLE'}"`,
      `"${w.isVerified ? 'VERIFIED' : 'UNVERIFIED'}"`,
      `"${w.status}"`,
      `"${new Date(w.createdAt).toISOString()}"`,
      `"${new Date(w.updatedAt).toISOString()}"`
    ].join(','));

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hbk_authorized_workers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Worker Management (कारीगर प्रबंधन)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Inspect worker profiles, manage verification badges, suspend/reactivate accounts, and review portfolios.
          </p>
        </div>

        <button onClick={exportToCSV} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Download size={14} /> Export to CSV
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
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">Search Worker</label>
              <input
                type="text"
                placeholder="Name, Phone, Worker ID, Skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Verification Status</label>
              <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="form-select">
                <option value="">All Verification Statuses</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>

            <div>
              <label className="form-label">Account Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
                <option value="">All Account Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="SUSPENDED">Suspended Only</option>
              </select>
            </div>

            <div>
              <label className="form-label">Work Availability</label>
              <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="form-select">
                <option value="">All Availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '180px' }}>
                <option value="">All Trade Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameEn} ({c.nameHi})</option>
                ))}
              </select>

              <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                <option value="">All Experience</option>
                <option value="1">1+ Year</option>
                <option value="2">2+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(search || verifiedFilter || statusFilter || availabilityFilter || experienceFilter || categoryFilter) && (
                <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCcw size={13} /> Reset
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Filter Workers
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Workers Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Worker ID & Name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Mobile & WhatsApp</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Category & Skills</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Experience & Availability</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Verification</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Registered Date</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Loading workers...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No workers matching filters found.</td></tr>
            ) : (
              workers.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{w.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ID: <strong>{w.workerId || 'Pending'}</strong>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div>+91 {w.phone}</div>
                    {w.whatsappNumber && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        WA: +91 {w.whatsappNumber}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div><span className="badge">{w.category?.nameEn || 'General'}</span></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.skills || 'No skills listed'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div>{w.experience || 'Not specified'}</div>
                    <div style={{ fontSize: '11px', color: w.availability === 'AVAILABLE' ? '#166534' : 'var(--text-muted)' }}>
                      {w.availability || 'AVAILABLE'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggleVerification(w.id, w.isVerified)}
                      className={`btn btn-sm ${w.isVerified ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      title="Click to toggle verification status"
                    >
                      <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                      {w.isVerified ? 'Verified' : 'Verify'}
                    </button>
                    {w.verificationNote && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {w.verificationNote}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div>{new Date(w.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Upd: {new Date(w.updatedAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* WhatsApp Direct Contact Button */}
                      {(w.whatsappNumber || w.phone) && (
                        <a
                          href={`https://wa.me/91${(w.whatsappNumber || w.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${w.name || 'कारीगर'} जी, HUNAR BHARAT KA पोर्टल व्यवस्थापक द्वारा आपकी प्रोफाइल (${w.workerId}) के संबंध में संपर्क किया जा रहा है।`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="WhatsApp Worker"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <WhatsAppSolidIcon size={14} color="#25D366" />
                          <span className="hide-on-mobile">WhatsApp</span>
                        </a>
                      )}

                      {/* View Full Worker Details in Admin Modal */}
                      <button 
                        onClick={() => handleOpenWorkerDetail(w.id)} 
                        className="btn btn-secondary btn-sm" 
                        title="View Full Profile & Portfolio Details"
                        style={{ padding: '4px 8px' }}
                      >
                        <Eye size={13} />
                      </button>

                      {/* View Public Profile in New Tab */}
                      <Link 
                        to={`/worker/${w.workerId}`} 
                        target="_blank" 
                        className="btn btn-secondary btn-sm" 
                        title="View Public Profile"
                        style={{ padding: '4px 8px' }}
                      >
                        <ExternalLink size={13} />
                      </Link>

                      {/* Suspend / Reactivate */}
                      <button
                        onClick={() => handleToggleStatus(w.id, w.status)}
                        className="btn btn-secondary btn-sm"
                        style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px',
                          color: w.status === 'ACTIVE' ? '#991B1B' : '#166534' 
                        }}
                        title={w.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {w.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FULL WORKER DETAIL & PORTFOLIO MODAL */}
      {showDetailModal && selectedWorker && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '20px' 
        }}>
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{selectedWorker.name}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Worker ID: <strong>{selectedWorker.workerId}</strong> • Registered: {new Date(selectedWorker.createdAt).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary btn-sm">
                ✕ Close
              </button>
            </div>

            {/* Profile Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#F9FAFB', padding: '18px', borderRadius: '6px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone Number</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>+91 {selectedWorker.phone}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WhatsApp Number</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>+91 {selectedWorker.whatsappNumber || selectedWorker.phone}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Location (Village/Town & District)</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedWorker.villageOrTown || ''}, {selectedWorker.district}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trade Category</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedWorker.category?.nameEn} ({selectedWorker.category?.nameHi})</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Years of Experience</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedWorker.experience || 'Not specified'}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Availability Status</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedWorker.availability || 'AVAILABLE'}</div>
              </div>
            </div>

            {/* Professional Skills & Bio */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Skills & Capabilities</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {selectedWorker.skills || 'No skills listed'}
              </p>
            </div>

            {selectedWorker.bio && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Profile Bio / Description</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {selectedWorker.bio}
                </p>
              </div>
            )}

            {/* Portfolio Links */}
            {selectedWorker.portfolioLinks && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Portfolio & Project Links</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                  {selectedWorker.portfolioLinks}
                </p>
              </div>
            )}

            {/* Applications History */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                Job Applications ({selectedWorker.applications?.length || 0})
              </h3>
              {selectedWorker.applications?.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No applications submitted yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedWorker.applications?.map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                      <div>
                        <strong>{app.job?.titleHi}</strong> ({app.job?.city})
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge">{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Received */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                Reviews Received ({selectedWorker.reviewsReceived?.length || 0})
              </h3>
              {selectedWorker.reviewsReceived?.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No customer reviews recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedWorker.reviewsReceived?.map(rev => (
                    <div key={rev.id} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Rating: {rev.rating} / 5</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>{rev.comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Notice: Passwords and sensitive tokens are never exposed */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Security: Passwords & OTPs are encrypted and excluded from this view.</span>
              <span>Updated: {new Date(selectedWorker.updatedAt).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {(selectedWorker.whatsappNumber || selectedWorker.phone) && (
                <a
                  href={`https://wa.me/91${(selectedWorker.whatsappNumber || selectedWorker.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${selectedWorker.name || 'कारीगर'} जी, HUNAR BHARAT KA पोर्टल व्यवस्थापक द्वारा आपकी प्रोफाइल (${selectedWorker.workerId}) के संबंध में संपर्क किया जा रहा है।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <WhatsAppSolidIcon size={16} color="#25D366" />
                  <span>Contact on WhatsApp</span>
                </a>
              )}
              <button 
                onClick={() => handleToggleVerification(selectedWorker.id, selectedWorker.isVerified)}
                className={`btn btn-sm ${selectedWorker.isVerified ? 'btn-secondary' : 'btn-primary'}`}
              >
                {selectedWorker.isVerified ? 'Mark Unverified' : 'Approve Verification'}
              </button>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkers;
