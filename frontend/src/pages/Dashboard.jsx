import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading…</div>;
  if (!user) return null;

  const name = user.user_metadata?.full_name || user.email;
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <h2>Welcome, {name} </h2>
        <p>Manage your invitations, RSVPs, and downloads.</p>
        <button className="btn-dash-primary">+ Create New Invitation</button>
      </div>

      <div className="dashboard-grid">
        {[
          { icon: '📨', label: 'My Invitations', count: '0' },
          { icon: '📋', label: 'Saved Drafts',   count: '0' },
          { icon: '👥', label: 'RSVP Responses', count: '0' },
          { icon: '📥', label: 'Downloads',       count: '0' },
        ].map(({ icon, label, count }) => (
          <div className="dash-card" key={label}>
            <div className="dash-card-icon">{icon}</div>
            <div className="dash-card-count">{count}</div>
            <div className="dash-card-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="dash-empty">
        <div className="dash-empty-icon">✦</div>
        <h3>No invitations yet</h3>
        <p>Create your first invitation to get started.</p>
        <button className="btn-dash-primary">Create Invitation</button>
      </div>
    </div>
  );
}
