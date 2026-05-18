import { describe, it, expect } from 'vitest';
import { validateImport, SCHEMA_VERSION } from './validateImport';
import { defaultWorkouts, defaultGroceries, defaultProfile } from '../data/initialData';

// Minimum payload that should pass validation.
function minimalPayload() {
  return {
    schemaVersion: SCHEMA_VERSION,
    workouts: defaultWorkouts,
    groceries: defaultGroceries,
    progress: [],
    tracking: {},
    reminders: {
      workoutReminderTime: '18:30',
      proteinReminderTime: '21:00',
      creatineReminderTime: '21:00',
      mealPrepReminderDay: 'Sunday',
      waterReminderEnabled: true,
    },
    profile: defaultProfile,
  };
}

describe('validateImport', () => {
  it('accepts a well-formed minimal payload', () => {
    const out = validateImport(minimalPayload());
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.workouts.length).toBeGreaterThan(0);
  });

  it('rejects a non-object payload', () => {
    expect(() => validateImport('not an object')).toThrow();
    expect(() => validateImport(null)).toThrow();
    expect(() => validateImport(42)).toThrow();
  });

  it('rejects a payload from a newer schema version', () => {
    const bad = { ...minimalPayload(), schemaVersion: SCHEMA_VERSION + 5 };
    expect(() => validateImport(bad)).toThrow(/newer schema/i);
  });

  it('rejects required arrays that are not arrays', () => {
    expect(() => validateImport({ ...minimalPayload(), workouts: 'oops' })).toThrow();
    expect(() => validateImport({ ...minimalPayload(), groceries: {} })).toThrow();
    expect(() => validateImport({ ...minimalPayload(), progress: null })).toThrow();
  });

  it('rejects tracking with unsafe prototype-pollution keys (JSON-parsed path)', () => {
    // Object literals interpret `__proto__:` specially and do NOT make it an
    // own property. JSON.parse is the real attack vector, so reconstruct via
    // JSON to get an enumerable `__proto__` key. validateImport must reject
    // it (either as unsafe key or non-date key).
    const valid = minimalPayload();
    const evilJson = `{"schemaVersion":${SCHEMA_VERSION},"workouts":${JSON.stringify(
      valid.workouts,
    )},"groceries":${JSON.stringify(
      valid.groceries,
    )},"progress":[],"tracking":{"__proto__":{"creatine":true,"water":true,"shake1":false,"shake2":false,"workoutCompleted":null}},"reminders":${JSON.stringify(
      valid.reminders,
    )},"profile":${JSON.stringify(valid.profile)}}`;
    const evil = JSON.parse(evilJson);
    expect(() => validateImport(evil)).toThrow();
  });

  it('drops orphan workoutCompleted ids on import', () => {
    const valid = minimalPayload();
    const orphanId = '00000000-aaaa-bbbb-cccc-deadbeef0000';
    const date = '2026-05-18';
    const out = validateImport({
      ...valid,
      tracking: {
        [date]: {
          creatine: false,
          water: false,
          shake1: false,
          shake2: false,
          workoutCompleted: orphanId,
        },
      },
    });
    expect(out.tracking[date]?.workoutCompleted).toBeNull();
  });

  it('drops orphan exercise-tracking ids and removes empty exercises maps', () => {
    const valid = minimalPayload();
    const orphanExId = 'orphan-exercise-id';
    const date = '2026-05-18';
    const out = validateImport({
      ...valid,
      tracking: {
        [date]: {
          creatine: false,
          water: false,
          shake1: false,
          shake2: false,
          workoutCompleted: null,
          exercises: { [orphanExId]: { status: 'done' } },
        },
      },
    });
    expect(out.tracking[date]?.exercises).toBeUndefined();
  });

  it('clamps sleep hours to 0-14 on import', () => {
    const valid = minimalPayload();
    const date = '2026-05-18';
    const out = validateImport({
      ...valid,
      tracking: {
        [date]: {
          creatine: false,
          water: false,
          shake1: false,
          shake2: false,
          workoutCompleted: null,
          sleepHours: 99,
        },
      },
    });
    expect(out.tracking[date]?.sleepHours).toBe(14);
  });

  it('migrates legacy mealPrepMissed boolean to mealPrepBoxesDone', () => {
    const valid = minimalPayload();
    const date = '2026-05-18';
    const out = validateImport({
      ...valid,
      tracking: {
        [date]: {
          creatine: false,
          water: false,
          shake1: false,
          shake2: false,
          workoutCompleted: null,
          // legacy field, current schema reads it for back-compat:
          mealPrepMissed: true,
        },
      },
    });
    expect(out.tracking[date]?.mealPrepBoxesDone).toBe(0);
  });

  it('rejects malformed date keys in tracking', () => {
    const bad = {
      ...minimalPayload(),
      tracking: {
        'not-a-date': {
          creatine: false,
          water: false,
          shake1: false,
          shake2: false,
          workoutCompleted: null,
        },
      },
    };
    expect(() => validateImport(bad)).toThrow();
  });
});
