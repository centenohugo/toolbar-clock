// Compact zone search: an input with up to five suggestions under it.

import { searchTimeZones, cityName } from '../lib/time.js';
import { h, t } from './dom.js';

const LIMIT = 5;

const region = (timeZone) => (timeZone.includes('/') ? timeZone.split('/')[0].replace(/_/g, ' ') : '');

/**
 * @param {{
 *   taken: () => Set<string>,
 *   timeText: (now: Date, timeZone: string) => string,
 *   onPick: (timeZone: string) => void,
 *   onClose: () => void,
 * }} options
 */
export function createSearch({ taken, timeText, onPick, onClose }) {
  let results = [];
  let active = 0;

  const input = h('input', {
    class: 'search-input',
    type: 'text',
    role: 'combobox',
    placeholder: t('searchPlaceholder'),
    autocomplete: 'off',
    spellcheck: false,
    'aria-label': t('addZone'),
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': 'suggestions',
  });
  const list = h('ul', { class: 'suggestions', id: 'suggestions', role: 'listbox', 'aria-label': t('addZone') });
  const el = h('section', { class: 'search', hidden: true }, input, list);

  function setActive(index) {
    active = index;
    list.querySelectorAll('[role=option]').forEach((li, i) => li.setAttribute('aria-selected', String(i === index)));
    if (results.length) input.setAttribute('aria-activedescendant', `suggestion-${index}`);
    else input.removeAttribute('aria-activedescendant');
  }

  function refresh() {
    const query = input.value.trim();
    const skip = taken();
    results = query
      ? searchTimeZones(query, { limit: LIMIT + skip.size }).filter((tz) => !skip.has(tz)).slice(0, LIMIT)
      : [];
    const now = new Date();
    list.replaceChildren(...results.map((tz, i) => h('li', {
      class: 'suggestion',
      id: `suggestion-${i}`,
      role: 'option',
      onmousedown: (event) => event.preventDefault(), // keep focus in the input
      onmousemove: () => active !== i && setActive(i),
      onclick: () => onPick(tz),
    },
      h('span', { class: 'city' }, cityName(tz)),
      h('span', { class: 'region' }, region(tz)),
      h('span', { class: 'suggestion-time' }, timeText(now, tz)),
    )));
    if (query && !results.length) list.append(h('li', { class: 'empty' }, t('noResults')));
    input.setAttribute('aria-expanded', String(results.length > 0));
    setActive(Math.min(active, Math.max(results.length - 1, 0)));
  }

  input.addEventListener('input', () => {
    active = 0;
    refresh();
  });

  input.addEventListener('keydown', (event) => {
    const n = results.length;
    if (event.key === 'ArrowDown' && n) setActive((active + 1) % n);
    else if (event.key === 'ArrowUp' && n) setActive((active - 1 + n) % n);
    else if (event.key === 'Enter' && n) onPick(results[active]);
    else if (event.key === 'Escape') onClose();
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  return {
    el,
    get open() {
      return !el.hidden;
    },
    show() {
      el.hidden = false;
      input.value = '';
      active = 0;
      refresh();
      input.focus();
    },
    hide() {
      el.hidden = true;
    },
    refresh() {
      if (!el.hidden) refresh();
    },
  };
}
