import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Briefcase, Filter, ChevronLeft, ChevronRight, RotateCcw, Calendar, Clock } from 'lucide-react';

const BrowseJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (skill) params.append('skill', skill);
      if (experience) params.append('experience', experience);
      if (employmentType) params.append('employmentType', employmentType);
      if (categoryId) params.append('categoryId', categoryId);
      params.append('page', page);
      params.append('limit', 10);

      const res = await axios.get(`/api/jobs?${params.toString()}`);
      setJobs(res.data?.jobs || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get('/api/jobs/categories')
      .then(res => setCategories(res.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [categoryId, employmentType, experience, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setSkill('');
    setExperience('');
    setEmploymentType('');
    setCategoryId('');
    setPage(1);
    axios.get('/api/jobs?page=1&limit=10')
      .then(res => {
        setJobs(res.data?.jobs || []);
        setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
      });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(search || location || skill || experience || employmentType || categoryId);

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      {/* Page Title & Breadcrumb Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
          उपलब्ध नौकरियां (Browse Jobs)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          शेखावाटी क्षेत्र (झुंझुनू, नवलगढ़, मंडावा, चिड़ावा) में व्यवस्थापक द्वारा सत्यापित एवं प्रकाशित कार्य
        </p>
      </div>

      {/* Filter and Search Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit}>
          {/* Top Row: Keywords & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">काम खोजें (कीवर्ड / शीर्षक)</label>
              <input
                type="text"
                placeholder="उदा. प्लंबर, टाइल, इलेक्ट्रीशियन..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">स्थान (शहर / कस्बा / क्षेत्र)</label>
              <input
                type="text"
                placeholder="उदा. झुंझुनू, नवलगढ़, मंडावा बाईपास..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">कौशल (Skill Filter)</label>
              <input
                type="text"
                placeholder="उदा. पाइप फिटिंग, वायरिंग..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Second Row: Category, Experience & Employment Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label className="form-label">कार्य श्रेणी (Category)</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="form-select"
              >
                <option value="">सभी श्रेणियां (All)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameHi} ({c.nameEn})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">अनुभव (Experience)</label>
              <select
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  setPage(1);
                }}
                className="form-select"
              >
                <option value="">सभी अनुभव स्तर</option>
                <option value="1">1 वर्ष या अधिक</option>
                <option value="2">2+ वर्ष</option>
                <option value="3">3+ वर्ष</option>
                <option value="5">5+ वर्ष</option>
              </select>
            </div>

            <div>
              <label className="form-label">रोजगार प्रकार (Employment Type)</label>
              <select
                value={employmentType}
                onChange={(e) => {
                  setEmploymentType(e.target.value);
                  setPage(1);
                }}
                className="form-select"
              >
                <option value="">सभी प्रकार</option>
                <option value="Daily Wage">Daily Wage (दैनिक मजदूरी)</option>
                <option value="Contract">Contract (ठेका कार्य)</option>
                <option value="Full-time">Full-time (पूर्णकालिक)</option>
                <option value="Part-time">Part-time (अंशकालिक)</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {hasActiveFilters && (
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={13} /> फ़िल्टर हटाएं (Reset)
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} /> खोजें (Search Jobs)
            </button>
          </div>
        </form>
      </div>

      {/* Result Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <div>
          {!loading && (
            <span>
              कुल <strong>{pagination.total}</strong> प्रकाशित नौकरियां उपलब्ध हैं
            </span>
          )}
        </div>
        {!loading && pagination.totalPages > 1 && (
          <div>
            पेज {pagination.page} / {pagination.totalPages}
          </div>
        )}
      </div>

      {/* Job Results List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          नौकरियां लोड हो रही हैं...
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '70px 20px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}>
          <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {hasActiveFilters 
              ? 'आपके खोजे गए फ़िल्टर के अनुसार कोई नौकरी नहीं मिली' 
              : 'वर्तमान में व्यवस्थापक (Admin) द्वारा कोई नौकरी प्रकाशित नहीं की गई है'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '540px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            {hasActiveFilters
              ? 'कृपया अपने फ़िल्टर बदलें या सभी नौकरियों को देखने के लिए फ़िल्टर रीसेट करें।'
              : 'जैसे ही व्यवस्थापक नई नौकरी पोस्ट करेंगे, वह तुरंत यहाँ प्रदर्शित होगी और आपको व्हाट्सएप पर भी सूचना प्राप्त होगी।'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {hasActiveFilters ? (
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                सभी नौकरियां देखें
              </button>
            ) : (
              <>
                <Link to="/my-profile" className="btn btn-secondary btn-sm">
                  मेरी प्रोफाइल देखें
                </Link>
                <Link to="/my-applications" className="btn btn-secondary btn-sm">
                  मेरे आवेदन एवं स्थिति
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="badge">{job.category?.nameHi || 'दैनिक कार्य'}</span>
                    <span className="badge badge-outline">{job.employmentType || 'दैनिक'}</span>
                    {job.requiredExp && (
                      <span className="badge" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
                        अनुभव: {job.requiredExp}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>
                    <Link to={`/jobs/${job.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {job.titleHi || job.titleEn}
                    </Link>
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {job.payment}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    आवश्यक कारीगर: {job.workersRequired}
                  </div>
                </div>
              </div>

              {/* Hindi Description faithfully displayed */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px', lineHeight: '1.6' }}>
                {job.descriptionHi || job.descriptionEn}
              </p>

              {/* Skills tags */}
              {job.requiredSkills && (
                <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>आवश्यक कौशल:</strong> {job.requiredSkills}
                </div>
              )}

              {/* Bottom footer with Location & Details Link */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>
                    <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {job.address}, {job.city}, {job.district}
                  </span>
                  {job.jobDate && (
                    <span>
                      <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      कार्य तिथि: {job.jobDate}
                    </span>
                  )}
                  {job.deadline && (
                    <span>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      अंतिम तिथि: {new Date(job.deadline).toLocaleDateString('hi-IN')}
                    </span>
                  )}
                </div>

                <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 16px' }}>
                  पूर्ण विवरण व आवेदन
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={14} /> पिछला (Prev)
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '36px', height: '36px', padding: '0 8px' }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                अगला (Next) <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
