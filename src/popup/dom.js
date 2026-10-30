// Small DOM helpers. Text always goes in through text nodes, never as HTML.

export const t = (key) => chrome.i18n.getMessage(key);

/**
 * Creates an element. Props starting with "on" become listeners, known
 * properties are assigned, anything else (aria-*, data-*) is an attribute.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in el) el[key] = value;
    else el.setAttribute(key, String(value));
  }
  el.append(...children.filter((c) => c != null && c !== false));
  return el;
}

/** Replaces the children of `parent`, keeping focus on the element with the same data-key. */
export function replaceKeepingFocus(parent, ...children) {
  const key = document.activeElement?.dataset?.key;
  parent.replaceChildren(...children);
  if (key) parent.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus();
}
