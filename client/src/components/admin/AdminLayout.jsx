import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileCheck,
  Star,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'var(--font-en)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px', color: '#111827' }}>
            HBK ADMIN
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Hunar Bharat Ka Management
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/workers"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <Users size={16} /> Workers
          </NavLink>

          <NavLink
            to="/admin/jobs"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <Briefcase size={16} /> Jobs
          </NavLink>

          <NavLink
            to="/admin/applications"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <FileCheck size={16} /> Applications
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <Star size={16} /> Reviews
          </NavLink>

          <NavLink
            to="/admin/notifications"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <MessageSquare size={16} /> WhatsApp Notifications
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <BarChart2 size={16} /> Reports
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', border: 'none' }}
          >
            <Settings size={16} /> Settings
          </NavLink>
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            {user?.name || 'Administrator'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Super Admin Session
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/" target="_blank" className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '12px' }}>
              <ExternalLink size={12} /> Live Site
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }} title="Logout">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ height: '64px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Administration Portal (English Interface)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-verified">Authorized Admin</span>
          </div>
        </header>

        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
