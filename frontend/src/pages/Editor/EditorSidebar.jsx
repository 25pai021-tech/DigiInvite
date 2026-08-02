import React, { useRef, useState } from 'react';
import { ICON_CATEGORIES } from './iconLibrary';

const TABS = ['Text', 'Uploads', 'Shapes', 'Icons', 'Background', 'Templates', 'Stickers'];
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
}) {
  const [tab, setTab] = useState('Text');
  const [iconCategory, setIconCategory] = useState(ICON_CATEGORIES[0].name);
  const uploadRef = useRef(null);
  const bgRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

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
      </div>
    </aside>
  );
}
