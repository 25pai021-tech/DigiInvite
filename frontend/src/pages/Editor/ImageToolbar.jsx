import React, { useRef } from 'react';
import { fabric } from 'fabric';

export default function ImageToolbar({
  object,
  canvas,
  onUpdate,
  onReplace,
  onFilter,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringForward,
  onSendBackward,
}) {
  const fileRef = useRef(null);
  if (!object) return null;
  const locked = !!object.locked;

  const applyBorderRadius = (value) => {
    if (!canvas) return;
    if (Number(value) <= 0) {
      object.clipPath = null;
    } else {
      const clip = new fabric.Rect({
        width: object.width,
        height: object.height,
        rx: Number(value),
        ry: Number(value),
        originX: 'center',
        originY: 'center',
      });
      object.clipPath = clip;
    }
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: object });
  };

  return (
    <div className="editor-floating-toolbar">
      <button onClick={() => fileRef.current?.click()} title="Replace image">Replace</button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        hidden
        onChange={(e) => e.target.files?.[0] && onReplace(e.target.files[0])}
      />

      <div className="editor-toolbar-group">
        <button onClick={() => onUpdate({ flipX: !object.flipX })} title="Flip horizontal">⇋</button>
        <button onClick={() => onUpdate({ flipY: !object.flipY })} title="Flip vertical">⇵</button>
      </div>

      <input
        type="number"
        value={Math.round(object.angle || 0)}
        onChange={(e) => onUpdate({ angle: Number(e.target.value) })}
        title="Rotation"
        style={{ width: 52 }}
      />

      <label className="editor-toolbar-slider" title="Opacity">
        Op
        <input type="range" min={0} max={1} step={0.05} value={object.opacity ?? 1} onChange={(e) => onUpdate({ opacity: Number(e.target.value) })} />
      </label>

      <label className="editor-toolbar-slider" title="Brightness">
        Br
        <input type="range" min={-1} max={1} step={0.05} defaultValue={0} onChange={(e) => onFilter('Brightness', Number(e.target.value))} />
      </label>

      <label className="editor-toolbar-slider" title="Contrast">
        Ct
        <input type="range" min={-1} max={1} step={0.05} defaultValue={0} onChange={(e) => onFilter('Contrast', Number(e.target.value))} />
      </label>

      <label className="editor-toolbar-slider" title="Saturation">
        Sa
        <input type="range" min={-1} max={1} step={0.05} defaultValue={0} onChange={(e) => onFilter('Saturation', Number(e.target.value))} />
      </label>

      <label className="editor-toolbar-slider" title="Blur">
        Bl
        <input type="range" min={0} max={1} step={0.02} defaultValue={0} onChange={(e) => onFilter('Blur', Number(e.target.value))} />
      </label>

      <label className="editor-toolbar-slider" title="Corner radius">
        Rx
        <input type="range" min={0} max={100} defaultValue={0} onChange={(e) => applyBorderRadius(e.target.value)} />
      </label>

      <div className="editor-toolbar-group">
        <button onClick={onDuplicate} title="Duplicate">⧉</button>
        <button onClick={onDelete} title="Delete">🗑</button>
        <button className={locked ? 'active' : ''} onClick={onToggleLock} title={locked ? 'Unlock' : 'Lock'}>{locked ? '🔒' : '🔓'}</button>
        
      </div>
    </div>
  );
}
