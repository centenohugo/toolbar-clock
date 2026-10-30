// Draws the toolbar icon. Runs in the service worker, so it only uses
// OffscreenCanvas (no DOM).

/**
 * Renders the time into icon bitmaps for chrome.action.setIcon.
 * @param {{ hours: string, minutes: string }} parts  From getTimeParts().
 * @param {import('../lib/settings.js').IconStyle} style
 * @returns {Record<number, ImageData>}  Keyed by size in px (16 and 32).
 */
export function renderIcon(parts, style) {
  throw new Error('not implemented');
}
