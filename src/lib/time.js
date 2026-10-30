// Pure time helpers shared by the service worker and the popup. No chrome.*
// APIs here, so everything can be tested with node:test.

/** IANA name of the system time zone. */
export function systemTimeZone() {
  throw new Error('not implemented');
}

/**
 * Time zone to use for a stored zone: its own, or the system one when null.
 * @param {{ timeZone: string|null }} zone
 * @returns {string}
 */
export function resolveTimeZone(zone) {
  throw new Error('not implemented');
}

/**
 * Hours and minutes in a zone, ready to draw.
 * 24 h: hours zero-padded ("09"). 12 h: no padding ("9"), with dayPeriod.
 * @param {Date} date
 * @param {string} timeZone
 * @param {boolean} hour12
 * @returns {{ hours: string, minutes: string, dayPeriod: 'am'|'pm'|null }}
 */
export function getTimeParts(date, timeZone, hour12) {
  throw new Error('not implemented');
}

/**
 * Time as text. "14:35" in 24 h; "2:35" in 12 h, or the locale's full
 * 12 h form ("2:35 p. m.", "2:35 PM") when withDayPeriod is true.
 * @param {Date} date
 * @param {string} timeZone
 * @param {{ hour12: boolean, withDayPeriod?: boolean, locale?: string }} options
 * @returns {string}
 */
export function formatTime(date, timeZone, options) {
  throw new Error('not implemented');
}

/**
 * Minutes that `timeZone` is ahead of `baseTimeZone` at `date` (negative if behind).
 * @returns {number}
 */
export function offsetFrom(date, timeZone, baseTimeZone) {
  throw new Error('not implemented');
}

/**
 * Offset as shown in the popup: "+0 h", "+7 h", "−3 h", "+5:30 h", "−9:30 h".
 * Uses the real minus sign (U+2212).
 * @param {number} minutes
 * @returns {string}
 */
export function formatOffset(minutes) {
  throw new Error('not implemented');
}

/**
 * Calendar day of `timeZone` relative to `baseTimeZone` at `date`: -1, 0 or 1.
 * @returns {-1|0|1}
 */
export function dayDelta(date, timeZone, baseTimeZone) {
  throw new Error('not implemented');
}

/**
 * Human city name from an IANA id: "America/New_York" -> "New York",
 * "America/Argentina/Buenos_Aires" -> "Buenos Aires".
 * @param {string} timeZone
 * @returns {string}
 */
export function cityName(timeZone) {
  throw new Error('not implemented');
}

/**
 * Label to show for a zone: the custom label, else the city name, else
 * `localLabel` for the system zone.
 * @param {{ timeZone: string|null, label: string }} zone
 * @param {string} localLabel
 * @returns {string}
 */
export function displayLabel(zone, localLabel) {
  throw new Error('not implemented');
}

/**
 * Up to `limit` IANA ids matching `query`, case- and accent-insensitive,
 * matching city or region; city prefix matches first. Also matches common
 * Spanish exonyms ("Nueva York", "Londres", "Tokio").
 * @param {string} query
 * @param {{ limit?: number, timeZones?: string[] }} [options]
 * @returns {string[]}
 */
export function searchTimeZones(query, options) {
  throw new Error('not implemented');
}

/**
 * Milliseconds from `date` to the start of the next minute.
 * @param {Date} date
 * @returns {number}
 */
export function msUntilNextMinute(date) {
  throw new Error('not implemented');
}
