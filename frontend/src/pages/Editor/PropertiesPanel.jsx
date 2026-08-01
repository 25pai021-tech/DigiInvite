import React from 'react';

export default function PropertiesPanel({ object, onUpdate }) {
  if (!object) {
    return (
      <aside className="editor-properties editor-properties-empty">
        <p>Select an object to see its properties.</p>
      </aside>
    );
  }

  const width = Math.round((object.width || 0) * (object.scaleX || 1));
  const height = Math.round((object.height || 0) * (object.scaleY || 1));

  return (
    <aside className="editor-properties">
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
