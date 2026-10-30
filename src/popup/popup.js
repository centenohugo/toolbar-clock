// Popup: lists the zones and holds the settings.

import { loadSettings, saveSettings, onSettingsChanged } from '../lib/settings.js';
import {
  systemTimeZone, resolveTimeZone, formatTime, offsetFrom, formatOffset, dayDelta,
  displayLabel, msUntilNextMinute,
} from '../lib/time.js';
import { h, t, replaceKeepingFocus } from './dom.js';

const locale = chrome.i18n.getUILanguage();

let settings;
let updaters = []; // one per visible time, called every minute

const app = document.getElementById('app');
const list = h('ul', { class: 'zones' });

/** Applies a change locally right away and persists it. */
function commit(change) {
  const next = structuredClone(settings);
  change(next);
  settings = next;
  render();
  saveSettings(next);
}

function timeText(now, timeZone) {
  return formatTime(now, timeZone, { hour12: settings.hour12, withDayPeriod: true, locale });
}

function zoneRow(zone) {
  const primary = zone.id === settings.primaryId;
  const timeZone = resolveTimeZone(zone);
  const time = h('span', { class: 'time' });
  const offset = h('span', { class: 'offset' });
  const day = h('span', { class: 'day' });

  updaters.push((now) => {
    const base = systemTimeZone();
    const delta = dayDelta(now, timeZone, base);
    time.textContent = timeText(now, timeZone);
    offset.textContent = formatOffset(offsetFrom(now, timeZone, base));
    day.textContent = delta > 0 ? t('tomorrow') : delta < 0 ? t('yesterday') : '';
  });

  const makePrimary = () => {
    if (!primary) commit((s) => { s.primaryId = zone.id; });
  };

  return h('li', { class: primary ? 'zone primary' : 'zone', onclick: makePrimary },
    h('div', { class: 'name' },
      h('button', {
        class: 'label',
        type: 'button',
        title: primary ? null : t('makePrimary'),
        'aria-current': primary ? 'true' : null,
        'aria-description': primary ? null : t('makePrimary'),
        'data-key': `row:${zone.id}`,
      }, displayLabel(zone, t('localZone'))),
      h('span', { class: 'sub' }, primary ? h('span', { class: 'hint' }, t('primaryHint')) : null),
    ),
    h('span', { class: 'shift' }, offset, day),
    time,
  );
}

function render() {
  updaters = [];
  replaceKeepingFocus(list, ...settings.zones.map(zoneRow));
  tick();
}

function tick() {
  const now = new Date();
  for (const update of updaters) update(now);
}

function scheduleTick() {
  setTimeout(() => {
    tick();
    scheduleTick();
  }, msUntilNextMinute(new Date()) + 20);
}

async function boot() {
  document.documentElement.lang = locale;
  document.title = t('extName');
  settings = await loadSettings();
  app.append(list);
  render();
  scheduleTick();
  onSettingsChanged((next) => {
    settings = next;
    render();
  });
}

boot();
