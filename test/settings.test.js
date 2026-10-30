import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings, primaryZone } from '../src/lib/settings.js';

test('normalizeSettings returns defaults for empty input', () => {
  assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
});

test('normalizeSettings keeps stored values and fills missing icon fields', () => {
  const s = normalizeSettings({ hour12: true, icon: { layout: 'stacked' } });
  assert.equal(s.hour12, true);
  assert.equal(s.icon.layout, 'stacked');
  assert.equal(s.icon.color, DEFAULT_SETTINGS.icon.color);
});

test('normalizeSettings falls back to the first zone when primaryId is unknown', () => {
  const zones = [{ id: 'a', timeZone: 'Asia/Tokyo', label: '' }];
  const s = normalizeSettings({ zones, primaryId: 'gone' });
  assert.equal(s.primaryId, 'a');
  assert.equal(primaryZone(s).timeZone, 'Asia/Tokyo');
});
