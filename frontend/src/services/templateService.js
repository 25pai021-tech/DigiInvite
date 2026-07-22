// ─────────────────────────────────────────────────────────────
// templateService.js
// Placeholder template data — replace with Supabase fetch later
//
// TODO (Phase 1): Replace getTemplates() with:
//   const { data } = await supabase.from('templates').select('*');
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  'All', 'Wedding', 'Birthday', 'Engagement', 'Baby Shower',
  'Housewarming', 'Corporate Event', 'Festival', 'Anniversary',
  'Graduation', 'Custom',
];

export const TEMPLATES = [
  { id: 1,  title: 'Royal Garden',      category: 'Wedding',        premium: false, color: '#2a0a5a', accent: '#d4af37', emoji: '🌸' },
  { id: 2,  title: 'Golden Ceremony',   category: 'Wedding',        premium: true,  color: '#1a0535', accent: '#f0ce5e', emoji: '💍' },
  { id: 3,  title: 'Floral Bliss',      category: 'Birthday',       premium: false, color: '#0a1a10', accent: '#4caf50', emoji: '🎂' },
  { id: 4,  title: 'Neon Celebration',  category: 'Birthday',       premium: false, color: '#0d0d2b', accent: '#e040fb', emoji: '🎉' },
  { id: 5,  title: 'Rose Velvet',       category: 'Engagement',     premium: true,  color: '#2d0820', accent: '#f48fb1', emoji: '💐' },
  { id: 6,  title: 'Diamond Ring',      category: 'Engagement',     premium: false, color: '#0a1520', accent: '#80deea', emoji: '💎' },
  { id: 7,  title: 'Pastel Dream',      category: 'Baby Shower',    premium: false, color: '#1a1035', accent: '#ce93d8', emoji: '👶' },
  { id: 8,  title: 'Sapphire Gala',     category: 'Corporate Event',premium: false, color: '#05101a', accent: '#29b6f6', emoji: '🏢' },
  { id: 9,  title: 'Diwali Lights',     category: 'Festival',       premium: true,  color: '#1a0a00', accent: '#ff9800', emoji: '🪔' },
  { id: 10, title: 'Silver Jubilee',    category: 'Anniversary',    premium: false, color: '#0f0f1a', accent: '#b0bec5', emoji: '🥂' },
  { id: 11, title: 'Convocation',       category: 'Graduation',     premium: false, color: '#0a1505', accent: '#a5d6a7', emoji: '🎓' },
  { id: 12, title: 'Housewarming Joy',  category: 'Housewarming',   premium: false, color: '#1a0f05', accent: '#ffcc80', emoji: '🏠' },
];

export function getTemplates(category = 'All') {
  // TODO: Replace with Supabase query
  if (category === 'All') return TEMPLATES;
  return TEMPLATES.filter(t => t.category === category);
}