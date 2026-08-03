// Starter icon set — simple, generic line/fill art built from basic SVG primitives
// so it renders reliably. Expand each category with more icons in a later pass.
// All icons use currentColor-style single-tone fills so addIconFromSvg() can recolor them.

const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;

export const ICON_CATEGORIES = [
  {
    name: 'Birthday',
    icons: [
      { id: 'birthday-balloon', label: 'Balloon', svg: wrap('<ellipse cx="50" cy="38" rx="28" ry="34" fill="#6C3BFF"/><path d="M50 72 L50 92" stroke="#6C3BFF" stroke-width="3" fill="none"/><path d="M46 92 L54 92 L50 100 Z" fill="#6C3BFF"/>') },
      { id: 'birthday-cake', label: 'Cake', svg: wrap('<rect x="20" y="55" width="60" height="30" rx="4" fill="#6C3BFF"/><rect x="20" y="45" width="60" height="12" fill="#6C3BFF" opacity="0.7"/><rect x="46" y="20" width="8" height="20" fill="#6C3BFF"/><ellipse cx="50" cy="18" rx="4" ry="6" fill="#6C3BFF"/>') },
      { id: 'birthday-gift', label: 'Gift', svg: wrap('<rect x="18" y="42" width="64" height="46" rx="3" fill="#6C3BFF"/><rect x="18" y="30" width="64" height="14" rx="3" fill="#6C3BFF" opacity="0.75"/><rect x="46" y="30" width="8" height="58" fill="#fff" opacity="0.5"/>') },
    ],
  },
  {
    name: 'Wedding',
    icons: [
      { id: 'wedding-rings', label: 'Rings', svg: wrap('<circle cx="38" cy="55" r="20" fill="none" stroke="#6C3BFF" stroke-width="6"/><circle cx="62" cy="55" r="20" fill="none" stroke="#6C3BFF" stroke-width="6"/>') },
      { id: 'wedding-bells', label: 'Bells', svg: wrap('<path d="M50 20 C35 20 30 35 30 50 L30 65 L70 65 L70 50 C70 35 65 20 50 20 Z" fill="#6C3BFF"/><circle cx="50" cy="75" r="6" fill="#6C3BFF"/>') },
    ],
  },
  {
    name: 'Baby',
    icons: [
      { id: 'baby-bottle', label: 'Bottle', svg: wrap('<rect x="38" y="35" width="24" height="45" rx="8" fill="#6C3BFF"/><rect x="42" y="20" width="16" height="18" rx="4" fill="#6C3BFF" opacity="0.75"/>') },
      { id: 'baby-star', label: 'Star', svg: wrap('<polygon points="50,15 61,40 88,40 66,57 74,84 50,68 26,84 34,57 12,40 39,40" fill="#6C3BFF"/>') },
    ],
  },
  {
    name: 'Flowers',
    icons: [
      { id: 'flower-daisy', label: 'Daisy', svg: wrap('<g fill="#6C3BFF"><circle cx="50" cy="30" r="12"/><circle cx="50" cy="70" r="12"/><circle cx="30" cy="50" r="12"/><circle cx="70" cy="50" r="12"/></g><circle cx="50" cy="50" r="10" fill="#D4AF37"/>') },
    ],
  },
  {
    name: 'Religious',
    icons: [
      { id: 'religious-diya', label: 'Diya (lamp)', svg: wrap('<path d="M15 65 Q50 90 85 65 Q75 55 50 55 Q25 55 15 65 Z" fill="#6C3BFF"/><path d="M50 40 C45 48 47 55 50 55 C53 55 55 48 50 40 Z" fill="#D4AF37"/>') },
      { id: 'religious-lotus', label: 'Lotus', svg: wrap('<g fill="#6C3BFF"><ellipse cx="50" cy="55" rx="10" ry="20"/><ellipse cx="35" cy="60" rx="10" ry="18" transform="rotate(-30 35 60)"/><ellipse cx="65" cy="60" rx="10" ry="18" transform="rotate(30 65 60)"/></g>') },
    ],
  },
  {
    name: 'Party',
    icons: [
      { id: 'party-popper', label: 'Popper', svg: wrap('<path d="M20 80 L45 45 L60 60 Z" fill="#6C3BFF"/><circle cx="70" cy="30" r="4" fill="#D4AF37"/><circle cx="80" cy="45" r="3" fill="#D4AF37"/><circle cx="60" cy="20" r="3" fill="#D4AF37"/>') },
    ],
  },
  {
    name: 'Festival',
    icons: [
      { id: 'festival-lantern', label: 'Lantern', svg: wrap('<ellipse cx="50" cy="50" rx="22" ry="28" fill="#6C3BFF"/><rect x="44" y="20" width="12" height="10" fill="#6C3BFF"/><rect x="44" y="78" width="12" height="10" fill="#6C3BFF"/>') },
    ],
  },
  {
    name: 'Food',
    icons: [
      { id: 'food-cupcake', label: 'Cupcake', svg: wrap('<path d="M30 55 L70 55 L64 85 L36 85 Z" fill="#6C3BFF"/><path d="M25 55 Q50 25 75 55 Z" fill="#6C3BFF" opacity="0.75"/>') },
    ],
  },
  {
    name: 'Balloons',
    icons: [
      { id: 'balloons-bunch', label: 'Bunch', svg: wrap('<ellipse cx="35" cy="35" rx="16" ry="20" fill="#6C3BFF"/><ellipse cx="65" cy="35" rx="16" ry="20" fill="#D4AF37"/><path d="M35 55 L48 90" stroke="#6C3BFF" stroke-width="2" fill="none"/><path d="M65 55 L52 90" stroke="#D4AF37" stroke-width="2" fill="none"/>') },
    ],
  },
  {
    name: 'Cake',
    icons: [
      { id: 'cake-slice', label: 'Slice', svg: wrap('<path d="M20 80 L50 25 L80 80 Z" fill="#6C3BFF"/><path d="M28 65 L72 65" stroke="#fff" stroke-width="3"/>') },
    ],
  },
  {
    name: 'Candles',
    icons: [
      { id: 'candle-single', label: 'Candle', svg: wrap('<rect x="42" y="40" width="16" height="45" fill="#6C3BFF"/><ellipse cx="50" cy="25" rx="6" ry="10" fill="#D4AF37"/>') },
    ],
  },
];
