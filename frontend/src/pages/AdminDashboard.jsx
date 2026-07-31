import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './AdminDashboard.css';

// ---------- Mock data (replace with real API calls later) ----------

const STATS = [
  { label: 'Total Users', value: '1,284', delta: '+42 this week' },
  { label: 'Invitations Created', value: '6,530', delta: '+310 this week' },
  { label: 'RSVP Responses', value: '9,102', delta: '+588 this week' },
  { label: 'Total Revenue', value: '₹2,84,600', delta: '+₹18,200 this week' },
];

const RECENT_USERS = [
  { name: 'Aanya Shah', email: 'aanya.shah@gmail.com', plan: 'Free', joined: '24 Jul 2026', status: 'Active' },
  { name: 'Vir Mehta', email: 'vir.mehta@gmail.com', plan: 'Pro', joined: '23 Jul 2026', status: 'Active' },
  { name: 'Meera Rao', email: 'meera.rao@gmail.com', plan: 'Free', joined: '22 Jul 2026', status: 'Suspended' },
  { name: 'Raj Patel', email: 'raj.patel@gmail.com', plan: 'Pro', joined: '20 Jul 2026', status: 'Active' },
];

const TEMPLATES = [
  { name: 'Together Forever', category: 'Wedding', uses: 412 },
  { name: "We're Engaged", category: 'Engagement', uses: 268 },
  { name: 'Golden Anniversary', category: 'Anniversary', uses: 154 },
  { name: 'Birthday Bash', category: 'Birthday', uses: 301 },
];

const INVITATIONS = [
  { title: 'Arjun & Meera', owner: 'Arjun Shah', type: 'Wedding', created: '25 Jul 2026', status: 'Published' },
  { title: 'Raj & Sunita', owner: 'Raj Patel', type: 'Anniversary', created: '24 Jul 2026', status: 'Draft' },
  { title: "Priya's 30th", owner: 'Priya Nair', type: 'Birthday', created: '21 Jul 2026', status: 'Flagged' },
];

const TICKETS = [
  { user: 'Meera Rao', subject: "Can't download invitation as PDF", priority: 'High', status: 'Open' },
  { user: 'Karan Joshi', subject: 'Payment charged twice', priority: 'High', status: 'Open' },
  { user: 'Dev Thakkar', subject: 'How to change RSVP deadline?', priority: 'Low', status: 'Resolved' },
];

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview' },
  { key: 'requests', label: 'Requests' },
  { key: 'users', label: 'Users' },
  { key: 'templates', label: 'Templates' },
  { key: 'invitations', label: 'Invitations' },
  { key: 'payments', label: 'Payments' },
  { key: 'support', label: 'Support' },
];

function StatusPill({ status }) {
  const cls = status.replace(/\s+/g, '-').toLowerCase();
  return <span className={`pill pill-${cls}`}>{status}</span>;
}

// ---------- Section views ----------

