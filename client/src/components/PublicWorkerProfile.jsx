import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Share2, MapPin, Phone, MessageSquare, Star, Award, AlertCircle } from 'lucide-react';
import WhatsAppSolidIcon from './WhatsAppIcon';

const PublicWorkerProfile = () => {
  const { identifier } = useParams();
  const { user } = useContext(AuthContext);

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const fetchWorker = async () => {
    try {
      const res = await axios.get(`/api/users/public/${identifier}`);
      setWorker(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'कारीगर प्रोफाइल नहीं मिली।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, [identifier]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HUNAR BHARAT KA - ${worker?.name}`,
          text: `शेखावाटी में प्रमाणित कारीगर प्रोफाइल देखें: ${worker?.name} (${worker?.workerId})`,
          url
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('समीक्षा दर्ज करने के लिए कृपया पहले लॉगिन करें।');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage('');

    try {
      await axios.post('/api/reviews', {
        workerId: worker.workerId,
        rating: parseInt(rating),
        comment
      });
      setReviewMessage('समीक्षा सफलतापूर्वक दर्ज की गई!');
      setShowReviewForm(false);
      setComment('');
      fetchWorker();
    } catch (err) {
      setReviewMessage(err.response?.data?.error || 'समीक्षा दर्ज करने में त्रुटि।');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>कारीगर प्रोफाइल लोड हो रही है...</div>;
  }

  if (error || !worker) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>{error || 'प्रोफाइल उपलब्ध नहीं है।'}</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>मुख्य पृष्ठ पर जाएं</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', border: '2px solid #111827' }}>
              {worker.name ? worker.name.charAt(0) : 'W'}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{worker.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> {worker.workerId}
                </span>
                <span className="badge">
                  {worker.category?.nameHi || 'कुशल कारीगर'}
                </span>
                {worker.isVerified ? (
                  <span className="badge badge-verified">प्रमाणित (Verified by Admin)</span>
                ) : (
                  <span className="badge badge-outline">पंजीकृत (Registered)</span>
                )}
                <span className="badge badge-outline">
                  {worker.availability === 'AVAILABLE' ? 'काम के लिए उपलब्ध' : 'वर्तमान में व्यस्त'}
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleShare} className="btn btn-secondary btn-sm">
            <Share2 size={14} /> {copySuccess ? 'लिंक कॉपी हो गया!' : 'प्रोफाइल शेयर करें'}
          </button>
        </div>

        {/* Action Buttons: WhatsApp and Direct Call */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {worker.publicWhatsapp ? (
            <a
              href={`https://wa.me/91${worker.publicWhatsapp}?text=${encodeURIComponent(`नमस्ते ${worker.name} जी, मैंने HUNAR BHARAT KA पोर्टल पर आपकी प्रोफाइल देखी। मुझे काम के संबंध में आपसे बात करनी है।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <WhatsAppSolidIcon size={18} color="#25D366" />
              <span>व्हाट्सएप पर संपर्क करें</span>
            </a>
          ) : (
            <button disabled className="btn btn-secondary" style={{ padding: '12px' }}>
              व्हाट्सएप नंबर निजी है
            </button>
          )}

          {worker.publicPhone ? (
            <a
              href={`tel:+91${worker.publicPhone}`}
              className="btn btn-secondary"
              style={{ padding: '12px' }}
            >
              <Phone size={16} /> सीधा कॉल करें (+91 {worker.publicPhone})
            </a>
          ) : (
            <button disabled className="btn btn-secondary" style={{ padding: '12px' }}>
              कॉलिंग नंबर निजी है
            </button>
          )}
        </div>

        {/* Location & Experience */}
        <div className="grid-2" style={{ marginBottom: '24px', backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>कार्य क्षेत्र (Location)</h4>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {worker.villageOrTown || 'स्थानीय'}, {worker.district}, {worker.state}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>अनुभव (Experience)</h4>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              <Award size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {worker.experience || 'अनुभवी कारीगर'}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>कौशल व विशेषज्ञता (Skills)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {worker.skills ? (
              worker.skills.split(',').map((s, idx) => (
                <span key={idx} className="badge badge-outline" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {s.trim()}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>विशेषज्ञता उपलब्ध नहीं</span>
            )}
          </div>
        </div>

        {/* Bio */}
        {worker.bio && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>कार्य परिचय</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              {worker.bio}
            </p>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px' }}>सत्यापित ग्राहक रेटिंग एवं समीक्षा</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                औसत रेटिंग: {worker.rating || '5.0'} / 5.0 ({worker.reviewsCount || 0} समीक्षाएं)
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-secondary btn-sm"
            >
              {showReviewForm ? 'रद्द करें' : 'समीक्षा लिखें'}
            </button>
          </div>

          {reviewMessage && (
            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
              {reviewMessage}
            </div>
          )}

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="card" style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#FAFAFA' }}>
              <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>कारीगर को कार्य समीक्षा दें</h4>
              <div className="form-group">
                <label className="form-label">रेटिंग चुनें (1 से 5 सितारे)</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="form-select">
                  <option value="5">⭐⭐⭐⭐⭐ 5 सितारे (उत्कृष्ट कार्य)</option>
                  <option value="4">⭐⭐⭐⭐ 4 सितारे (बहुत अच्छा)</option>
                  <option value="3">⭐⭐⭐ 3 सितारे (संतोषजनक)</option>
                  <option value="2">⭐⭐ 2 सितारे (सुधार की आवश्यकता)</option>
                  <option value="1">⭐ 1 सितारा (असंतोषजनक)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">समीक्षा टिप्पणी (Review Comment) *</label>
                <textarea
                  required
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="कारीगर के काम की गुणवत्ता, समयबद्धता और व्यवहार के बारे में लिखें..."
                  className="form-textarea"
                />
              </div>

              <button type="submit" disabled={reviewSubmitting} className="btn btn-primary btn-sm">
                {reviewSubmitting ? 'जमा हो रहा है...' : 'समीक्षा सबमिट करें'}
              </button>
            </form>
          )}

          {worker.reviews && worker.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {worker.reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{r.authorName}</strong>
                    <div style={{ display: 'flex' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#111827" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              अभी तक कोई सार्वजनिक समीक्षा नहीं है।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicWorkerProfile;
