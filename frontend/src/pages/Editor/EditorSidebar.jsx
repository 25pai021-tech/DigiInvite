import React, { useRef, useState } from 'react';

const TABS = ['Text', 'Uploads', 'Shapes', 'Background'];
const SWATCHES = ['#FFFFFF', '#F5F0FF', '#1a1035', '#0D0A1A', '#6C3BFF', '#D4AF37', '#22c55e', '#ef4444'];

export default function EditorSidebar({ onAddText, onAddImageFile, onAddShape, onSetBackgroundColor, onSetBackgroundImageFile }) {
  const [tab, setTab] = useState('Text');
  const uploadRef = useRef(null);
  const bgRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onAddImageFile(file);
  };

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
            <button onClick={() => onAddShape('line')}>— Line</button>
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
      </div>
    </aside>
  );
}
