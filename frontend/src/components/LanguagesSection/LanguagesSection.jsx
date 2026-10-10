import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LanguagesSection.css';

const LANGUAGES = [
  {
    id: 'hindi',
    name: 'हिन्दी (Hindi)',
    tagline: 'शुभ विवाह निमंत्रण',
    header: '॥ श्री गणेशाय नमः ॥',
    names: 'आरव एवं मीरा',
    event: 'अपने परिवारजनों सहित आपको अपने विवाह समारोह में पधारने का सादर निमंत्रण देते हैं',
    date: 'शुक्रवार, १८ दिसम्बर २०२६ · लेक पैलेस, उदयपुर',
    motifs: 'ॐ · स्वस्तिक · कलश',
  },
  {
    id: 'gujarati',
    name: 'ગુજરાતી (Gujarati)',
    tagline: 'રૂડી કંકોતરી · લગ્ન નિમંત્રણ',
    header: '॥ શ્રી ગણેશાય નમઃ ॥',
    names: 'આરવ અને મીરા',
    event: 'પોતાના પરિવાર સાથે આપને તેમના લગ્ન સમારોહમાં પધારવા સાદર આમંત્રણ પાઠવે છે',
    date: 'શુક્રવાર, ૧૮ ડિસેમ્બર ૨૦૨૬ · લેક પેલેસ, ઉદયપુર',
    motifs: 'ૐ · સાથિયો · કળશ',
  },
  {
    id: 'tamil',
    name: 'தமிழ் (Tamil)',
    tagline: 'திருமண அழைப்பிதழ்',
    header: '|| ஓம் கணேசாய நமஹ ||',
    names: 'ஆரவ் மற்றும் மீரா',
    event: 'தங்கள் குடும்பத்தினருடன் இணைந்து, தங்களை அவர்களின் திருமண விழாவிற்கு அன்புடன் அழைக்கின்றனர்',
    date: 'வெள்ளிக்கிழமை, 18 டிசம்பர் 2026 · லேக் பேலஸ், உதய்ப்பூர்',
    motifs: 'ஓம் · ஸ்வஸ்திகம் · கலசம்',
  },
  {
    id: 'telugu',
    name: 'తెలుగు (Telugu)',
    tagline: 'శుభలేఖ · వివాహ ఆహ్వాన పత్రిక',
    header: '|| శ్రీ గణేశాయ నమః ||',
    names: 'ఆరవ్ మరియు మీరా',
    event: 'తమ కుటుంబ సభ్యులతో కలిసి, తమ వివాహ వేడుకకు మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నారు',
    date: 'శుక్రవారం, 18 డిసెంబర్ 2026 · లేక్ ప్యాలెస్, ఉదయపూర్',
    motifs: 'ఓం · స్వస్తిక్ · కలశం',
  },
  {
    id: 'marathi',
    name: 'मराठी (Marathi)',
    tagline: 'लग्नपत्रिका · सस्नेह निमंत्रण',
    header: '॥ श्री गणेशाय नमः ॥',
    names: 'आरव आणि मीरा',
    event: 'आपल्या कुटुंबीयांसह आपणास त्यांच्या विवाह सोहळ्यास उपस्थित राहण्याचे सादर निमंत्रण देत आहेत',
    date: 'शुक्रवार, १८ डिसेंबर २०२६ · लेक पॅलेस, उदयपूर',
    motifs: 'ॐ · स्वस्तिक · कलश',
  },
  {
    id: 'english',
    name: 'English',
    tagline: 'Wedding Invitation',
    header: '✦ SHREE GANESHAY NAMAH ✦',
    names: 'Aarav & Meera',
    event: 'Together with their families, request the pleasure of your company at their wedding',
    date: 'Friday, December 18, 2026 · Lake Palace, Udaipur',
    motifs: 'Om · Swastik · Kalash',
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
            10 Indian Languages.
          </h2>
          <p className="section-sub">
            Write your invitation in Hindi, Gujarati, Tamil, Telugu, Marathi and more —
            with traditional phrasing and the right regional script.
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
        <div
        className="lang-showcase-box"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="lang-preview-card"  style={{ margin: '0 auto' }}>
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
              <span className="lang-ai-badge">Traditional Wedding Phrasing</span>
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}
