import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Shield, Globe, Lock, CheckCircle, Database } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading portal settings...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Portal Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Configure portal parameters, security controls, and operational defaults.
        </p>
      </div>

      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} /> Portal Identity & Localization
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '14px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Platform Name</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>{settings?.portalName}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Operational Target Region</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>{settings?.region}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Public Worker Language</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>Hindi (Devanagari)</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Admin Dashboard Language</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>English</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Design System Palette</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>Pure Black & White (No Gradients)</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Administrative Authentication Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '14px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Admin Name</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>{settings?.adminUser?.name || 'Administrator'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Admin Login Phone</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>+91 {settings?.adminUser?.phone}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Authorization Level</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>SUPER_ADMIN</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Session Security</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>JWT Bearer Authentication</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} /> Data Retention & Security Rules
        </h2>
        <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '18px' }}>
          <li>Worker passwords and OTPs are never transmitted or displayed in the admin interface.</li>
          <li>Applications capture permanent profile snapshots at the exact time of submission.</li>
          <li>WhatsApp job alerts respect worker explicit opt-in preferences.</li>
          <li>All status transitions are audited with admin operator IDs and timestamps.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
