# Changelog

## 0.2.0 - 2026-04-30

- Hardened backup restore validation against malformed JSON, oversized files,
  invalid date keys, unsafe record keys, bad reminder values, and out-of-range
  profile/tracking values.
- Fixed local date handling so progress entries, backup filenames, tracking
  keys, and missed-workout labels do not shift days in negative UTC timezones.
- Fixed the missed-workout "Do it today" flow so it no longer marks the planned
  workout card as complete when the stored workout belongs to another day.
- Resolved the dependency audit finding by overriding `serialize-javascript` to
  the patched `7.0.5` release.
- Tightened TypeScript checks with strict null, unchecked index, unused symbol,
  optional property, and casing validation.
- Improved browser resilience when `localStorage` is unavailable or corrupted.
- Removed the external Google Fonts request for a more private, offline-friendly
  PWA shell.
- Changed the default dev server to bind locally, with `npm run dev:host`
  available for explicit LAN testing.
- Stress-tested the app end to end across desktop and mobile navigation, Today,
  Workouts, Grocery, Progress, Settings, backup/restore, malformed import, and
  reset flows.

## 0.1.0 - 2026-04-30

- Initial installable V-Fit Planner PWA with workouts, daily tracking, meal
  guidance, grocery list, progress logs, settings, local backup/restore, and
  offline support.
