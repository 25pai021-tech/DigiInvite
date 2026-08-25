import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LanguagesSection.css';

const LANGUAGES = [
  {
    id: 'hindi',
    name: 'हिन्दी (Hindi)',
    tagline: 'शुभ विवाह एवं उत्सव पत्रिका',
    header: '॥ श्री गणेशाय नमः ॥',
    names: 'आयुष्मान् आदित्य संग आयुष्मती रिया',
    event: 'के पावन परिणय संस्कार में आपका सस्नेह निमंत्रण',
    date: 'शनिवार, १८ दिसम्बर २०२६ · उदयपुर',
    motifs: 'ॐ · स्वास्तिक · कलश',
  },
  {
    id: 'gujarati',
    name: 'ગુજરાતી (Gujarati)',
    tagline: 'રૂડી કંકોતરી અને લગ્ન ઉત્સવ',
    header: '॥ શ્રી ગણેશાય નમઃ ॥',
    names: 'ચિ. ચિરાગ સંગ ચિ. પ્રાચી',
    event: 'ના શુભ લગ્ન પ્રસંગે પધારવા હાર્દિક નિમંત્રણ',
    date: 'રવિવાર, ૨૪ જાન્યુઆરી ૨૦૨૭ · અમદાવાદ',
    motifs: 'શ્રી ગણેશ · સાથિયો',
  },
  {
    id: 'tamil',
    name: 'தமிழ் (Tamil)',
    tagline: 'பாரம்பரிய திருமண அழைப்பிதழ்',
    header: '|| ஓம் கணேசாய நமஹ ||',
    names: 'கார்த்திக் மற்றும் அனன்யா',
    event: 'திருமண விழாவிற்கு தங்களை அன்போடு அழைக்கின்றோம்',
    date: 'ஞாயிறு, 14 பிப்ரவரி 2027 · சென்னை',
    motifs: 'மங்கள வாத்தியம் · தீபம்',
  },
  {
    id: 'telugu',
    name: 'తెలుగు (Telugu)',
    tagline: 'శుభలేఖ & వివాహ ఆహ్వాన పత్రిక',
    header: '|| శ్రీ రస్తు - శుభమస్తు ||',
    names: 'చి. సౌ. రాహుల్ మరియు చి. లావణ్య',
    event: 'వివాహ మహోత్సవమునకు మిమ్ములను సకుటుంబంగా ఆహ్వానిస్తున్నాము',
    date: 'ఆదివారం, 28 నవంబర్ 2026 · హైదరాబాద్',
    motifs: 'కలశం · అక్షతలు',
  },
  {
    id: 'marathi',
    name: 'मराठी (Marathi)',
    tagline: 'लग्नपत्रिका आणि सस्नेह निमंत्रण',
    header: '॥ श्री कुलदैवत प्रसन्न ॥',
    names: 'चि. संकेत आणि चि.सौ.कां. तन्वी',
    event: 'यांच्या शुभविवाह सोहळ्यास सहकुटुंब सहपरिवार उपस्थित राहावे',
    date: 'शुक्रवार, ५ डिसेंबर २०२६ · पुणे',
    motifs: 'तुतारी · अक्षता · कलश',
  },
  {
    id: 'english',
    name: 'English (Bilingual)',
    tagline: 'Modern & Traditional English',
    header: '✦ TOGETHER WITH THEIR FAMILIES ✦',
    names: 'Aarav & Meera',
    event: 'Cordially invite you to celebrate their auspicious wedding',
    date: 'Saturday, December 18, 2026 · Lake Palace, Udaipur',
    motifs: 'Royal Crest · Gold Foil Border',
  },
];

export default function LanguagesSection() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  return (
    <section className="languages-section" id="languages">
      <div className="section-inner">
        <div className="text-center lang-header">
          <span className="section-tag">Cultural Heritage &amp; Languages</span>
          <h2 className="section-title">
            Celebrate in Your Mother Tongue. <br />
            20+ Indian &amp; Global Languages.
          </h2>
          <p className="section-sub">
            From traditional Shlokas and regional wedding phrasing to modern bilingual layouts—DigiInvite honors every cultural tradition.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="lang-tabs-row">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`lang-tab-btn ${lang.id === selectedLang.id ? 'active' : ''}`}
              onClick={() => setSelectedLang(lang)}
              type="button"
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Live Multilingual Card Showcase */}
        <div className="lang-showcase-box">
          <div className="lang-preview-card">
            <div className="lang-card-gold-border" />
            
            <div className="lang-card-header">
              <span className="lang-card-shloka">{selectedLang.header}</span>
              <span className="lang-card-tagline">{selectedLang.tagline}</span>
            </div>

            <div className="lang-card-body">
              <h3 className="lang-card-names">{selectedLang.names}</h3>
              <div className="lang-card-divider" />
              <p className="lang-card-event">{selectedLang.event}</p>
              <p className="lang-card-date">{selectedLang.date}</p>
            </div>

            <div className="lang-card-footer">
              <span className="lang-motif-badge">✦ {selectedLang.motifs}</span>
              <span className="lang-ai-badge">AI Regional Phrasing Verified</span>
            </div>
          </div>

          <div className="lang-info-panel">
            <h3 className="info-panel-title">Authentic Phrasing &amp; Typographic Elegance</h3>
            <p className="info-panel-desc">
              Never worry about spelling mistakes in complex Shlokas or regional scripts. Our language engine automatically recommends traditional opening invocations, auspicious colors, and appropriate family salutations.
            </p>

            <ul className="lang-feature-list">
              <li>
                <span className="check-bullet">✓</span>
                <span><strong>Bilingual Side-by-Side:</strong> Create English + Regional language dual-page invites.</span>
              </li>
              <li>
                <span className="check-bullet">✓</span>
                <span><strong>Authentic Script Rendering:</strong> Devnagari, Dravidian, and Indo-Aryan font sets.</span>
              </li>
              <li>
                <span className="check-bullet">✓</span>
                <span><strong>WhatsApp &amp; PDF Compatibility:</strong> Flawless rendering on all phones and print formats.</span>
              </li>
            </ul>

            <div className="lang-action-wrap">
              <Link to="/create-invitation" className="btn-primary">
                ✦ Create in Your Language →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
