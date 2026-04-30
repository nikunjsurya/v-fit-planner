import { v4 as uuidv4 } from 'uuid';
import {
  WorkoutDay,
  Exercise,
  CardioConfig,
  GroceryCategory,
  GroceryItem,
  UserProfile,
  defaultProfile,
  WorkoutSlot,
} from '../data/initialData';
import { isDateKey } from './dateKeys';

// Pure structural validator + migrator for backup files. No React, no DOM.
// On success returns a clean payload that is safe to feed into the context
// setters. On failure returns a string with a short reason for the UI.

export const SCHEMA_VERSION = 1;

const VALID_SLOTS: WorkoutSlot[] = ['push', 'pull', 'legs', 'shoulders'];
const VALID_REMINDER_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MAX_ID_LENGTH = 120;
const MAX_TEXT_LENGTH = 500;
const MAX_NOTE_LENGTH = 2_000;
const MAX_WORKOUTS = 14;
const MAX_EXERCISES_PER_WORKOUT = 50;
const MAX_ALTERNATIVES_PER_EXERCISE = 20;
const MAX_GROCERY_CATEGORIES = 30;
const MAX_GROCERY_ITEMS_PER_CATEGORY = 300;
const MAX_TRACKING_DAYS = 2_000;
const MAX_EXERCISE_TRACKING_PER_DAY = 200;
const MAX_PROGRESS_ENTRIES = 2_000;
const UNSAFE_RECORD_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type DailyTracking = {
  creatine: boolean;
  water: boolean;
  shake1: boolean;
  shake2: boolean;
  workoutCompleted: string | null;
  dayCompleted?: boolean;
  sleepHours?: number;
  mealPrepBoxesDone?: number;
  notes?: string;
  exercises?: Record<string, ExerciseTracking>;
};

export type ExerciseTracking = {
  status: 'done' | 'skipped' | 'replaced';
  replacementName?: string;
  note?: string;
};

export type ProgressEntry = {
  id: string;
  date: string;
  weight: string;
  waist: string;
  sleep: string;
  notes: string;
};

export type ReminderSettings = {
  workoutReminderTime: string;
  proteinReminderTime: string;
  creatineReminderTime: string;
  mealPrepReminderDay: string;
  waterReminderEnabled: boolean;
};

export type ImportPayload = {
  schemaVersion: number;
  exportedAt?: string;
  workouts: WorkoutDay[];
  groceries: GroceryCategory[];
  tracking: Record<string, DailyTracking>;
  progress: ProgressEntry[];
  reminders: ReminderSettings;
  profile: UserProfile;
};

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isString = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const isSafeRecordKey = (v: string) => !UNSAFE_RECORD_KEYS.has(v);
const isBoundedString = (v: unknown, max = MAX_TEXT_LENGTH): v is string =>
  isString(v) && v.length <= max;
const isRequiredString = (v: unknown, max = MAX_TEXT_LENGTH): v is string =>
  isBoundedString(v, max) && v.trim().length > 0;
const isId = (v: unknown): v is string =>
  isRequiredString(v, MAX_ID_LENGTH) && isSafeRecordKey(v);
const createRecord = <T>(): Record<string, T> => Object.create(null) as Record<string, T>;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const isReminderDay = (v: unknown): v is (typeof VALID_REMINDER_DAYS)[number] =>
  isString(v) && VALID_REMINDER_DAYS.includes(v as (typeof VALID_REMINDER_DAYS)[number]);
const isTimeString = (v: unknown): v is string => isString(v) && TIME_PATTERN.test(v);

function validateExercise(raw: unknown): Exercise | string {
  if (!isObject(raw)) return 'exercise is not an object';
  const { id, name, sets, rest, alternatives, notes, warning } = raw;
  if (!isId(id)) return 'exercise.id missing or invalid';
  if (!isRequiredString(name)) return 'exercise.name missing or too long';
  if (!isRequiredString(sets)) return 'exercise.sets missing or too long';
  if (!isRequiredString(rest)) return 'exercise.rest missing or too long';
  if (
    !Array.isArray(alternatives) ||
    alternatives.length > MAX_ALTERNATIVES_PER_EXERCISE ||
    !alternatives.every(item => isBoundedString(item))
  ) {
    return 'exercise.alternatives must be a bounded string[]';
  }
  if (notes != null && !isBoundedString(notes, MAX_NOTE_LENGTH))
    return 'exercise.notes is too long';
  if (warning != null && !isBoundedString(warning, MAX_TEXT_LENGTH))
    return 'exercise.warning is too long';
  return {
    id,
    name,
    sets,
    rest,
    alternatives,
    ...(isString(notes) ? { notes } : {}),
    ...(isString(warning) ? { warning } : {}),
  };
}

