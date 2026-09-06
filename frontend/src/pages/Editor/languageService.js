/**
 * Language Configuration, Mock Translation Engine, and Formatting Utilities
 * for the DigiInvite Multilingual Editor.
 */

export const SUPPORTED_LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { id: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { id: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
];

export const LANGUAGE_CONFIG = {
  en: {
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    fontFamily: "'Playfair Display', 'Inter', 'Georgia', sans-serif",
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Devanagari MT', sans-serif",
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    fontFamily: "'Noto Sans Gujarati', 'Shruti', 'Gujarati MT', sans-serif",
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    fontFamily: "'Noto Sans Malayalam', 'Kartika', 'Malayalam MN', sans-serif",
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    fontFamily: "'Noto Sans Tamil', 'Latha', 'Tamil MN', sans-serif",
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    fontFamily: "'Noto Sans Telugu', 'Gautami', 'Telugu MN', sans-serif",
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Devanagari MT', sans-serif",
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    fontFamily: "'Noto Sans Bengali', 'Vrinda', 'Bangla MN', sans-serif",
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    fontFamily: "'Noto Sans Gurmukhi', 'Raavi', 'Gurmukhi MN', sans-serif",
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    fontFamily: "'Noto Sans Kannada', 'Tunga', 'Kannada MN', sans-serif",
  },
};

/**
 * Frontend Mock Translation Dictionary.
 * Contains invitation-appropriate translations for common invitation lines.
 */
export const MOCK_TRANSLATIONS = {
  "YOU'RE INVITED!": {
    hi: "आप आमंत्रित हैं!",
    gu: "તમે આમંત્રિત છો!",
    ml: "നിങ്ങൾക്ക് ക്ഷണമുണ്ട്!",
    ta: "நீங்கள் அழைக்கப்படுகிறீர்கள்!",
    te: "మీకు ఆహ్వానం!",
    mr: "तुम्ही आमंत्रित आहात!",
    bn: "আপনি আমন্ত্রিত!",
    pa: "ਤੁਸੀਂ ਸੱਦੇ ਗਏ ਹੋ!",
    kn: "ನೀವು ಆಹ್ವಾನಿತರಾಗಿದ್ದೀರಿ!",
  },
  "YOU ARE INVITED!": {
    hi: "आप आमंत्रित हैं!",
    gu: "તમે આમંત્રિત છો!",
    ml: "നിങ്ങൾക്ക് ക്ഷണമുണ്ട്!",
    ta: "நீங்கள் அழைக்கப்படுகிறீர்கள்!",
    te: "మీకు ఆహ్వానం!",
    mr: "तुम्ही आमंत्रित आहात!",
    bn: "আপনি আমন্ত্রিত!",
    pa: "ਤੁਸੀਂ ਸੱਦੇ ਗਏ ਹੋ!",
    kn: "ನೀವು ಆಹ್ವಾನಿತರಾಗಿದ್ದೀರಿ!",
  },
  "YOU ARE INVITED": {
    hi: "आप आमंत्रित हैं",
    gu: "તમે આમંત્રિત છો",
    ml: "നിങ്ങൾക്ക് ക്ഷണമുണ്ട്",
    ta: "நீங்கள் அழைக்கப்படுகிறீர்கள்",
    te: "మీకు ఆహ్వానం",
    mr: "तुम्ही आमंत्रित आहात",
    bn: "আপনি আমন্ত্রিত",
    pa: "ਤੁਸੀਂ ਸੱਦੇ ਗਏ ਹੋ",
    kn: "ನೀವು ಆಹ್ವಾನಿತರಾಗಿದ್ದೀರಿ",
  },
  "OLIVIA IS TURNING 7": {
    hi: "ओलिविया 7 साल की हो रही है",
    gu: "ઓલિવિયા 7 વર્ષની થઈ રહી છે",
    ml: "ഒലീവിയ 7 വയസ്സ് തികയുന്നു",
    ta: "ஒலிவியாவுக்கு 7 வயது நிறைவடைகிறது",
    te: "ఒలివియా 7వ పుట్టినరోజు",
    mr: "ऑलिव्हिया ७ वर्षांची होत आहे",
    bn: "অলিভিয়ার ৭ বছর পূর্ণ হচ্ছে",
    pa: "ਓਲੀਵੀਆ 7 ਸਾਲਾਂ ਦੀ ਹੋ ਰਹੀ ਹੈ",
    kn: "ಒಲಿವಿಯಾಗೆ 7 ವರ್ಷ ತುಂಬುತ್ತಿದೆ",
  },
  "JOIN US FOR A WONDERFUL CELEBRATION": {
    hi: "एक भव्य उत्सव में हमारे साथ शामिल हों",
    gu: "એક સુંદર ઉત્સવમાં અમારી સાથે જોડાઓ",
    ml: "മനോഹരമായ ഈ ആഘോഷത്തിൽ ഞങ്ങളോടൊപ്പം പങ്കുചേരൂ",
    ta: "அற்புதமான இந்த கொண்டாட்டத்தில் எங்களோடு இணையுங்கள்",
    te: "అద్భుతమైన వేడుకలో మాతో చేరండి",
    mr: "एका सुंदर उत्सवात आमच्यासोबत सामील व्हा",
    bn: "একটি চমৎকার উদযাপনে আমাদের সাথে যোগ দিন",
    pa: "ਇੱਕ ਸ਼ਾਨਦਾਰ ਜਸ਼ਨ ਲਈ ਸਾਡੇ ਨਾਲ ਜੁੜੋ",
    kn: "ಅದ್ಭುತ ಸಂಭ್ರಮಾಚರಣೆಯಲ್ಲಿ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿ",
  },
  "SAVE THE DATE": {
    hi: "तारीख याद रखें",
    gu: "તારીખ યાદ રાખો",
    ml: "തീയതി കുറിച്ചുവെക്കൂ",
    ta: "தேதியை நினைவில் கொள்க",
    te: "తేదీని గుర్తుంచుకోండి",
    mr: "तारीख लक्षात ठेवा",
    bn: "তারিখটি মনে রাখুন",
    pa: "ਤਾਰੀਖ ਯਾਦ ਰੱਖੋ",
    kn: "ದಿನಾಂಕವನ್ನು ನೆನಪಿಡಿ",
  },
  "WELCOME": {
    hi: "स्वागत है",
    gu: "સ્વાગત છે",
    ml: "സ്വാഗതം",
    ta: "வரவேற்கிறோம்",
    te: "స్వాగతం",
    mr: "स्वागत आहे",
    bn: "স্বাগতম",
    pa: "ਜੀ ਆਇਆਂ ਨੂੰ",
    kn: "ಸುಸ್ವಾಗತ",
  },
  "CELEBRATION": {
    hi: "उत्सव",
    gu: "ઉત્સવ",
    ml: "ആഘോഷം",
    ta: "கொண்டாட்டம்",
    te: "వేడుక",
    mr: "सोहळा",
    bn: "উদযাপন",
    pa: "ਜਸ਼ਨ",
    kn: "ಸಂಭ್ರಮಾಚರಣೆ",
  },
  "BIRTHDAY PARTY": {
    hi: "जन्मदिन समारोह",
    gu: "જન્મદિવસની ઉજવણી",
    ml: "ജന്മദിനാഘോഷം",
    ta: "பிறந்தநாள் விழா",
    te: "పుట్టినరోజు వేడుక",
    mr: "वाढदिवसाचा कार्यक्रम",
    bn: "জন্মদিনের পার্টি",
    pa: "ਜਨਮਦਿਨ ਦੀ ਪਾਰਟੀ",
    kn: "ಹುಟ್ಟುಹಬ್ಬದ ಪಾರ್ಟಿ",
  },
  "WEDDING CEREMONY": {
    hi: "विवाह संस्कार",
    gu: "શુભ લગ્ન સમારોહ",
    ml: "വിവാഹ ചടങ്ങ്",
    ta: "திருமண விழா",
    te: "వివాహ మహోత్సవం",
    mr: "शुभविवाह सोहळा",
    bn: "বিবাহ অনুষ্ঠান",
    pa: "ਵਿਆਹ ਸਮਾਗਮ",
    kn: "ವಿವಾಹ ಮಹೋತ್ಸವ",
  },
  "RECEPTION": {
    hi: "प्रीतिभोज एवं स्वागत समारोह",
    gu: "સ્નેહમિલન અને રિસેપ્શન",
    ml: "സൽക്കാരം",
    ta: "வரவேற்பு நிகழ்ச்சி",
    te: "రిసెప్షన్",
    mr: "स्नेहभोजन सोहळा",
    bn: "সংবর্ধনা অনুষ্ঠান",
    pa: "ਰਿਸੈਪਸ਼ਨ",
    kn: "ಸ್ವಾಗತ ಸಮಾರಂಭ",
  },
  "THANK YOU FOR JOINING US": {
    hi: "हमारे साथ शामिल होने के लिए धन्यवाद",
    gu: "અમારી સાથે જોડાવા બદલ આભાર",
    ml: "ഞങ്ങളോടൊപ്പം ചേർന്നതിന് നന്ദി",
    ta: "எங்களுடன் இணைந்ததற்கு நன்றி",
    te: "మాతో చేరినందుకు ధన్యవాదాలు",
    mr: "आमच्यासोबत सामील झाल्याबद्दल धन्यवाद",
    bn: "আমাদের সাথে যোগ দেওয়ার জন্য ধন্যবাদ",
    pa: "ਸਾਡੇ ਨਾਲ ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਧੰਨਵਾਦ",
    kn: "ನಮ್ಮೊಂದಿಗೆ ಸೇರಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು",
  },
  "PLEASE JOIN US": {
    hi: "कृपया हमारे साथ सम्मिलित हों",
    gu: "કૃપા કરીને અમારી સાથે પધારો",
    ml: "ദയവായി ഞങ്ങളോടൊപ്പം പങ്കെടുക്കൂ",
    ta: "தயவுசெய்து எங்களுடன் இணையுங்கள்",
    te: "దయచేసి మాతో చేరండి",
    mr: "कृपया आमच्यासोबत सामील व्हा",
    bn: "অনুগ্রহ করে আমাদের সাথে যোগ দিন",
    pa: "ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਨਾਲ ਸ਼ਾਮਲ ਹੋਵੋ",
    kn: "ದಯವಿಟ್ಟು ನಮ್ಮೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ",
  },
  "WE WOULD LOVE TO SEE YOU": {
    hi: "हम आपसे मिलने के लिए उत्सुक हैं",
    gu: "અમે તમને મળવા માટે ઉત્સુક છીએ",
    ml: "നിങ്ങളെ കാണാൻ ഞങ്ങൾ ആഗ്രഹിക്കുന്നു",
    ta: "உங்களை சந்திக்க நாங்கள் ஆவலாக உள்ளோம்",
    te: "మిమ్మల్ని చూడాలని మేము కోరుకుంటున్నాము",
    mr: "आम्हाला तुम्हाला भेटायला नक्कीच आवडेल",
    bn: "আপনাকে দেখতে পেলে আমরা অত্যন্ত আনন্দিত হব",
    pa: "ਅਸੀਂ ਤੁਹਾਨੂੰ ਵੇਖਣ ਲਈ ਉਤਸੁਕ ਹਾਂ",
    kn: "ನಿಮ್ಮನ್ನು ನೋಡಲು ನಾವು ಇಷ್ಟಪಡುತ್ತೇವೆ",
  },
  "WITH LOVE": {
    hi: "सस्नेह",
    gu: "સ્નેહપૂર્વક",
    ml: "സ്നേഹത്തോടെ",
    ta: "அன்புடன்",
    te: "ప్రేಮతో",
    mr: "सस्नेह",
    bn: "ভালোবাসার সাথে",
    pa: "ਪਿਆਰ ਨਾਲ",
    kn: "ಪ್ರೀತಿಯಿಂದ",
  },
  "BEST WISHES": {
    hi: "शुभकामनाएं",
    gu: "શુભેચ્છાઓ",
    ml: "આശംസകൾ",
    ta: "வாழ்த்துகள்",
    te: "శుభాకాంక్షలు",
    mr: "हार्दिक शुभेच्छा",
    bn: "শুভকামনা",
    pa: "ਸ਼ੁਭਕਾਮਨਾਵਾਂ",
    kn: "ಶುಭಾಶಯಗಳು",
  },
  "SEE YOU THERE": {
    hi: "वहां मिलते हैं",
    gu: "ત્યાં મળીએ",
    ml: "അവിടെ കാണാം",
    ta: "அங்கு சந்திப்போம்",
    te: "అక్కడ కలుద్దాం",
    mr: "तिथे भेटूया",
    bn: "সেখানে দেখা হবে",
    pa: "ਓਥੇ ਮਿਲਦੇ ਹਾਂ",
    kn: "ಅಲ್ಲಿ ಭೇಟಿಯಾಗೋಣ",
  },
  "CELEBRATION INVITATION": {
    hi: "उत्सव आमंत्रण",
    gu: "ઉત્સવ આમંત્રણ",
    ml: "ആഘോഷ ക്ഷണം",
    ta: "கொண்டாட்ட அழைப்பிதழ்",
    te: "వేడుక ఆహ్వానం",
    mr: "उत्सव निमंत्रण",
    bn: "উদযাপন আমন্ত্রণ",
    pa: "ਜਸ਼ਨ ਸੱਦਾ",
    kn: "ಸಂಭ್ರಮಾಚರಣೆ ಆಹ್ವಾನ",
  },
  "YOUR EVENT": {
    hi: "आपका विशेष समारोह",
    gu: "તમારો વિશેષ પ્રસંગ",
    ml: "നിങ്ങളുടെ വിശേഷ ചടങ്ങ്",
    ta: "உங்கள் சிறப்பு நிகழ்வு",
    te: "మీ ప్రత్యేక వేడుక",
    mr: "तुमचा विशेष कार्यक्रम",
    bn: "আপনার বিশেষ অনুষ্ঠান",
    pa: "ਤੁਹਾਡਾ ਵਿਸ਼ੇਸ਼ ਸਮਾਗਮ",
    kn: "ನಿಮ್ಮ ವಿಶೇಷ ಕಾರ್ಯಕ್ರಮ",
  },
  "DOUBLE-CLICK TO EDIT": {
    hi: "संपादित करने के लिए दो बार क्लिक करें",
    gu: "સંપાદિત કરવા માટે બે વાર ક્લિક કરો",
    ml: "എഡിറ്റ് ചെയ്യാൻ രണ്ടുതവണ ക്ലിക്ക് ചെയ്യുക",
    ta: "திருத்த இருமுறை கிளிக் செய்யவும்",
    te: "ಸವರಿಸಲು ಎರಡು ಬಾರಿ ಕ್ಲಿಕ್ ಮಾಡಿ",
    mr: "संपादित करण्यासाठी दोनदा क्लिक करा",
    bn: "সম্পাদনা করতে ডাবল ক্লিক করুন",
    pa: "ਸੰਪਾਦਨ ਕਰਨ ਲਈ ਦੋ ਵਾਰ ਕਲਿੱਕ ਕਰੋ",
    kn: "ಸಂಪಾದಿಸಲು ಎರಡು ಬಾರಿ ಕ್ಲಿಕ್ ಮಾಡಿ",
  },
  "WEDDING INVITATION": {
    hi: "शुभ विवाह आमंत्रण",
    gu: "શુભ લગ્ન કંકોત્રી",
    ml: "വിവാഹ ക്ഷണക്കത്ത്",
    ta: "திருமண அழைப்பிதழ்",
    te: "శుభలేఖ వివాహ ఆహ్వానం",
    mr: "लग्नपत्रिका व सस्नेह निमंत्रण",
    bn: "বিবাহের নিমন্ত্রণপত্র",
    pa: "ਵਿਆਹ ਦਾ ਸੱਦਾ ਪੱਤਰ",
    kn: "ವಿವಾಹ ಆಹ್ವಾನ ಪತ್ರಿಕೆ",
  },
};

/**
 * Normalizes phrase keys for dictionary lookup.
 */
function normalizeKey(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Dynamic field detection to protect dates, times, phone numbers,
 * URLs, email addresses, RSVP links, and standalone person names.
 */
export function isDynamicField(text, objectName = '', fieldType = '') {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  const lowerName = (objectName || '').toLowerCase();
  const lowerField = (fieldType || '').toLowerCase();

  // Explicit dynamic field types or layer names
  const protectedNames = ['date', 'time', 'venue', 'phone', 'url', 'email', 'rsvp', 'link', 'qrcode', 'name'];
  if (protectedNames.includes(lowerName) || protectedNames.includes(lowerField)) {
    return true;
  }

  // Pure digits or bullet separator lines (e.g. "18-12-2026 • 18:00")
  if (/^[\d\s•\-:./\w]+$/.test(trimmed) && /\d/.test(trimmed) && (trimmed.includes('•') || trimmed.includes(':') || trimmed.includes('-'))) {
    return true;
  }

  // Date formats: 01 September 2026, 18/12/2026, 2026-09-01, Saturday, Dec 18
  const dateRegex = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i;
  if (dateRegex.test(trimmed)) return true;

  // Time formats: 5:00 PM, 18:00, 6:30am
  const timeRegex = /\b(\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?)\b/;
  if (timeRegex.test(trimmed)) return true;

  // Phone numbers: +91 XXXXX XXXXX, (123) 456-7890
  const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/;
  if (phoneRegex.test(trimmed) && trimmed.replace(/\D/g, '').length >= 7) return true;

  // URLs & Domains: example.com, https://...
  const urlRegex = /(https?:\/\/|www\.|\b[a-zA-Z0-9.-]+\.(com|org|in|net|co|io|me|app)\b)/i;
  if (urlRegex.test(trimmed)) return true;

  // Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  if (emailRegex.test(trimmed)) return true;

  // Standalone single name (e.g. "Olivia", "Aarav", "Riya") without common phrase words
  const words = trimmed.split(/\s+/);
  if (words.length === 1 && /^[A-Z][a-z]+$/.test(trimmed)) {
    // Only protect if it's not a dictionary word like "Welcome" or "Celebration"
    if (!MOCK_TRANSLATIONS[normalizeKey(trimmed)]) {
      return true;
    }
  }

  return false;
}

/**
 * Translation Abstraction: translateText(text, sourceLanguage, targetLanguage)
 * Currently backed by mockTranslations, can later be routed to a live Translation API.
 */
export async function translateText(text, sourceLanguage = 'en', targetLanguage = 'hi') {
  if (!text || typeof text !== 'string') {
    return { success: false, text: text, message: 'Invalid text' };
  }

  // If target language is the same as source, return original
  if (targetLanguage === sourceLanguage || targetLanguage === 'en') {
    return { success: true, text: text };
  }

  const key = normalizeKey(text);
  const entry = MOCK_TRANSLATIONS[key];

  if (entry && entry[targetLanguage]) {
    return {
      success: true,
      text: entry[targetLanguage],
    };
  }

  // Check partial key matches (e.g., if text ends with exclamation or has extra spaces)
  const strippedKey = key.replace(/[!.,?]/g, '').trim();
  for (const dictKey of Object.keys(MOCK_TRANSLATIONS)) {
    if (dictKey.replace(/[!.,?]/g, '').trim() === strippedKey) {
      const match = MOCK_TRANSLATIONS[dictKey][targetLanguage];
      if (match) {
        return { success: true, text: match };
      }
    }
  }

  // Translation not found in dictionary: preserve original text and inform user
  return {
    success: false,
    text: text,
    message: 'Translation unavailable for this text. Original text has been preserved.',
  };
}

/**
 * Automatically fits translated text within design boundaries.
 * Prevents text overflow and clipping without breaking visual layout.
 */
export function fitTranslatedText(textObj, canvasWidth = 800, canvasHeight = 1000) {
  if (!textObj) return;

  const maxAllowedWidth = canvasWidth * 0.88;
  const minFontSize = 14;
  let currentFontSize = textObj.fontSize || 24;

  // Textbox handles wrapping, but we may expand width if too cramped
  if (textObj.type === 'textbox') {
    if (textObj.width && textObj.width < maxAllowedWidth * 0.75) {
      textObj.set({ width: Math.min(maxAllowedWidth, textObj.width * 1.15) });
    }
  }

  // Measure current rendered width and scale
  let scaledWidth = textObj.getScaledWidth();

  // If scaled width exceeds available boundary, reduce font size gradually
  let iterations = 0;
  while (scaledWidth > maxAllowedWidth && currentFontSize > minFontSize && iterations < 30) {
    currentFontSize -= 2;
    textObj.set({ fontSize: currentFontSize });
    scaledWidth = textObj.getScaledWidth();
    iterations++;
  }

  // Check top/bottom canvas bounds
  const scaledHeight = textObj.getScaledHeight();
  const top = textObj.top || 0;
  if (top + scaledHeight / 2 > canvasHeight - 20 && textObj.originY === 'center') {
    if (currentFontSize > minFontSize) {
      textObj.set({ fontSize: Math.max(minFontSize, currentFontSize - 2) });
    }
  }

  textObj.setCoords();
}
