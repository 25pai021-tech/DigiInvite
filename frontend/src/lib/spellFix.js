// 1) EXACT FIXES: known wrong spellings → correct word. Add pairs any time (keys lowercase).
const FIXES = {
  // family
  famely: 'family', familly: 'family', famly: 'family', fameley: 'family', famliy: 'family',
  // birthday
  birthdwy: 'birthday', birthdya: 'birthday', birthady: 'birthday', brithday: 'birthday',
  birthdy: 'birthday', bithday: 'birthday', birtday: 'birthday', birthdey: 'birthday',
  // wedding / engagement / anniversary
  weding: 'wedding', wedng: 'wedding', wedeing: 'wedding', weadding: 'wedding', weddng: 'wedding',
  engagment: 'engagement', engagemnt: 'engagement', engagament: 'engagement',
  anniversery: 'anniversary', aniversary: 'anniversary', anniversry: 'anniversary',
  anivarsary: 'anniversary',
  // general invitation words
  invitaion: 'invitation', invtation: 'invitation', invitaton: 'invitation',
  celebraton: 'celebration', celebrtion: 'celebration', celabration: 'celebration',
  ceremoney: 'ceremony', ceromony: 'ceremony', cermony: 'ceremony',
  recepton: 'reception', receptoin: 'reception',
  partey: 'party', pary: 'party', paty: 'party',
  graduaton: 'graduation', gradution: 'graduation',
  togather: 'together', togeather: 'together',
  freinds: 'friends', frinds: 'friends',
  welcom: 'welcome', wellcome: 'welcome',
  blessng: 'blessing', blessigs: 'blessings',
  // months and days
  decmber: 'December', desember: 'December', febuary: 'February', feburary: 'February',
  saterday: 'Saturday', satarday: 'Saturday', wensday: 'Wednesday', wednesady: 'Wednesday',
};

// 2) VOCABULARY: correct invitation words used for the "close match" check.
// Only words in this list can be the result of a close-match fix.
const VOCAB = [
  'birthday', 'wedding', 'engagement', 'anniversary', 'reception', 'ceremony',
  'celebration', 'invitation', 'family', 'party', 'graduation', 'housewarming',
  'together', 'friends', 'welcome', 'blessings', 'blessing', 'sangeet', 'mehndi',
  'haldi', 'shower', 'festival', 'dinner', 'lunch', 'function', 'gathering',
  'cordially', 'invite', 'pleasure', 'company', 'hosted', 'venue',
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
  'january', 'february', 'march', 'april', 'august', 'september', 'october',
  'november', 'december',
];
const VOCAB_SET = new Set(VOCAB);

// Words that must never be "corrected" (common surnames / names that could look like typos).
const PROTECTED = new Set([
  'patel', 'shah', 'sharma', 'mehta', 'desai', 'joshi', 'gupta', 'singh', 'kumar',
  'tanvi', 'aarav', 'meera', 'krish', 'arya', 'kinjal', 'bhavin',
]);

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

// Close-match: only for words of 6+ letters, same first letter, 1 edit (2 for 9+ letters).
function closeMatch(lower) {
  if (lower.length < 6 || VOCAB_SET.has(lower) || PROTECTED.has(lower)) return null;
  const maxDist = lower.length >= 9 ? 2 : 1;
  let best = null;
  let bestDist = 99;
  for (const w of VOCAB) {
    if (w[0] !== lower[0]) continue;
    const d = editDistance(lower, w);
    if (d <= maxDist && d < bestDist) { best = w; bestDist = d; }
  }
  return best;
}

// Keep the user's capital letters: "famely" → "family", "Famely" → "Family", "FAMELY" → "FAMILY".
function matchCase(original, fix) {
  if (original.length > 1 && original === original.toUpperCase()) return fix.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return fix[0].toUpperCase() + fix.slice(1);
  return fix.toLowerCase();
}

export function fixSpelling(text) {
  if (!text || typeof text !== 'string') return text;

  const fixed = text.replace(/[A-Za-z]+/g, (word) => {
    const lower = word.toLowerCase();
    if (PROTECTED.has(lower)) return word;
    const fix = FIXES[lower] || closeMatch(lower);
    return fix ? matchCase(word, fix) : word;
  });

  // Tidy spacing: collapse repeated spaces and trim the ends.
  return fixed.replace(/[ \t]{2,}/g, ' ').trim();
}