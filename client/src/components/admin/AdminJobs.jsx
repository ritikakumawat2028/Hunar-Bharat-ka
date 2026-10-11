import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Archive, 
  RotateCcw, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Briefcase, 
  Phone, 
  AlertCircle 
} from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [previewJob, setPreviewJob] = useState(null);
  
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const initialFormState = {
    titleHi: '',
    titleEn: '',
    descriptionHi: '',
    descriptionEn: '',
    categoryId: '',
    address: '',
    area: '',
    city: 'Jhunjhunu',
    district: 'Jhunjhunu',
    state: 'Rajasthan',
    pincode: '333001',
    payment: '₹800 / day',
    workersRequired: 1,
    requiredSkills: '',
    requiredExp: '2+ years',
    employerName: '',
    employerContact: '',
    jobDate: '',
    startTime: '09:00 AM',
    duration: '1 day',
    deadline: '',
    employmentType: 'Daily Wage',
    status: 'PUBLISHED'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const [jobsRes, catsRes] = await Promise.all([
        axios.get('/api/admin/jobs', { params }),
        axios.get('/api/jobs/categories')
      ]);
      setJobs(jobsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error(err);
      setActionError('Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      ...initialFormState,
      categoryId: categories[0]?.id || ''
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      titleHi: job.titleHi || '',
      titleEn: job.titleEn || '',
      descriptionHi: job.descriptionHi || '',
      descriptionEn: job.descriptionEn || '',
      categoryId: job.categoryId || (categories[0]?.id || ''),
      address: job.address || '',
      area: job.area || '',
      city: job.city || 'Jhunjhunu',
      district: job.district || 'Jhunjhunu',
      state: job.state || 'Rajasthan',
      pincode: job.pincode || '333001',
      payment: job.payment || '',
      workersRequired: job.workersRequired || 1,
      requiredSkills: job.requiredSkills || '',
      requiredExp: job.requiredExp || '',
      employerName: job.employerName || '',
      employerContact: job.employerContact || '',
      jobDate: job.jobDate || '',
      startTime: job.startTime || '',
      duration: job.duration || '',
      deadline: job.deadline || '',
      employmentType: job.employmentType || 'Daily Wage',
      status: job.status || 'PUBLISHED'
    });
    setShowFormModal(true);
  };

  const handleOpenPreview = (job) => {
    setPreviewJob(job);
    setShowPreviewModal(true);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionMessage('');
    setActionError('');

    // Client-side past date check
    if (formData.deadline) {
      if (formData.deadline < todayStr) {
        setActionError('Application Deadline cannot be in the past (भूतकाल में नहीं हो सकती). Please select today or a future date.');
        return;
      }
    }

    if (formData.jobDate && formData.jobDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      if (formData.jobDate < todayStr) {
        setActionError('Work Date cannot be in the past. Please select today or a future date.');
        return;
      }
    }

    try {
      if (editingJob) {
        const res = await axios.put(`/api/admin/jobs/${editingJob.id}`, formData);
        if (res.data?.notificationResult) {
          setActionMessage(`Job post updated & WhatsApp notification queued for ${res.data.notificationResult.totalEligible} eligible workers.`);
        } else {
          setActionMessage('Job post updated successfully.');
        }
      } else {
        const res = await axios.post('/api/admin/jobs', formData);
        if (res.data?.notificationResult) {
          setActionMessage(`Job published! WhatsApp notifications queued for ${res.data.notificationResult.totalEligible} eligible workers.`);
        } else {
          setActionMessage(formData.status === 'PUBLISHED' ? 'Job published successfully.' : 'Job saved as Draft.');
        }
      }
      setShowFormModal(false);
      fetchJobs();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to save job post.');
    }
  };

  // Status Actions: Publish, Close, Reopen, Archive
  const handleStatusChange = async (jobId, targetStatus, label) => {
    if (!window.confirm(`Are you sure you want to mark this job as ${label}?`)) return;
    try {
      const res = await axios.put(`/api/admin/jobs/${jobId}/status`, { status: targetStatus });
      if (res.data?.notificationResult) {
        setActionMessage(`Job marked as ${label}! WhatsApp alert sent to ${res.data.notificationResult.totalEligible} eligible workers.`);
      } else {
        setActionMessage(`Job status changed to ${label}.`);
      }
      setTimeout(() => setActionMessage(''), 4000);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to change status to ${label}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this job post? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/jobs/${id}`);
      setActionMessage('Job permanently deleted.');
      setTimeout(() => setActionMessage(''), 3000);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete job post.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge-verified">PUBLISHED (Active)</span>;
      case 'DRAFT':
        return <span className="badge" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' }}>DRAFT</span>;
      case 'CLOSED':
        return <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>CLOSED</span>;
      case 'ARCHIVED':
        return <span className="badge badge-outline" style={{ color: '#6B7280' }}>ARCHIVED</span>;
      default:
        return <span className="badge badge-outline">{status}</span>;
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Job Management (व्यवस्थापक कार्य प्रबंधन)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Only authorized admins can create, publish, edit, close, reopen, archive and delete jobs.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <Plus size={14} /> Create New Job
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
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED', 'ARCHIVED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {st === 'ALL' ? 'All Jobs' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search title, skill or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px' }}>
              <Search size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Job Title (Hindi / English)</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Category & Type</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Location</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Payment & Openings</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Applicants</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Created / Updated</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>Loading jobs...</td></tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No jobs found matching the selected filter.
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.titleHi}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.titleEn}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div><span className="badge">{job.category?.nameHi || job.category?.nameEn}</span></div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {job.employmentType || 'Daily Wage'}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div>{job.city}, {job.district}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.address}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600' }}>{job.payment}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Openings: {job.workersRequired}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {getStatusBadge(job.status)}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <strong>{job._count?.applications || 0}</strong> applicants
                  </td>

                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div>Created: {new Date(job.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(job.updatedAt).toLocaleDateString()}</div>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* Preview Button */}
                      <button 
                        onClick={() => handleOpenPreview(job)} 
                        className="btn btn-secondary btn-sm" 
                        title="Preview Public Worker View"
                        style={{ padding: '4px 8px' }}
                      >
                        <Eye size={13} />
                      </button>

                      {/* Edit Button */}
                      <button 
                        onClick={() => handleOpenEdit(job)} 
                        className="btn btn-secondary btn-sm" 
                        title="Edit Job"
                        style={{ padding: '4px 8px' }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Status Lifecycle Actions */}
                      {job.status === 'DRAFT' && (
                        <button 
                          onClick={() => handleStatusChange(job.id, 'PUBLISHED', 'Published')}
                          className="btn btn-primary btn-sm"
                          title="Publish Job"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Publish
                        </button>
                      )}

                      {job.status === 'PUBLISHED' && (
                        <button 
                          onClick={() => handleStatusChange(job.id, 'CLOSED', 'Closed')}
                          className="btn btn-secondary btn-sm"
                          title="Close Job"
                          style={{ padding: '4px 8px', fontSize: '11px', color: '#991B1B' }}
                        >
                          Close
                        </button>
                      )}

                      {job.status === 'CLOSED' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(job.id, 'PUBLISHED', 'Reopened')}
                            className="btn btn-secondary btn-sm"
                            title="Reopen Job"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <RotateCcw size={11} style={{ marginRight: '3px' }} /> Reopen
                          </button>
                          <button 
                            onClick={() => handleStatusChange(job.id, 'ARCHIVED', 'Archived')}
                            className="btn btn-secondary btn-sm"
                            title="Archive Job"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <Archive size={11} />
                          </button>
                        </>
                      )}

                      {job.status === 'ARCHIVED' && (
                        <button 
                          onClick={() => handleStatusChange(job.id, 'PUBLISHED', 'Reopened')}
                          className="btn btn-secondary btn-sm"
                          title="Reopen Job"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <RotateCcw size={11} style={{ marginRight: '3px' }} /> Reopen
                        </button>
                      )}

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDelete(job.id)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ color: '#991B1B', padding: '4px 8px' }} 
                        title="Delete Job Permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT JOB MODAL */}
      {showFormModal && (
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
          <div className="card" style={{ maxWidth: '720px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
                  {editingJob ? 'Edit Job Post (कार्य संपादन)' : 'Create New Job (नई नौकरी बनाएं)'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  All fields are displayed faithfully to workers. Never fabricate employer or salary details.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowFormModal(false)} 
                className="btn btn-secondary btn-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Job Titles */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title in Hindi (कार्य शीर्षक) *</label>
                  <input 
                    type="text" 
                    name="titleHi" 
                    required 
                    value={formData.titleHi} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. प्लंबर एवं पाइप फिटिंग कार्य" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title in English</label>
                  <input 
                    type="text" 
                    name="titleEn" 
                    value={formData.titleEn} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="e.g. Plumber & Pipe Fitting Work" 
                  />
                </div>
              </div>

              {/* Category & Employment Type */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Category (कार्य श्रेणी) *</label>
                  <select 
                    name="categoryId" 
                    required 
                    value={formData.categoryId} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameHi} ({c.nameEn})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type (रोजगार प्रकार) *</label>
                  <select 
                    name="employmentType" 
                    value={formData.employmentType} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="Daily Wage">Daily Wage (दैनिक मजदूरी)</option>
                    <option value="Contract">Contract (ठेका कार्य)</option>
                    <option value="Full-time">Full-time (पूर्णकालिक)</option>
                    <option value="Part-time">Part-time (अंशकालिक)</option>
                  </select>
                </div>
              </div>

              {/* Payment & Openings */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Salary / Payment Range (मजदूरी / दर) *</label>
                  <input 
                    type="text" 
                    name="payment" 
                    required 
                    value={formData.payment} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. ₹700 - ₹900 / day या ₹18,000 / month" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Openings (आवश्यक कारीगर संख्या) *</label>
                  <input 
                    type="number" 
                    name="workersRequired" 
                    min="1" 
                    required 
                    value={formData.workersRequired} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Location / Address (कार्य स्थल पता) *</label>
                  <input 
                    type="text" 
                    name="address" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. मंडावा बाईपास, निकट किसान सेवा केंद्र" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Landmark</label>
                  <input 
                    type="text" 
                    name="area" 
                    value={formData.area} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. मंडावा चौराहा" 
                  />
                </div>
              </div>

              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City / Town</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input 
                    type="text" 
                    name="district" 
                    value={formData.district} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Required Skills (आवश्यक हुनर)</label>
                  <input 
                    type="text" 
                    name="requiredSkills" 
                    value={formData.requiredSkills} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. पाइप फिटिंग, सीपीवीसी, मोटर इंस्टॉलेशन" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Experience (आवश्यक अनुभव)</label>
                  <input 
                    type="text" 
                    name="requiredExp" 
                    value={formData.requiredExp} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. 2+ वर्ष, न्यूनतम 1 वर्ष, नवागंतुक भी मान्य" 
                  />
                </div>
              </div>

              {/* Schedule, Duration & Deadline */}
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Work Date / Start (कार्य तिथि)</label>
                  <input 
                    type="date" 
                    name="jobDate" 
                    min={todayStr}
                    value={formData.jobDate} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    केवल आज या भविष्य की तिथि (No past dates)
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time / Duration</label>
                  <input 
                    type="text" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. 9:00 AM से 6:00 PM (3 दिन)" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline (अंतिम तिथि)</label>
                  <input 
                    type="date" 
                    name="deadline" 
                    min={todayStr}
                    value={formData.deadline} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    केवल आज या भविष्य की तिथि (No past dates)
                  </div>
                </div>
              </div>

              {/* Hindi & English Descriptions */}
              <div className="form-group">
                <label className="form-label">Job Description in Hindi (कार्य का पूरा विवरण) *</label>
                <textarea 
                  rows="3" 
                  name="descriptionHi" 
                  required 
                  value={formData.descriptionHi} 
                  onChange={handleChange} 
                  className="form-textarea" 
                  placeholder="काम का सटीक विवरण: क्या कार्य करना है, आवश्यक औजार, कार्य स्थल की शर्तें आदि..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description in English (Optional)</label>
                <textarea 
                  rows="2" 
                  name="descriptionEn" 
                  value={formData.descriptionEn} 
                  onChange={handleChange} 
                  className="form-textarea" 
                  placeholder="Detailed description in English..." 
                />
              </div>

              {/* Optional Employer or Contact Details */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Optional Employer / Contact Person</label>
                  <input 
                    type="text" 
                    name="employerName" 
                    value={formData.employerName} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. सुनील शर्मा / ठेकेदार" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Optional Contact Phone</label>
                  <input 
                    type="text" 
                    name="employerContact" 
                    value={formData.employerContact} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="उदा. 98290XXXXX" 
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="form-group">
                <label className="form-label">Job Status *</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="form-select"
                >
                  <option value="PUBLISHED">Published (सार्वजनिक रूप से दृश्य एवं WhatsApp सूचना योग्य)</option>
                  <option value="DRAFT">Draft (प्रारूप - केवल व्यवस्थापक को दृश्य)</option>
                  <option value="CLOSED">Closed (बंद - आवेदन स्वीकार्य नहीं)</option>
                  <option value="ARCHIVED">Archived (संग्रहीत)</option>
                </select>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Note: Only PUBLISHED jobs appear on the public browse page.
                </small>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px' }}>
                  {editingJob ? 'Update Job Post' : (formData.status === 'PUBLISHED' ? 'Save & Publish Job' : 'Save as Draft')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)} 
                  className="btn btn-secondary"
                  style={{ minWidth: '100px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW JOB MODAL */}
      {showPreviewModal && previewJob && (
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
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-outline" style={{ marginRight: '8px' }}>Admin Preview Mode</span>
                {getStatusBadge(previewJob.status)}
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="btn btn-secondary btn-sm"
              >
                ✕ Close Preview
              </button>
            </div>

            {/* Simulated Worker View */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge">{previewJob.category?.nameHi || 'दैनिक कार्य'}</span>
                    <span className="badge badge-outline">{previewJob.employmentType || 'दैनिक'}</span>
                  </div>
                  <h1 style={{ fontSize: '22px', fontWeight: '800' }}>{previewJob.titleHi}</h1>
                  {previewJob.titleEn && (
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{previewJob.titleEn}</div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800' }}>{previewJob.payment}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Openings: {previewJob.workersRequired} कारीगर
                  </div>
                </div>
              </div>

              {/* Key metadata grid */}
              <div className="grid-2" style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>स्थान (Location)</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {previewJob.address}, {previewJob.city}, {previewJob.district} - {previewJob.pincode}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>कार्य तिथि व समय</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {previewJob.jobDate || 'तत्काल'} {previewJob.duration ? `(${previewJob.duration})` : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>आवेदन अंतिम तिथि (Deadline)</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {previewJob.deadline ? new Date(previewJob.deadline).toLocaleDateString() : 'जब तक रिक्तियां उपलब्ध हैं'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>रोजगार प्रकार</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {previewJob.employmentType || 'Daily Wage'}
                  </div>
                </div>
              </div>

              {/* Hindi Description */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>काम का विवरण (Hindi Description)</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                  {previewJob.descriptionHi}
                </p>
              </div>

              {previewJob.descriptionEn && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Description (English)</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                    {previewJob.descriptionEn}
                  </p>
                </div>
              )}

              {/* Skills & Experience */}
              {(previewJob.requiredSkills || previewJob.requiredExp) && (
                <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>आवश्यक कौशल एवं अनुभव</h3>
                  {previewJob.requiredSkills && (
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      <strong>कौशल:</strong> {previewJob.requiredSkills}
                    </div>
                  )}
                  {previewJob.requiredExp && (
                    <div style={{ fontSize: '14px' }}>
                      <strong>अनुभव:</strong> {previewJob.requiredExp}
                    </div>
                  )}
                </div>
              )}

              {/* Employer Details */}
              {previewJob.employerName && (
                <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>नियोक्ता / संपर्क व्यक्ति</h3>
                  <div style={{ fontSize: '14px' }}>
                    {previewJob.employerName} {previewJob.employerContact ? `(+91 ${previewJob.employerContact})` : ''}
                  </div>
                </div>
              )}

              {/* Audit Timestamps */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Job ID: {previewJob.id}</span>
                <span>Created: {new Date(previewJob.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(previewJob.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowPreviewModal(false);
                  handleOpenEdit(previewJob);
                }} 
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={13} /> Edit Job
              </button>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
