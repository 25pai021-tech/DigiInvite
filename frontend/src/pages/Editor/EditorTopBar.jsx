import React from 'react';

export default function EditorTopBar({ zoom, onZoomIn, onZoomOut, onFit, onActualSize, onUndo, onRedo, saveState, lastSavedAt, isDirty, onSave }) {
  const savedLabel = () => {
    if (saveState === 'saving') return 'Saving…';
    if (saveState === 'saved') return 'Saved';
    if (saveState === 'error') return 'Save failed';
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

      <div className="editor-topbar-status">
        <span className={`editor-save-dot ${saveState}`} />
        <span>{savedLabel()}</span>
      </div>
    </div>
  );
}
