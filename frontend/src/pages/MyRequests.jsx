import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { publishInvitation, getWhatsAppShareUrl } from '../lib/publishInvitation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_COLORS = {
  'Pending': '#9ca3af',
  'Draft': '#7A1F3D',
  'Paid': '#14b8a6',
  'Completed': '#16a34a',
};

const VIEWABLE = ['Draft', 'Paid', 'Completed'];

export default function MyRequests() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [generatingId, setGeneratingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [publishModal, setPublishModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);

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

  async function handleGenerate(requestId) {
    setGeneratingId(requestId);
    try {
      const res = await fetch(`${API_URL}/generateCard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not generate your card.');

      // mark it Draft immediately — no admin step involved
      const { error } = await supabase
        .from('invitation_requests')
        .update({ status: 'Draft' })
        .eq('id', requestId);
      if (error) throw new Error('Card generated, but could not update its status.');

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, generated_image_url: data.image_url, status: 'Draft' } : r
        )
      );
    } catch (e) {
      alert(e.message || 'Something went wrong generating your card.');
    } finally {
      setGeneratingId(null);
    }
  }

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

  function startRename(r) {
    setEditingId(r.id);
    setEditName(r.event_name || '');
  }

  function cancelRename() {
    setEditingId(null);
    setEditName('');
  }

  async function saveRename(requestId) {
    const name = editName.trim();
    if (!name) {
      alert('Please enter a name.');
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from('invitation_requests')
      .update({ event_name: name })
      .eq('id', requestId);
    setSavingName(false);
    if (error) {
      alert('Could not rename this request. Please try again.');
      return;
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, event_name: name } : r))
    );
    setEditingId(null);
    setEditName('');
  }

  async function handlePublish(request) {
    setPublishingId(request.id);
    try {
      const res = await publishInvitation(request.id);
      const publicUrl = `${window.location.origin}${res.public_url}`;
      setPublishModal({
        id: request.id,
        slug: res.public_slug,
        title: request.event_name || 'My Invitation',
        url: publicUrl,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                published: true,
                public_slug: res.public_slug,
                published_at: res.published_at,
                editor_state: {
                  ...(typeof r.editor_state === 'object' ? r.editor_state : {}),
                  publish_info: {
                    public_slug: res.public_slug,
                    published: true,
                    published_at: res.published_at,
                  },
                },
              }
            : r
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to publish invitation.');
    } finally {
      setPublishingId(null);
    }
  }

  function handleCopyLink(url) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function isPublished(r) {
    return Boolean(r.published || r.editor_state?.publish_info?.published);
  }

  function getSlug(r) {
    return r.public_slug || r.editor_state?.publish_info?.public_slug;
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
        Track the status of every invitation you've requested and publish live mini-websites.
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
        {requests.map((r) => {
          const published = isPublished(r);
          const slug = getSlug(r);

          return (
            <div key={r.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === r.id ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <input
                        type="text"
                        value={editName}
                        autoFocus
                        maxLength={80}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(r.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        style={renameInputStyle}
                      />
                      <button
                        onClick={() => saveRename(r.id)}
                        disabled={savingName}
                        style={{ ...iconBtnStyle, color: '#16a34a' }}
                        title="Save"
                      >
                        {savingName ? '…' : '✓'}
                      </button>
                      <button
                        onClick={cancelRename}
                        style={{ ...iconBtnStyle, color: '#e05555' }}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h3 style={{ margin: '0 0 4px', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{r.event_name}</span>
                      <button
                        onClick={() => startRename(r)}
                        style={iconBtnStyle}
                        title="Rename"
                        aria-label="Rename request"
                      >
                        ✏️
                      </button>
                    </h3>
                  )}
                  <div style={{ color: 'var(--muted, #888)', fontSize: 14 }}>
                    {r.event_type} · {r.date} · {r.venue}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {published && (
                    <span style={{ ...badgeStyle, background: '#7a1030' }}>
                      🌐 Live
                    </span>
                  )}
                  <span style={{ ...badgeStyle, background: STATUS_COLORS[r.status] || '#9ca3af' }}>
                    {r.status}
                  </span>
                </div>
              </div>

              {published && slug && (
                <div style={{ margin: '10px 0 2px', fontSize: 13, background: '#fdf2f4', padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>🔗 Public Link:</span>
                  <a href={`/invite/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7a1030', fontWeight: 600 }}>
                    /invite/{slug}
                  </a>
                </div>
              )}

              {r.status === 'Pending' && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => handleGenerate(r.id)}
                    disabled={generatingId === r.id}
                    style={btnStyle}
                  >
                    {generatingId === r.id ? 'Generating…' : 'Generate My Card'}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ ...btnStyle, marginLeft: 10, background: '#e05555' }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {VIEWABLE.includes(r.status) && (r.generated_image_url || r.preview_url) && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    onClick={() => navigate(`/editor/${r.id}`)}
                    style={btnStyle}
                  >
                    Edit Invitation
                  </button>

                  <button
                    onClick={() => handlePublish(r)}
                    disabled={publishingId === r.id}
                    style={{
                      ...btnStyle,
                      background: '#7a1030',
                    }}
                  >
                    {publishingId === r.id ? 'Publishing…' : published ? 'Publish / Share Details' : 'Publish Invitation'}
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{
                      ...btnStyle,
                      background: '#e05555',
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {VIEWABLE.includes(r.status) && !r.generated_image_url && !r.preview_url && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: 'var(--muted, #888)', fontSize: 13, margin: '0 0 8px' }}>
                    Your card is being prepared.
                  </p>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ ...btnStyle, background: '#e05555' }}
                  >
                    Delete
                  </button>
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--muted, #aaa)', marginTop: 12 }}>
                Requested on {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Result Modal */}
      {publishModal && (
        <div style={modalOverlayStyle} onClick={() => setPublishModal(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, margin: '0 0 6px', color: '#7a1030' }}>
                Invitation is Live!
              </h2>
              <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                Your smart adaptive mini-website is created and ready to share.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
                Public Website Link
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input
                  type="text"
                  readOnly
                  value={publishModal.url}
                  style={inputStyle}
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => handleCopyLink(publishModal.url)}
                  style={{ ...btnStyle, background: copied ? '#16a34a' : '#7a1030', whiteSpace: 'nowrap' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <a
                href={getWhatsAppShareUrl(publishModal.title, publishModal.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnStyle, background: '#25d366', textDecoration: 'none', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                💬 Share on WhatsApp
              </a>

              <a
                href={publishModal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnStyle, background: '#2563eb', textDecoration: 'none', flex: 1, textAlign: 'center' }}
              >
                🔗 Open Live Page
              </a>
            </div>

            <button
              onClick={() => setPublishModal(null)}
              style={{ ...btnStyle, background: '#e5e7eb', color: '#333', width: '100%', marginTop: 12 }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: 'var(--card-shadow)',
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
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: 20,
};
const modalContentStyle = {
  background: '#ffffff',
  borderRadius: 20,
  padding: '32px 28px',
  maxWidth: 480,
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  border: '1px solid #f3e8eb',
};

const inputStyle = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 14,
  background: '#f9fafb',
};
const iconBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 15,
  lineHeight: 1,
  padding: 4,
  borderRadius: 6,
};
const renameInputStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 16,
  fontWeight: 600,
  minWidth: 200,
  maxWidth: '100%',
};