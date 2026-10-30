// Draws the toolbar icon. Runs in the service worker, so it only uses
// OffscreenCanvas (no DOM). The look is fixed: hours over minutes, bold,
// filling the whole icon on a transparent background.

const SIZES = [16, 32];
const FONT = (px) => `700 ${px}px system-ui, "Segoe UI", sans-serif`;

// Font sizes only depend on the icon size and digit count, so they are
// worked out once and reused every minute.
const fontSizeCache = new Map();

/**
 * Renders the time into icon bitmaps for chrome.action.setIcon.
 * @param {{ hours: string, minutes: string }} parts  From getTimeParts().
 * @param {import('../lib/settings.js').IconStyle} style
 * @returns {Record<number, ImageData>}  Keyed by size in px (16 and 32).
 */
export function renderIcon(parts, style) {
  const images = {};
  for (const size of SIZES) images[size] = renderSize(parts, style, size);
  return images;
}

function renderSize(parts, style, size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Layout is measured on "8"s of the same length as the real text, so the
  // digits sit in fixed cells and nothing shifts from one minute to the next.
  const template = {
    hours: '8'.repeat(parts.hours.length),
    minutes: '8'.repeat(parts.minutes.length),
  };
  const gap = size / 16;
  const key = [size, template.hours.length, template.minutes.length].join();
  if (!fontSizeCache.has(key)) {
    fontSizeCache.set(key, largestFit((px) => measure(ctx, px, template, gap), size));
  }
  const m = measure(ctx, fontSizeCache.get(key), template, gap);

  ctx.fillStyle = style.color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  const top = (size - m.height) / 2;
  const first = Math.round(top + m.ascent);
  const second = Math.round(top + m.ascent + m.descent + gap + m.ascent);
  drawCentered(ctx, parts.hours, m.hours, size, first);
  drawCentered(ctx, parts.minutes, m.minutes, size, second);

  return ctx.getImageData(0, 0, size, size);
}

/** Ink box of the two template lines at `px`. */
function measure(ctx, px, template, gap) {
  ctx.font = FONT(px);
  const hours = ctx.measureText(template.hours);
  const minutes = ctx.measureText(template.minutes);
  const ascent = Math.max(hours.actualBoundingBoxAscent, minutes.actualBoundingBoxAscent);
  const descent = Math.max(hours.actualBoundingBoxDescent, minutes.actualBoundingBoxDescent);
  return {
    hours,
    minutes,
    ascent,
    descent,
    width: Math.max(width(hours), width(minutes)),
    height: 2 * (ascent + descent) + gap,
  };
}

/** Largest font size, in half pixels, whose text fits a `box` x `box` square. */
function largestFit(measureAt, box) {
  let lo = 1;
  let hi = box * 2;
  while (hi - lo > 0.5) {
    const mid = Math.round(lo + hi) / 2;
    const m = measureAt(mid);
    if (m.width <= box && m.height <= box) lo = mid;
    else hi = mid;
  }
  return lo;
}

function drawCentered(ctx, text, templateMetrics, size, baseline) {
  const x = (size - width(templateMetrics)) / 2 + templateMetrics.actualBoundingBoxLeft;
  ctx.fillText(text, Math.round(x), baseline);
}

function width(metrics) {
  return metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
}
