import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShieldCheck, UserCheck, MessageSquare, ArrowRight } from 'lucide-react';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/reviews')
      .then(res => setReviews(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '880px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>समीक्षाएं एवं रेटिंग (Reviews and Ratings)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          शेखावाटी के स्थानीय कारीगरों के वास्तविक कार्य पर ग्राहकों द्वारा दी गई प्रामाणिक समीक्षाएं।
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          समीक्षाएं लोड हो रही हैं...
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <h3>अभी कोई सार्वजनिक समीक्षा दर्ज नहीं है।</h3>
          <p>कार्य संपन्न होने के पश्चात ग्राहक कारीगर की सार्वजनिक प्रोफाइल पर समीक्षा दे सकते हैं।</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(rev => (
            <div key={rev.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{rev.author?.name || 'सत्यापित ग्राहक'}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>द्वारा</span>
                    <Link to={`/worker/${rev.worker?.workerId}`} style={{ fontWeight: '700', textDecoration: 'underline' }}>
                      {rev.worker?.name} ({rev.worker?.workerId})
                    </Link>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    स्थान: {rev.worker?.villageOrTown || 'स्थानीय'}, {rev.worker?.district || 'झुंझुनू'} | श्रेणी: {rev.worker?.category?.nameHi || 'कुशल कार्य'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#111827" />
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: '700', marginLeft: '4px' }}>{rev.rating}.0 / 5</span>
                </div>
              </div>

              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                "{rev.comment}"
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span>समीक्षा तिथि: {new Date(rev.createdAt).toLocaleDateString('hi-IN')}</span>
                <Link to={`/worker/${rev.worker?.workerId}`} className="btn btn-secondary btn-sm" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  कारीगर प्रोफाइल देखें <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
