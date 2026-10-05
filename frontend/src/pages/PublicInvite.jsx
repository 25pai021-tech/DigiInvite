import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getPublicInvite, uploadPublicEventPhoto, getWhatsAppShareUrl } from '../lib/publishInvitation';
import './PublicInvite.css';

export default function PublicInvite() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [photos, setPhotos] = useState([]);

  // Testing view override via ?view=before | ?view=today | ?view=after
  const viewOverride = searchParams.get('view');

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  // Photo upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [activePhoto, setActivePhoto] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);

  // Load invitation
  useEffect(() => {
    if (!slug) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getPublicInvite(slug);
        if (active) {
          setData(res.invitation);
          setPhotos(res.photos || []);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Invitation not found or unpublished.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  // Determine stage: 'before' | 'today' | 'after'
  const eventStage = useMemo(() => {
    if (viewOverride && ['before', 'today', 'after'].includes(viewOverride)) {
      return viewOverride;
    }
    if (!data?.date) return 'before';

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const eventDateStr = data.date.slice(0, 10);

    if (eventDateStr === todayStr) {
      return 'today';
    } else if (eventDateStr < todayStr) {
      return 'after';
    } else {
      return 'before';
    }
  }, [data?.date, viewOverride]);

  // Countdown calculation
  useEffect(() => {
    if (!data?.date) return;

    function calculate() {
      const now = new Date().getTime();
      let targetTime;

      if (data.time) {
        const [hours, mins] = data.time.split(':');
        const [y, m, d] = data.date.split('-').map(Number);
        targetTime = new Date(y, m - 1, d, parseInt(hours || 0, 10), parseInt(mins || 0, 10)).getTime();
      } else {
        const [y, m, d] = data.date.split('-').map(Number);
        targetTime = new Date(y, m - 1, d, 9, 0).getTime();
      }

      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, total: diff });
      }
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [data?.date, data?.time]);

  // Handle photo selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size should be under 15MB.');
      return;
    }

    setUploadFile(file);
    setUploadError('');
    setUploadPreview(URL.createObjectURL(file));
  };

  // Handle photo submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please choose a photo to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const newPhoto = await uploadPublicEventPhoto(
        slug,
        uploadFile,
        uploadCaption,
        uploadName.trim() || 'Guest'
      );

      setPhotos((prev) => [newPhoto, ...prev]);
      setUploadFile(null);
      setUploadPreview('');
      setUploadCaption('');
      setUploadSuccess('🎉 Photo uploaded successfully! Thank you for sharing your memory.');
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-invite-root" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✦</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#7a1030' }}>Loading Invitation…</h2>
          <p style={{ color: '#888' }}>Preparing your celebration details</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-invite-error-wrap">
        <div className="error-card">
          <div className="error-icon">💌</div>
          <h1 className="error-title">Invitation Unavailable</h1>
          <p className="error-desc">
            {error || 'This invitation link is invalid or has not been published yet.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-upload-submit"
            style={{ textDecoration: 'none' }}
          >
            Go to DigiInvite Home
          </button>
        </div>
      </div>
    );
  }

  // Format dates & URLs
  const cardImageUrl = data.preview_url || data.generated_image_url;
  const eventTitle = data.event_name || data.event_type || 'Special Celebration';
  const eventDateFormatted = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const formatTimeStr = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${hr}:${m || '00'} ${ampm}`;
  };

  const timeFormatted = formatTimeStr(data.time);

  const googleMapsUrl = data.map_link || (data.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue)}`
    : null);

  const whatsAppUrl = getWhatsAppShareUrl(eventTitle, window.location.href);

  // Simulated schedule timeline based on event time
  const scheduleItems = [
    { time: '1 Hour Prior', title: 'Guest Arrival & Welcome Refreshments', desc: 'Settle in, mingle, and find your seats' },
    { time: timeFormatted || 'Main Event', title: `${eventTitle} Begins`, desc: 'The ceremony and celebration commence' },
    { time: 'Following Ceremony', title: 'Banquet & Celebrations', desc: 'Delicious food, toasts, music & laughter' },
    { time: 'Conclusion', title: 'Farewell & Blessings', desc: 'Photo captures, warm wishes and memories' },
  ];

  return (
    <div className="public-invite-root">
      {/* Top Banner */}
      <header className="public-invite-banner">
        <div className="public-invite-badge">
          {eventStage === 'today' ? (
            <span className="public-invite-badge today-pulse">🎉 Happening Today</span>
          ) : eventStage === 'after' ? (
            <span>📸 Memories & Highlights</span>
          ) : (
            <span>✨ You're Cordially Invited</span>
          )}
        </div>

        <h1 className="public-invite-title">{eventTitle}</h1>

        <p className="public-invite-subtitle">
          {data.host_name ? `Hosted with joy by ${data.host_name}` : 'A special moment to cherish together'}
        </p>

        {/* Action Buttons */}
        <div className="public-invite-actions">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <WhatsAppIcon /> Share on WhatsApp
          </a>

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-directions"
            >
              <DirectionsIcon /> Get Directions
            </a>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="public-invite-container">
        {/* Preview View Switcher for Testing/Demoing */}
        <div className="state-switcher-pill">
          <div className="switcher-box">
            <button
              className={`switcher-btn ${eventStage === 'before' ? 'active' : ''}`}
              onClick={() => setSearchParams({ view: 'before' })}
            >
              Before Event
            </button>
            <button
              className={`switcher-btn ${eventStage === 'today' ? 'active' : ''}`}
              onClick={() => setSearchParams({ view: 'today' })}
            >
              Event Day
            </button>
            <button
              className={`switcher-btn ${eventStage === 'after' ? 'active' : ''}`}
              onClick={() => setSearchParams({ view: 'after' })}
            >
              After (Memories)
            </button>
          </div>
        </div>

        {/* 1. BEFORE EVENT VIEW */}
        {eventStage === 'before' && (
          <section>
            {/* Countdown Timer */}
            <div className="countdown-card">
              <div className="countdown-title">Countdown to Celebration</div>
              <div className="countdown-grid">
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.days}</div>
                  <div className="countdown-label">Days</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.hours}</div>
                  <div className="countdown-label">Hours</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.minutes}</div>
                  <div className="countdown-label">Mins</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.seconds}</div>
                  <div className="countdown-label">Secs</div>
                </div>
              </div>
            </div>

            {/* Showcase Grid: Card + Details */}
            <div className="card-showcase-grid">
              {cardImageUrl && (
                <div className="invitation-image-card">
                  <img
                    src={cardImageUrl}
                    alt={eventTitle}
                    className="invitation-img"
                    onClick={() => setShowCardModal(true)}
                    title="Click to view full size"
                  />
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 10 }}>
                    🔍 Click image to expand
                  </p>
                </div>
              )}

              <div className="event-details-card">
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#7a1030', margin: '0 0 20px' }}>
                  Event Details
                </h2>

                <div className="detail-row">
                  <div className="detail-icon-wrap"><CalendarIcon /></div>
                  <div>
                    <div className="detail-label">Date & Time</div>
                    <div className="detail-value">{eventDateFormatted}</div>
                    {timeFormatted && <div style={{ color: '#666', fontSize: '0.95rem' }}>at {timeFormatted}</div>}
                  </div>
                </div>

                {data.venue && (
                  <div className="detail-row">
                    <div className="detail-icon-wrap"><LocationIcon /></div>
                    <div>
                      <div className="detail-label">Venue Location</div>
                      <div className="detail-value">{data.venue}</div>
                      {googleMapsUrl && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#7a1030', fontSize: '0.88rem', fontWeight: 600, display: 'inline-block', marginTop: 4 }}
                        >
                          View on Google Maps →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {(data.bride_name || data.groom_name) && (
                  <div className="detail-row">
                    <div className="detail-icon-wrap"><HeartIcon /></div>
                    <div>
                      <div className="detail-label">Celebrating</div>
                      <div className="detail-value">
                        {[data.bride_name, data.groom_name].filter(Boolean).join(' & ')}
                      </div>
                    </div>
                  </div>
                )}

                {data.special_message && (
                  <div className="special-message-box">
                    "{data.special_message}"
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="timeline-section">
              <h3 className="timeline-title"><ClockIcon /> Event Schedule</h3>
              <div className="timeline-list">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-time">{item.time}</div>
                    <div className="timeline-event-name">{item.title}</div>
                    <div className="timeline-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. ON EVENT DAY VIEW */}
        {eventStage === 'today' && (
          <section>
            {/* Celebratory Banner */}
            <div className="today-celebration-card">
              <div style={{ fontSize: '3rem', marginBottom: 4 }}>🎉</div>
              <h2 className="today-celebration-title">Today is the Day!</h2>
              <p className="today-celebration-text">
                The celebration is here! We cannot wait to celebrate with you today.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-upload-submit"
                    style={{ textDecoration: 'none', background: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <DirectionsIcon /> Open Live Directions
                  </a>
                )}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <WhatsAppIcon /> Share with Friends
                </a>
              </div>
            </div>

            {/* Event Summary Grid */}
            <div className="card-showcase-grid">
              {cardImageUrl && (
                <div className="invitation-image-card">
                  <img
                    src={cardImageUrl}
                    alt={eventTitle}
                    className="invitation-img"
                    onClick={() => setShowCardModal(true)}
                  />
                </div>
              )}

              <div className="event-details-card">
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#7a1030', margin: '0 0 16px' }}>
                  Today's Essentials
                </h3>

                <div className="detail-row">
                  <div className="detail-icon-wrap"><ClockIcon /></div>
                  <div>
                    <div className="detail-label">Starting Time</div>
                    <div className="detail-value">{timeFormatted || 'Check Schedule Below'}</div>
                  </div>
                </div>

                {data.venue && (
                  <div className="detail-row">
                    <div className="detail-icon-wrap"><LocationIcon /></div>
                    <div>
                      <div className="detail-label">Venue</div>
                      <div className="detail-value">{data.venue}</div>
                    </div>
                  </div>
                )}

                {data.special_message && (
                  <div className="special-message-box">
                    "{data.special_message}"
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="timeline-section">
              <h3 className="timeline-title"><ClockIcon /> Today's Program</h3>
              <div className="timeline-list">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-time">{item.time}</div>
                    <div className="timeline-event-name">{item.title}</div>
                    <div className="timeline-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. AFTER EVENT (MEMORIES & GALLERY) VIEW */}
        {eventStage === 'after' && (
          <section>
            {/* Memories Header */}
            <div className="memories-header-card">
              <div style={{ fontSize: '2.8rem', marginBottom: 6 }}>📸</div>
              <h2 className="memories-title">Memories & Moments</h2>
              <p className="memories-subtitle">
                Thank you for being part of our story! Relive the joyful moments and contribute your favorite snapshots below.
              </p>

              {cardImageUrl && (
                <button
                  onClick={() => setShowCardModal(true)}
                  style={{
                    marginTop: 18,
                    background: 'transparent',
                    border: '1px solid #7a1030',
                    color: '#7a1030',
                    padding: '8px 18px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  💌 View Original Invitation Card
                </button>
              )}
            </div>

            {/* Photo Upload Form for Guests (Without Login) */}
            <div className="photo-upload-card">
              <UploadCloudIcon className="upload-icon" />
              <h3 className="upload-title">Add Your Event Photos</h3>
              <p className="upload-hint">
                Captured special photos? Upload them here directly — no account required!
              </p>

              <form onSubmit={handleUploadSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="guest-photo-input"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="guest-photo-input"
                    className="btn-directions"
                    style={{ cursor: 'pointer', display: 'inline-flex' }}
                  >
                    📁 Select Photo from Device
                  </label>
                </div>

                {uploadPreview && (
                  <div style={{ marginBottom: 16 }}>
                    <img
                      src={uploadPreview}
                      alt="Upload preview"
                      style={{ maxHeight: 180, borderRadius: 12, border: '2px solid #7a1030' }}
                    />
                  </div>
                )}

                <div className="upload-fields-grid">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Maya)"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="upload-input"
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. Beautiful couple!)"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="upload-input"
                  />
                </div>

                {uploadError && (
                  <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: 12 }}>
                    ⚠ {uploadError}
                  </p>
                )}

                {uploadSuccess && (
                  <p style={{ color: '#16a34a', fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
                    {uploadSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="btn-upload-submit"
                >
                  {isUploading ? 'Uploading Photo…' : 'Post to Photo Gallery'}
                </button>
              </form>
            </div>

            {/* Gallery Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#7a1030', margin: 0 }}>
                Event Photo Gallery ({photos.length})
              </h3>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <WhatsAppIcon /> Share Gallery
              </a>
            </div>

            {photos.length === 0 ? (
              <div className="gallery-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📷</div>
                <p style={{ fontWeight: 600, color: '#444', marginBottom: 4 }}>No photos uploaded yet</p>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                  Be the first guest to share a memory using the upload box above!
                </p>
              </div>
            ) : (
              <div className="gallery-grid">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id || index}
                    className="gallery-item"
                    onClick={() => setActivePhoto(photo)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Event memory'}
                      className="gallery-img"
                      loading="lazy"
                    />
                    <div className="gallery-info">
                      {photo.caption && <div className="gallery-caption">{photo.caption}</div>}
                      <div className="gallery-meta">
                        By {photo.uploaded_by || 'Guest'} · {new Date(photo.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Lightbox Modal for Gallery Photos */}
      {activePhoto && (
        <div className="lightbox-overlay" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActivePhoto(null)}>✕</button>
            <img src={activePhoto.photo_url} alt="Full view" className="lightbox-img" />
            {activePhoto.caption && <p className="lightbox-caption">{activePhoto.caption}</p>}
            <p style={{ color: '#ccc', fontSize: '0.85rem', marginTop: 4 }}>
              Shared by {activePhoto.uploaded_by || 'Guest'}
            </p>
          </div>
        </div>
      )}

      {/* Modal for Full Invitation Card */}
      {showCardModal && cardImageUrl && (
        <div className="lightbox-overlay" onClick={() => setShowCardModal(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowCardModal(false)}>✕</button>
            <img src={cardImageUrl} alt={eventTitle} className="lightbox-img" />
            <p className="lightbox-caption">{eventTitle} · Official Card</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Inline SVG Icons ---- */

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.53 1.83.813 2.796.813 3.183 0 5.769-2.587 5.769-5.766-.001-3.182-2.588-5.77-5.769-5.77zm0-1.872c4.227 0 7.641 3.414 7.641 7.642 0 4.228-3.414 7.642-7.641 7.642-1.258 0-2.433-.314-3.479-.871l-5.552 1.455 1.479-5.405c-.649-1.096-1.047-2.368-1.048-3.821 0-4.228 3.414-7.642 7.641-7.642z"/>
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function UploadCloudIcon(props) {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 16l-4-4-4 4M12 12v9"></path>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    </svg>
  );
}
