import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Share2, MapPin, Phone, MessageSquare, Star, Award, User, CheckCircle } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    axios.get('/api/users/me')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/worker/${profile?.workerId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HUNAR BHARAT KA - ${profile?.name}`,
          text: `${profile?.name} (${profile?.workerId}) - कुशल कारीगर प्रोफाइल`,
          url
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>प्रोफाइल लोड हो रही है...</div>;
  }

  const reviews = profile?.reviewsReceived || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', border: '2px solid #111827' }}>
              {profile?.name?.charAt(0) || 'क'}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{profile?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> {profile?.workerId || 'HBK-1001'}
                </span>
                <span className="badge">
                  {profile?.category?.nameHi || 'कुशल कारीगर'}
                </span>
                {profile?.isVerified ? (
                  <span className="badge badge-verified">सत्यापित (Verified)</span>
                ) : (
                  <span className="badge badge-outline">सत्यापन प्रतीक्षारत</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleShare} className="btn btn-secondary btn-sm">
              <Share2 size={14} /> {copySuccess ? 'कॉपी हो गया' : 'शेयर करें'}
            </button>
            <Link to="/edit-profile" className="btn btn-primary btn-sm">
              संपादित करें
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>स्थान (Location)</h4>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>
              <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {profile?.villageOrTown || 'झुंझुनू'}, {profile?.district || 'झुंझुनू'}, {profile?.state || 'राजस्थान'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>कार्य अनुभव (Experience)</h4>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>
              <Award size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {profile?.experience || 'अनुभवी'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>संपर्क मोबाइल नंबर</h4>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>
              <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              +91 {profile?.phone}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>व्हाट्सएप नंबर</h4>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>
              <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              +91 {profile?.whatsappNumber || profile?.phone}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>कौशल व विशेषताएं (Skills)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile?.skills ? (
              profile.skills.split(',').map((s, idx) => (
                <span key={idx} className="badge badge-outline" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {s.trim()}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>कौशल दर्ज नहीं किए गए</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>कार्य परिचय (About / Bio)</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '6px' }}>
            {profile?.bio || 'विवरण उपलब्ध नहीं है। प्रोफाइल संपादित करके अपने कार्य का विवरण जोड़ें।'}
          </p>
        </div>

        {/* Reviews */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px' }}>ग्राहक समीक्षाएं एवं रेटिंग ({reviews.length})</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Star size={16} fill="#111827" /> {avgRating} / 5.0
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              अभी कोई समीक्षा दर्ज नहीं है। काम पूरा होने के पश्चात ग्राहक यहाँ समीक्षा दे सकते हैं।
            </div>
          ) : (
            <div>
              {reviews.map(rev => (
                <div key={rev.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>{rev.author?.name || 'ग्राहक'}</strong>
                    <div style={{ display: 'flex' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#111827" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