function validateCardio(raw: unknown): CardioConfig | null | string {
  if (raw === null || raw === undefined) return null;
  if (!isObject(raw)) return 'cardio is not an object or null';
  const { description, duration, speed, incline } = raw;
  if (!isRequiredString(description)) return 'cardio.description missing or too long';
  if (!isRequiredString(duration)) return 'cardio.duration missing or too long';
  if (speed != null && !isBoundedString(speed)) return 'cardio.speed is too long';
  if (incline != null && !isBoundedString(incline)) return 'cardio.incline is too long';
  return {
    description,
    duration,
    ...(isString(speed) ? { speed } : {}),
    ...(isString(incline) ? { incline } : {}),
  };
}

function validateWorkout(raw: unknown, idx: number): WorkoutDay | string {
  if (!isObject(raw)) return `workouts[${idx}] is not an object`;
  const { id, slot, name, description, exercises, alternateDescription, alternateExercises, cardio } = raw;
  if (!isId(id)) return `workouts[${idx}].id missing or invalid`;
  if (!isRequiredString(name)) return `workouts[${idx}].name missing or too long`;
  if (!isRequiredString(description)) return `workouts[${idx}].description missing or too long`;
  if (alternateDescription != null && !isBoundedString(alternateDescription))
    return `workouts[${idx}].alternateDescription is too long`;
  if (!Array.isArray(exercises))
    return `workouts[${idx}].exercises must be an array`;
  if (exercises.length > MAX_EXERCISES_PER_WORKOUT)
    return `workouts[${idx}].exercises has too many entries`;

  const exs: Exercise[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const ex = validateExercise(exercises[i]);
    if (typeof ex === 'string') return `workouts[${idx}].exercises[${i}]: ${ex}`;
    exs.push(ex);
  }

  let altExs: Exercise[] | undefined;
  if (alternateExercises != null) {
    if (!Array.isArray(alternateExercises))
      return `workouts[${idx}].alternateExercises must be an array`;
    if (alternateExercises.length > MAX_EXERCISES_PER_WORKOUT)
      return `workouts[${idx}].alternateExercises has too many entries`;

    altExs = [];
    for (let i = 0; i < alternateExercises.length; i++) {
      const ex = validateExercise(alternateExercises[i]);
      if (typeof ex === 'string')
        return `workouts[${idx}].alternateExercises[${i}]: ${ex}`;
      altExs.push(ex);
    }
  }

  // Slot is new in v1. Accept legacy workouts without it; fall back by
  // position so existing backups remain importable.
  let resolvedSlot: WorkoutSlot;
  if (isString(slot) && VALID_SLOTS.includes(slot as WorkoutSlot)) {
    resolvedSlot = slot as WorkoutSlot;
  } else {
    resolvedSlot = (VALID_SLOTS[idx] ?? 'push') as WorkoutSlot;
  }

  const cardioResult = validateCardio(cardio);
  if (typeof cardioResult === 'string')
    return `workouts[${idx}].${cardioResult}`;

  return {
    id,
    slot: resolvedSlot,
    name,
    description,
    exercises: exs,
    ...(isString(alternateDescription) ? { alternateDescription } : {}),
    ...(altExs?.length ? { alternateExercises: altExs } : {}),
    cardio: cardioResult,
  };
}

function validateGroceryItem(raw: unknown): GroceryItem | string {
  if (!isObject(raw)) return 'item is not an object';
  const { id, name, checked } = raw;
  if (!isId(id)) return 'item.id missing or invalid';
  if (!isRequiredString(name)) return 'item.name missing or too long';
  if (!isBool(checked)) return 'item.checked must be boolean';
  return { id, name, checked };
}

