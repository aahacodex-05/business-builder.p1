import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';
const { openWindows, formatTimeLeft } = await import('../src/alerts.js');

const HOUR = 3600_000;
const due = new Date('2026-11-01T12:00:00Z');
const at = (msBefore) => new Date(due - msBefore);
const defaults = [10080, 1440, 60];

test('no alert before the first window opens', () => {
  assert.deepEqual(openWindows(due, at(8 * 24 * HOUR), defaults, new Set()), []);
});

test('each window fires once', () => {
  assert.deepEqual(openWindows(due, at(6 * 24 * HOUR), defaults, new Set()), [10080]);
  assert.deepEqual(openWindows(due, at(6 * 24 * HOUR), defaults, new Set([10080])), []);
  assert.deepEqual(openWindows(due, at(30 * 60_000), defaults, new Set([10080, 1440])), [60]);
});

test('missed windows collapse into one alert', () => {
  assert.deepEqual(openWindows(due, at(30 * 60_000), defaults, new Set()), [10080, 1440, 60]);
});

test('nothing after the deadline passes', () => {
  assert.deepEqual(openWindows(due, at(-1), defaults, new Set()), []);
});

test('time left reads naturally', () => {
  assert.equal(formatTimeLeft(7 * 24 * HOUR), '7 days');
  assert.equal(formatTimeLeft(HOUR), '1 hour');
  assert.equal(formatTimeLeft(5 * 60_000), '5 minutes');
});
