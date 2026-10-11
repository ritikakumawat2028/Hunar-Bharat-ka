import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ShieldCheck, Check, X } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/reviews');
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleModeration = async (id, currentVal) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/reviews/${id}`, { isModerated: !currentVal });
      fetchReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Review Moderation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Inspect submitted ratings, prevent abuse and fraud, and moderate public visibility.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Worker Name & ID</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Reviewer</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Rating</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Comment</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No reviews submitted yet.</td></tr>
            ) : (
              reviews.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600' }}>{r.worker?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.worker?.workerId}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{r.author?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.author?.phone}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#111827" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.comment}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${r.isModerated ? 'badge-verified' : 'badge-outline'}`}>
                      {r.isModerated ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleModeration(r.id, r.isModerated)}
                      className="btn btn-secondary btn-sm"
                    >
                      {r.isModerated ? 'Hide' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviews;
