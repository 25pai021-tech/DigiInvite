// Common misspellings seen on invitation forms → correct word.
// Add more pairs here any time. Keys must be lowercase.
const FIXES = {
  // family
  famely: 'family', familly: 'family', famly: 'family', fameley: 'family', famliy: 'family',
  // birthday
  birthdwy: 'birthday', birthdya: 'birthday', birthady: 'birthday', brithday: 'birthday',
  birthdy: 'birthday', bithday: 'birthday', birtday: 'birthday', birthdey: 'birthday',
  // wedding / engagement / anniversary
  weding: 'wedding', wedng: 'wedding', wedeing: 'wedding',
  engagment: 'engagement', engagemnt: 'engagement', engagament: 'engagement',
  anniversery: 'anniversary', aniversary: 'anniversary', anniversry: 'anniversary',
  anivarsary: 'anniversary',
  // general invitation words
  invitaion: 'invitation', invtation: 'invitation', invitaton: 'invitation',
  celebraton: 'celebration', celebrtion: 'celebration', celabration: 'celebration',
  ceremoney: 'ceremony', ceromony: 'ceremony', cermony: 'ceremony',
  recepton: 'reception', receptoin: 'reception',
  partey: 'party', pary: 'party',
  graduaton: 'graduation', gradution: 'graduation',
  togather: 'together', togeather: 'together',
  freinds: 'friends', frinds: 'friends',
  welcom: 'welcome', wellcome: 'welcome',
  blessng: 'blessing', blessigs: 'blessings',
  // months and days
  decmber: 'December', desember: 'December', febuary: 'February', feburary: 'February',
  saterday: 'Saturday', satarday: 'Saturday', wensday: 'Wednesday', wednesady: 'Wednesday',
};

export function fixSpelling(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/[A-Za-z]+/g, (word) => {
    const fix = FIXES[word.toLowerCase()];
    if (!fix) return word;
    if (word.length > 1 && word === word.toUpperCase()) return fix.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return fix[0].toUpperCase() + fix.slice(1);
    return fix.toLowerCase() === fix ? fix : fix.toLowerCase();
  });
}