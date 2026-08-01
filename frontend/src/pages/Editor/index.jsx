import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useFabricEditor, EDITOR_CANVAS_SIZE } from './useFabricEditor';
import EditorTopBar from './EditorTopBar';
import EditorSidebar from './EditorSidebar';
import TextToolbar from './TextToolbar';
import ImageToolbar from './ImageToolbar';
import PropertiesPanel from './PropertiesPanel';
import './editor.css';

const TEXT_TYPES = ['i-text', 'textbox', 'text'];

export default function Editor() {
  const { requestId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const canvasWrapRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !requestId) return;
    async function load() {
      const { data, error } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error || !data) setError('Could not load this card.');
      else setRequest(data);
      setBusy(false);
    }
    load();
  }, [user, requestId]);

  const editor = useFabricEditor({ request });

  useEffect(() => {
    if (editor.fitToScreen && canvasWrapRef.current) {
      editor.fitToScreen(canvasWrapRef.current.clientWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  if (loading || busy) {
    return <div style={centerStyle}>Loading…</div>;
  }
  if (error) {
    return <div style={centerStyle}>{error}</div>;
  }
  if (!request) return null;

  const isPaid = request.status === 'Paid' || request.status === 'Completed';
  const activeType = editor.activeObject?.type;
  const isText = TEXT_TYPES.includes(activeType);
  const isImage = activeType === 'image';

  const handleDownload = (format) => {
    const dataUrl = editor.exportImage(format, 3);
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(request.event_name || 'invitation').replace(/\s+/g, '-')}.${format}`;
    link.click();
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <button onClick={() => navigate('/my-requests')} className="editor-back-btn">← Back to My Requests</button>
        <div>
          <h1>{request.event_name}</h1>
          <p>{request.event_type} · {request.date} · {request.venue}</p>
        </div>
      </div>

      <EditorTopBar
        zoom={editor.zoom}
        onZoomIn={editor.zoomIn}
        onZoomOut={editor.zoomOut}
        onFit={() => editor.fitToScreen(canvasWrapRef.current?.clientWidth)}
        onActualSize={editor.actualSize}
        onUndo={editor.undo}
        onRedo={editor.redo}
        saveState={editor.saveState}
        lastSavedAt={editor.lastSavedAt}
        isDirty={editor.isDirty}
      />

      <div className="editor-workspace">
        <EditorSidebar
          onAddText={editor.addText}
          onAddImageFile={editor.addImageFromFile}
          onAddShape={editor.addShape}
          onSetBackgroundColor={editor.setBackgroundColor}
          onSetBackgroundImageFile={editor.setBackgroundImageFile}
        />

        <div className="editor-canvas-column">
          {isText && (
            <TextToolbar
              object={editor.activeObject}
              onUpdate={editor.updateActive}
              onDuplicate={editor.duplicateActive}
              onDelete={editor.deleteActive}
              onToggleLock={editor.toggleLock}
              onBringForward={editor.bringForward}
              onSendBackward={editor.sendBackward}
            />
          )}
          {isImage && (
            <ImageToolbar
              object={editor.activeObject}
              canvas={editor.canvasRef.current}
              onUpdate={editor.updateActive}
              onReplace={editor.replaceActiveImage}
              onFilter={editor.applyImageFilter}
              onDuplicate={editor.duplicateActive}
              onDelete={editor.deleteActive}
              onToggleLock={editor.toggleLock}
              onBringForward={editor.bringForward}
              onSendBackward={editor.sendBackward}
            />
          )}

          <div className="editor-canvas-wrap" ref={canvasWrapRef} style={{ minHeight: EDITOR_CANVAS_SIZE.height * editor.zoom + 32 }}>
            <canvas ref={editor.canvasElRef} />
          </div>
        </div>

        <PropertiesPanel object={editor.activeObject} onUpdate={editor.updateActive} />
      </div>

      <div className="editor-actions">
        <button
          className="editor-btn editor-btn-primary"
          disabled={!editor.isDirty || editor.saveState === 'saving'}
          onClick={editor.save}
        >
          {editor.saveState === 'saving' ? 'Saving…' : 'Save Edits'}
        </button>

        {isPaid ? (
          <div className="editor-toolbar-group">
            <button className="editor-btn" onClick={() => handleDownload('png')}>Download PNG</button>
            <button className="editor-btn" onClick={() => handleDownload('jpg')}>Download JPG</button>
          </div>
        ) : (
          <button className="editor-btn editor-btn-green" onClick={() => navigate('/pricing')}>
            Pay to Download
          </button>
        )}
      </div>

      <p className="editor-footnote">
        {isPaid
          ? 'You have paid — you can edit and download this card anytime.'
          : 'You can preview and edit your card. Downloading unlocks after payment.'}
      </p>
    </div>
  );
}

const centerStyle = { minHeight: '100vh', display: 'grid', placeItems: 'center' };
