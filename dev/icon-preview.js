// Dev-only: draws renderIcon() output for a few text colors.

import { renderIcon } from '../src/icon/render.js';

const TIMES = [
  { label: '09:05', hours: '09', minutes: '05' },
  { label: '14:35', hours: '14', minutes: '35' },
  { label: '23:59', hours: '23', minutes: '59' },
  { label: '9:05 (12 h)', hours: '9', minutes: '05' },
  { label: '12:59 (12 h)', hours: '12', minutes: '59' },
];

const COLORS = [
  { label: 'white text', color: '#ffffff' },
  { label: 'dark text', color: '#202124' },
  { label: 'accent text', color: '#8ab4f8' },
];

const grid = document.getElementById('grid');
grid.append(row('th', ['Color', ...TIMES.map((t) => t.label)]));

for (const { label, color } of COLORS) {
  grid.append(row('td', [label, ...TIMES.map((t) => cell(renderIcon(t, { color })))]));
}

function row(tag, items) {
  const tr = document.createElement('tr');
  for (const item of items) {
    const el = document.createElement(tag);
    el.append(item);
    tr.append(el);
  }
  return tr;
}

function cell(images) {
  const wrap = document.createElement('div');
  for (const theme of ['light', 'dark']) {
    const strip = document.createElement('div');
    strip.className = `strip ${theme}`;
    for (const scale of [1, 4]) {
      for (const size of [16, 32]) strip.append(canvas(images[size], scale));
    }
    wrap.append(strip);
  }
  return wrap;
}

function canvas(imageData, scale) {
  const c = document.createElement('canvas');
  c.width = imageData.width;
  c.height = imageData.height;
  c.style.width = `${imageData.width * scale}px`;
  c.style.height = `${imageData.height * scale}px`;
  c.getContext('2d').putImageData(imageData, 0, 0);
  return c;
}
