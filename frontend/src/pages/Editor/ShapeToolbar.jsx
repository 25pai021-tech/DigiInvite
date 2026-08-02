import React from 'react';

export default function ShapeToolbar({
  object,
  onUpdate,
  onRecolor,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringForward,
  onSendBackward,
  onGroup,
  onUngroup,
}) {
  if (!object) return null;
  const locked = !!object.locked;
  const isGroup = object.type === 'group';
  const isSelection = object.type === 'activeSelection';
  const hasStroke = 'stroke' in object;

  const toggleShadow = () => {
    onUpdate({ shadow: object.shadow ? null : { color: 'rgba(0,0,0,0.35)', blur: 12, offsetX: 4, offsetY: 4 } });
  };

  return (
    <div className="editor-floating-toolbar">
      {!isGroup && (
        <input
          type="color"
          value={typeof object.fill === 'string' ? object.fill : '#6C3BFF'}
          onChange={(e) => (isGroup ? onRecolor(e.target.value) : onUpdate({ fill: e.target.value }))}
          title="Fill color"
        />
      )}
      {isGroup && (
        <button onClick={() => { const c = prompt('Icon color (hex):', '#6C3BFF'); if (c) onRecolor(c); }} title="Recolor icon">
          🎨 Recolor
        </button>
      )}

      {hasStroke && (
        <>
          <input type="color" value={object.stroke || '#000000'} onChange={(e) => onUpdate({ stroke: e.target.value })} title="Border color" />
          <input
            type="number"
            min={0}
            max={40}
            value={object.strokeWidth || 0}
            onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
            title="Border width"
            style={{ width: 50 }}
          />
        </>
      )}

      <button className={object.shadow ? 'active' : ''} onClick={toggleShadow} title="Toggle shadow">◐ Shadow</button>

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
        {isSelection && <button onClick={onGroup} title="Group (Ctrl+G)">⛓ Group</button>}
        {isGroup && <button onClick={onUngroup} title="Ungroup (Ctrl+Shift+G)">✂ Ungroup</button>}
        <button onClick={onDuplicate} title="Duplicate">⧉</button>
        <button onClick={onDelete} title="Delete">🗑</button>
        <button className={locked ? 'active' : ''} onClick={onToggleLock} title={locked ? 'Unlock' : 'Lock'}>{locked ? '🔒' : '🔓'}</button>
        <button onClick={onBringForward} title="Bring forward">▲</button>
        <button onClick={onSendBackward} title="Send backward">▼</button>
      </div>
    </div>
  );
}
