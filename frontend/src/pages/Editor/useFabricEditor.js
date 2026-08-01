import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { supabase } from '../../lib/supabaseClient';

const CANVAS_W = 800;
const CANVAS_H = 1000;
const HISTORY_LIMIT = 100;
const PREVIEW_BUCKET = 'design-uploads';

/**
 * Builds the default set of editable Fabric text objects from a freshly
 * generated request (used the first time someone opens the editor, before
 * any editor_state has been saved).
 */
function buildDefaultObjects(request) {
  const objects = [];

  objects.push(
    new fabric.IText(request.event_name || 'Your Event', {
      left: CANVAS_W / 2,
      top: 140,
      originX: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 44,
      fontWeight: '700',
      fill: '#1a1a1a',
      textAlign: 'center',
      name: 'title',
    })
  );

  const dateLine = [request.date, request.time].filter(Boolean).join('  •  ');
  if (dateLine) {
    objects.push(
      new fabric.IText(dateLine, {
        left: CANVAS_W / 2,
        top: 210,
        originX: 'center',
        fontFamily: 'Inter',
        fontSize: 20,
        fill: '#333333',
        textAlign: 'center',
        name: 'date',
      })
    );
  }

  if (request.venue) {
    objects.push(
      new fabric.IText(request.venue, {
        left: CANVAS_W / 2,
        top: 250,
        originX: 'center',
        fontFamily: 'Inter',
        fontSize: 18,
        fill: '#555555',
        textAlign: 'center',
        name: 'venue',
      })
    );
  }

  if (request.special_message) {
    objects.push(
      new fabric.Textbox(request.special_message, {
        left: CANVAS_W / 2,
        top: 300,
        width: 560,
        originX: 'center',
        fontFamily: 'Inter',
        fontSize: 16,
        fill: '#6b6585',
        textAlign: 'center',
        name: 'message',
      })
    );
  }

  return objects;
}

