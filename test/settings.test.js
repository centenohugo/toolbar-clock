import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings, primaryZone } from '../src/lib/settings.js';

test('normalizeSettings returns defaults for empty input', () => {
  assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
});

test('normalizeSettings keeps stored values and drops unknown icon fields', () => {
  const s = normalizeSettings({ hour12: true, icon: { color: '#ff0000', layout: 'horizontal' } });
  assert.equal(s.hour12, true);
  assert.deepEqual(s.icon, { color: '#ff0000' });
});

test('normalizeSettings fills a missing icon color', () => {
  assert.equal(normalizeSettings({ icon: {} }).icon.color, DEFAULT_SETTINGS.icon.color);
});

test('normalizeSettings falls back to the first zone when primaryId is unknown', () => {
  const zones = [{ id: 'a', timeZone: 'Asia/Tokyo', label: '' }];
  const s = normalizeSettings({ zones, primaryId: 'gone' });
  assert.equal(s.primaryId, 'a');
  assert.equal(primaryZone(s).timeZone, 'Asia/Tokyo');
});
