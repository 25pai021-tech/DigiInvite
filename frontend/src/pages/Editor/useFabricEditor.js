import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { supabase } from '../../lib/supabaseClient';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIG,
  translateText,
  isDynamicField,
  fitTranslatedText,
} from './languageService';

const CANVAS_W = 800;
const CANVAS_H = 1000;
const HISTORY_LIMIT = 100;
const PREVIEW_BUCKET = 'design-uploads';

const CUSTOM_PROPS = [
  'name',
  'locked',
  '__uid',
  'originalText',
  'sourceLanguage',
  'activeLanguage',
  'isTranslatable',
  'translations',
  'translationMode',
  'originalFontFamily',
  'originalFontSize',
  'fieldType',
];

function initTextObjectMetadata(obj, fieldType = 'custom') {
  if (!obj) return obj;
  const isDyn = isDynamicField(obj.text, obj.name, fieldType);
  obj.set({
    originalText: obj.text || '',
    sourceLanguage: 'en',
    activeLanguage: 'en',
    isTranslatable: !isDyn,
    fieldType: fieldType || (isDyn ? 'protected' : 'text'),
    translations: { en: obj.text || '' },
    translationMode: 'replace',
    originalFontFamily: obj.fontFamily || 'Inter',
    originalFontSize: obj.fontSize || 24,
  });
  return obj;
}

/**
 * Builds the default set of editable Fabric text objects from a freshly
 * generated request (used the first time someone opens the editor, before
 * any editor_state has been saved).
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d}-${m}-${y}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}

function buildDefaultObjects(request) {
  const objects = [];
  const centerY = CANVAS_H / 2;

  const title = new fabric.IText(request.event_name || 'Your Event', {
    left: CANVAS_W / 2,
    top: centerY - 120,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Playfair Display',
    fontSize: 56,
    fontWeight: '700',
    fill: '#1a1a1a',
    textAlign: 'center',
    name: 'title',
  });
  initTextObjectMetadata(title, 'title');
  objects.push(title);

  const dateLine = [formatDate(request.date), formatTime(request.time)].filter(Boolean).join('  •  ');
  if (dateLine) {
    const dateObj = new fabric.IText(dateLine, {
      left: CANVAS_W / 2,
      top: centerY - 20,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 28,
      fill: '#333333',
      textAlign: 'center',
      name: 'date',
    });
    initTextObjectMetadata(dateObj, 'date');
    objects.push(dateObj);
  }

  if (request.venue) {
    const venueObj = new fabric.IText(request.venue, {
      left: CANVAS_W / 2,
      top: centerY + 50,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#555555',
      textAlign: 'center',
      name: 'venue',
    });
    initTextObjectMetadata(venueObj, 'venue');
    objects.push(venueObj);
  }

  if (request.special_message) {
    const messageObj = new fabric.Textbox(request.special_message, {
      left: CANVAS_W / 2,
      top: centerY + 130,
      width: 560,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#6b6585',
      textAlign: 'center',
      name: 'message',
    });
    initTextObjectMetadata(messageObj, 'message');
    objects.push(messageObj);
  }

  return objects;
}

/**
 * Builds editable text objects from a template's saved text_layout —
 * using each field's real value from the request, falling back to the
 * template's sample text if that field is empty.
 */
function buildObjectsFromLayout(layout, request, bgHeight = CANVAS_H) {
  return layout.map((item) => {
    let text = request?.is_template ? (item.sample || request[item.field] || '') : (request[item.field] || item.sample || '');

    if (!request?.is_template && item.field === 'date') {
      const dateLine = [request.date, request.time].filter(Boolean).join('  •  ');
      text = dateLine || item.sample || '';
    }

    const Ctor = item.field === 'venue' || item.field === 'special_message' ? fabric.Textbox : fabric.IText;
    const heightScale = bgHeight / CANVAS_H;

    const obj = new Ctor(text, {
      left: (item.x / 100) * CANVAS_W,
      top: (item.y / 100) * bgHeight,
      originX: 'center',
      originY: 'center',
      width: Ctor === fabric.Textbox ? CANVAS_W * 0.8 : undefined,
      fontFamily: item.font || 'Playfair Display',
      fontSize: (item.size || 20) * heightScale,
      fill: item.color || '#1a1a1a',
      textAlign: item.align || 'center',
      name: item.id || `text_${item.field || 'layer'}`,
    });
    initTextObjectMetadata(obj, item.field || 'layer');
    return obj;
  });
}

