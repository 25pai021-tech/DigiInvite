import { useEffect, useMemo, useRef, useState } from 'react';
import { startFromTemplate } from '../../lib/startFromTemplate';
import { useNavigate } from 'react-router-dom';
import './TemplatesPage.css';

const API_URL = 'http://localhost:8000';

/**
 * Maps raw `event_type` values coming from the backend/templates table into a
 * clean display category. Multiple raw values can fold into one category
 * (e.g. "Wedding" and "Wedding (Nikah)" both become "Wedding Invitations").
 * Add more entries here any time a new event_type shows up in templates.csv.
 */
const CATEGORY_MAP = [
  { test: /wedding/i, key: 'wedding', label: 'Wedding Invitations', emoji: '💍', order: 2 },
  { test: /birthday/i, key: 'birthday', label: 'Birthday Parties', emoji: '🎂', order: 1 },
  { test: /engagement/i, key: 'engagement', label: 'Engagement Parties', emoji: '💫', order: 3 },
  { test: /corporate|conference|gala|networking|business/i, key: 'corporate', label: 'Corporate Events', emoji: '💼', order: 4 },
  { test: /reception/i, key: 'reception', label: 'Reception', emoji: '🥂', order: 5 },
  { test: /festival/i, key: 'festival', label: 'Festivals', emoji: '🎉', order: 5.2 },
  { test: /graduation/i, key: 'graduation', label: 'Graduation', emoji: '🎓', order: 5.5 },
  { test: /mehndi/i, key: 'mehndi', label: 'Mehndi Ceremony', emoji: '🌿', order: 6 },
  { test: /griha|housewarming/i, key: 'housewarming', label: 'Housewarming', emoji: '🏠', order: 7 },
  { test: /baby[\s-]?shower/i, key: 'babyshower', label: 'Baby Shower', emoji: '🍼', order: 8 },
  { test: /anniversary/i, key: 'anniversary', label: 'Anniversary', emoji: '💐', order: 9 },
  { test: /^custom$/i, key: 'custom', label: 'Custom Designs', emoji: '✨', order: 10 },
];

function categorize(eventType = '') {
  const match = CATEGORY_MAP.find((c) => c.test.test(eventType));
  if (match) return match;
  const label = eventType
    ? eventType.replace(/\b\w/g, (c) => c.toUpperCase())
    : 'More Invitations';
  return { key: label.toLowerCase().replace(/\s+/g, '-'), label, emoji: '✨', order: 99 };
}

function getThumb(tpl) {
  return tpl.thumbnail_url || tpl.config?.full_image_url || tpl.image_url || '';
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [expanded, setExpanded] = useState(null); // category key currently in "See All" mode
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/templates`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const groups = new Map();
    for (const tpl of templates) {
      const cat = categorize(tpl.event_type);
      if (!groups.has(cat.key)) groups.set(cat.key, { ...cat, items: [] });
      groups.get(cat.key).items.push(tpl);
    }
    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }, [templates]);

  
  const [starting, setStarting] = useState(false);

  const handleCustomize = async (tpl) => {
    if (starting) return;
    setStarting(true);
    try {
      const request = await startFromTemplate(tpl);
      navigate(`/editor/${request.id}`);
    } catch (e) {
      alert(e.message || 'Could not start this template. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="templates-page">
      <div className="tp-hero">
        <h1 className="tp-title">Discover Beautiful Online Invitations</h1>
        <p className="tp-sub">
          Choose from hundreds of unique designs for your special occasion.
        </p>
      </div>

      {status === 'loading' && (
        <div className="tp-state">Loading templates…</div>
      )}

      {status === 'error' && (
        <div className="tp-state tp-state-error">
          Couldn't load templates. Make sure the backend is running at{' '}
          <code>{API_URL}</code> and try again.
        </div>
      )}

      {status === 'ready' && categories.length === 0 && (
        <div className="tp-state">No templates found yet.</div>
      )}

      {status === 'ready' && categories.length > 0 && (
        <div className="tp-sections">
          {(expanded ? categories.filter((c) => c.key === expanded) : categories).map((cat) => (
            <CategorySection
              key={cat.key}
              category={cat}
              expanded={expanded === cat.key}
              onToggleExpand={() => setExpanded(expanded === cat.key ? null : cat.key)}
              onCustomize={handleCustomize}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, expanded, onToggleExpand, onCustomize }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => updateArrows();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [category.items.length, expanded]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.tpl-card');
    const cardWidth = card ? card.getBoundingClientRect().width + 18 : 260;
    el.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  return (
    <section className="tp-category">
      <div className="tp-category-header">
        <h2 className="tp-category-title">
          {category.label} <span className="tp-emoji">{category.emoji}</span>
        </h2>
        <button className="tp-see-all" onClick={onToggleExpand}>
          {expanded ? '← Back to all' : 'See All'}
        </button>
      </div>

      <div className="tp-row-wrap">
        {!expanded && canScrollLeft && (
          <button
            className="tp-arrow tp-arrow-left"
            aria-label="Scroll left"
            onClick={() => scrollByCards(-1)}
          >
            ‹
          </button>
        )}

        <div
          className={expanded ? 'tp-grid' : 'tp-track'}
          ref={trackRef}
          onScroll={expanded ? undefined : updateArrows}
        >
          {category.items.map((tpl) => (
            <TemplateCard key={tpl.id ?? getThumb(tpl)} template={tpl} onCustomize={onCustomize} />
          ))}
        </div>

        {!expanded && canScrollRight && (
          <button
            className="tp-arrow tp-arrow-right"
            aria-label="Scroll right"
            onClick={() => scrollByCards(1)}
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}

function TemplateCard({ template, onCustomize }) {
  const thumb = getThumb(template);
  const layout = template.text_layout;

  return (
    <div className="tpl-card">
      <div className="tpl-image-wrap">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <div className="tpl-image-fallback" />
        )}

        {Array.isArray(layout) && layout
          .filter((item) => item.sample && item.sample.length <= 40)
          .map((item) => (
            <span
              key={item.id}
              className="tpl-overlay-text"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontFamily: item.font || 'Inter',
                fontSize: `${Math.max(8, (item.size || 20) * 0.35)}px`,
                color: item.color || '#1a1a1a',
                textAlign: item.align || 'center',
              }}
            >
              {item.sample}
            </span>
          ))}
      </div>
      <button className="tpl-customize-btn" onClick={() => onCustomize(template)}>
        Customize
      </button>
    </div>
  );
}
