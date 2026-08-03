import React from 'react';

const STEP = 50; // canvas units between tick marks

export default function Rulers({ width, height, zoom }) {
  const hTicks = [];
  for (let x = 0; x <= width; x += STEP) hTicks.push(x);
  const vTicks = [];
  for (let y = 0; y <= height; y += STEP) vTicks.push(y);

  return (
    <>
      <div className="editor-ruler editor-ruler-h" style={{ width: width * zoom }}>
        {hTicks.map((x) => (
          <span key={x} style={{ left: x * zoom }}>{x}</span>
        ))}
      </div>
      <div className="editor-ruler editor-ruler-v" style={{ height: height * zoom }}>
        {vTicks.map((y) => (
          <span key={y} style={{ top: y * zoom }}>{y}</span>
        ))}
      </div>
    </>
  );
}
