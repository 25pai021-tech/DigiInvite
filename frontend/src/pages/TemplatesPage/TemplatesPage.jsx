import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { startFromTemplate } from '../../lib/startFromTemplate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './TemplatesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Overall size of the preview text on the template cards. Lower = smaller text
// with more margin around it. This is the single knob to tune the look.
const CARD_TEXT_SCALE = 0.7;

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

// ───────── Fuzzy search (tolerant of spelling mistakes, no dependency) ─────────

// Levenshtein edit distance between two short strings.
function _lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}
// How many typos we forgive, based on the length of the typed word.
function _tol(len) {
  return len <= 3 ? 0 : len <= 5 ? 1 : len <= 8 ? 2 : 3;
}
// Split a string into unique lowercase words.
function _tokens(s) {
  return Array.from(new Set(String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
}
// Fields we search, with how much each one counts toward relevance.
// event_type matters most (that's what "birthday" really means), sample text least.
const FIELD_WEIGHTS = { event: 3.0, theme: 2.0, name: 2.0, sample: 1.0 };

// How well one typed word matches one template word: 0 = no match, 1 = perfect.
// NOTE: we never let a tiny template word (like "a"/"of") match a long query —
// that was the old bug that pulled in unrelated templates.
function wordMatchQuality(qw, w) {
  if (!qw || !w) return 0;
  if (qw === w) return 1;                                       // exact
  if (qw.length >= 3 && w.startsWith(qw)) return 0.9;           // "birth" → "birthday"
  if (w.length >= 4 && qw.startsWith(w)) return 0.75;           // "weddings" → "wedding"
  if (qw.length >= 4 && w.includes(qw)) return 0.7;             // contained, long enough
  if (w.length >= 4 && qw.includes(w)) return 0.65;
  if (qw.length >= 3 && w.length >= 3) {                        // close spelling (typos)
    const tol = _tol(qw.length);
    const d = _lev(qw, w);
    if (d <= tol) return 0.85 - 0.12 * d;                       // "brithday" → "birthday"
    if (w.length > qw.length && _lev(qw, w.slice(0, qw.length)) <= tol) return 0.6; // "annivers" → "anniversary"
  }
  return 0;
}

// Precompute the weighted word-groups we search for one template.
function templateFields(tpl) {
  const groups = [
    { weight: FIELD_WEIGHTS.event, words: _tokens(tpl.event_type) },
    { weight: FIELD_WEIGHTS.theme, words: _tokens(tpl.theme) },
    { weight: FIELD_WEIGHTS.name,  words: _tokens(tpl.name) },
  ];
  if (Array.isArray(tpl.text_layout)) {
    const sample = tpl.text_layout.map((it) => (it && it.sample) || '').join(' ');
    groups.push({ weight: FIELD_WEIGHTS.sample, words: _tokens(sample) });
  }
  return groups.filter((g) => g.words.length);
}

// Relevance score for a template. 0 means "not related" (so it is never shown).
// Every typed word must hit something, which is what keeps wedding cards out of a
// "birthday" search. Higher score = more relevant = shown first.
function scoreTemplate(qWords, groups) {
  let total = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const g of groups) {
      for (const w of g.words) {
        const q = wordMatchQuality(qw, w) * g.weight;
        if (q > best) best = q;
      }
    }
    if (best === 0) return 0;   // a typed word matched nothing → not related
    total += best;
  }
  return total;
}


