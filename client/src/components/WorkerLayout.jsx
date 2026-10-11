import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WorkerLayout = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="header">
        <div className="brand-title">HUNAR BHARAT KA</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <NavLink to="/worker/notifications" style={{color: 'inherit'}}>
            <Bell size={20} className="text-secondary" />
          </NavLink>
          <NavLink to="/worker/profile" style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            backgroundColor: 'var(--border-color)', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', color: 'inherit'
          }}>
            <User size={16} />
          </NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '16px' }}>
        {children}
      </main>

      {/* Fixed Bottom Navigation (Mobile) */}
      <nav className="mobile-nav">
        <NavLink to="/worker" end className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>होम</span>
        </NavLink>
        <NavLink to="/worker/jobs" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Briefcase size={24} />
          <span>काम</span>
        </NavLink>
        <NavLink to="/worker/notifications" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={24} />
          <span>सूचना</span>
        </NavLink>
        <NavLink to="/worker/profile" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span>प्रोफाइल</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default WorkerLayout;
