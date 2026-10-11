import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4 style={{ marginBottom: '12px' }}>HUNAR BHARAT KA</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              शेखावाटी (झुंझुनू, सीकर, चूरू), राजस्थान के स्थानीय श्रमिकों व कारीगरों को पारदर्शी रोज़गार के अवसरों से जोड़ने वाला मंच।
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '12px' }}>त्वरित लिंक</h4>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><Link to="/jobs">उपलब्ध नौकरियां</Link></li>
              <li><Link to="/reviews">समीक्षाएं एवं रेटिंग (Reviews)</Link></li>
              <li><Link to="/register">कारीगर पंजीकरण</Link></li>
              <li><Link to="/login">लॉगिन करें</Link></li>
              <li><Link to="/help">सहायता एवं संपर्क</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '12px' }}>नीति एवं शर्तें</h4>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><Link to="/privacy">गोपनीयता नीति (Privacy Policy)</Link></li>
              <li><Link to="/terms">नियम और शर्तें (Terms & Conditions)</Link></li>
              <li><Link to="/help">सुरक्षा एवं शिकायत निवारण</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '12px' }}>संपर्क विवरण</h4>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={16} /> झुंझुनू, राजस्थान - 333001
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Phone size={16} /> +91 98765 43210
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> help@hunarbharatka.in
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} HUNAR BHARAT KA. सर्वाधिकार सुरक्षित।
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>स्थान: शेखावाटी, राजस्थान, भारत</span>
            <span>•</span>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '12px' }}>
              व्यवस्थापक पोर्टल (Admin Portal)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
