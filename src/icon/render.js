// Draws the toolbar icon. Runs in the service worker, so it only uses
// OffscreenCanvas (no DOM).

const SIZES = [16, 32];
const FONT_FAMILY = 'system-ui, "Segoe UI", sans-serif';

// Font sizes only depend on the size, style and digit count, so they are
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

  if (style.background) {
    ctx.fillStyle = style.background;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();
  }

  // Layout is measured on "8"s of the same length as the real text, so the
  // digits sit in fixed cells and nothing shifts from one minute to the next.
  const template = {
    hours: '8'.repeat(parts.hours.length),
    minutes: '8'.repeat(parts.minutes.length),
  };
  const box = size - 2 * padding(style, size);
  const gap = size / 16;
  const key = [size, style.layout, style.fit, style.bold, !!style.background, template.hours.length, template.minutes.length].join();
  if (!fontSizeCache.has(key)) {
    fontSizeCache.set(key, largestFit((px) => measure(ctx, style, px, template, gap), box));
  }
  const m = measure(ctx, style, fontSizeCache.get(key), template, gap);

  ctx.fillStyle = style.color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  if (style.layout === 'stacked') {
    const top = (size - m.height) / 2;
    const first = Math.round(top + m.ascent);
    const second = Math.round(top + m.ascent + m.descent + gap + m.ascent);
    drawCentered(ctx, parts.hours, m.hours, size, first);
    drawCentered(ctx, parts.minutes, m.minutes, size, second);
  } else {
    const baseline = Math.round((size - m.height) / 2 + m.ascent);
    const colonLeft = (size - m.width) / 2 + width(m.hours) + gap;
    // Hours end just before the colon, minutes start just after it.
    ctx.fillText(parts.hours, Math.round(colonLeft - gap - m.hours.actualBoundingBoxRight), baseline);
    ctx.fillText(parts.minutes, Math.round(colonLeft + width(m.colon) + gap + m.minutes.actualBoundingBoxLeft), baseline);
    // Center the colon on the digits instead of leaving it on the baseline.
    const digitMiddle = baseline - (m.ascent - m.descent) / 2;
    const colonBaseline = digitMiddle + (m.colon.actualBoundingBoxAscent - m.colon.actualBoundingBoxDescent) / 2;
    ctx.fillText(':', Math.round(colonLeft + m.colon.actualBoundingBoxLeft), Math.round(colonBaseline));
  }

  return ctx.getImageData(0, 0, size, size);
}

/** Space left between the icon edge and the text. */
function padding(style, size) {
  if (style.fit === 'roomy') return size * 0.16;
  // Tight: use every pixel, but keep text off the edge of a filled background.
  return style.background ? size / 16 : 0;
}

/** Ink box of the template text at `px`, laid out for the style. */
function measure(ctx, style, px, template, gap) {
  ctx.font = `${style.bold ? 700 : 500} ${px}px ${FONT_FAMILY}`;
  const hours = ctx.measureText(template.hours);
  const minutes = ctx.measureText(template.minutes);
  const colon = ctx.measureText(':');
  const ascent = Math.max(hours.actualBoundingBoxAscent, minutes.actualBoundingBoxAscent);
  const descent = Math.max(hours.actualBoundingBoxDescent, minutes.actualBoundingBoxDescent);
  const lineHeight = ascent + descent;

  return style.layout === 'stacked'
    ? { px, hours, minutes, colon, ascent, descent, width: Math.max(width(hours), width(minutes)), height: 2 * lineHeight + gap }
    : { px, hours, minutes, colon, ascent, descent, width: width(hours) + gap + width(colon) + gap + width(minutes), height: lineHeight };
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
