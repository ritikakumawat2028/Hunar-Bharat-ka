import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, LogIn, UserPlus, LogOut, Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <Briefcase size={22} />
          <span>HUNAR BHARAT KA</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={closeMenu}>
            होम
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
            नौकरियां
          </NavLink>

          {user && user.role === 'WORKER' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                डैशबोर्ड
              </NavLink>
              <NavLink to="/my-profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                मेरी प्रोफाइल
              </NavLink>
              <NavLink to="/my-applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                मेरे आवेदन
              </NavLink>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary btn-sm" onClick={closeMenu}>
              <Shield size={14} />
              <span>Admin Panel</span>
            </Link>
          )}

          {user ? (
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="लॉगआउट">
              <LogOut size={14} />
              <span>लॉगआउट</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu}>
                <LogIn size={14} />
                <span>लॉगिन</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                <UserPlus size={14} />
                <span>रजिस्टर करें</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