function starPoints(spikes, outerRadius, innerRadius) {
  const points = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < 2 * spikes; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return points;
}

const HEART_PATH = 'M 50 30 C 20 0 -20 10 0 45 C 15 70 40 85 50 100 C 60 85 85 70 100 45 C 120 10 80 0 50 30 Z';
const ARROW_PATH = 'M 0 30 L 100 30 L 100 10 L 150 50 L 100 90 L 100 70 L 0 70 Z';
const SPEECH_BUBBLE_PATH = 'M 10 10 L 150 10 Q 165 10 165 25 L 165 90 Q 165 105 150 105 L 55 105 L 25 130 L 30 105 L 25 105 Q 10 105 10 90 Z';

let uidCounter = 0;
function ensureId(obj) {
  if (!obj.__uid) obj.__uid = `obj_${Date.now()}_${uidCounter++}`;
  return obj.__uid;
}

function readableName(obj) {
  if (obj.name && obj.name !== '__background') return obj.name;
  if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') return (obj.text || 'Text').slice(0, 24);
  if (obj.type === 'image') return 'Image';
  if (obj.type === 'group') return 'Group';
  return obj.type ? obj.type[0].toUpperCase() + obj.type.slice(1) : 'Object';
}

export function useFabricEditor({ request, onSaved }) {
  const canvasElRef = useRef(null);
  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const suppressHistory = useRef(false);
  const clipboardRef = useRef(null);
  const refreshLayersRef = useRef(() => {});

  const [activeObject, setActiveObject] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [translationMode, setTranslationMode] = useState('replace');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationMessage, setTranslationMessage] = useState('');
  const [selectedTranslationMessage, setSelectedTranslationMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [layers, setLayers] = useState([]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [snapToObjects, setSnapToObjects] = useState(true);
  const guideLinesRef = useRef([]);
  const bgHeightRef = useRef(CANVAS_H);
  const snapToGridRef = useRef(snapToGrid);
  const snapToObjectsRef = useRef(snapToObjects);
  useEffect(() => { snapToGridRef.current = snapToGrid; }, [snapToGrid]);
  useEffect(() => { snapToObjectsRef.current = snapToObjects; }, [snapToObjects]);

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
      undoStack.current = [JSON.stringify(canvas.toJSON(CUSTOM_PROPS))];
      redoStack.current = [];
      setIsDirty(false);
      canvas.requestRenderAll();
      refreshLayersRef.current();
    };

    const loadDefaultObjects = (bgHeight = CANVAS_H) => {
      const layout = request.templates?.text_layout;
      const objects = (layout && layout.length)
        ? buildObjectsFromLayout(layout, request, bgHeight)
        : buildDefaultObjects(request);
      objects.forEach((obj) => canvas.add(obj));
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
            const realBgHeight = img.getScaledHeight();
            canvas.setHeight(realBgHeight);
            canvas.setWidth(CANVAS_W);
            bgHeightRef.current = realBgHeight;
            if (request.editor_state) {
              // background already included in saved state; skip re-adding
            } else {
              loadDefaultObjects(realBgHeight);
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
      try {
        const state = typeof request.editor_state === 'string' ? JSON.parse(request.editor_state) : request.editor_state;
        if (state?.languageState) {
          if (state.languageState.activeLanguage) setActiveLanguage(state.languageState.activeLanguage);
          if (state.languageState.translationMode) setTranslationMode(state.languageState.translationMode);
        }
        canvas.loadFromJSON(state, () => {
          // Resize the canvas to match the restored background image,
          // otherwise a tall card gets clipped at the default 1000px height.
          const bg = canvas.getObjects().find((o) => o.name === '__background');
          if (bg) {
            const realBgHeight = bg.getScaledHeight();
            canvas.setWidth(CANVAS_W);
            canvas.setHeight(realBgHeight);
            bgHeightRef.current = realBgHeight;
          }
          canvas.requestRenderAll();
          suppressHistory.current = false;
          finishLoad();
        });
      } catch (e) {
        suppressHistory.current = false;
        finishLoad();
      }
    } else {
      setupWithBackground();
    }

    // ── selection tracking ──
    const syncActive = () => setActiveObject(canvas.getActiveObject() || null);
    canvas.on('selection:created', syncActive);
    canvas.on('selection:updated', syncActive);
    canvas.on('selection:cleared', () => setActiveObject(null));

    // ── layers tracking ──
    const refreshLayers = () => {
      const objs = canvas
        .getObjects()
        .filter((o) => o.name !== '__background')
        .map((o) => {
          ensureId(o);
          return { id: o.__uid, name: readableName(o), type: o.type, visible: o.visible !== false, locked: !!o.locked };
        })
        .reverse(); // top-of-stack first, like Canva
      setLayers(objs);
    };
    canvas.on('object:added', refreshLayers);
    canvas.on('object:removed', refreshLayers);
    canvas.on('object:modified', refreshLayers);
    canvas.on('text:changed', (e) => {
      const obj = e.target;
      if (obj && (obj.activeLanguage === 'en' || !obj.activeLanguage)) {
        obj.originalText = obj.text;
        obj.translations = { ...(obj.translations || {}), en: obj.text };
      }
    });
    refreshLayersRef.current = refreshLayers;

    // ── history tracking ──
    const pushHistory = () => {
      if (suppressHistory.current) return;
      const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS));
      undoStack.current.push(json);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setIsDirty(true);
    };
    canvas.on('object:modified', pushHistory);
    canvas.on('object:added', pushHistory);
    canvas.on('object:removed', pushHistory);

    // ── snap to grid + smart guides ──
    const GRID = 20;
    const THRESHOLD = 6;
    const clearGuides = () => {
      guideLinesRef.current.forEach((l) => canvas.remove(l));
      guideLinesRef.current = [];
    };
    const drawGuide = (points) => {
      const line = new fabric.Line(points, {
        stroke: '#FF4FCB',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      guideLinesRef.current.push(line);
      canvas.add(line);
      canvas.bringToFront(line);
    };

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      clearGuides();

      if (snapToGridRef.current) {
        obj.set({
          left: Math.round(obj.left / GRID) * GRID,
          top: Math.round(obj.top / GRID) * GRID,
        });
      }

      if (snapToObjectsRef.current) {
        const bounds = obj.getBoundingRect(true);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        // canvas center guides
        const canvasCenterX = CANVAS_W / 2;
        const canvasCenterY = CANVAS_H / 2;
        if (Math.abs(centerX - canvasCenterX) < THRESHOLD) {
          obj.set({ left: obj.left + (canvasCenterX - centerX) });
          drawGuide([canvasCenterX, 0, canvasCenterX, CANVAS_H]);
        }
        if (Math.abs(centerY - canvasCenterY) < THRESHOLD) {
          obj.set({ top: obj.top + (canvasCenterY - centerY) });
          drawGuide([0, canvasCenterY, CANVAS_W, canvasCenterY]);
        }

        // other objects' centers
        canvas.getObjects().forEach((other) => {
          if (other === obj || other.name === '__background' || guideLinesRef.current.includes(other)) return;
          const ob = other.getBoundingRect(true);
          const ocx = ob.left + ob.width / 2;
          const ocy = ob.top + ob.height / 2;
          const curBounds = obj.getBoundingRect(true);
          const curCx = curBounds.left + curBounds.width / 2;
          const curCy = curBounds.top + curBounds.height / 2;
          if (Math.abs(curCx - ocx) < THRESHOLD) {
            obj.set({ left: obj.left + (ocx - curCx) });
            drawGuide([ocx, 0, ocx, CANVAS_H]);
          }
          if (Math.abs(curCy - ocy) < THRESHOLD) {
            obj.set({ top: obj.top + (ocy - curCy) });
            drawGuide([0, ocy, CANVAS_W, ocy]);
          }
        });
      }
      obj.setCoords();
    });

    canvas.on('mouse:up', clearGuides);

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
    canvas.setHeight(bgHeightRef.current * clamped);
    setZoomState(clamped);
  }, []);
  
  const zoomIn = useCallback(() => setZoom(zoom + 0.1), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - 0.1), [zoom, setZoom]);
  const fitToScreen = useCallback((containerWidth) => {
    if (!containerWidth) return setZoom(1);
    setZoom(Math.min(1, (containerWidth - 48) / CANVAS_W));
  }, [setZoom]);
  const actualSize = useCallback(() => setZoom(1), [setZoom]);
  const toggleGrid = useCallback(() => setGridEnabled((v) => !v), []);
  const toggleSnapToGrid = useCallback(() => setSnapToGrid((v) => !v), []);
  const toggleSnapToObjects = useCallback(() => setSnapToObjects((v) => !v), []);

  // ── object actions ───────────────────────────────────────────
  const findObjectById = useCallback((id) => {
    const canvas = canvasRef.current;
    return canvas?.getObjects().find((o) => o.__uid === id) || null;
  }, []);

  const selectObjectById = useCallback((id) => {
    const canvas = canvasRef.current;
    const obj = findObjectById(id);
    if (!canvas || !obj) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, [findObjectById]);

  const updateActive = useCallback((props) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    if (props.text !== undefined && (obj.activeLanguage === 'en' || !obj.activeLanguage)) {
      props.originalText = props.text;
      props.translations = { ...(obj.translations || {}), en: props.text };
    }
    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj });
    setActiveObject({ ...obj });
  }, []);

  const duplicateObject = useCallback((target) => {
    const canvas = canvasRef.current;
    const obj = target || canvas?.getActiveObject();
    if (!canvas || !obj) return;
    obj.clone((clone) => {
      clone.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
    });
  }, []);
  const duplicateActive = useCallback(() => duplicateObject(), [duplicateObject]);

  const deleteObject = useCallback((target) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (target) {
      canvas.remove(target);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }
    const active = canvas.getActiveObjects();
    if (!active?.length) return;
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);
  const deleteActive = useCallback(() => deleteObject(), [deleteObject]);

  const toggleLockObject = useCallback((target) => {
    const canvas = canvasRef.current;
    const obj = target || canvas?.getActiveObject();
    if (!canvas || !obj) return;
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
    setActiveObject((prev) => (prev === obj ? null : prev));
    if (canvas.getActiveObject() === obj) setActiveObject(obj);
  }, []);
  const toggleLock = useCallback(() => toggleLockObject(), [toggleLockObject]);

  const setObjectVisible = useCallback((target, visible) => {
    const canvas = canvasRef.current;
    if (!canvas || !target) return;
    target.set({ visible });
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target });
  }, []);

  const renameObject = useCallback((target, name) => {
    const canvas = canvasRef.current;
    if (!canvas || !target) return;
    target.set({ name });
    refreshLayersRef.current();
  }, []);

  const bringForward = useCallback((target) => {
    const canvas = canvasRef.current;
    const obj = target || canvas?.getActiveObject();
    if (!canvas || !obj) return;
    canvas.bringForward(obj);
    canvas.fire('object:modified', { target: obj });
    refreshLayersRef.current();
  }, []);

  const sendBackward = useCallback((target) => {
    const canvas = canvasRef.current;
    const obj = target || canvas?.getActiveObject();
    if (!canvas || !obj) return;
    canvas.sendBackwards(obj);
    canvas.fire('object:modified', { target: obj });
    refreshLayersRef.current();
  }, []);

  const moveLayerToIndex = useCallback((target, canvasIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || !target) return;
    canvas.moveTo(target, canvasIndex);
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target });
    refreshLayersRef.current();
  }, []);

  const groupActive = useCallback(() => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== 'activeSelection') return;
    const group = active.toGroup();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: group });
  }, []);

  const ungroupActive = useCallback(() => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== 'group') return;
    active.toActiveSelection();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: active });
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
    initTextObjectMetadata(text, 'custom');
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
    else if (type === 'star') shape = new fabric.Polygon(starPoints(6, 70, 30), { ...common });
    else if (type === 'heart') shape = new fabric.Path(HEART_PATH, { ...common, scaleX: 1.4, scaleY: 1.4 });
    else if (type === 'arrow') shape = new fabric.Path(ARROW_PATH, { ...common });
    else if (type === 'hexagon') shape = new fabric.Polygon(starPoints(6, 80, 80), { ...common });
    else if (type === 'speechBubble') shape = new fabric.Path(SPEECH_BUBBLE_PATH, { ...common, scaleX: 1.2, scaleY: 1.2 });
    if (!shape) return;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  }, []);

  const addIconFromSvg = useCallback((svgString, color = '#6C3BFF') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    fabric.loadSVGFromString(svgString, (objects, options) => {
      const icon = fabric.util.groupSVGElements(objects, options);
      icon.set({
        left: CANVAS_W / 2,
        top: CANVAS_H / 2,
        originX: 'center',
        originY: 'center',
      });
      icon.scaleToWidth(80);
      recolorIcon(icon, color);
      canvas.add(icon);
      canvas.setActiveObject(icon);
      canvas.requestRenderAll();
    });
  }, []);

  const recolorIcon = useCallback((target, color) => {
    const canvas = canvasRef.current;
    const obj = target || canvas?.getActiveObject();
    if (!obj) return;
    const applyFill = (o) => {
      if (o.type === 'group' && o._objects) o._objects.forEach(applyFill);
      else o.set({ fill: color });
    };
    applyFill(obj);
    canvas?.requestRenderAll();
    canvas?.fire('object:modified', { target: obj });
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

  const setBackgroundGradient = useCallback((colorStops) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: CANVAS_W, y2: CANVAS_H },
      colorStops: colorStops.map((color, i) => ({ offset: i / (colorStops.length - 1), color })),
    });
    canvas.setBackgroundColor(gradient, () => canvas.requestRenderAll());
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
      if (ctrl && e.shiftKey && e.key.toLowerCase() === 'g') { e.preventDefault(); ungroupActive(); return; }
      if (ctrl && e.key.toLowerCase() === 'g') { e.preventDefault(); groupActive(); return; }
      if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return; }
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

  // ── translation actions ──────────────────────────────────────
  const translateInvitation = useCallback(async (targetLang, mode = 'replace') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsTranslating(true);
    setTranslationMessage('');
    // Realistic async delay for loading state
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const textObjects = canvas.getObjects().filter(
        (o) => (o.type === 'i-text' || o.type === 'textbox' || o.type === 'text') && o.name !== '__background'
      );

      let translatedCount = 0;
      let unavailableCount = 0;

      for (const obj of textObjects) {
        // Ensure initial metadata
        if (!obj.originalText) {
          obj.originalText = obj.text || '';
          obj.translations = { en: obj.originalText };
          obj.sourceLanguage = 'en';
          obj.activeLanguage = 'en';
          obj.translationMode = 'replace';
          obj.originalFontFamily = obj.fontFamily;
          obj.originalFontSize = obj.fontSize;
          obj.isTranslatable = !isDynamicField(obj.originalText, obj.name, obj.fieldType);
        }

        // Skip dynamic/protected fields
        if (isDynamicField(obj.originalText, obj.name, obj.fieldType)) {
          continue;
        }

        // Switching back to English
        if (targetLang === 'en') {
          obj.set({
            text: obj.originalText,
            fontFamily: obj.originalFontFamily || 'Inter',
            fontSize: obj.originalFontSize || obj.fontSize,
            activeLanguage: 'en',
            translationMode: 'replace',
          });
          fitTranslatedText(obj, CANVAS_W, bgHeightRef.current);
          translatedCount++;
          continue;
        }

        // Check if translation is already cached
        let targetText = obj.translations?.[targetLang];
        if (!targetText) {
          const res = await translateText(obj.originalText, obj.sourceLanguage || 'en', targetLang);
          if (res.success && res.text) {
            targetText = res.text;
            obj.translations = { ...(obj.translations || {}), [targetLang]: targetText };
          }
        }

        if (targetText) {
          const langCfg = LANGUAGE_CONFIG[targetLang];
          const newFont = langCfg?.fontFamily || obj.fontFamily;

        obj.set({
            text: targetText,
            activeLanguage: targetLang,
            translationMode: 'replace',
            fontFamily: newFont,
          });
          
          fitTranslatedText(obj, CANVAS_W, bgHeightRef.current);
          translatedCount++;
        } else {
          unavailableCount++;
        }
      }

      canvas.requestRenderAll();
      const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS));
      undoStack.current.push(json);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setIsDirty(true);
      refreshLayersRef.current();

      setActiveLanguage(targetLang);
      setTranslationMode(mode);

      if (unavailableCount > 0 && translatedCount === 0) {
        setTranslationMessage('Translation unavailable for this text. Original text has been preserved.');
      } else if (unavailableCount > 0) {
        setTranslationMessage(`Translated with ${unavailableCount} phrase(s) preserved in original.`);
      } else {
        setTranslationMessage('');
      }
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslationMessage('Translation failed. Original text preserved.');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateSelectedText = useCallback(async (targetLang, mode = 'replace') => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || !(obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) return;

    setIsTranslating(true);
    setSelectedTranslationMessage('');
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      if (!obj.originalText) {
        obj.originalText = obj.text || '';
        obj.translations = { en: obj.originalText };
        obj.sourceLanguage = 'en';
        obj.activeLanguage = 'en';
        obj.translationMode = 'replace';
        obj.originalFontFamily = obj.fontFamily;
        obj.originalFontSize = obj.fontSize;
        obj.isTranslatable = !isDynamicField(obj.originalText, obj.name, obj.fieldType);
      }

      if (targetLang === 'en') {
        obj.set({
          text: obj.originalText,
          fontFamily: obj.originalFontFamily || 'Inter',
          fontSize: obj.originalFontSize || obj.fontSize,
          activeLanguage: 'en',
          translationMode: 'replace',
        });
        fitTranslatedText(obj, CANVAS_W, bgHeightRef.current);
      } else {
        let targetText = obj.translations?.[targetLang];
        if (!targetText) {
          const res = await translateText(obj.originalText, obj.sourceLanguage || 'en', targetLang);
          if (res.success && res.text) {
            targetText = res.text;
            obj.translations = { ...(obj.translations || {}), [targetLang]: targetText };
          }
        }

        if (targetText) {
          const langCfg = LANGUAGE_CONFIG[targetLang];
          const newFont = langCfg?.fontFamily || obj.fontFamily;
          obj.set({
            text: targetText,
            activeLanguage: targetLang,
            translationMode: 'replace',
            fontFamily: newFont,
          });

          fitTranslatedText(obj, CANVAS_W, bgHeightRef.current);
        } else {
          setSelectedTranslationMessage('Translation unavailable for this text. Original text has been preserved.');
        }
      }

      canvas.requestRenderAll();
      const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS));
      undoStack.current.push(json);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setIsDirty(true);
      refreshLayersRef.current();
      setActiveObject({ ...obj });
    } catch (err) {
      console.error('Selected text translation failed:', err);
      setSelectedTranslationMessage('Translation unavailable for this text. Original text has been preserved.');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // ── save ─────────────────────────────────────────────────────
  const save = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !request?.id) return;
    setSaveState('saving');
    setSaveError('');
    try {
      const json = canvas.toJSON(CUSTOM_PROPS);
      json.languageState = { activeLanguage, translationMode };
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.9 });

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        throw new Error('Please sign in to save your customized invitation.');
      }

      const blob = await (await fetch(dataUrl)).blob();
      const saveId = request.is_template ? `template_${Date.now()}` : request.id;
      const path = `${currentUser.id}/previews/${saveId}.png`;

      const { error: uploadError } = await supabase.storage
        .from(PREVIEW_BUCKET)
        .upload(path, blob, { upsert: true, contentType: 'image/png' });
      if (uploadError) console.warn('Preview upload notice:', uploadError.message);

      const { data: pub } = supabase.storage.from(PREVIEW_BUCKET).getPublicUrl(path);
      const previewUrl = pub?.publicUrl || dataUrl;

      if (request.is_template) {
        const { data: newRow, error: insertError } = await supabase
          .from('invitation_requests')
          .insert([
            {
              user_id: currentUser.id,
              template_id: request.template_id || request.id,
              event_name: request.event_name || 'My Celebration',
              event_type: request.event_type || 'wedding',
              theme: request.theme || null,
              venue: request.venue || 'Venue',
              date: request.date || new Date().toISOString().slice(0, 10),
              time: request.time || '18:00',
              phone: 'Not provided',
              email: currentUser.email || 'Not provided',
              generated_image_url: request.generated_image_url || null,
              editor_state: json,
              preview_url: previewUrl,
              status: 'Draft',
            },
          ])
          .select()
          .single();

        if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);
        request.id = newRow.id;
        request.is_template = false;
        request.user_id = currentUser.id;
      } else {
        const { error: updateError } = await supabase
          .from('invitation_requests')
          .update({ editor_state: json, preview_url: previewUrl })
          .eq('id', request.id);
        if (updateError) throw new Error(`Database update failed: ${updateError.message}`);
      }

      setIsDirty(false);
      setSaveState('saved');
      setLastSavedAt(new Date());
      onSaved?.(previewUrl);
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err.message || 'Unknown error while saving.');
      setSaveState('error');
    }
  }, [request, onSaved, activeLanguage, translationMode]);

  // ── autosave every 30s ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) save();
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, save]);

  // ── export for download ─────────────────────────────────────
  const exportImage = useCallback((format = 'png', multiplier = 2, opts = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const prevBg = canvas.backgroundColor;
    if (format === 'png' && opts.transparent) canvas.backgroundColor = null;
    const dataUrl = canvas.toDataURL({ format: format === 'jpg' ? 'jpeg' : 'png', quality: 0.95, multiplier });
    if (format === 'png' && opts.transparent) canvas.backgroundColor = prevBg;
    return dataUrl;
  }, []);

  const exportPdf = useCallback(async (multiplier = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { jsPDF } = await import('jspdf');
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.95, multiplier });
    const pdf = new jsPDF({
      orientation: CANVAS_H >= CANVAS_W ? 'portrait' : 'landscape',
      unit: 'px',
      format: [CANVAS_W, CANVAS_H],
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_W, CANVAS_H);
    return pdf;
  }, []);

  return {
    canvasElRef,
    canvasRef,
    activeObject,
    isDirty,
    zoom,
    saveState,
    saveError,
    lastSavedAt,
    layers,
    gridEnabled,
    snapToGrid,
    snapToObjects,
    activeLanguage,
    setActiveLanguage,
    translationMode,
    setTranslationMode,
    isTranslating,
    translationMessage,
    selectedTranslationMessage,
    translateInvitation,
    translateSelectedText,
    SUPPORTED_LANGUAGES,
    LANGUAGE_CONFIG,
    toggleGrid,
    toggleSnapToGrid,
    toggleSnapToObjects,
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
    duplicateObject,
    deleteObject,
    toggleLock,
    toggleLockObject,
    setObjectVisible,
    renameObject,
    bringForward,
    sendBackward,
    moveLayerToIndex,
    groupActive,
    ungroupActive,
    findObjectById,
    selectObjectById,
    addText,
    addShape,
    addIconFromSvg,
    recolorIcon,
    addImageFromFile,
    replaceActiveImage,
    setBackgroundColor,
    setBackgroundGradient,
    setBackgroundImageFile,
    applyImageFilter,
    save,
    exportImage,
    exportPdf,
  };
}

export const EDITOR_CANVAS_SIZE = { width: CANVAS_W, height: CANVAS_H };
