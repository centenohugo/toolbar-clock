# Toolbar Clock

A minimal digital clock in the browser toolbar. The icon shows the time of one
zone; click it to see all your zones and change the settings.

Works in Brave, Chrome, Edge and any Chromium browser (Manifest V3). Only asks
for the `storage` and `alarms` permissions.

## Install for development

1. Open `brave://extensions` (or `chrome://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and pick this folder.
4. Pin the extension from the extensions menu so it stays in the toolbar.

## Tests

```sh
npm test
```

Uses `node:test`, no dependencies. Requires Node 20+.

## Layout

```
manifest.json
_locales/{en,es}/messages.json   UI strings
src/background.js                service worker, redraws the icon every minute
src/icon/render.js               draws the icon with OffscreenCanvas
src/lib/time.js                  pure time helpers (tested)
src/lib/settings.js              settings schema and storage
src/popup/                       popup UI
test/                            node:test suites
dev/                             popup preview with a stubbed chrome API
```

## License

MIT