function Overview() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Overview</h2>
        <p>Platform-wide activity at a glance.</p>
      </div>

      <div className="stat-grid">
        {STATS.map((s) => (
          <div className="admin-card stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Most-used templates</h3>
        <ul className="template-list">
          {TEMPLATES.map((t) => (
            <li key={t.name}>
              <span>{t.name}</span>
              <span className="muted">{t.uses} uses</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Users() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Users</h2>
        <p>Manage everyone with a DigiInvite account.</p>
      </div>
      <div className="admin-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Plan</th><th>Joined</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {RECENT_USERS.map((u) => (
              <tr key={u.email}>
                <td>{u.name}</td>
                <td className="muted">{u.email}</td>
                <td>{u.plan}</td>
                <td className="muted">{u.joined}</td>
                <td><StatusPill status={u.status} /></td>
                <td className="row-actions">
                  <button className="link-btn">View</button>
                  <button className="link-btn danger">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Templates() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Templates</h2>
        <p>Manage invitation templates shown to users.</p>
        <button className="btn-admin-primary">+ Add Template</button>
      </div>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <div className="admin-card template-card" key={t.name}>
            <div className="template-swatch" />
            <div className="template-name">{t.name}</div>
            <div className="muted">{t.category} · {t.uses} uses</div>
            <div className="row-actions" style={{ marginTop: 8 }}>
              <button className="link-btn">Edit</button>
              <button className="link-btn">Feature</button>
              <button className="link-btn danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Invitations() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Invitations</h2>
        <p>All invitations created across the platform.</p>
      </div>
      <div className="admin-card table-wrap">
        <table>
          <thead>
            <tr><th>Title</th><th>Owner</th><th>Type</th><th>Created</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {INVITATIONS.map((inv) => (
              <tr key={inv.title}>
                <td>{inv.title}</td>
                <td className="muted">{inv.owner}</td>
                <td>{inv.type}</td>
                <td className="muted">{inv.created}</td>
                <td><StatusPill status={inv.status} /></td>
                <td className="row-actions">
                  <button className="link-btn">View</button>
                  <button className="link-btn danger">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Payments() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Payments</h2>
        <p>Revenue and subscription overview.</p>
      </div>
      <div className="stat-grid">
        <div className="admin-card stat-card">
          <div className="stat-value">₹1,42,300</div>
          <div className="stat-label">Monthly Recurring Revenue</div>
        </div>
        <div className="admin-card stat-card">
          <div className="stat-value">318</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>
        <div className="admin-card stat-card">
          <div className="stat-value" style={{ color: '#e0555a' }}>6</div>
          <div className="stat-label">Failed Payments</div>
        </div>
      </div>
    </div>
  );
}

function Support() {
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Support</h2>
        <p>Tickets and feedback from users.</p>
      </div>
      <div className="admin-card table-wrap">
        <table>
          <thead>
            <tr><th>User</th><th>Subject</th><th>Priority</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {TICKETS.map((t) => (
              <tr key={t.subject}>
                <td>{t.user}</td>
                <td className="muted">{t.subject}</td>
                <td><StatusPill status={t.priority} /></td>
                <td><StatusPill status={t.status} /></td>
                <td className="row-actions"><button className="link-btn">Reply</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Main layout ----------
const STATUS_OPTIONS = [
  'Pending', 'Designing', 'Preview Ready',
  'Revision Requested', 'Approved', 'Paid', 'Completed',
];

const API_URL = 'http://localhost:8000';


function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);   // the request being viewed in detail
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  

  useEffect(() => {
    fetch(`${API_URL}/admin/requests`)
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load requests. Is the backend running?');
        setLoading(false);
      });
  }, []);

  async function changeStatus(requestId, newStatus) {
    try {
      const res = await fetch(`${API_URL}/admin/updateStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
      // keep the open detail view in sync too
      setSelected((prev) => (prev && prev.id === requestId ? { ...prev, status: newStatus } : prev));
    } catch {
      alert('Could not update status. Please try again.');
    }
  }

  async function generateCard(requestId) {
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch(`${API_URL}/generateCard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Generation failed');

      // put the new image on both the list and the open detail view
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, generated_image_url: data.image_url } : r))
      );
      setSelected((prev) =>
        prev && prev.id === requestId ? { ...prev, generated_image_url: data.image_url } : prev
      );
    } catch (e) {
      setGenError(String(e.message || e));
    } finally {
      setGenerating(false);
    }
  }

  // ===== DETAIL VIEW (shown when a request is selected) =====
  if (selected) {
    const r = selected;

    // helper to show one labelled field (skips empty ones)
    const Field = ({ label, value }) =>
      value ? (
        <div className="detail-field">
          <span className="detail-label">{label}</span>
          <span className="detail-value">{value}</span>
        </div>
      ) : null;

    // reference images may be stored as an array
    const refImages = Array.isArray(r.reference_image_urls) ? r.reference_image_urls : [];

    return (
      <div>
        <div className="admin-section-heading">
          <button className="link-btn" onClick={() => setSelected(null)}>← Back to list</button>
          <h2 style={{ marginTop: 10 }}>{r.event_name || 'Request details'}</h2>
          <p>Review everything the user submitted before generating or approving.</p>
        </div>

        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Event</h3>
          <Field label="Event name" value={r.event_name} />
          <Field label="Event type" value={r.event_type} />
          <Field label="Date" value={r.date} />
          <Field label="Time" value={r.time} />
          <Field label="Venue" value={r.venue} />
          <Field label="Map link" value={r.map_link} />
        </div>

        <div className="admin-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>People</h3>
          <Field label="Host name" value={r.host_name} />
          <Field label="Bride name" value={r.bride_name} />
          <Field label="Groom name" value={r.groom_name} />
          <Field label="Phone" value={r.phone} />
          <Field label="Email" value={r.email} />
        </div>

        <div className="admin-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Design preferences</h3>
          <Field label="Theme" value={r.theme} />
          <Field label="Colour" value={r.color} />
          <Field label="Instructions" value={r.instructions} />
          <Field label="Special message" value={r.special_message} />
          <Field label="Additional notes" value={r.additional_notes} />
        </div>

        {(r.couple_photo_url || refImages.length > 0) && (
          <div className="admin-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Uploaded photos</h3>
            <div className="detail-photos">
              {r.couple_photo_url && (
                <a href={r.couple_photo_url} target="_blank" rel="noreferrer">
                  <img src={r.couple_photo_url} alt="Couple" />
                </a>
              )}
              {refImages.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`Reference ${i + 1}`} />
                </a>
              ))}
            </div>
          </div>
        )}


        <div className="admin-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>AI Card</h3>

          <button
            className="btn-admin-primary"
            onClick={() => generateCard(r.id)}
            disabled={generating}
          >
            {generating
              ? 'Generating… (this can take up to a minute)'
              : r.generated_image_url ? 'Regenerate Card' : 'Generate Card'}
          </button>

          {genError && (
            <p style={{ color: '#e0555a', marginTop: 10 }}>{genError}</p>
          )}

          {r.generated_image_url && !generating && (
            <div style={{ marginTop: 16 }}>
              <img
                src={r.generated_image_url}
                alt="Generated card"
                className="generated-preview"
              />
              <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Happy with it? Set the status below to <strong>Preview Ready</strong> so the user can view it.
              </p>
            </div>
          )}
        </div>

        <div className="admin-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Status</h3>
          <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW (default) =====
  return (
    <div>
      <div className="admin-section-heading">
        <h2>Invitation Requests</h2>
        <p>Every request submitted by users. Click "View" to see full details.</p>
      </div>

      {loading && <div className="admin-card">Loading requests…</div>}
      {error && <div className="admin-card">{error}</div>}

      {!loading && !error && (
        <div className="admin-card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th><th>Type</th><th>Host</th>
                <th>Event Date</th><th>Submitted</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.event_name}</td>
                  <td>{r.event_type}</td>
                  <td className="muted">{r.host_name}</td>
                  <td className="muted">{r.date}</td>
                  <td className="muted">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => setSelected(r)}>View</button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan="7" className="muted">No requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


export default function AdminDashboard() {
  const [active, setActive] = useState('overview');
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const views = {
    overview: <Overview />,
    requests: <Requests />,
    users: <Users />,
    templates: <Templates />,
    invitations: <Invitations />,
    payments: <Payments />,
    support: <Support />,
  };

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          ✦ DigiInvite <span>Admin</span>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-btn ${active === item.key ? 'active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          ↩ Log out
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Link to="/" className="admin-back-link">
            ← Dashboard
          </Link>
          <span className="muted">Welcome, Admin</span>
        </header>
        <main className="admin-content">{views[active]}</main>
      </div>
    </div>
  );
}