function validateGroceryCategory(raw: unknown, idx: number): GroceryCategory | string {
  if (!isObject(raw)) return `groceries[${idx}] is not an object`;
  const { id, category, items } = raw;
  if (!isId(id)) return `groceries[${idx}].id missing or invalid`;
  if (!isRequiredString(category)) return `groceries[${idx}].category missing or too long`;
  if (!Array.isArray(items)) return `groceries[${idx}].items must be an array`;
  if (items.length > MAX_GROCERY_ITEMS_PER_CATEGORY)
    return `groceries[${idx}].items has too many entries`;
  const out: GroceryItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = validateGroceryItem(items[i]);
    if (typeof item === 'string')
      return `groceries[${idx}].items[${i}]: ${item}`;
    out.push(item);
  }
  return { id, category, items: out };
}

function validateExerciseTracking(raw: unknown): ExerciseTracking | null {
  if (!isObject(raw)) return null;
  const { status, replacementName, note } = raw;
  if (status !== 'done' && status !== 'skipped' && status !== 'replaced')
    return null;
  if (replacementName != null && !isBoundedString(replacementName))
    return null;
  if (note != null && !isBoundedString(note, MAX_NOTE_LENGTH))
    return null;
  return {
    status,
    ...(isString(replacementName) ? { replacementName } : {}),
    ...(isString(note) ? { note } : {}),
  };
}

function validateDailyTracking(raw: unknown): DailyTracking | null {
  if (!isObject(raw)) return null;
  const out: DailyTracking = {
    creatine: isBool(raw.creatine) ? raw.creatine : false,
    water: isBool(raw.water) ? raw.water : false,
    shake1: isBool(raw.shake1) ? raw.shake1 : false,
    shake2: isBool(raw.shake2) ? raw.shake2 : false,
    workoutCompleted: isId(raw.workoutCompleted) ? raw.workoutCompleted : null,
  };
  if (isBool(raw.dayCompleted)) out.dayCompleted = raw.dayCompleted;
  if (isNum(raw.sleepHours)) out.sleepHours = clamp(raw.sleepHours, 0, 14);
  if (isBoundedString(raw.notes, MAX_NOTE_LENGTH)) out.notes = raw.notes;

  // Legacy field migration: `mealPrepMissed` (boolean) -> `mealPrepBoxesDone` (number).
  // Missing a box is the inverse of "boxes done"; coarse but preserves intent.
  if (isNum(raw.mealPrepBoxesDone)) {
    out.mealPrepBoxesDone = Math.max(0, Math.min(3, Math.round(raw.mealPrepBoxesDone)));
  } else if (isBool(raw.mealPrepMissed)) {
    out.mealPrepBoxesDone = raw.mealPrepMissed ? 0 : 1;
  }

  if (isObject(raw.exercises)) {
    const entries = Object.entries(raw.exercises).slice(0, MAX_EXERCISE_TRACKING_PER_DAY);
    const exs = createRecord<ExerciseTracking>();
    for (const [exId, val] of entries) {
      if (!isId(exId)) continue;
      const t = validateExerciseTracking(val);
      if (t) exs[exId] = t;
    }
    if (Object.keys(exs).length) out.exercises = exs;
  }
  return out;
}

function validateProgressEntry(raw: unknown, idx: number): ProgressEntry | string {
  if (!isObject(raw)) return `progress[${idx}] is not an object`;
  const { id, date, weight, waist, sleep, notes } = raw;
  if (!isString(date) || !isDateKey(date)) return `progress[${idx}].date missing or invalid`;
  return {
    id: isId(id) ? id : uuidv4(),
    date,
    weight: isBoundedString(weight) ? weight : '',
    waist: isBoundedString(waist) ? waist : '',
    sleep: isBoundedString(sleep) ? sleep : '',
    notes: isBoundedString(notes, MAX_NOTE_LENGTH) ? notes : '',
  };
}

function validateReminders(raw: unknown): ReminderSettings | string {
  if (!isObject(raw)) return 'reminders is not an object';
  const { workoutReminderTime, proteinReminderTime, creatineReminderTime, mealPrepReminderDay, waterReminderEnabled } = raw;
  return {
    workoutReminderTime: isTimeString(workoutReminderTime) ? workoutReminderTime : '18:30',
    proteinReminderTime: isTimeString(proteinReminderTime) ? proteinReminderTime : '21:00',
    creatineReminderTime: isTimeString(creatineReminderTime) ? creatineReminderTime : '21:00',
    mealPrepReminderDay: isReminderDay(mealPrepReminderDay) ? mealPrepReminderDay : 'Sunday',
    waterReminderEnabled: isBool(waterReminderEnabled) ? waterReminderEnabled : true,
  };
}

