import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Check, ShieldCheck, AlertCircle, KeyRound, LogIn } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    villageOrTown: '',
    district: 'Jhunjhunu',
    state: 'Rajasthan',
    pincode: '333001',
    categoryId: '',
    skills: '',
    experience: '3 वर्ष',
    bio: '',
    availability: 'AVAILABLE',
    termsAccepted: false,
    whatsappOptIn: true
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCodeReceived, setOtpCodeReceived] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [error, setError] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'WORKER') {
      navigate('/dashboard');
    }
    axios.get('http://localhost:5000/api/jobs/categories')
      .then(res => setCategories(res.data || []))
      .catch(err => console.error(err));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'phone') {
      setIsAlreadyRegistered(false);
      setError('');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError('कृपया पहले 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    setError('');
    setIsAlreadyRegistered(false);
    setOtpSending(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', {
        phone: formData.phone,
        purpose: 'register'
      });
      setOtpSent(true);
      const generatedCode = res.data?.otp || '';
      setOtpCodeReceived(generatedCode);
      setFormData(prev => ({ ...prev, otp: generatedCode }));
      setOtpMessage(`ओटीपी सफलतापूर्वक जनरेट हुआ: ${generatedCode}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'ओटीपी भेजने में असमर्थ।';
      setError(errMsg);
      if (err.response?.data?.isRegistered) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAlreadyRegistered(false);

    if (!formData.otp) {
      setError('कृपया पहले "ओटीपी भेजें" बटन दबाकर ओटीपी कोड प्राप्त करें।');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    if (!formData.termsAccepted) {
      setError('कृपया नियम और गोपनीयता नीति स्वीकार करें।');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
      if (res.message && res.message.includes('पंजीकृत')) {
        setIsAlreadyRegistered(true);
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '640px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>कारीगर पंजीकरण (Worker Registration)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            HUNAR BHARAT KA से जुड़ें और अपनी स्थायी पहचान (HBK ID) प्राप्त करें।
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            {isAlreadyRegistered && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #FCA5A5' }}>
                <Link to="/login" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
                  <LogIn size={14} /> इस नंबर से तुरंत लॉगिन करें (Go to Login)
                </Link>
              </div>
            )}
          </div>
        )}

        {otpMessage && otpSent && !isAlreadyRegistered && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={18} />
              <span>{otpMessage}</span>
            </div>
            <span className="badge badge-verified" style={{ fontSize: '13px', padding: '4px 10px' }}>
              कोड: {otpCodeReceived}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="form-group">
            <label className="form-label">पूरा नाम *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="उदा. सुरेश कुमार जांगिड़"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">मोबाइल नंबर (10 अंक) *</label>
              <input
                type="tel"
                name="phone"
                required
                maxLength="10"
                value={formData.phone}
                onChange={handleChange}
                placeholder="उदा. 9829012345"
                className="form-input"
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpSending}
              className="btn btn-primary"
              style={{ height: '42px', fontSize: '13px' }}
            >
              {otpSending ? 'भेज रहे हैं...' : (otpSent ? 'पुनः भेजें' : 'ओटीपी भेजें')}
            </button>
          </div>

          {otpSent && !isAlreadyRegistered && (
            <div className="form-group" style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>ओटीपी सत्यापन कोड (SMS OTP) *</label>
                {otpCodeReceived && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    (स्वतः भरा गया: <strong>{otpCodeReceived}</strong>)
                  </span>
                )}
              </div>
              <input
                type="text"
                name="otp"
                required
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6 अंकों का ओटीपी दर्ज करें"
                className="form-input"
                style={{ fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold' }}
              />
              <div className="form-hint">यह ओटीपी 5 मिनट के लिए वैध है।</div>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">व्हाट्सएप नंबर (यदि अलग है)</label>
              <input
                type="tel"
                name="whatsappNumber"
                maxLength="10"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="वैकल्पिक"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ईमेल पता (वैकल्पिक)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="form-input"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">गांव / कस्बा / मोहल्ला *</label>
              <input
                type="text"
                name="villageOrTown"
                required
                value={formData.villageOrTown}
                onChange={handleChange}
                placeholder="उदा. मंडावा, नवलगढ़, झुंझुनू"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">जिला</label>
              <select name="district" value={formData.district} onChange={handleChange} className="form-select">
                <option value="Jhunjhunu">झुंझुनू (Jhunjhunu)</option>
                <option value="Sikar">सीकर (Sikar)</option>
                <option value="Churu">चूरू (Churu)</option>
              </select>
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">मुख्य कार्य श्रेणी *</label>
              <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="form-select">
                <option value="">-- श्रेणी चुनें --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameHi} ({c.nameEn})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">कार्य अनुभव *</label>
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
            <label className="form-label">कौशल एवं विशेषताएं (Skills) *</label>
            <input
              type="text"
              name="skills"
              required
              value={formData.skills}
              onChange={handleChange}
              placeholder="उदा. पाइप फिटिंग, बाथरूम लीकेज रिपेयर, मोटर फिटिंग"
              className="form-input"
            />
            <div className="form-hint">अल्पविराम (comma) लगाकर अपने मुख्य कार्य लिखें।</div>
          </div>

          <div className="form-group">
            <label className="form-label">परिचय व कार्य विवरण (Bio)</label>
            <textarea
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              placeholder="अपने काम के बारे में संक्षेप में लिखें..."
              className="form-textarea"
            />
          </div>

          {/* Passwords */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">सुरक्षित पासवर्ड *</label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                placeholder="कम से कम 6 अक्षर"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">पासवर्ड की पुष्टि करें *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="पासवर्ड दोबारा लिखें"
                className="form-input"
              />
            </div>
          </div>

          {/* Consents */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox"
                name="whatsappOptIn"
                checked={formData.whatsappOptIn}
                onChange={handleChange}
                style={{ marginTop: '3px' }}
              />
              <span>मैं नई नौकरियों और आवश्यक अलर्ट के लिए व्हाट्सएप सूचनाएं प्राप्त करने की सहमति देता हूँ।</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="termsAccepted"
                required
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{ marginTop: '3px' }}
              />
              <span>
                मैंने <Link to="/terms" target="_blank" style={{ textDecoration: 'underline' }}>नियम व शर्तें</Link> तथा{' '}
                <Link to="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>गोपनीयता नीति</Link> पढ़ ली हैं और स्वीकार करता हूँ। *
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'पंजीकरण हो रहा है...' : 'पंजीकरण पूर्ण करें (Register)'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          पहले से खाता है? <Link to="/login" style={{ fontWeight: '600', textDecoration: 'underline' }}>यहाँ लॉगिन करें</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
