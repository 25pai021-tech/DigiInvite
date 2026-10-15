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
import { fetchPremiumStatus, upgradeToPremium, payForTemplate, stampDownload } from '../../lib/premium';
import './editor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [paying, setPaying] = useState(false);
  const canvasWrapRef = useRef(null);

  // Has this specific card already been paid for (₹99 one-card unlock)?
  const isPaidCard = request?.status === 'Paid';

  // Load the signed-in user's Premium status (controls the watermark & publish).
  useEffect(() => {
    let active = true;
    fetchPremiumStatus().then((s) => {
      if (active) setIsPremiumUser(Boolean(s?.is_premium));
    });
    return () => { active = false; };
  }, [user]);

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
          .select('*, templates(text_layout, is_premium)')
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
              is_premium: tplData.is_premium || false,
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

  // A premium template shows a watermark for free users. It is removed when the
  // user is Premium (free) OR they pay the one-time ₹99 fee for this card.
  const isPremiumTemplate = Boolean(request?.templates?.is_premium);
  const watermarked = isPremiumTemplate && !isPremiumUser && !isPaidCard;
  const editor = useFabricEditor({ request, watermarked });

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

  const activeType = editor.activeObject?.type;
  const isText =
    TEXT_TYPES.includes(activeType) ||
    (activeType === 'activeSelection' &&
      Boolean(editor.activeObject?.getObjects?.().length) &&
      editor.activeObject.getObjects().every((o) => TEXT_TYPES.includes(o.type)));
  const isImage = activeType === 'image';
  const isShapeLike = editor.activeObject && !isText && !isImage;

  // Non-paying users on a premium template get the watermark baked in server-side.
  const needsServerStamp = isPremiumTemplate && !isPremiumUser && !isPaidCard;

  const handleDownload = async (format, opts = {}) => {
    let dataUrl = editor.exportImage(format, 3, opts);
    if (!dataUrl) return;
    if (needsServerStamp) {
      try {
        dataUrl = await stampDownload(request.id, dataUrl, format === 'jpg' ? 'jpg' : 'png');
      } catch (e) {
        alert(e.message || 'Could not prepare the download. Please try again.');
        return;
      }
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(request.event_name || 'invitation').replace(/\s+/g, '-')}.${format}`;
    link.click();
  };

    // One-time upgrade to Premium — removes the watermark on premium templates and
  // unlocks unlimited AI generation + publishing.
  const handleUpgrade = async () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      await upgradeToPremium();
      setIsPremiumUser(true);        // the editor hook drops the watermark live
      editor.removeWatermark?.();
      alert('You are now Premium! The watermark has been removed.');
    } catch (err) {
      if (err?.message && err.message !== 'Upgrade cancelled.') {
        alert(err.message);
      }
    } finally {
      setUpgrading(false);
    }
  };


  // Pay ₹99 once to remove the watermark on THIS card only (free users).
  const handlePayForCard = async () => {
    if (paying) return;
    if (request.is_template) {
      alert('Please click "Save Edits" first to save this card, then remove the watermark.');
      return;
    }
    setPaying(true);
    try {
      await payForTemplate(request.id);
      setRequest((prev) => ({ ...prev, status: 'Paid' })); // drops the watermark live
      editor.removeWatermark?.();
      alert('Payment successful! The watermark has been removed from this card.');
    } catch (err) {
      if (err?.message && err.message !== 'Payment cancelled.') {
        alert(err.message);
      }
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadPdf = async () => {
    let override = null;
    if (needsServerStamp) {
      const png = editor.exportImage('png', 3);
      if (!png) return;
      try {
        override = await stampDownload(request.id, png, 'png');
      } catch (e) {
        alert(e.message || 'Could not prepare the download. Please try again.');
        return;
      }
    }
    const pdf = await editor.exportPdf(3, override);
    pdf?.save(`${(request.event_name || 'invitation').replace(/\s+/g, '-')}.pdf`);
  };

  const handlePublish = async () => {
    if (request.is_template) {
      alert('Please click "Save Edits" first to save your invitation, then publish.');
      return;
    }
    if (!isPremiumUser) {
      alert('Publishing is a Premium feature. Upgrade to Premium to publish your invitation.');
      return;
    }
    setIsPublishing(true);
    try {
      if (editor.isDirty) {
        await editor.save();
      }
      const res = await publishInvitation(request.id);
      const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
      const fullUrl = `${SITE_URL}${res.public_url}`;
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

        <div className="editor-toolbar-group">
          <button className="editor-btn" onClick={() => handleDownload('png')}>PNG</button>
          <button className="editor-btn" onClick={() => handleDownload('png', { transparent: true })}>PNG (transparent)</button>
          <button className="editor-btn" onClick={() => handleDownload('jpg')}>JPG</button>
          <button className="editor-btn" onClick={handleDownloadPdf}>PDF</button>
        </div>

        {watermarked && (
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
            <button
              onClick={handlePayForCard}
              disabled={paying}
              title="Pay ₹99 once to remove the watermark on this card"
              style={{
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600,
                cursor: paying ? 'default' : 'pointer', opacity: paying ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {paying ? 'Opening…' : '✦ Remove watermark – ₹99'}
            </button>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              title="Get Premium (₹499) — watermark-free on all templates, forever"
              style={{
                background: 'transparent', color: 'var(--purple, #7a1030)',
                border: '1px solid var(--purple, #7a1030)',
                borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600,
                cursor: upgrading ? 'default' : 'pointer', opacity: upgrading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {upgrading ? 'Opening…' : 'or get Premium ₹499'}
            </button>
          </div>
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
        {watermarked
          ? 'This is a premium template, so your card shows a watermark. Pay ₹99 once to remove it from this card, or get Premium (₹499) to remove watermarks on all premium templates forever.'
          : 'You can edit and download this card anytime, in PNG, transparent PNG, JPG, or PDF.'}
      </p>
    </div>
  );
}

const centerStyle = { minHeight: '100vh', display: 'grid', placeItems: 'center' };