function validateProfile(raw: unknown): UserProfile {
  if (!isObject(raw)) return defaultProfile;
  return {
    name: isBoundedString(raw.name) ? raw.name : defaultProfile.name,
    age: isNum(raw.age) ? Math.round(clamp(raw.age, 10, 120)) : defaultProfile.age,
    heightCm: isNum(raw.heightCm) ? Math.round(clamp(raw.heightCm, 100, 250)) : defaultProfile.heightCm,
    goalWeightKg: isNum(raw.goalWeightKg) ? clamp(raw.goalWeightKg, 30, 250) : defaultProfile.goalWeightKg,
    diet: isBoundedString(raw.diet) ? raw.diet : defaultProfile.diet,
    shiftSummary: isBoundedString(raw.shiftSummary) ? raw.shiftSummary : defaultProfile.shiftSummary,
  };
}

// Throws ImportValidationError on bad input. Caller catches and surfaces .message.
export function validateImport(raw: unknown): ImportPayload {
  if (!isObject(raw)) throw new ImportValidationError('Backup file is not a JSON object.');

  const schemaVersion = isNum(raw.schemaVersion) ? raw.schemaVersion : 0;
  if (schemaVersion > SCHEMA_VERSION) {
    throw new ImportValidationError(
      `Backup is from a newer schema version (${schemaVersion}). Update the app first.`,
    );
  }

  if (!Array.isArray(raw.workouts)) throw new ImportValidationError('workouts must be an array.');
  if (!Array.isArray(raw.groceries)) throw new ImportValidationError('groceries must be an array.');
  if (!Array.isArray(raw.progress)) throw new ImportValidationError('progress must be an array.');
  if (!isObject(raw.tracking)) throw new ImportValidationError('tracking must be an object.');
  if (!isObject(raw.reminders)) throw new ImportValidationError('reminders must be an object.');
  if (raw.workouts.length > MAX_WORKOUTS) throw new ImportValidationError('workouts has too many entries.');
  if (raw.groceries.length > MAX_GROCERY_CATEGORIES)
    throw new ImportValidationError('groceries has too many categories.');
  if (raw.progress.length > MAX_PROGRESS_ENTRIES)
    throw new ImportValidationError('progress has too many entries.');

  const workouts: WorkoutDay[] = [];
  for (let i = 0; i < raw.workouts.length; i++) {
    const r = validateWorkout(raw.workouts[i], i);
    if (typeof r === 'string') throw new ImportValidationError(r);
    workouts.push(r);
  }

  const groceries: GroceryCategory[] = [];
  for (let i = 0; i < raw.groceries.length; i++) {
    const r = validateGroceryCategory(raw.groceries[i], i);
    if (typeof r === 'string') throw new ImportValidationError(r);
    groceries.push(r);
  }

  const progress: ProgressEntry[] = [];
  for (let i = 0; i < raw.progress.length; i++) {
    const r = validateProgressEntry(raw.progress[i], i);
    if (typeof r === 'string') throw new ImportValidationError(r);
    progress.push(r);
  }

  const trackingEntries = Object.entries(raw.tracking);
  if (trackingEntries.length > MAX_TRACKING_DAYS)
    throw new ImportValidationError('tracking has too many days.');

  const tracking = createRecord<DailyTracking>();
  for (const [date, val] of trackingEntries) {
    if (!isSafeRecordKey(date) || !isDateKey(date)) {
      throw new ImportValidationError(`tracking date "${date}" is invalid.`);
    }
    const t = validateDailyTracking(val);
    if (t) tracking[date] = t;
  }

  const remindersResult = validateReminders(raw.reminders);
  if (typeof remindersResult === 'string')
    throw new ImportValidationError(remindersResult);

  return {
    schemaVersion: SCHEMA_VERSION,
    ...(isBoundedString(raw.exportedAt) ? { exportedAt: raw.exportedAt } : {}),
    workouts,
    groceries,
    tracking,
    progress,
    reminders: remindersResult,
    profile: validateProfile(raw.profile),
  };
}
