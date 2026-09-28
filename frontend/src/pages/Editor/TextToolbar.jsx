import React from 'react';
import { AVAILABLE_FONTS, FONT_CATEGORIES, cleanFontName } from './fontManager';

export default function TextToolbar({ object, onUpdate, onDuplicate, onDelete, onToggleLock, onBringForward, onSendBackward }) {
  if (!object) return null;
  const locked = !!object.locked;
  const currentFont = cleanFontName(object.fontFamily || 'Inter');
  const isKnown = AVAILABLE_FONTS.some((f) => f.name.toLowerCase() === currentFont.toLowerCase());

  return (
    <div className="editor-floating-toolbar">
      <select
        value={currentFont}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        title="Font family"
        className="editor-font-select"
      >
        {!isKnown && currentFont && (
          <option value={currentFont}>{currentFont}</option>
        )}
        {FONT_CATEGORIES.map((cat) => (
          <optgroup key={cat} label={cat}>
            {AVAILABLE_FONTS.filter((f) => f.category === cat).map((f) => (
              <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                {f.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <input
        type="number"
        min={6}
        max={200}
        value={Math.round(object.fontSize || 16)}
        onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
        title="Font size"
        style={{ width: 56 }}
      />

      <input
        type="color"
        value={object.fill || '#000000'}
        onChange={(e) => onUpdate({ fill: e.target.value })}
        title="Font color"
      />

      <div className="editor-toolbar-group">
        <button className={object.fontWeight === '700' || object.fontWeight === 'bold' ? 'active' : ''} onClick={() => onUpdate({ fontWeight: object.fontWeight === '700' || object.fontWeight === 'bold' ? '400' : '700' })} title="Bold"><b>B</b></button>
        <button className={object.fontStyle === 'italic' ? 'active' : ''} onClick={() => onUpdate({ fontStyle: object.fontStyle === 'italic' ? 'normal' : 'italic' })} title="Italic"><i>I</i></button>
        <button className={object.underline ? 'active' : ''} onClick={() => onUpdate({ underline: !object.underline })} title="Underline"><u>U</u></button>
        <button className={object.linethrough ? 'active' : ''} onClick={() => onUpdate({ linethrough: !object.linethrough })} title="Strikethrough"><s>S</s></button>
      </div>

      <div className="editor-toolbar-group">
        <button className={object.textAlign === 'left' ? 'active' : ''} onClick={() => onUpdate({ textAlign: 'left' })} title="Align left">⟸</button>
        <button className={object.textAlign === 'center' ? 'active' : ''} onClick={() => onUpdate({ textAlign: 'center' })} title="Align center">≡</button>
        <button className={object.textAlign === 'right' ? 'active' : ''} onClick={() => onUpdate({ textAlign: 'right' })} title="Align right">⟹</button>
        <button className={object.textAlign === 'justify' ? 'active' : ''} onClick={() => onUpdate({ textAlign: 'justify' })} title="Justify">☰</button>
      </div>

      <div className="editor-toolbar-group">
        <button onClick={() => onUpdate({ text: (object.text || '').toUpperCase() })} title="Uppercase">AA</button>
        <button onClick={() => onUpdate({ text: (object.text || '').toLowerCase() })} title="Lowercase">aa</button>
      </div>

      <label className="editor-toolbar-slider" title="Letter spacing">
        Ls
        <input type="range" min={-50} max={400} value={object.charSpacing || 0} onChange={(e) => onUpdate({ charSpacing: Number(e.target.value) })} />
      </label>

      <label className="editor-toolbar-slider" title="Line height">
        Lh
        <input type="range" min={0.5} max={3} step={0.1} value={object.lineHeight || 1.16} onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })} />
      </label>

      <label className="editor-toolbar-slider" title="Opacity">
        Op
        <input type="range" min={0} max={1} step={0.05} value={object.opacity ?? 1} onChange={(e) => onUpdate({ opacity: Number(e.target.value) })} />
      </label>

      <input
        type="number"
        value={Math.round(object.angle || 0)}
        onChange={(e) => onUpdate({ angle: Number(e.target.value) })}
        title="Rotation"
        style={{ width: 52 }}
      />

      <div className="editor-toolbar-group">
        <button onClick={onDuplicate} title="Duplicate">⧉</button>
        <button onClick={onDelete} title="Delete">🗑</button>
        <button className={locked ? 'active' : ''} onClick={onToggleLock} title={locked ? 'Unlock' : 'Lock'}>{locked ? '🔒' : '🔓'}</button>
        <button onClick={onBringForward} title="Bring forward">▲</button>
        <button onClick={onSendBackward} title="Send backward">▼</button>
      </div>
    </div>
  );
}
