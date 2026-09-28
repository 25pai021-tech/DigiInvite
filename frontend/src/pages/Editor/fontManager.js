/**
 * Centralized Font Management System for DigiInvite Fabric.js Editor.
 * Provides curated invitation fonts, dynamic web-font loading,
 * canvas re-rendering triggers, and Fabric.js text object updates.
 */

export const FONT_CATEGORIES = ['Script', 'Serif', 'Sans-Serif'];

export const AVAILABLE_FONTS = [
  // Elegant Calligraphy & Scripts (Weddings, Celebrations, Signatures)
  { name: 'Great Vibes', category: 'Script' },
  { name: 'Dancing Script', category: 'Script' },
  { name: 'Alex Brush', category: 'Script' },
  { name: 'Parisienne', category: 'Script' },
  { name: 'Pinyon Script', category: 'Script' },
  { name: 'Allura', category: 'Script' },
  { name: 'Italianno', category: 'Script' },
  { name: 'MonteCarlo', category: 'Script' },
  { name: 'Sacramento', category: 'Script' },
  { name: 'Tangerine', category: 'Script' },
  { name: 'Pacifico', category: 'Script' },
  { name: 'Caveat', category: 'Script' },

  // Classic & Luxury Serifs (Headings, Dates, Venues, Formal Cards)
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Cinzel', category: 'Serif' },
  { name: 'Cormorant Garamond', category: 'Serif' },
  { name: 'Bodoni Moda', category: 'Serif' },
  { name: 'Prata', category: 'Serif' },
  { name: 'Marcellus', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Georgia', category: 'Serif', isSystem: true },
  { name: 'Times New Roman', category: 'Serif', isSystem: true },

  // Modern & Clean Sans-Serifs (Event Details, Addresses, Times, RSVP)
  { name: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Poppins', category: 'Sans-Serif' },
  { name: 'Inter', category: 'Sans-Serif' },
  { name: 'Lato', category: 'Sans-Serif' },
  { name: 'Raleway', category: 'Sans-Serif' },
  { name: 'Oswald', category: 'Sans-Serif' },
  { name: 'Arial', category: 'Sans-Serif', isSystem: true },
];

const SYSTEM_FONTS = new Set([
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Helvetica',
  'sans-serif',
  'serif',
  'monospace',
]);

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  'family=Alex+Brush&family=Allura&family=Bodoni+Moda:wght@400;700&' +
  'family=Caveat:wght@400;700&family=Cinzel:wght@400;600;700&' +
  'family=Cormorant+Garamond:wght@400;600;700&family=Dancing+Script:wght@400;600;700&' +
  'family=Great+Vibes&family=Inter:wght@400;600;700&family=Italianno&' +
  'family=Lato:wght@400;700&family=Marcellus&family=Merriweather:wght@400;700&' +
  'family=MonteCarlo&family=Montserrat:wght@400;600;700&family=Oswald:wght@400;600;700&' +
  'family=Pacifico&family=Parisienne&family=Pinyon+Script&' +
  'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;600;700&' +
  'family=Prata&family=Raleway:wght@400;600;700&family=Sacramento&family=Tangerine:wght@400;700&display=swap';

export function cleanFontName(fontFamily) {
  if (!fontFamily || typeof fontFamily !== 'string') return 'Inter';
  const first = fontFamily.split(',')[0].trim();
  return first.replace(/^['"]+|['"]+$/g, '').trim() || 'Inter';
}

const loadedFontCache = new Set();
let fontsInjected = false;

/**
 * Injects Google Fonts preconnect and primary stylesheet for all 20+ invitation fonts.
 */
export function initEditorFonts() {
  if (typeof document === 'undefined') return;
  if (fontsInjected || document.getElementById('digiinvite-editor-fonts')) {
    fontsInjected = true;
    return;
  }

  try {
    if (!document.getElementById('digiinvite-font-preconnect-1')) {
      const p1 = document.createElement('link');
      p1.id = 'digiinvite-font-preconnect-1';
      p1.rel = 'preconnect';
      p1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(p1);
    }
    if (!document.getElementById('digiinvite-font-preconnect-2')) {
      const p2 = document.createElement('link');
      p2.id = 'digiinvite-font-preconnect-2';
      p2.rel = 'preconnect';
      p2.href = 'https://fonts.gstatic.com';
      p2.crossOrigin = 'anonymous';
      document.head.appendChild(p2);
    }

    const link = document.createElement('link');
    link.id = 'digiinvite-editor-fonts';
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
    fontsInjected = true;
  } catch (err) {
    console.warn('Failed to inject editor fonts link:', err);
  }
}

/**
 * Dynamically injects any unlisted Google Font (e.g. from custom templates or regional languages).
 */
export function injectDynamicFont(fontName) {
  if (typeof document === 'undefined') return;
  const clean = cleanFontName(fontName);
  if (SYSTEM_FONTS.has(clean)) return;

  const id = `digiinvite-dynfont-${clean.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  try {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  } catch (err) {
    console.warn(`Failed to inject dynamic font for ${clean}:`, err);
  }
}

/**
 * Ensures the font is loaded in document.fonts before or as rendering happens.
 */
export async function loadFont(fontFamily) {
  const font = cleanFontName(fontFamily);
  if (!font) return 'Inter';
  if (SYSTEM_FONTS.has(font) || loadedFontCache.has(font)) {
    return font;
  }

  initEditorFonts();

  const isKnown = AVAILABLE_FONTS.some((f) => f.name.toLowerCase() === font.toLowerCase());
  if (!isKnown) {
    injectDynamicFont(font);
  }

  if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
    try {
      await document.fonts.load(`16px "${font}"`);
      await document.fonts.ready;
    } catch (e) {
      console.warn(`Font load warning for "${font}":`, e);
    }
  }

  loadedFontCache.add(font);
  return font;
}

/**
 * Loads all fonts referenced by an array of Fabric objects.
 */
export async function loadFontsForObjects(objects) {
  if (!Array.isArray(objects)) return;
  const fonts = new Set();
  objects.forEach((obj) => {
    if (obj && ['i-text', 'textbox', 'text'].includes(obj.type)) {
      if (obj.fontFamily) fonts.add(cleanFontName(obj.fontFamily));
      if (obj.originalFontFamily) fonts.add(cleanFontName(obj.originalFontFamily));
    }
  });
  await Promise.all(Array.from(fonts).map((f) => loadFont(f)));
}

/**
 * Applies a font to a Fabric text target (i-text, textbox, text, or activeSelection).
 * Handles inline character style overrides, dimensions recalculation, and coordinates.
 */
export function applyFontToTarget(canvas, target, fontName, extraProps = {}) {
  if (!canvas || !target) return;
  const font = cleanFontName(fontName);

  const applySingle = (obj) => {
    if (!['i-text', 'textbox', 'text'].includes(obj.type)) {
      if (Object.keys(extraProps).length > 0) {
        obj.set(extraProps);
        obj.setCoords();
      }
      return;
    }

    if (obj.isEditing && obj.selectionStart !== obj.selectionEnd) {
      obj.setSelectionStyles({ fontFamily: font });
      if (Object.keys(extraProps).length > 0) {
        obj.set(extraProps);
      }
    } else {
      obj.set({
        ...extraProps,
        fontFamily: font,
        originalFontFamily: font,
      });

      // Clear conflicting character-level fontFamily styles so full object changes reliably
      if (obj.styles) {
        Object.keys(obj.styles).forEach((lineKey) => {
          const line = obj.styles[lineKey];
          if (line) {
            Object.keys(line).forEach((charKey) => {
              if (line[charKey] && line[charKey].fontFamily) {
                delete line[charKey].fontFamily;
              }
            });
          }
        });
      }
    }

    if (typeof obj.initDimensions === 'function') {
      obj.initDimensions();
    }
    obj.dirty = true;
    obj.setCoords();
  };

  if (target.type === 'activeSelection') {
    target.getObjects().forEach(applySingle);
  } else {
    applySingle(target);
  }

  canvas.requestRenderAll();
  canvas.fire('object:modified', { target });
}
