import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { publishInvitation, getWhatsAppShareUrl } from '../lib/publishInvitation';
import { fetchPremiumStatus } from '../lib/premium';
import '../Styles/createInvitation.css';
import './Dashboard.css';


export default function Dashboard() {
  
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [invitationCount, setInvitationCount] = useState(0);
  const [recentInvites, setRecentInvites] = useState([]);
  const [publishingId, setPublishingId] = useState(null);
  const [publishModal, setPublishModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [premium, setPremium] = useState(null);
  const isPremium = Boolean(premium?.is_premium);

  const STATS = [
    { key: 'invitations', label: 'My Invitations', value: invitationCount, icon: <InvitationIcon />, accent: '#7dd3fc' },
    { key: 'plan', label: 'Your Plan', value: isPremium ? 'Premium' : 'Free', icon: <RsvpIcon />, accent: '#f5b301' },
    { key: 'drafts', label: 'Saved Drafts', value: 0, icon: <DraftIcon />, accent: '#fb923c' },
    { key: 'downloads', label: 'Downloads', value: 0, icon: <DownloadIcon />, accent: '#f472b6' },
  ];


  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const { count, error } = await supabase
        .from('invitation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error) setInvitationCount(count || 0);

      const { data: list } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentInvites(list || []);
    }

    loadData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchPremiumStatus().then(setPremium);
  }, [user]);


  async function handlePublish(invite) {
    setPublishingId(invite.id);
    try {
      const res = await publishInvitation(invite.id);
      const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
      const publicUrl = `${SITE_URL}${res.public_url}`;
      setPublishModal({
        id: invite.id,
        slug: res.public_slug,
        title: invite.event_name || 'My Invitation',
        url: publicUrl,
      });

      setRecentInvites((prev) =>
        prev.map((r) =>
          r.id === invite.id
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

  function handleCopy(url) {
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

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading…</div>;
  }
  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email;

  return (
    <div className="dash">
      <div className="dash-page">
        <div className="dash-hero">
          <div>
            <h1 className="dash-hero__title">My Dashboard</h1>
            <p className="dash-hero__subtitle">Manage your invitations, templates, and downloads.</p>
            <button className="dash-cta" onClick={() => navigate('/create-invitation')}>
              <span className="dash-cta__plus">+</span> Create New Invitation
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h2 className="dash-hero__welcome">Welcome, {userName}</h2>
            {isPremium ? (
              <span style={{ display: 'inline-block', marginTop: 10, background: 'linear-gradient(90deg,#b8860b,#f5c542)', color: '#2b2200', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 999 }}>
                ⭐ Premium Member
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ background: '#e5e7eb', color: '#555', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 999 }}>Free plan</span>
                <button onClick={() => navigate('/pricing')} style={{ background: 'transparent', border: 'none', color: '#7a1030', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Upgrade →</button>
              </span>
            )}
          </div>
        </div>

        <div className="dash-stats">
          {STATS.map((stat) => (
            <div className="dash-stat-card" key={stat.key}>
              <div className="dash-stat-card__icon" style={{ color: stat.accent }}>{stat.icon}</div>
              <div className="dash-stat-card__value">{stat.value}</div>
              <div className="dash-stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Invitations & Publishing */}
        {recentInvites.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, margin: 0 }}>
                My Saved Invitations
              </h2>
              <button
                onClick={() => navigate('/my-requests')}
                style={{ background: 'transparent', border: 'none', color: '#7a1030', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                View All Requests →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {recentInvites.map((inv) => {
                const published = isPublished(inv);
                const slug = getSlug(inv);

                return (
                  <div
                    key={inv.id}
                    style={{
                      background: 'var(--card-bg, #ffffff)',
                      border: '1px solid var(--card-border, #eee)',
                      borderRadius: 16,
                      padding: 20,
                      boxShadow: 'var(--card-shadow, 0 4px 15px rgba(0,0,0,0.04))',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>
                          {inv.event_name || 'Celebration'}
                        </h3>
                        {published ? (
                          <span style={{ background: '#7a1030', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>
                            LIVE
                          </span>
                        ) : (
                          <span style={{ background: '#e5e7eb', color: '#555', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>
                            {inv.status}
                          </span>
                        )}
                      </div>

                      <p style={{ color: 'var(--muted, #888)', fontSize: 13, margin: '0 0 12px' }}>
                        {inv.date} · {inv.venue || 'No venue set'}
                      </p>

                      {published && slug && (
                        <div style={{ marginBottom: 14, fontSize: 12 }}>
                          <a
                            href={`/invite/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#7a1030', fontWeight: 600, textDecoration: 'none' }}
                          >
                            🔗 /invite/{slug}
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => navigate(`/editor/${inv.id}`)}
                        style={{
                          flex: 1,
                          background: 'var(--purple, #6d28d9)',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Edit Invitation
                      </button>

                      <button
                        onClick={() => handlePublish(inv)}
                        disabled={publishingId === inv.id}
                        style={{
                          flex: 1,
                          background: '#7a1030',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {publishingId === inv.id ? 'Publishing…' : published ? 'Share Page' : 'Publish Invitation'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Publish Modal */}
        {publishModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20,
            }}
            onClick={() => setPublishModal(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: '32px 28px',
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                border: '1px solid #f3e8eb',
                color: '#2c2523',
              }}
              onClick={(e) => e.stopPropagation()}
            >
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
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                      background: '#f9fafb',
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={() => handleCopy(publishModal.url)}
                    style={{
                      background: copied ? '#16a34a' : '#7a1030',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                    }}
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
                  style={{
                    background: '#25d366',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  💬 Share on WhatsApp
                </a>

                <a
                  href={publishModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  🔗 Open Live Page
                </a>
              </div>

              <button
                onClick={() => setPublishModal(null)}
                style={{
                  background: '#e5e7eb',
                  color: '#333',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  width: '100%',
                  marginTop: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Stat icons (inline SVG, no external deps) ---- */

function InvitationIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 8H15.5M8.5 11.5H15.5M8.5 15H12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RsvpIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 19c0-3.1 2.6-5.5 5.7-5.5s5.7 2.4 5.7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 14.2c2.6.3 4.7 2.4 4.7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 3.5H15L19 7.5V20.5H5V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 3.5V7.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10.5V16.5M12 16.5L9.3 13.8M12 16.5L14.7 13.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}