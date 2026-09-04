import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from './languageService';

export default function PropertiesPanel({
  object,
  onUpdate,
  onTranslateSelected,
  isTranslating = false,
  selectedTranslationMessage = '',
}) {
  const [targetLang, setTargetLang] = useState('hi');

  if (!object) {
    return (
      <aside className="editor-properties editor-properties-empty">
        <p>Select an object to see its properties.</p>
      </aside>
    );
  }

  const isText = ['i-text', 'textbox', 'text'].includes(object.type);
  const width = Math.round((object.width || 0) * (object.scaleX || 1));
  const height = Math.round((object.height || 0) * (object.scaleY || 1));

  return (
    <aside className="editor-properties">
      {isText && (
        <div className="editor-properties-section">
          <h4>Text</h4>
          <label className="editor-properties-col-label">
            <span>Content</span>
            <textarea
              className="editor-properties-textarea"
              rows={2}
              value={object.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </label>
          <label className="editor-properties-col-label">
            <span>Language</span>
            <select
              value={object.activeLanguage || 'en'}
              className="editor-properties-select"
              onChange={(e) => onTranslateSelected?.(e.target.value, object.translationMode || 'replace')}
              disabled={isTranslating}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.nativeName}
                </option>
              ))}
            </select>
          </label>
          <label className="editor-properties-col-label">
            <span>Translate To</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="editor-properties-select"
              disabled={isTranslating}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.nativeName}
                </option>
              ))}
            </select>
          </label>
          <button
            className="editor-sidebar-item editor-translate-btn"
            disabled={isTranslating}
            onClick={() => onTranslateSelected?.(targetLang, object.translationMode || 'replace')}
          >
            {isTranslating ? 'Translating…' : 'Translate Text'}
          </button>
          {selectedTranslationMessage && (
            <p className="editor-translation-msg">⚠ {selectedTranslationMessage}</p>
          )}
          <div className="editor-lang-divider" style={{ margin: '10px 0' }} />
        </div>
      )}

      <h4>Properties</h4>

      <label>
        X
        <input type="number" value={Math.round(object.left || 0)} onChange={(e) => onUpdate({ left: Number(e.target.value) })} />
      </label>
      <label>
        Y
        <input type="number" value={Math.round(object.top || 0)} onChange={(e) => onUpdate({ top: Number(e.target.value) })} />
      </label>
      <label>
        Width
        <input
          type="number"
          value={width}
          onChange={(e) => onUpdate({ scaleX: Number(e.target.value) / (object.width || 1) })}
        />
      </label>
      <label>
        Height
        <input
          type="number"
          value={height}
          onChange={(e) => onUpdate({ scaleY: Number(e.target.value) / (object.height || 1) })}
        />
      </label>
      <label>
        Rotation
        <input type="number" value={Math.round(object.angle || 0)} onChange={(e) => onUpdate({ angle: Number(e.target.value) })} />
      </label>
      <label>
        Opacity
        <input type="range" min={0} max={1} step={0.05} value={object.opacity ?? 1} onChange={(e) => onUpdate({ opacity: Number(e.target.value) })} />
      </label>
      <label className="editor-properties-checkbox">
        Visible
        <input type="checkbox" checked={object.visible !== false} onChange={(e) => onUpdate({ visible: e.target.checked })} />
      </label>
    </aside>
  );
}
