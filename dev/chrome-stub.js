// Minimal in-memory stand-in for the chrome.* APIs the popup uses, so it can
// be previewed in a normal tab. Dev only, never loaded by the extension.

/**
 * @param {{ locale?: string, settings?: object }} [options]
 */
export async function installChromeStub({ locale = 'es', settings } = {}) {
  const url = new URL(`../_locales/${locale}/messages.json`, import.meta.url);
  const messages = await (await fetch(url)).json();

  const data = settings ? { settings: structuredClone(settings) } : {};
  const listeners = new Set();

  const keysOf = (keys) => {
    if (keys == null) return Object.keys(data);
    if (typeof keys === 'string') return [keys];
    return Array.isArray(keys) ? keys : Object.keys(keys);
  };

  globalThis.chrome = {
    storage: {
      sync: {
        async get(keys) {
          return Object.fromEntries(
            keysOf(keys).filter((k) => k in data).map((k) => [k, structuredClone(data[k])]),
          );
        },
        async set(items) {
          console.debug('storage.sync.set', items);
          const changes = {};
          for (const [k, v] of Object.entries(items)) {
            changes[k] = { oldValue: data[k], newValue: structuredClone(v) };
            data[k] = structuredClone(v);
          }
          setTimeout(() => listeners.forEach((fn) => fn(structuredClone(changes), 'sync')));
        },
      },
      onChanged: {
        addListener: (fn) => listeners.add(fn),
        removeListener: (fn) => listeners.delete(fn),
      },
    },
    i18n: {
      getMessage: (key) => messages[key]?.message ?? '',
      getUILanguage: () => locale,
    },
  };
}
