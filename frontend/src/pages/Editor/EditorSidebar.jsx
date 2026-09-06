import React, { useEffect, useRef, useState } from 'react';
import { ICON_CATEGORIES } from './iconLibrary';
import { SUPPORTED_LANGUAGES } from './languageService';

const TABS = ['Text', 'Uploads', 'Shapes', 'Icons', 'Background', 'Templates', 'Stickers', 'Language'];
const SWATCHES = ['#FFFFFF', '#F5F0FF', '#1a1035', '#0D0A1A', '#6C3BFF', '#D4AF37', '#22c55e', '#ef4444'];
const GRADIENTS = [
  ['#6C3BFF', '#8B5CFF'],
  ['#D4AF37', '#F5E7A8'],
  ['#1a1035', '#4A1FE8'],
  ['#ef4444', '#f59e0b'],
];

export default function EditorSidebar({
  onAddText,
  onAddImageFile,
  onAddShape,
  onAddIcon,
  onSetBackgroundColor,
  onSetBackgroundGradient,
  onSetBackgroundImageFile,
  activeLanguage = 'en',
  translationMode = 'replace',
  onTranslateInvitation,
  isTranslating = false,
  translationMessage = '',
}) {
  const [tab, setTab] = useState('Text');
  const [iconCategory, setIconCategory] = useState(ICON_CATEGORIES[0].name);
  const [selectedTargetLang, setSelectedTargetLang] = useState('hi');
  const [selectedMode, setSelectedMode] = useState(translationMode);
  const uploadRef = useRef(null);
  const bgRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setSelectedMode(translationMode);
  }, [translationMode]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onAddImageFile(file);
  };

  const activeIconCategory = ICON_CATEGORIES.find((c) => c.name === iconCategory);

  return (
    <aside className="editor-sidebar">
      <div className="editor-sidebar-tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="editor-sidebar-panel">
        {tab === 'Text' && (
          <div className="editor-sidebar-grid">
            <button className="editor-sidebar-item" onClick={onAddText}>
              + Add a text box
            </button>
            <p className="editor-sidebar-hint">Double-click any text on the card to start typing.</p>
          </div>
        )}

        {tab === 'Uploads' && (
          <div
            className={`editor-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => uploadRef.current?.click()}
          >
            <p>Drag &amp; drop an image</p>
            <span>or click to browse (PNG, JPG, SVG)</span>
            <input
              ref={uploadRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              hidden
              onChange={(e) => e.target.files?.[0] && onAddImageFile(e.target.files[0])}
            />
          </div>
        )}

        {tab === 'Shapes' && (
          <div className="editor-sidebar-grid editor-shape-grid">
            <button onClick={() => onAddShape('rect')}>▭ Rectangle</button>
            <button onClick={() => onAddShape('roundedRect')}>▢ Rounded rect</button>
            <button onClick={() => onAddShape('circle')}>◯ Circle</button>
            <button onClick={() => onAddShape('triangle')}>△ Triangle</button>
            <button onClick={() => onAddShape('hexagon')}>⬡ Polygon</button>
            <button onClick={() => onAddShape('star')}>★ Star</button>
            <button onClick={() => onAddShape('heart')}>♥ Heart</button>
            <button onClick={() => onAddShape('arrow')}>➔ Arrow</button>
            <button onClick={() => onAddShape('speechBubble')}>💬 Speech bubble</button>
            <button onClick={() => onAddShape('line')}>— Line</button>
          </div>
        )}

        {tab === 'Icons' && (
          <div>
            <select value={iconCategory} onChange={(e) => setIconCategory(e.target.value)} className="editor-icon-category-select">
              {ICON_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div className="editor-icon-grid">
              {activeIconCategory.icons.map((icon) => (
                <button
                  key={icon.id}
                  title={icon.label}
                  onClick={() => onAddIcon(icon.svg)}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              ))}
            </div>
            <p className="editor-sidebar-hint">Starter set — click an icon to add it, then recolor from its toolbar.</p>
          </div>
        )}

        {tab === 'Background' && (
          <div className="editor-sidebar-grid">
            <p className="editor-sidebar-hint">Solid color</p>
            <div className="editor-swatches">
              {SWATCHES.map((c) => (
                <button key={c} className="editor-swatch" style={{ background: c }} onClick={() => onSetBackgroundColor(c)} />
              ))}
              <input type="color" onChange={(e) => onSetBackgroundColor(e.target.value)} title="Custom color" />
            </div>

            <p className="editor-sidebar-hint" style={{ marginTop: 16 }}>Gradient</p>
            <div className="editor-swatches">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  className="editor-swatch"
                  style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
                  onClick={() => onSetBackgroundGradient(g)}
                />
              ))}
            </div>

            <p className="editor-sidebar-hint" style={{ marginTop: 16 }}>Upload background image</p>
            <button className="editor-sidebar-item" onClick={() => bgRef.current?.click()}>Upload image</button>
            <input
              ref={bgRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              hidden
              onChange={(e) => e.target.files?.[0] && onSetBackgroundImageFile(e.target.files[0])}
            />
          </div>
        )}

        {tab === 'Templates' && (
          <p className="editor-sidebar-hint">
            Template gallery is coming soon — for now, use the AI Generator to produce a new starting design,
            or start from the current card and customize it here.
          </p>
        )}

        {tab === 'Stickers' && (
          <p className="editor-sidebar-hint">
            A dedicated sticker pack is coming soon — the Icons tab already works as decorative stickers
            in the meantime (add one, then resize/rotate/recolor it freely).
          </p>
        )}

        {tab === 'Language' && (
          <div className="editor-language-panel">
            <h4 className="editor-lang-title">LANGUAGE</h4>
            <div className="editor-lang-divider" />

            <div className="editor-lang-group">
              <label className="editor-lang-label">Invitation Language</label>
              <select
                value={activeLanguage}
                onChange={(e) => onTranslateInvitation?.(e.target.value, selectedMode)}
                className="editor-lang-select"
                disabled={isTranslating}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-lang-group">
              <label className="editor-lang-label">Translate To</label>
              <select
                value={selectedTargetLang}
                onChange={(e) => setSelectedTargetLang(e.target.value)}
                className="editor-lang-select"
                disabled={isTranslating}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-lang-group">
              <label className="editor-lang-label">Translation Mode</label>
              <div className="editor-lang-modes">
                <label className="editor-lang-radio">
                  <input
                    type="radio"
                    name="translationMode"
                    value="replace"
                    checked={selectedMode === 'replace'}
                    onChange={() => setSelectedMode('replace')}
                    disabled={isTranslating}
                  />
                  <span>Replace Language</span>
                </label>
                <label className="editor-lang-radio">
                  <input
                    type="radio"
                    name="translationMode"
                    value="bilingual"
                    checked={selectedMode === 'bilingual'}
                    onChange={() => setSelectedMode('bilingual')}
                    disabled={isTranslating}
                  />
                  <span>Bilingual</span>
                </label>
              </div>
            </div>

            <button
              className="editor-sidebar-item editor-translate-btn"
              disabled={isTranslating}
              onClick={() => onTranslateInvitation?.(selectedTargetLang, selectedMode)}
            >
              {isTranslating ? 'Translating…' : 'Translate Invitation'}
            </button>

            {translationMessage && (
              <p className="editor-translation-msg">⚠ {translationMessage}</p>
            )}

            <div className="editor-lang-divider" />

            <div className="editor-supported-langs">
              <span className="editor-supported-title">Supported Languages</span>
              <div className="editor-supported-grid">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <div
                    key={l.id}
                    className={`editor-lang-chip ${activeLanguage === l.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTargetLang(l.id);
                    }}
                    title={`Click to set target to ${l.name}`}
                  >
                    <span className="editor-chip-native">{l.nativeName}</span>
                    <span className="editor-chip-en">{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
