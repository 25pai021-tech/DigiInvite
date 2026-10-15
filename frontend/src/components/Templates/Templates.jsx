import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Templates.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Overall size of the preview text on the template cards. Lower = smaller text
// with more margin. Keep this in sync with TemplatesPage.jsx.
const CARD_TEXT_SCALE = 0.7;

/**
 * One template thumbnail with its editable-text preview overlaid. Each line is
 * sized like the editor (size × frameHeight/1000) and then shrunk if it would be
 * wider than the frame, so text fits inside the card without wrapping or
 * overflowing — matching the original's proportions.
 */
function TplTextOverlay({ layout }) {
  const frameRef = useRef(null);
  const spanRefs = useRef({});
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitLines = () => {
    const el = frameRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    if (!W || !H) return;
    const bases = {};
    let k = 1;
    const avail = W * 0.88;
    layout.forEach((item, idx) => {
      const span = spanRefs.current[idx];
      if (!span) return;
      const base = Math.max(4, (item.size || 20) * H / 1000 * CARD_TEXT_SCALE);
      bases[idx] = base;
      span.style.fontSize = base + 'px';
      if (span.scrollWidth > avail) k = Math.min(k, avail / span.scrollWidth);
    });
    if (k < 1) {
      layout.forEach((item, idx) => {
        const span = spanRefs.current[idx];
        if (span && bases[idx]) span.style.fontSize = (bases[idx] * k) + 'px';
      });
    }
  };

  useLayoutEffect(fitLines, [dims]);
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims]);

  return (
    <div className="tpl-text-overlay" aria-hidden="true" ref={frameRef}>
      {dims.h > 0 && layout
        .filter((item) => item.sample && String(item.sample).trim())
        .map((item, idx) => (
          <span
            key={item.id || idx}
            ref={(el) => { spanRefs.current[idx] = el; }}
            className="tpl-text-line"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontFamily: item.font ? `'${item.font}', serif` : "'Playfair Display', serif",
              color: item.color || '#2b2924',
              textAlign: item.align || 'center',
              fontWeight: item.font?.toLowerCase().includes('playfair') ? 700 : (item.size > 24 ? 600 : 500),
              whiteSpace: 'nowrap',   // force one line (fit-to-width handles size)
              maxWidth: 'none',
              overflow: 'visible',
            }}
          >
            {item.sample}
          </span>
        ))}
    </div>
  );
}

const CATEGORIES = [
  'All',
  'Wedding',
  'Birthday',
  'Engagement',
  'Corporate',
  'Traditional',
  'Festival',
  'Graduation',
  'Housewarming',
  'Anniversary',
];

function getThumb(tpl) {
  return tpl?.thumbnail_url || tpl?.config?.full_image_url || tpl?.image_url || '';
}

function formatTemplateName(name) {
  if (!name) return 'Invitation Card';
  return name
    .replace(/-blank\.png$/i, '')
    .replace(/\.png$/i, '')
    .replace(/^[a-z0-9]+_/i, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const trackRef = useRef(null);
  const navigate = useNavigate();

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Fetch complete template records from Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        setLoading(true);
        setError(null);

        // 1. Direct Supabase query to get complete template records
        const { data, error: sbError } = await supabase
          .from('templates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!sbError && Array.isArray(data) && data.length > 0) {
          if (!cancelled) {
            setTemplates(data);
            setLoading(false);
          }
          return;
        }

        // 2. Fallback to backend API endpoint
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

  // Track scroll state for prev/next button activation
  const updateScrollButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [filteredTemplates, updateScrollButtons]);

  // Carousel scroll controls
  const scrollCarousel = (direction) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector('.real-template-card');
    const cardWidth = card ? card.getBoundingClientRect().width + 24 : 304;
    trackRef.current.scrollBy({
      left: direction * cardWidth * 2,
      behavior: 'smooth',
    });
    setTimeout(updateScrollButtons, 350);
  };

  // Change category and reset scroll position
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll mouse handlers
  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Direct navigation to existing Editor with template ID
  const handleCardClick = (tpl) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    navigate(`/editor/${tpl.id}`);
  };

  return (
    <section className="templates-section" id="templates">
      <div className="section-inner">
        <div className="templates-header-row">
          <div>
            <span className="section-tag">Template Gallery</span>
            <h2 className="section-title">
              Explore Our Template Catalog
            </h2>
            <p className="section-sub">
              Pulled live from our catalog. Every design is fully customizable on our canvas editor.
            </p>
          </div>

          <div className="templates-nav-actions hide-mobile">
            <button
              className={`carousel-arrow-btn ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => scrollCarousel(-1)}
              aria-label="Scroll templates left"
              type="button"
              disabled={!canScrollLeft}
            >
              ‹
            </button>
            <button
              className={`carousel-arrow-btn ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => scrollCarousel(1)}
              aria-label="Scroll templates right"
              type="button"
              disabled={!canScrollRight}
            >
              ›
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="template-filter-tabs" role="tablist" aria-label="Template categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
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
          <div
            className="templates-carousel-track"
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {filteredTemplates.map((tpl) => {
              const thumbUrl = getThumb(tpl);
              const displayName = formatTemplateName(tpl.name);

              return (
                <div
                  key={tpl.id || tpl.name}
                  className="real-template-card"
                  onClick={() => handleCardClick(tpl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(tpl)}
                  aria-label={`Open template ${displayName}`}
                >
                  <div className="tpl-thumb-frame">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={displayName}
                        className="tpl-image"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div className="tpl-fallback-thumb">
                        <span className="fallback-ornament">✦</span>
                        <strong>{tpl.event_type || 'Invitation'}</strong>
                        <small>{tpl.event_type || 'Celebration'}</small>
                      </div>
                    )}

                    {/* Complete Template Typography & Text Layer Preview */}
                    {Array.isArray(tpl.text_layout) && tpl.text_layout.length > 0 && (
                      <TplTextOverlay layout={tpl.text_layout} />
                    )}

                    <div className="tpl-overlay-hover">
                      <span className="btn-use-tpl">Customize on Canvas →</span>
                    </div>

                    {tpl.is_premium && <span className="tpl-badge-lock">👑 Premium</span>}
                  </div>

                  <div className="tpl-card-meta">
                    <div className="tpl-card-tags">
                      <span className="tpl-tag-event">{tpl.event_type || 'Event'}</span>
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
            <span>Browse the Full Template Catalog</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}