import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      if (res.success) {
        if (res.user?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          // Regular worker tried to log into admin portal
          await logout();
          setError('Access Denied: This portal is restricted to authorized platform administrators only.');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Authentication server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--text-primary)',
            color: '#FFFFFF',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            HUNAR BHARAT KA
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
            Administrative Control Portal
          </p>
        </div>

        <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-medium)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Administrator Sign In</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Enter your secure administrator credentials to access system management.
          </p>

          {error && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px', fontSize: '13px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Admin Mobile Number *</label>
              <input
                type="tel"
                required
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit registered number"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Admin Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <Lock size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={14} />
            <span>Return to Public Worker Portal (मुख्य पृष्ठ)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
