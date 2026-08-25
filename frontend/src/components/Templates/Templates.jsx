import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Templates.css';

const API_URL = 'http://localhost:8000';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Engagement', 'Corporate', 'Traditional'];

function getThumb(tpl) {
  return tpl?.thumbnail_url || tpl?.config?.full_image_url || tpl?.image_url || '';
}

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real templates from Supabase with fallback to backend API
  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        setLoading(true);
        // 1. First try direct Supabase table query
        const { data, error: sbError } = await supabase
          .from('templates')
          .select('*')
          .eq('is_active', true)
          .limit(24);

        if (!sbError && Array.isArray(data) && data.length > 0) {
          if (!cancelled) {
            setTemplates(data);
            setLoading(false);
          }
          return;
        }

        // 2. Fallback to API endpoint
        const res = await fetch(`${API_URL}/templates`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setTemplates(Array.isArray(json.templates) ? json.templates : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load templates');
          setLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter templates based on active category tab
  const filteredTemplates = templates.filter((tpl) => {
    if (activeCategory === 'All') return true;
    const cat = (tpl.event_type || '').toLowerCase();
    const theme = (tpl.theme || '').toLowerCase();
    const target = activeCategory.toLowerCase();
    return cat.includes(target) || theme.includes(target);
  });

  // Carousel scroll controls
  const scrollCarousel = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = 320 * 2;
    trackRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCardClick = (tpl) => {
    // Navigate to existing Templates Page with template state
    navigate('/templates', { state: { selectedTemplateId: tpl.id, category: tpl.event_type } });
  };

  return (
    <section className="templates-section" id="templates">
      <div className="section-inner">
        <div className="templates-header-row">
          <div>
            <span className="section-tag">Database Gallery</span>
            <h2 className="section-title">
              Explore 1,000+ Real Templates
            </h2>
            <p className="section-sub">
              Curated from our live template catalog. Every design is fully customizable on our canvas editor.
            </p>
          </div>

          <div className="templates-nav-actions hide-mobile">
            <button
              className="carousel-arrow-btn"
              onClick={() => scrollCarousel(-1)}
              aria-label="Scroll templates left"
              type="button"
            >
              ‹
            </button>
            <button
              className="carousel-arrow-btn"
              onClick={() => scrollCarousel(1)}
              aria-label="Scroll templates right"
              type="button"
            >
              ›
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="template-filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="templates-state-box">
            <span className="spinner-sparkle">✦</span>
            <span>Loading live templates from database…</span>
          </div>
        )}

        {/* Error / Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="templates-state-box">
            <span>{error ? 'Connect database to view live templates.' : 'No templates found for this category.'}</span>
            <Link to="/templates" className="btn-primary" style={{ marginTop: '14px' }}>
              View Templates Catalog →
            </Link>
          </div>
        )}

        {/* Real Templates Swipeable Carousel Track */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="templates-carousel-track" ref={trackRef}>
            {filteredTemplates.map((tpl) => {
              const thumbUrl = getThumb(tpl);
              const isPremium = tpl.tier === 'premium' || tpl.is_premium;

              return (
                <div
                  key={tpl.id || tpl.name}
                  className="real-template-card"
                  onClick={() => handleCardClick(tpl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(tpl)}
                >
                  <div className="tpl-thumb-frame">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={tpl.name || 'Invitation Template'}
                        className="tpl-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="tpl-fallback-thumb">
                        <span className="fallback-ornament">✦</span>
                        <strong>{tpl.name || 'DigiInvite Design'}</strong>
                        <small>{tpl.event_type || 'Celebration'}</small>
                      </div>
                    )}

                    <div className="tpl-overlay-hover">
                      <span className="btn-use-tpl">Customize on Canvas →</span>
                    </div>

                    {isPremium ? (
                      <span className="tpl-badge-lock">👑 Premium</span>
                    ) : (
                      <span className="tpl-badge-free">Free Tier</span>
                    )}
                  </div>

                  <div className="tpl-card-meta">
                    <h4 className="tpl-card-name">{tpl.name}</h4>
                    <div className="tpl-card-tags">
                      <span className="tpl-tag-event">{tpl.event_type}</span>
                      {tpl.theme && <span className="tpl-tag-theme">{tpl.theme}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All CTAs */}
        <div className="templates-footer-row">
          <Link to="/templates" className="btn-view-all-templates">
            <span>Explore All 1,000+ Designs on Template Catalog</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
