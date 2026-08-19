import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const STATUS_COLORS = {
  'Pending': '#9ca3af',
  'Designing': '#3b82f6',
  'Preview Ready': '#8b5cf6',
  'Revision Requested': '#f59e0b',
  'Approved': '#22c55e',
  'Paid': '#14b8a6',
  'Completed': '#16a34a',
};

const VIEWABLE = ['Preview Ready', 'Approved', 'Paid', 'Completed'];

export default function MyRequests() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [viewingCard, setViewingCard] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data, error } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) setError('Could not load your requests.');
      else setRequests(data || []);
      setBusy(false);
    }
    load();
  }, [user]);

  async function handleDelete(requestId) {
    const confirmed = window.confirm('Delete this request? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await supabase
      .from('invitation_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      alert('Could not delete this request. Please try again.');
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  if (loading || busy) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        Loading…
      </div>
    );
  }
  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'calc(var(--nav-h) + 40px) 24px 60px' }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>My Requests</h1>
      <p style={{ color: 'var(--muted, #888)', marginBottom: 28 }}>
        Track the status of every invitation you've requested.
      </p>

      {error && <div className="admin-card">{error}</div>}

      {!error && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #ccc', borderRadius: 12 }}>
          <p style={{ marginBottom: 16 }}>You haven't requested any invitations yet.</p>
          <button onClick={() => navigate('/create-invitation')} style={btnStyle}>
            + Create your first invitation
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {requests.map((r) => (
          <div key={r.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{r.event_name}</h3>
                <div style={{ color: 'var(--muted, #888)', fontSize: 14 }}>
                  {r.event_type} · {r.date} · {r.venue}
                </div>
              </div>
              <span style={{ ...badgeStyle, background: STATUS_COLORS[r.status] || '#9ca3af' }}>
                {r.status}
              </span>
            </div>

            {VIEWABLE.includes(r.status) && r.generated_image_url && (
              <button
                onClick={() => navigate(`/editor/${r.id}`)}
                style={{ ...btnStyle, marginTop: 12 }}
              >
                View & Edit Card
              </button>
            )}
            {VIEWABLE.includes(r.status) && !r.generated_image_url && (
              <p style={{ color: 'var(--muted, #888)', fontSize: 13, marginTop: 12 }}>
                Your card is being prepared.
              </p>
            )}

            <button
              onClick={() => handleDelete(r.id)}
              style={{
                ...btnStyle,
                marginTop: 12,
                marginLeft: 10,
                background: '#e05555',
              }}
            >
              Delete
            </button>

            <div style={{ fontSize: 12, color: 'var(--muted, #aaa)', marginTop: 10 }}>
              Requested on {new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {viewingCard && (
        <div
          onClick={() => setViewingCard(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <img
              src={viewingCard}
              alt="Your invitation card"
              style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12 }}
            />
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setViewingCard(null)} style={btnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'var(--card, #fff)',
  border: '1px solid var(--border, #eee)',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};
const badgeStyle = {
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  padding: '5px 12px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
};
const btnStyle = {
  background: 'var(--purple, #6d28d9)',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 14,
};