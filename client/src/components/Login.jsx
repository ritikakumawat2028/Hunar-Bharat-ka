import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogIn, AlertCircle, KeyRound, Phone } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setError('कृपया पहले 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    setError('');
    setOtpSending(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { phone });
      setOtpSent(true);
      const code = res.data?.otp || '';
      setOtp(code);
      setOtpNotice(`ओटीपी भेजा गया: ${code}`);
    } catch (err) {
      setError(err.response?.data?.error || 'ओटीपी भेजने में त्रुटि हुई।');
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('कृपया मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (loginMethod === 'otp' && !otp) {
      setError('कृपया पहले ओटीपी प्राप्त करें एवं दर्ज करें।');
      return;
    }

    if (loginMethod === 'password' && !password) {
      setError('कृपया पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    const res = await login(phone, password, loginMethod === 'otp' ? otp : null);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', padding: '60px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>लॉगिन करें (Login)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            अपने पंजीकृत मोबाइल नंबर से प्रवेश करें
          </p>
        </div>

        {/* Tab switcher: OTP vs Password */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => { setLoginMethod('otp'); setError(''); }}
            className={`btn btn-sm ${loginMethod === 'otp' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '13px' }}
          >
            ओटीपी से लॉगिन (OTP)
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`btn btn-sm ${loginMethod === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '13px' }}
          >
            पासवर्ड से लॉगिन
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {otpNotice && otpSent && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} />
            <span>{otpNotice} (ऑटो-फिल कोड)</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">मोबाइल नंबर *</label>
            <input
              type="tel"
              required
              maxLength="10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10 अंकों का मोबाइल नंबर"
              className="form-input"
            />
          </div>

          {loginMethod === 'otp' ? (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  {otpSending ? 'भेज रहे हैं...' : (otpSent ? 'ओटीपी पुनः भेजें' : 'ओटीपी प्राप्त करें')}
                </button>
              </div>

              {otpSent && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">6 अंकों का ओटीपी कोड *</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6 अंकों का कोड दर्ज करें"
                    className="form-input"
                    style={{ fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">पासवर्ड *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="अपना पासवर्ड दर्ज करें"
                className="form-input"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'सत्यापित हो रहा है...' : 'लॉगिन करें (Sign In)'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '24px', paddingTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            नया खाता बनाना चाहते हैं?
          </p>
          <Link to="/register" className="btn btn-secondary btn-sm btn-block">
            कारीगर पंजीकरण (Register)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
