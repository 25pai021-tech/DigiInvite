import QRCode from 'qrcode';
import { fabric } from 'fabric';

export async function addMapQr(canvas, mapLink, bgHeight, done) {
  const link = (mapLink || '').trim();
  if (!link) { done?.(); return; }

  try {
    const dataUrl = await QRCode.toDataURL(link, {
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });

    fabric.Image.fromURL(dataUrl, (img) => {
      const size = 120;
      img.scaleToWidth(size);
      img.set({
        left: 800 - size - 40,
        top: bgHeight - size - 70,
        name: 'map_qr',
        cornerColor: '#8B5CF6',
        cornerStyle: 'circle',
        transparentCorners: false,
      });

      const label = new fabric.Text('Scan for location', {
        left: 800 - size - 40,
        top: bgHeight - 62,
        fontSize: 18,
        fontFamily: 'Inter',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 0.8,
        paintFirst: 'stroke',
        name: 'map_qr_label',
      });

      canvas.add(img);
      canvas.add(label);
      canvas.requestRenderAll();
      done?.();
    });
  } catch (e) {
    console.warn('Map QR failed:', e);
    done?.();
  }
}