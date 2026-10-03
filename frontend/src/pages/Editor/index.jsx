import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useFabricEditor, EDITOR_CANVAS_SIZE } from './useFabricEditor';
import EditorTopBar from './EditorTopBar';
import EditorSidebar from './EditorSidebar';
import TextToolbar from './TextToolbar';
import ImageToolbar from './ImageToolbar';
import ShapeToolbar from './ShapeToolbar';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import ContextMenu from './ContextMenu';
import Rulers from './Rulers';
import { publishInvitation, getWhatsAppShareUrl } from '../../lib/publishInvitation';
import './editor.css';

const API_URL = 'http://localhost:8000';
const TEXT_TYPES = ['i-text', 'textbox', 'text'];

export default function Editor() {
  const { requestId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [publishModal, setPublishModal] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasWrapRef = useRef(null);

  useEffect(() => {
    if (!loading && !user && request && !request.is_template) {
      navigate('/login');
    }
  }, [loading, user, request, navigate]);

  useEffect(() => {
    if (!requestId) return;
    let active = true;

    async function load() {
      setBusy(true);
      setError('');
      try {
        // 1. First check if requestId matches an invitation_requests row
        const { data: reqData } = await supabase
          .from('invitation_requests')
          .select('*, templates(text_layout)')
          .eq('id', requestId)
          .maybeSingle();

        if (reqData && active) {
          setRequest(reqData);
          setBusy(false);
          return;
        }

        // 2. If not found in invitation_requests, check templates table
        const { data: tplData } = await supabase
          .from('templates')
          .select('*')
          .eq('id', requestId)
          .maybeSingle();

        if (tplData && active) {
          const cleanName = tplData.name
            ? tplData.name
                .replace(/-blank\.png$/i, '')
                .replace(/\.png$/i, '')
                .replace(/^[a-z0-9]+_/i, '')
                .replace(/_/g, ' ')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : 'Celebration Invitation';

          const templateRequest = {
            id: tplData.id,
            is_template: true,
            template_id: tplData.id,
            event_name: cleanName,
            event_type: tplData.event_type || 'wedding',
            theme: tplData.theme || '',
            venue: 'The Grand Ballroom',
            date: new Date().toISOString().slice(0, 10),
            time: '18:00',
            generated_image_url: tplData.config?.full_image_url || tplData.thumbnail_url,
            templates: {
              text_layout: tplData.text_layout || [],
            },
            editor_state: tplData.editor_state || null,
            status: 'Draft',
          };
          setRequest(templateRequest);
          setBusy(false);
          return;
        }

        if (active) {
          setError('Could not load this invitation card.');
          setBusy(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Error loading invitation card.');
          setBusy(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [requestId]);

  const editor = useFabricEditor({ request });

  useEffect(() => {
    if (editor.fitToScreen && canvasWrapRef.current) {
      editor.fitToScreen(canvasWrapRef.current.clientWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  // right-click context menu on the canvas
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const canvas = editor.canvasRef.current;
    if (!canvas) return;
    const target = canvas.findTarget(e.nativeEvent, false);
    if (target) canvas.setActiveObject(target);
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [editor.canvasRef]);

  if (loading || busy) {
    return <div style={centerStyle}>Loading…</div>;
  }
  if (error) {
    return <div style={centerStyle}>{error}</div>;
  }
  if (!request) return null;
  const isPaid = request.status === 'Paid' || request.status === 'Completed';

  const activeType = editor.activeObject?.type;
  const isText =
    TEXT_TYPES.includes(activeType) ||
    (activeType === 'activeSelection' &&
      Boolean(editor.activeObject?.getObjects?.().length) &&
      editor.activeObject.getObjects().every((o) => TEXT_TYPES.includes(o.type)));
  const isImage = activeType === 'image';
  const isShapeLike = editor.activeObject && !isText && !isImage;

  const handleDownload = (format, opts = {}) => {
    const dataUrl = editor.exportImage(format, 3, opts);
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(request.event_name || 'invitation').replace(/\s+/g, '-')}.${format}`;
    link.click();
  };

    const handlePay = async () => {
    try {
      // must be a saved request (not an unsaved template)
      if (request.is_template) {
        alert('Please click "Save Edits" first, then pay.');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { navigate('/login'); return; }

      // 1) create the order on our backend
      const orderRes = await fetch(`${API_URL}/createOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_id: request.id }),
      });
      if (!orderRes.ok) throw new Error('Could not start payment.');
      const order = await orderRes.json();

      // 2) open the Razorpay popup
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'DigiInvite',
        description: 'Invitation download',
        order_id: order.order_id,
        theme: { color: '#7a1030' },
        handler: async (response) => {
          // 3) verify on our backend → marks the request Paid
          const verifyRes = await fetch(`${API_URL}/verifyPayment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              request_id: request.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            setRequest((prev) => ({ ...prev, status: 'Paid' })); // unlocks downloads
            editor.removeWatermark();
            alert('Payment successful! You can now download your card.');
          } else {
            alert('Payment could not be verified.');
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Payment failed to start.');
    }
  };

  const handleDownloadPdf = async () => {
    const pdf = await editor.exportPdf(3);
    pdf?.save(`${(request.event_name || 'invitation').replace(/\s+/g, '-')}.pdf`);
  };

  const handlePublish = async () => {
    if (request.is_template) {
      alert('Please click "Save Edits" first to save your invitation, then publish.');
      return;
    }
    setIsPublishing(true);
    try {
      if (editor.isDirty) {
        await editor.save();
      }
      const res = await publishInvitation(request.id);
      const fullUrl = `${window.location.origin}${res.public_url}`;
      setPublishModal({
        slug: res.public_slug,
        title: request.event_name || 'My Celebration',
        url: fullUrl,
      });
      setRequest((prev) => ({
        ...prev,
        published: true,
        public_slug: res.public_slug,
        published_at: res.published_at,
      }));
    } catch (err) {
      alert(err.message || 'Failed to publish invitation.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReorderLayer = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const fromLayer = editor.layers[fromIdx];
    const toLayer = editor.layers[toIdx];
    const fromObj = editor.findObjectById(fromLayer.id);
    const toObj = editor.findObjectById(toLayer.id);
    const canvasObjs = editor.canvasRef.current.getObjects();
    const targetIndex = canvasObjs.indexOf(toObj);
    editor.moveLayerToIndex(fromObj, targetIndex);
  };

  const contextItems = editor.activeObject
    ? [
        { label: 'Duplicate', onClick: editor.duplicateActive },
        { label: 'Delete', onClick: editor.deleteActive },
        { divider: true },
        { label: 'Bring forward', onClick: () => editor.bringForward() },
        { label: 'Send backward', onClick: () => editor.sendBackward() },
        { divider: true },
        { label: editor.activeObject.locked ? 'Unlock' : 'Lock', onClick: editor.toggleLock },
        { divider: true },
        { label: 'Group', onClick: editor.groupActive, disabled: editor.activeObject.type !== 'activeSelection' },
        { label: 'Ungroup', onClick: editor.ungroupActive, disabled: editor.activeObject.type !== 'group' },
      ]
    : [];

  return (
    <div className="editor-page">
      <div className="editor-header">
        <button
          onClick={() => (user ? navigate('/my-requests') : navigate('/templates'))}
          className="editor-back-btn"
        >
          ← {user ? 'Back to My Requests' : 'Back to Templates'}
        </button>
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
        saveError={editor.saveError}
        lastSavedAt={editor.lastSavedAt}
        isDirty={editor.isDirty}
        gridEnabled={editor.gridEnabled}
        onToggleGrid={editor.toggleGrid}
        snapToGrid={editor.snapToGrid}
        onToggleSnapToGrid={editor.toggleSnapToGrid}
        snapToObjects={editor.snapToObjects}
        onToggleSnapToObjects={editor.toggleSnapToObjects}
      />

      <div className="editor-workspace">
        <EditorSidebar
          onAddText={editor.addText}
          onAddImageFile={editor.addImageFromFile}
          onAddShape={editor.addShape}
          onAddIcon={editor.addIconFromSvg}
          onSetBackgroundColor={editor.setBackgroundColor}
          onSetBackgroundGradient={editor.setBackgroundGradient}
          onSetBackgroundImageFile={editor.setBackgroundImageFile}
          activeLanguage={editor.activeLanguage}
          translationMode={editor.translationMode}
          onTranslateInvitation={editor.translateInvitation}
          isTranslating={editor.isTranslating}
          translationMessage={editor.translationMessage}
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
          {isShapeLike && (
            <ShapeToolbar
              object={editor.activeObject}
              onUpdate={editor.updateActive}
              onRecolor={(color) => editor.recolorIcon(editor.activeObject, color)}
              onDuplicate={editor.duplicateActive}
              onDelete={editor.deleteActive}
              onToggleLock={editor.toggleLock}
              onBringForward={editor.bringForward}
              onSendBackward={editor.sendBackward}
              onGroup={editor.groupActive}
              onUngroup={editor.ungroupActive}
            />
          )}

          <div className="editor-canvas-scroll">
            <Rulers width={EDITOR_CANVAS_SIZE.width} height={EDITOR_CANVAS_SIZE.height} zoom={editor.zoom} />
            <div
              className={`editor-canvas-wrap ${editor.gridEnabled ? 'grid-on' : ''}`}
              ref={canvasWrapRef}
              style={{
                minHeight: EDITOR_CANVAS_SIZE.height * editor.zoom + 32,
                backgroundSize: editor.gridEnabled ? `${20 * editor.zoom}px ${20 * editor.zoom}px` : undefined,
              }}
              onContextMenu={handleContextMenu}
            >
              <canvas ref={editor.canvasElRef} />
            </div>
          </div>
        </div>

        <div className="editor-right-column">
          <PropertiesPanel
            object={editor.activeObject}
            onUpdate={editor.updateActive}
            onTranslateSelected={editor.translateSelectedText}
            isTranslating={editor.isTranslating}
            selectedTranslationMessage={editor.selectedTranslationMessage}
          />
          <LayersPanel
            layers={editor.layers}
            activeObject={editor.activeObject}
            onSelect={editor.selectObjectById}
            onToggleVisible={(layer) => editor.setObjectVisible(editor.findObjectById(layer.id), !layer.visible)}
            onToggleLock={(layer) => editor.toggleLockObject(editor.findObjectById(layer.id))}
            onRename={(layer, name) => editor.renameObject(editor.findObjectById(layer.id), name)}
            onDelete={(layer) => editor.deleteObject(editor.findObjectById(layer.id))}
            onDuplicate={(layer) => editor.duplicateObject(editor.findObjectById(layer.id))}
            onReorder={handleReorderLayer}
          />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextItems} onClose={() => setContextMenu(null)} />
      )}

      <div className="editor-actions">
        <button
          className="editor-btn editor-btn-primary"
          disabled={!editor.isDirty || editor.saveState === 'saving'}
          onClick={editor.save}
        >
          {editor.saveState === 'saving' ? 'Saving…' : 'Save Edits'}
        </button>

        <button
          className="editor-btn"
          style={{ background: '#7a1030', color: '#fff' }}
          disabled={isPublishing}
          onClick={handlePublish}
        >
          {isPublishing ? 'Publishing…' : (request.published || request.editor_state?.publish_info?.published) ? 'Publish / Share Details' : 'Publish Invitation'}
        </button>

        {isPaid ? (
          <div className="editor-toolbar-group">
            <button className="editor-btn" onClick={() => handleDownload('png')}>PNG</button>
            <button className="editor-btn" onClick={() => handleDownload('png', { transparent: true })}>PNG (transparent)</button>
            <button className="editor-btn" onClick={() => handleDownload('jpg')}>JPG</button>
            <button className="editor-btn" onClick={handleDownloadPdf}>PDF</button>
          </div>
        ) : (
          <button className="editor-btn editor-btn-green" onClick={handlePay}>
            Pay to Download
          </button>
        )}
      </div>

      {/* Publish Result Modal */}
      {publishModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setPublishModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '32px 28px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid #f3e8eb',
              color: '#2c2523',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, margin: '0 0 6px', color: '#7a1030' }}>
                Invitation is Live!
              </h2>
              <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                Your smart adaptive mini-website is created and ready to share.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
                Public Website Link
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input
                  type="text"
                  readOnly
                  value={publishModal.url}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    background: '#f9fafb',
                  }}
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => handleCopyLink(publishModal.url)}
                  style={{
                    background: copied ? '#16a34a' : '#7a1030',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <a
                href={getWhatsAppShareUrl(publishModal.title, publishModal.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25d366',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  flex: 1,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                💬 Share on WhatsApp
              </a>

              <a
                href={publishModal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  flex: 1,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                🔗 Open Live Page
              </a>
            </div>

            <button
              onClick={() => setPublishModal(null)}
              style={{
                background: '#e5e7eb',
                color: '#333',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 10,
                width: '100%',
                marginTop: 12,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {editor.saveState === 'error' && editor.saveError && (
        <p className="editor-save-error">⚠ {editor.saveError}</p>
      )}

      <p className="editor-footnote">
        {isPaid
          ? 'You have paid — you can edit and download this card anytime, in PNG, transparent PNG, JPG, or PDF.'
          : 'You can preview and edit your card. Downloading unlocks after payment.'}
      </p>
    </div>
  );
}

const centerStyle = { minHeight: '100vh', display: 'grid', placeItems: 'center' };
