import React, { useState } from 'react';

export default function LayersPanel({
  layers,
  activeObject,
  onSelect,
  onToggleVisible,
  onToggleLock,
  onRename,
  onDelete,
  onDuplicate,
  onReorder,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [draftName, setDraftName] = useState('');
  const dragIndex = React.useRef(null);

  const startRename = (layer) => {
    setRenamingId(layer.id);
    setDraftName(layer.name);
  };
  const commitRename = (layer) => {
    if (draftName.trim()) onRename(layer, draftName.trim());
    setRenamingId(null);
  };

  return (
    <div className="editor-layers">
      <h4>Layers</h4>
      {!layers.length && <p className="editor-sidebar-hint">Nothing on the canvas yet.</p>}
      <ul>
        {layers.map((layer, index) => {
          const isActive = activeObject?.__uid === layer.id;
          return (
            <li
              key={layer.id}
              className={isActive ? 'active' : ''}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current === null) return;
                onReorder(dragIndex.current, index);
                dragIndex.current = null;
              }}
              onClick={() => onSelect(layer.id)}
            >
              <span className="editor-layer-drag">⠿</span>

              {renamingId === layer.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commitRename(layer)}
                  onKeyDown={(e) => e.key === 'Enter' && commitRename(layer)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="editor-layer-name" onDoubleClick={(e) => { e.stopPropagation(); startRename(layer); }}>
                  {layer.name}
                </span>
              )}

              <span className="editor-layer-actions">
                <button onClick={(e) => { e.stopPropagation(); onToggleVisible(layer); }} title={layer.visible ? 'Hide' : 'Show'}>
                  {layer.visible ? '👁' : '🚫'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleLock(layer); }} title={layer.locked ? 'Unlock' : 'Lock'}>
                  {layer.locked ? '🔒' : '🔓'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(layer); }} title="Duplicate">⧉</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(layer); }} title="Delete">🗑</button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