export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [searchParams] = useSearchParams();
  const catParam = (searchParams.get('cat') || '').toLowerCase();
  const [expanded, setExpanded] = useState(catParam || null); // category key currently in "See All" mode
  const navigate = useNavigate();

  // When the footer link changes (e.g. Wedding -> Birthday) while already on this page
  useEffect(() => {
    setExpanded(catParam || null);
  }, [catParam]);

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

  // ----- Search -----
   // ----- Search -----
  const [query, setQuery] = useState('');
  // precompute each template's weighted search fields once
  const withFields = useMemo(
    () => templates.map((t) => ({ t, groups: templateFields(t) })),
    [templates]
  );
  // ranked results: most relevant first, unrelated templates dropped entirely
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qWords = q.split(/\s+/).filter(Boolean);
    return withFields
      .map((x) => ({ t: x.t, score: scoreTemplate(qWords, x.groups) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t);
  }, [query, withFields]);
  const searching = query.trim().length > 0;

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

        <div className="tp-search">
          <span className="tp-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="tp-search-input"
            placeholder="Search templates — wedding, birthday, diwali…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
          {query && (
            <button
              className="tp-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
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

      {/* ---- Search results view ---- */}
      {status === 'ready' && searching && (
        <div className="tp-sections">
          <section className="tp-category">
            <div className="tp-category-header">
              <h2 className="tp-category-title">
                {results.length > 0
                  ? `Results for “${query.trim()}”`
                  : `No matches for “${query.trim()}”`}{' '}
                {results.length > 0 && (
                  <span className="tp-emoji">({results.length})</span>
                )}
              </h2>
            </div>
            {results.length > 0 ? (
              <div className="tp-grid">
                {results.map((tpl) => (
                  <TemplateCard
                    key={tpl.id ?? getThumb(tpl)}
                    template={tpl}
                    onCustomize={handleCustomize}
                  />
                ))}
              </div>
            ) : (
              <div className="tp-state">
                Try a different word — search works even with small spelling mistakes.
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---- Normal category view (when not searching) ---- */}
      {status === 'ready' && !searching && categories.length === 0 && (
        <div className="tp-state">No templates found yet.</div>
      )}

      {status === 'ready' && !searching && categories.length > 0 && (
        <div className="tp-sections">
          {(expanded && categories.some((c) => c.key === expanded)
            ? categories.filter((c) => c.key === expanded)
            : categories
          ).map((cat) => (
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
  const layout = Array.isArray(template.text_layout) ? template.text_layout : [];

  const wrapRef = useRef(null);
  const spanRefs = useRef({});
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitLines = () => {
    const el = wrapRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    if (!W || !H) return;

    const bases = {};
    let k = 1;
    const avail = W * 0.88;
    layout.forEach((item) => {
      const span = spanRefs.current[item.id];
      if (!span) return;
      const base = Math.max(4, (item.size || 20) * H / 1000 * CARD_TEXT_SCALE);
      bases[item.id] = base;
      span.style.fontSize = base + 'px';
      const natural = span.scrollWidth;
      if (natural > avail) k = Math.min(k, avail / natural);
    });

    if (k < 1) {
      layout.forEach((item) => {
        const span = spanRefs.current[item.id];
        if (span && bases[item.id]) span.style.fontSize = (bases[item.id] * k) + 'px';
      });
    }
  };

  useLayoutEffect(fitLines, [dims, template.id]);
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, template.id]);

  return (
    <div className="tpl-card">
      <div className="tpl-image-wrap" ref={wrapRef}>
         {template.is_premium && (
          <span
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 3,
              background: '#7a1030', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '4px 8px', borderRadius: 999,
            }}
          >
            👑 Premium
          </span>
        )}
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onLoad={() => wrapRef.current && setDims({ w: wrapRef.current.clientWidth, h: wrapRef.current.clientHeight })}
          />
        ) : (
          <div className="tpl-image-fallback" />
        )}

        {dims.h > 0 && layout
          .filter((item) => item.sample && item.sample.trim())
          .map((item) => (
            <span
              key={item.id}
              ref={(el) => { spanRefs.current[item.id] = el; }}
              className="tpl-overlay-text"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontFamily: item.font || 'Inter',
                color: item.color || '#1a1a1a',
                textAlign: item.align || 'center',
                whiteSpace: 'nowrap',
                maxWidth: 'none',
                overflow: 'visible',
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