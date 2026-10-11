import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    email: '',
    villageOrTown: '',
    district: 'Jhunjhunu',
    state: 'Rajasthan',
    pincode: '333001',
    categoryId: '',
    skills: '',
    experience: '3 वर्ष',
    bio: '',
    availability: 'AVAILABLE',
    isPublicProfile: true,
    showPhonePublic: true,
    showWhatsappPublic: true,
    whatsappOptIn: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, meRes] = await Promise.all([
          axios.get('http://localhost:5000/api/jobs/categories'),
          axios.get('http://localhost:5000/api/users/me')
        ]);
        setCategories(catsRes.data || []);
        if (meRes.data) {
          const u = meRes.data;
          setFormData({
            name: u.name || '',
            whatsappNumber: u.whatsappNumber || '',
            email: u.email || '',
            villageOrTown: u.villageOrTown || '',
            district: u.district || 'Jhunjhunu',
            state: u.state || 'Rajasthan',
            pincode: u.pincode || '333001',
            categoryId: u.categoryId || '',
            skills: u.skills || '',
            experience: u.experience || '3 वर्ष',
            bio: u.bio || '',
            availability: u.availability || 'AVAILABLE',
            isPublicProfile: u.isPublicProfile !== false,
            showPhonePublic: u.showPhonePublic !== false,
            showWhatsappPublic: u.showWhatsappPublic !== false,
            whatsappOptIn: u.whatsappOptIn !== false
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await axios.put('http://localhost:5000/api/users/me', formData);
      setMessage('प्रोफाइल सफलतापूर्वक अपडेट हो गई!');
      setTimeout(() => navigate('/my-profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'अपडेट करने में त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>विवरण लोड हो रहा है...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '640px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>प्रोफाइल संपादित करें (Edit Profile)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          अपने कौशल, स्थान और संपर्क वरीयताओं को अद्यतन रखें।
        </p>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">पूरा नाम *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">व्हाट्सएप नंबर</label>
              <input
                type="tel"
                name="whatsappNumber"
                maxLength="10"
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ईमेल (वैकल्पिक)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">गांव / कस्बा *</label>
              <input
                type="text"
                name="villageOrTown"
                required
                value={formData.villageOrTown}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">जिला</label>
              <select name="district" value={formData.district} onChange={handleChange} className="form-select">
                <option value="Jhunjhunu">झुंझुनू</option>
                <option value="Sikar">सीकर</option>
                <option value="Churu">चूरू</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">श्रेणी</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="form-select">
                <option value="">-- श्रेणी चुनें --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameHi}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">अनुभव</label>
              <select name="experience" value={formData.experience} onChange={handleChange} className="form-select">
                <option value="1 वर्ष">1 वर्ष</option>
                <option value="2 वर्ष">2 वर्ष</option>
                <option value="3 वर्ष">3 वर्ष</option>
                <option value="5 वर्ष">5 वर्ष</option>
                <option value="7+ वर्ष">7+ वर्ष</option>
                <option value="10+ वर्ष">10+ वर्ष</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">कौशल एवं काम की विशेषताएं</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">कार्य विवरण (Bio)</label>
            <textarea
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          {/* Privacy controls */}
          <div style={{ backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '6px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>गोपनीयता एवं संपर्क सेटिंग्स</h4>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="isPublicProfile" checked={formData.isPublicProfile} onChange={handleChange} />
              <span>मेरी प्रोफाइल को सार्वजनिक रखें ताकि ग्राहक सीधे संपर्क कर सकें</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="showPhonePublic" checked={formData.showPhonePublic} onChange={handleChange} />
              <span>सार्वजनिक प्रोफाइल पर कॉलिंग नंबर प्रदर्शित करें</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="showWhatsappPublic" checked={formData.showWhatsappPublic} onChange={handleChange} />
              <span>सार्वजनिक प्रोफाइल पर व्हाट्सएप संपर्क बटन दिखाएं</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="whatsappOptIn" checked={formData.whatsappOptIn} onChange={handleChange} />
              <span>व्हाट्सएप पर नौकरी अलर्ट प्राप्त करें</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-block">
              {saving ? 'सहेजा जा रहा है...' : 'परिवर्तन सहेजें (Save Changes)'}
            </button>
            <button type="button" onClick={() => navigate('/my-profile')} className="btn btn-secondary">
              रद्द करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
