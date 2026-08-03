import React from 'react';

export default function EditorTopBar({
  zoom, onZoomIn, onZoomOut, onFit, onActualSize, onUndo, onRedo,
  saveState, saveError, lastSavedAt, isDirty,
  gridEnabled, onToggleGrid, snapToGrid, onToggleSnapToGrid, snapToObjects, onToggleSnapToObjects,
}) {
  const savedLabel = () => {
    if (saveState === 'saving') return 'Saving…';
    if (saveState === 'saved') return 'Saved';
    if (saveState === 'error') return saveError ? `Save failed: ${saveError}` : 'Save failed';
    if (lastSavedAt) return `Last saved ${lastSavedAt.toLocaleTimeString()}`;
    return isDirty ? 'Unsaved changes' : 'No changes yet';
  };

  return (
    <div className="editor-topbar">
      <div className="editor-toolbar-group">
        <button onClick={onUndo} title="Undo (Ctrl+Z)">↺</button>
        <button onClick={onRedo} title="Redo (Ctrl+Y)">↻</button>
      </div>

      <div className="editor-toolbar-group">
        <button onClick={onZoomOut} title="Zoom out">−</button>
        <span className="editor-zoom-label">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} title="Zoom in">+</button>
        <button onClick={onFit} title="Fit to screen">Fit</button>
        <button onClick={onActualSize} title="Actual size">100%</button>
      </div>

      <div className="editor-toolbar-group">
        <button className={gridEnabled ? 'active' : ''} onClick={onToggleGrid} title="Toggle grid">▦ Grid</button>
        <button className={snapToGrid ? 'active' : ''} onClick={onToggleSnapToGrid} title="Snap to grid">⌗ Snap grid</button>
        <button className={snapToObjects ? 'active' : ''} onClick={onToggleSnapToObjects} title="Snap to objects">⌖ Snap obj</button>
      </div>

      <div className="editor-topbar-status" title={saveState === 'error' ? saveError : undefined}>
        <span className={`editor-save-dot ${saveState}`} />
        <span>{savedLabel()}</span>
      </div>
    </div>
  );
}
