const svg = (s) => 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
const NS = 'xmlns="http://www.w3.org/2000/svg"';

export const STICKER_CATEGORIES = [
  {
    name: 'Celebration',
    stickers: [
      { id: 'balloon', label: 'Balloon', src: svg(`<svg ${NS} viewBox="0 0 100 140"><path d="M50 5C25 5 12 28 12 50c0 25 20 45 38 45s38-20 38-45C88 28 75 5 50 5z" fill="#e5484d"/><path d="M50 95l-6 10h12z" fill="#e5484d"/><path d="M50 105c-6 10 6 18 0 30" stroke="#555" stroke-width="2" fill="none"/><ellipse cx="35" cy="35" rx="8" ry="14" fill="#fff" opacity=".35"/></svg>`) },
      { id: 'star', label: 'Star', src: svg(`<svg ${NS} viewBox="0 0 100 100"><polygon points="50,5 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" fill="#f5b82e"/></svg>`) },
      { id: 'heart', label: 'Heart', src: svg(`<svg ${NS} viewBox="0 0 100 100"><path d="M50 88C10 58 8 28 30 20C42 16 50 26 50 32C50 26 58 16 70 20C92 28 90 58 50 88Z" fill="#e0457b"/></svg>`) },
      { id: 'gift', label: 'Gift', src: svg(`<svg ${NS} viewBox="0 0 100 100"><rect x="12" y="38" width="76" height="52" rx="4" fill="#7b1d3f"/><rect x="8" y="26" width="84" height="16" rx="4" fill="#a62b57"/><rect x="45" y="26" width="10" height="64" fill="#f5b82e"/><path d="M50 26C30 6 18 22 36 26ZM50 26C70 6 82 22 64 26Z" fill="#f5b82e"/></svg>`) },
      { id: 'hat', label: 'Party hat', src: svg(`<svg ${NS} viewBox="0 0 100 100"><polygon points="50,8 18,90 82,90" fill="#3aa6b9"/><circle cx="50" cy="8" r="7" fill="#f5b82e"/><circle cx="42" cy="55" r="5" fill="#fff"/><circle cx="60" cy="70" r="5" fill="#f5b82e"/><circle cx="52" cy="35" r="4" fill="#e5484d"/></svg>`) },
    ],
  },
  {
    name: 'Festival',
    stickers: [
      { id: 'diya', label: 'Diya', src: svg(`<svg ${NS} viewBox="0 0 100 100"><path d="M50 8C58 24 64 32 50 46C36 32 42 24 50 8Z" fill="#ff9f1c"/><path d="M50 22C54 30 56 34 50 40C44 34 46 30 50 22Z" fill="#ffe066"/><path d="M12 54H88C88 78 70 92 50 92C30 92 12 78 12 54Z" fill="#c8553d"/><rect x="12" y="50" width="76" height="8" rx="4" fill="#e07a5f"/></svg>`) },
    ],
  },
];