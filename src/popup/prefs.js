// Settings section: time format and the icon text color. Every control saves
// on its own; the color only on `change`, since storage.sync has write quotas.

import { h, t } from './dom.js';

/**
 * @param {{ onChange: (change: (settings: object) => void) => void }} options
 */
export function createPrefs({ onChange }) {
  const syncers = [];

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

  syncers.push((s) => {
    color.value = s.icon.color;
  });

  const el = h('section', { class: 'prefs', hidden: true },
    segmented('timeFormat', [[false, 'format24'], [true, 'format12']],
      (s) => s.hour12, (s, v) => { s.hour12 = v; }),
    pref('textColor', 'pref-color', color),
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
