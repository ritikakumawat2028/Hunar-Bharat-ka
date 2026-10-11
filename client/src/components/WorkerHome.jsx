import React, { useState, useEffect, useContext } from 'react';
import { Search, MapPin, Calendar, Clock, IndianRupee, Users } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const WorkerHome = () => {
  const [jobs, setJobs] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch jobs from backend
    axios.get('http://localhost:5000/api/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error("Error fetching jobs", err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          नमस्ते, {user?.name || 'उपयोगकर्ता'} जी 👋
        </h1>
        <h2 style={{ fontSize: '18px', marginTop: '8px' }}>आपके लिए उपलब्ध काम खोजें</h2>
        <p className="text-secondary" style={{ fontSize: '14px', marginTop: '4px' }}>
          अपने हुनर के अनुसार अपने आसपास काम पाएं।
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--secondary-color)', fontSize: '14px', fontWeight: '600' }}>
          <MapPin size={16} />
          <span>शेखावाटी, झुंझुनू, राजस्थान</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="🔍 काम या स्थान खोजें" 
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)',
            fontSize: '16px', outline: 'none'
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>काम की श्रेणियाँ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: 0 }}>
            <span>🔧</span> <span style={{fontWeight: '500'}}>प्लंबर</span>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: 0 }}>
            <span>🧱</span> <span style={{fontWeight: '500'}}>टाइल मिस्त्री</span>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: 0 }}>
            <span>⚡</span> <span style={{fontWeight: '500'}}>इलेक्ट्रिशियन</span>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: 0 }}>
            <span>🎨</span> <span style={{fontWeight: '500'}}>पेंटर</span>
          </div>
        </div>
      </div>

      {/* New Jobs */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>नए उपलब्ध काम</h3>
        
        {jobs.length === 0 ? (
          <p className="text-secondary" style={{textAlign: 'center', padding: '24px'}}>अभी आपके लिए कोई नया काम उपलब्ध नहीं है।</p>
        ) : (
          jobs.map(job => (
            <div className="card" key={job.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>💼</span>
                <h4 style={{ fontSize: '18px', color: 'var(--primary-color)' }}>{job.titleHi}</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {job.city}, {job.state}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> {job.jobDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {job.startTime}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontWeight: 'bold' }}>
                  <IndianRupee size={16} /> ₹{job.payment} / दिन
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {job.workersRequired} लोगों की आवश्यकता</div>
              </div>
              
              <p style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-main)' }}>
                {job.descriptionHi}
              </p>
              
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                काम की जानकारी देखें →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerHome;
