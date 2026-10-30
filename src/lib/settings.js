// Settings live in chrome.storage.sync under a single key so they follow the
// user across devices. Every reader goes through loadSettings(), which fills
// in defaults for anything missing.

const STORAGE_KEY = 'settings';

export const MAX_ZONES = 20;

/**
 * @typedef {Object} Zone
 * @property {string} id         Stable id, 'local' for the initial zone.
 * @property {string|null} timeZone  IANA name, or null to follow the system zone.
 * @property {string} label      Custom label; empty means "derive from the zone".
 *
 * @typedef {Object} IconStyle
 * @property {'horizontal'|'stacked'} layout
 * @property {'tight'|'roomy'} fit
 * @property {string} color          Text color, #rrggbb.
 * @property {string|null} background  #rrggbb, or null for transparent.
 * @property {boolean} bold
 *
 * @typedef {Object} Settings
 * @property {number} version
 * @property {Zone[]} zones
 * @property {string} primaryId   Id of the zone drawn in the toolbar.
 * @property {boolean} hour12
 * @property {IconStyle} icon
 */

/** @type {Settings} */
export const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  zones: [{ id: 'local', timeZone: null, label: '' }],
  primaryId: 'local',
  hour12: false,
  icon: {
    layout: 'horizontal',
    fit: 'tight',
    color: '#ffffff',
    background: '#202124',
    bold: true,
  },
});

/** @returns {Settings} */
export function normalizeSettings(raw) {
  const base = structuredClone(DEFAULT_SETTINGS);
  if (!raw || typeof raw !== 'object') return base;

  const zones = Array.isArray(raw.zones) && raw.zones.length > 0 ? raw.zones : base.zones;
  const primaryId = zones.some((z) => z.id === raw.primaryId) ? raw.primaryId : zones[0].id;

  return {
    version: base.version,
    zones,
    primaryId,
    hour12: typeof raw.hour12 === 'boolean' ? raw.hour12 : base.hour12,
    icon: { ...base.icon, ...(raw.icon || {}) },
  };
}

/** @returns {Promise<Settings>} */
export async function loadSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  return normalizeSettings(stored[STORAGE_KEY]);
}

/** @param {Settings} settings */
export async function saveSettings(settings) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: normalizeSettings(settings) });
}

/** Calls back with the new settings whenever they change, from any context. */
export function onSettingsChanged(callback) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && STORAGE_KEY in changes) {
      callback(normalizeSettings(changes[STORAGE_KEY].newValue));
    }
  });
}

/** @returns {Zone} */
export function primaryZone(settings) {
  return settings.zones.find((z) => z.id === settings.primaryId) || settings.zones[0];
}

export function newZoneId() {
  return Math.random().toString(36).slice(2, 10);
}
