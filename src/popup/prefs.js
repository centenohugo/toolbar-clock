// Settings section: time format and the toolbar icon style. Every control
// saves on its own; colors only on `change`, since storage.sync has write quotas.

import { DEFAULT_SETTINGS } from '../lib/settings.js';
import { h, t } from './dom.js';

/**
 * @param {{ onChange: (change: (settings: object) => void) => void }} options
 */
export function createPrefs({ onChange }) {
  const syncers = [];
  let lastBackground = DEFAULT_SETTINGS.icon.background;

  const pref = (labelKey, labelFor, ...controls) => h('div', { class: 'pref' },
    h(labelFor ? 'label' : 'span', { class: 'pref-label', id: `${labelKey}-label`, htmlFor: labelFor }, t(labelKey)),
    h('div', { class: 'pref-controls' }, ...controls),
  );

  /** Two or more text buttons acting as a single choice. */
  const segmented = (labelKey, choices, get, set) => {
    const buttons = choices.map(([value, key]) => h('button', {
      class: 'segment',
      type: 'button',
      onclick: () => onChange((s) => set(s, value)),
    }, t(key)));
    syncers.push((s) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(get(s) === choices[i][0]))));
    return pref(labelKey, null,
      h('div', { class: 'segmented', role: 'group', 'aria-labelledby': `${labelKey}-label` }, ...buttons));
  };

  const color = h('input', {
    class: 'swatch',
    type: 'color',
    id: 'pref-color',
    onchange: () => onChange((s) => { s.icon.color = color.value; }),
  });

  const background = h('input', {
    class: 'swatch',
    type: 'color',
    id: 'pref-background',
    onchange: () => onChange((s) => { s.icon.background = background.value; }),
  });

  const transparent = h('input', {
    type: 'checkbox',
    onchange: () => onChange((s) => { s.icon.background = transparent.checked ? null : lastBackground; }),
  });

  const bold = h('input', {
    type: 'checkbox',
    id: 'pref-bold',
    onchange: () => onChange((s) => { s.icon.bold = bold.checked; }),
  });

  syncers.push((s) => {
    const bg = s.icon.background;
    if (bg) lastBackground = bg;
    color.value = s.icon.color;
    background.value = lastBackground;
    background.disabled = bg === null;
    transparent.checked = bg === null;
    bold.checked = s.icon.bold;
  });

  const el = h('section', { class: 'prefs', hidden: true },
    segmented('timeFormat', [[false, 'format24'], [true, 'format12']],
      (s) => s.hour12, (s, v) => { s.hour12 = v; }),
    segmented('layout', [['horizontal', 'layoutHorizontal'], ['stacked', 'layoutStacked']],
      (s) => s.icon.layout, (s, v) => { s.icon.layout = v; }),
    segmented('textSize', [['tight', 'fitTight'], ['roomy', 'fitRoomy']],
      (s) => s.icon.fit, (s, v) => { s.icon.fit = v; }),
    pref('textColor', 'pref-color', color),
    pref('background', 'pref-background', background,
      h('label', { class: 'check' }, transparent, t('transparent'))),
    pref('bold', 'pref-bold', bold),
  );

  return {
    el,
    get open() {
      return !el.hidden;
    },
    show() {
      el.hidden = false;
    },
    hide() {
      el.hidden = true;
    },
    sync(settings) {
      for (const sync of syncers) sync(settings);
    },
  };
}
