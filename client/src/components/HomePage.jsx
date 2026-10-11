import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [verifiedWorkers, setVerifiedWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, jobsRes, workersRes] = await Promise.all([
          axios.get('/api/jobs/categories'),
          axios.get('/api/jobs'),
          axios.get('/api/users/public-directory')
        ]);
        setCategories(catsRes.data || []);
        setRecentJobs(jobsRes.data?.jobs || []);
        setVerifiedWorkers(workersRes.data || []);
      } catch (err) {
        console.error('Home page fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--border-light)', padding: '50px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div className="badge" style={{ marginBottom: '16px' }}>
            <MapPin size={12} /> शेखावाटी, झुंझुनू (राजस्थान) का अपना पोर्टल
          </div>
          <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: '800' }}>
            हुनर भारत का — अपने शहर और गांव में पाएं काम
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            प्लंबर, मिस्त्री, इलेक्ट्रीशियन, पेंटर व सभी हुनरमंद साथी सीधा काम खोजें और रोज़गार से जुड़ें।
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 250px', position: 'relative' }}>
              <input
                type="text"
                placeholder="कौशल, काम का नाम या पद (उदा. प्लंबर, टाइल)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <input
                type="text"
                placeholder="स्थान (उदा. झुंझुनू, नवलगढ़)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>

            <button type="submit" className="btn btn-primary">
              खोजें
            </button>
          </form>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary">
              कारीगर पंजीकरण करें
            </Link>
            <Link to="/jobs" className="btn btn-secondary">
              उपलब्ध नौकरियां देखें
            </Link>
          </div>
        </div>
      </section>

      {/* Published Jobs Section */}
      <section style={{ padding: '50px 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2>व्यवस्थापक द्वारा प्रकाशित नौकरियां</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>व्यवस्थापक (Admin) द्वारा वर्तमान में पोस्ट की गई रिक्तियां</p>
            </div>
            {recentJobs.length > 0 && (
              <Link to="/jobs" className="btn btn-secondary btn-sm">
                सभी देखें <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)' }}>
              <Briefcase size={44} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                वर्तमान में कोई नौकरी प्रकाशित नहीं है
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                व्यवस्थापक (Admin) द्वारा अभी तक कोई नौकरी पोस्ट नहीं की गई है। कृपया बाद में देखें या अपना पंजीकरण पूर्ण रखें।
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/register" className="btn btn-primary btn-sm">
                  कारीगर रजिस्टर करें
                </Link>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  लॉगिन करें
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid-2">
              {recentJobs.map((job) => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className="badge">{job.category?.nameHi || 'सामान्य कार्य'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.employmentType || 'दैनिक'}</span>
                    </div>

                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                      <Link to={`/jobs/${job.id}`}>{job.titleHi}</Link>
                    </h3>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {job.descriptionHi}
                    </p>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {job.city}, {job.district}
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                      पारिश्रमिक: {job.payment}
                    </div>
                  </div>

                  <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm btn-block">
                    विवरण देखें व आवेदन करें
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '50px 0', borderBottom: '1px solid var(--border-light)', backgroundColor: '#FAFAFA' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2>पोर्टल कैसे काम करता है?</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
              सरल, पारदर्शी और पूरी तरह निःशुल्क प्रक्रिया
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>1</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>रजिस्टर करें</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                अपना नाम, मोबाइल नंबर और हुनर दर्ज कर स्थायी कारीगर आईडी प्राप्त करें।
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>2</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>एडमिन जॉब पोस्टिंग</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                एडमिन द्वारा नौकरी प्रकाशित होते ही आपको सूचना मिलेगी और आप आवेदन कर सकेंगे।
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>3</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>स्टेटस एवं प्रोफाइल देखें</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                अपने डैशबोर्ड से कभी भी अपनी प्रोफाइल और आवेदन स्थिति (Job Status) जांचें।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Workers Showcase */}
      {verifiedWorkers.length > 0 && (
        <section style={{ padding: '50px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2>सत्यापित स्थानीय कारीगर</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                शेखावाटी के कुशल और विश्वसनीय कामगार
              </p>
            </div>

            <div className="grid-3">
              {verifiedWorkers.slice(0, 3).map((w) => (
                <div key={w.workerId} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700' }}>
                      {w.name ? w.name.charAt(0) : 'W'}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{w.name}</h4>
                  <div className="badge badge-verified" style={{ marginBottom: '8px' }}>
                    <ShieldCheck size={12} /> {w.workerId}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {w.skills || w.category?.nameHi || 'कुशल कारीगर'}
                  </p>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {w.villageOrTown || w.city}, {w.district} | अनुभव: {w.experience || 'अनुभवी'}
                  </div>

                  <Link to={`/worker/${w.workerId}`} className="btn btn-secondary btn-sm btn-block">
                    प्रोफाइल देखें
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
