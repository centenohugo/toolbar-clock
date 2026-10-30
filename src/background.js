// Service worker: keeps the toolbar icon showing the primary zone's time,
// redrawn at the start of every minute and whenever settings change.

import { renderIcon } from './icon/render.js';
import { loadSettings, onSettingsChanged, primaryZone } from './lib/settings.js';
import { displayLabel, formatTime, getTimeParts, msUntilNextMinute, resolveTimeZone } from './lib/time.js';

const ALARM = 'tick';

async function draw() {
  const settings = await loadSettings();
  const zone = primaryZone(settings);
  const timeZone = resolveTimeZone(zone);
  const hour12 = settings.hour12;
  const now = new Date();

  // The icon has no room for AM/PM; the tooltip spells it out.
  await chrome.action.setIcon({ imageData: renderIcon(getTimeParts(now, timeZone, hour12), settings.icon) });
  const label = displayLabel(zone, chrome.i18n.getMessage('localZone'));
  const time = formatTime(now, timeZone, { hour12, withDayPeriod: true, locale: chrome.i18n.getUILanguage() });
  await chrome.action.setTitle({ title: `${label} ${time}` });
}

/** Wakes the worker just after the next minute starts (replaces any pending tick). */
function schedule() {
  const delay = msUntilNextMinute(new Date()) + 50;
  chrome.alarms.create(ALARM, { when: Date.now() + delay });
  // Alarms never fire sooner than 30 s; the timer covers that gap while the
  // worker is still awake.
  if (delay < 30_000) setTimeout(update, delay);
}

// Updates requested while one is running collapse into a single redraw after it.
let running = null;
let again = false;

function update() {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        again = false;
        try {
          await draw();
        } catch (error) {
          console.error('Toolbar Clock: redraw failed', error);
        }
      } while (again);
      schedule();
    } finally {
      running = null;
    }
  })();
  return running;
}

// Alarms can fire late (e.g. after sleep); draw() always uses the current time.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) update();
});
chrome.runtime.onInstalled.addListener(update);
chrome.runtime.onStartup.addListener(update);
onSettingsChanged(update);

update();