export function useFabricEditor({ request, onSaved }) {
  const canvasElRef = useRef(null);
  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const suppressHistory = useRef(false);
  const clipboardRef = useRef(null);

  const [activeObject, setActiveObject] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // ── init canvas ──────────────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || !request) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    const finishLoad = () => {
      undoStack.current = [JSON.stringify(canvas.toJSON(['name', 'locked']))];
      redoStack.current = [];
      setIsDirty(false);
      canvas.requestRenderAll();
    };

    const loadDefaultObjects = () => {
      buildDefaultObjects(request).forEach((obj) => canvas.add(obj));
      finishLoad();
    };

    const setupWithBackground = () => {
      if (request.generated_image_url) {
        fabric.Image.fromURL(
          request.generated_image_url,
          (img) => {
            img.scaleToWidth(CANVAS_W);
            img.set({ left: 0, top: 0, selectable: false, evented: false, name: '__background' });
            canvas.add(img);
            canvas.sendToBack(img);
            if (request.editor_state) {
              // background already included in saved state; skip re-adding
            } else {
              loadDefaultObjects();
              return;
            }
            finishLoad();
          },
          { crossOrigin: 'anonymous' }
        );
      } else if (!request.editor_state) {
        loadDefaultObjects();
      } else {
        finishLoad();
      }
    };

    if (request.editor_state) {
      suppressHistory.current = true;
      canvas.loadFromJSON(request.editor_state, () => {
        suppressHistory.current = false;
        finishLoad();
      });
    } else {
      setupWithBackground();
    }

    // ── selection tracking ──
    const syncActive = () => setActiveObject(canvas.getActiveObject() || null);
    canvas.on('selection:created', syncActive);
    canvas.on('selection:updated', syncActive);
    canvas.on('selection:cleared', () => setActiveObject(null));

    // ── history tracking ──
    const pushHistory = () => {
      if (suppressHistory.current) return;
      const json = JSON.stringify(canvas.toJSON(['name', 'locked']));
      undoStack.current.push(json);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setIsDirty(true);
    };
    canvas.on('object:modified', pushHistory);
    canvas.on('object:added', pushHistory);
    canvas.on('object:removed', pushHistory);

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  // ── undo / redo ──────────────────────────────────────────────
  const restoreFromJSON = useCallback((json) => {
    const canvas = canvasRef.current;
    if (!canvas || !json) return;
    suppressHistory.current = true;
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.requestRenderAll();
      suppressHistory.current = false;
      setIsDirty(true);
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length <= 1) return;
    const current = undoStack.current.pop();
    redoStack.current.push(current);
    restoreFromJSON(undoStack.current[undoStack.current.length - 1]);
  }, [restoreFromJSON]);

  const redo = useCallback(() => {
    if (!redoStack.current.length) return;
    const next = redoStack.current.pop();
    undoStack.current.push(next);
    restoreFromJSON(next);
  }, [restoreFromJSON]);

  // ── zoom ─────────────────────────────────────────────────────
  const setZoom = useCallback((value) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const clamped = Math.min(2, Math.max(0.1, value));
    canvas.setZoom(clamped);
    canvas.setWidth(CANVAS_W * clamped);
    canvas.setHeight(CANVAS_H * clamped);
    setZoomState(clamped);
  }, []);
  const zoomIn = useCallback(() => setZoom(zoom + 0.1), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - 0.1), [zoom, setZoom]);
  const fitToScreen = useCallback((containerWidth) => {
    if (!containerWidth) return setZoom(1);
    setZoom(Math.min(1, (containerWidth - 48) / CANVAS_W));
  }, [setZoom]);
  const actualSize = useCallback(() => setZoom(1), [setZoom]);

  // ── object actions ───────────────────────────────────────────
  const updateActive = useCallback((props) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj });
  }, []);

  const duplicateActive = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.clone((clone) => {
      clone.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
    });
  }, []);

  const deleteActive = useCallback(() => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObjects();
    if (!active?.length) return;
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const toggleLock = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    const locked = !obj.lockMovementX;
    obj.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      lockRotation: locked,
      locked,
      hasControls: !locked,
    });
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj });
    setActiveObject(null);
    setActiveObject(obj);
  }, []);

  const bringForward = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.bringForward(obj);
    canvas.fire('object:modified', { target: obj });
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.sendBackwards(obj);
    canvas.fire('object:modified', { target: obj });
  }, []);

  const addText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Double-click to edit', {
      left: CANVAS_W / 2,
      top: CANVAS_H / 2,
      originX: 'center',
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#1a1a1a',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }, []);

  const addShape = useCallback((type) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const common = { left: CANVAS_W / 2, top: CANVAS_H / 2, originX: 'center', originY: 'center', fill: '#6C3BFF' };
    let shape;
    if (type === 'rect') shape = new fabric.Rect({ ...common, width: 160, height: 100 });
    else if (type === 'roundedRect') shape = new fabric.Rect({ ...common, width: 160, height: 100, rx: 16, ry: 16 });
    else if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 70 });
    else if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 140, height: 120 });
    else if (type === 'line') shape = new fabric.Line([0, 0, 180, 0], { ...common, stroke: '#6C3BFF', strokeWidth: 4 });
    if (!shape) return;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  }, []);

  const addImageFromFile = useCallback((file) => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scaleToWidth(300);
        img.set({ left: CANVAS_W / 2, top: CANVAS_H / 2, originX: 'center', originY: 'center' });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const replaceActiveImage = useCallback((file) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || obj.type !== 'image' || !file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const { left, top, angle, scaleX, scaleY, originX, originY } = obj;
      fabric.Image.fromURL(e.target.result, (img) => {
        img.set({ left, top, angle, scaleX, scaleY, originX, originY });
        canvas.remove(obj);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        canvas.fire('object:modified', { target: img });
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const setBackgroundColor = useCallback((color) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setBackgroundColor(color, () => canvas.requestRenderAll());
    setIsDirty(true);
  }, []);

  const setBackgroundImageFile = useCallback((file) => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scaleToWidth(CANVAS_W);
        canvas.setBackgroundImage(img, () => {
          canvas.requestRenderAll();
          setIsDirty(true);
        });
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const applyImageFilter = useCallback((filterName, value) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || obj.type !== 'image') return;
    const FilterClass = fabric.Image.filters[filterName];
    if (!FilterClass) return;
    obj.filters = (obj.filters || []).filter((f) => f.type !== filterName);
    const arg = filterName === 'Blur' ? { blur: value } : filterName === 'Brightness' ? { brightness: value } : filterName === 'Contrast' ? { contrast: value } : { saturation: value };
    obj.filters.push(new FilterClass(arg));
    obj.applyFilters();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj });
  }, []);

  // ── keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const tag = document.activeElement?.tagName;
      const editingText = canvas.getActiveObject()?.isEditing;
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (editingText || tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateActive(); return; }
      if (ctrl && e.key.toLowerCase() === 'a') { e.preventDefault(); canvas.discardActiveObject(); canvas.setActiveObject(new fabric.ActiveSelection(canvas.getObjects().filter((o) => o.selectable !== false), { canvas })); canvas.requestRenderAll(); return; }
      if (ctrl && e.key.toLowerCase() === 'c') { const obj = canvas.getActiveObject(); if (obj) obj.clone((c) => (clipboardRef.current = c)); return; }
      if (ctrl && e.key.toLowerCase() === 'v') {
        if (clipboardRef.current) {
          clipboardRef.current.clone((c) => {
            c.set({ left: c.left + 20, top: c.top + 20 });
            canvas.add(c);
            canvas.setActiveObject(c);
            canvas.requestRenderAll();
          });
        }
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); deleteActive(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, duplicateActive, deleteActive]);

  // ── save ─────────────────────────────────────────────────────
  const save = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !request?.id) return;
    setSaveState('saving');
    try {
      const json = canvas.toJSON(['name', 'locked']);
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.9 });

      const blob = await (await fetch(dataUrl)).blob();
      const path = `${request.user_id}/previews/${request.id}.png`;
      await supabase.storage.from(PREVIEW_BUCKET).upload(path, blob, { upsert: true, contentType: 'image/png' });
      const { data: pub } = supabase.storage.from(PREVIEW_BUCKET).getPublicUrl(path);

      const { error } = await supabase
        .from('invitation_requests')
        .update({ editor_state: json, preview_url: pub.publicUrl })
        .eq('id', request.id);
      if (error) throw error;

      setIsDirty(false);
      setSaveState('saved');
      setLastSavedAt(new Date());
      onSaved?.(pub.publicUrl);
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveState('error');
    }
  }, [request, onSaved]);

  // ── autosave every 30s ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) save();
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, save]);

  // ── export for download ─────────────────────────────────────
  const exportImage = useCallback((format = 'png', multiplier = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({ format: format === 'jpg' ? 'jpeg' : 'png', quality: 0.95, multiplier });
  }, []);

  return {
    canvasElRef,
    canvasRef,
    activeObject,
    isDirty,
    zoom,
    saveState,
    lastSavedAt,
    setZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    actualSize,
    undo,
    redo,
    updateActive,
    duplicateActive,
    deleteActive,
    toggleLock,
    bringForward,
    sendBackward,
    addText,
    addShape,
    addImageFromFile,
    replaceActiveImage,
    setBackgroundColor,
    setBackgroundImageFile,
    applyImageFilter,
    save,
    exportImage,
  };
}

export const EDITOR_CANVAS_SIZE = { width: CANVAS_W, height: CANVAS_H };
