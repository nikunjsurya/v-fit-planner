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

// Pure structural validator + migrator for backup files. No React, no DOM.
// On success returns a clean payload that is safe to feed into the context
// setters. On failure returns a string with a short reason for the UI.

export const SCHEMA_VERSION = 1;

const VALID_SLOTS: WorkoutSlot[] = ['push', 'pull', 'legs', 'shoulders'];

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

function validateExercise(raw: unknown): Exercise | string {
  if (!isObject(raw)) return 'exercise is not an object';
  const { id, name, sets, rest, alternatives, notes, warning } = raw;
  if (!isString(id)) return 'exercise.id missing';
  if (!isString(name)) return 'exercise.name missing';
  if (!isString(sets)) return 'exercise.sets missing';
  if (!isString(rest)) return 'exercise.rest missing';
  if (!Array.isArray(alternatives) || !alternatives.every(isString))
    return 'exercise.alternatives must be string[]';
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
  if (raw === null) return null;
  if (!isObject(raw)) return 'cardio is not an object or null';
  const { description, duration, speed, incline } = raw;
  if (!isString(description)) return 'cardio.description missing';
  if (!isString(duration)) return 'cardio.duration missing';
  return {
    description,
    duration,
    ...(isString(speed) ? { speed } : {}),
    ...(isString(incline) ? { incline } : {}),
  };
}

function validateWorkout(raw: unknown, idx: number): WorkoutDay | string {
  if (!isObject(raw)) return `workouts[${idx}] is not an object`;
  const { id, slot, name, description, exercises, cardio } = raw;
  if (!isString(id)) return `workouts[${idx}].id missing`;
  if (!isString(name)) return `workouts[${idx}].name missing`;
  if (!isString(description)) return `workouts[${idx}].description missing`;
  if (!Array.isArray(exercises))
    return `workouts[${idx}].exercises must be an array`;

  const exs: Exercise[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const ex = validateExercise(exercises[i]);
    if (typeof ex === 'string') return `workouts[${idx}].exercises[${i}]: ${ex}`;
    exs.push(ex);
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
    cardio: cardioResult,
  };
}

function validateGroceryItem(raw: unknown): GroceryItem | string {
  if (!isObject(raw)) return 'item is not an object';
  const { id, name, checked } = raw;
  if (!isString(id)) return 'item.id missing';
  if (!isString(name)) return 'item.name missing';
  if (!isBool(checked)) return 'item.checked must be boolean';
  return { id, name, checked };
}

function validateGroceryCategory(raw: unknown, idx: number): GroceryCategory | string {
  if (!isObject(raw)) return `groceries[${idx}] is not an object`;
  const { id, category, items } = raw;
  if (!isString(id)) return `groceries[${idx}].id missing`;
  if (!isString(category)) return `groceries[${idx}].category missing`;
  if (!Array.isArray(items)) return `groceries[${idx}].items must be an array`;
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
    workoutCompleted: isString(raw.workoutCompleted) ? raw.workoutCompleted : null,
  };
  if (isBool(raw.dayCompleted)) out.dayCompleted = raw.dayCompleted;
  if (isNum(raw.sleepHours)) out.sleepHours = raw.sleepHours;
  if (isString(raw.notes)) out.notes = raw.notes;

  // Legacy field migration: `mealPrepMissed` (boolean) -> `mealPrepBoxesDone` (number).
  // Missing a box is the inverse of "boxes done"; coarse but preserves intent.
  if (isNum(raw.mealPrepBoxesDone)) {
    out.mealPrepBoxesDone = Math.max(0, Math.min(3, Math.round(raw.mealPrepBoxesDone)));
  } else if (isBool(raw.mealPrepMissed)) {
    out.mealPrepBoxesDone = raw.mealPrepMissed ? 0 : 1;
  }

  if (isObject(raw.exercises)) {
    const exs: Record<string, ExerciseTracking> = {};
    for (const [exId, val] of Object.entries(raw.exercises)) {
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
  if (!isString(date)) return `progress[${idx}].date missing`;
  return {
    id: isString(id) ? id : `${Date.now()}-${idx}`,
    date,
    weight: isString(weight) ? weight : '',
    waist: isString(waist) ? waist : '',
    sleep: isString(sleep) ? sleep : '',
    notes: isString(notes) ? notes : '',
  };
}

function validateReminders(raw: unknown): ReminderSettings | string {
  if (!isObject(raw)) return 'reminders is not an object';
  const { workoutReminderTime, proteinReminderTime, creatineReminderTime, mealPrepReminderDay, waterReminderEnabled } = raw;
  return {
    workoutReminderTime: isString(workoutReminderTime) ? workoutReminderTime : '18:30',
    proteinReminderTime: isString(proteinReminderTime) ? proteinReminderTime : '21:00',
    creatineReminderTime: isString(creatineReminderTime) ? creatineReminderTime : '21:00',
    mealPrepReminderDay: isString(mealPrepReminderDay) ? mealPrepReminderDay : 'Sunday',
    waterReminderEnabled: isBool(waterReminderEnabled) ? waterReminderEnabled : true,
  };
}

function validateProfile(raw: unknown): UserProfile {
  if (!isObject(raw)) return defaultProfile;
  return {
    name: isString(raw.name) ? raw.name : defaultProfile.name,
    age: isNum(raw.age) ? raw.age : defaultProfile.age,
    heightCm: isNum(raw.heightCm) ? raw.heightCm : defaultProfile.heightCm,
    goalWeightKg: isNum(raw.goalWeightKg) ? raw.goalWeightKg : defaultProfile.goalWeightKg,
    diet: isString(raw.diet) ? raw.diet : defaultProfile.diet,
    shiftSummary: isString(raw.shiftSummary) ? raw.shiftSummary : defaultProfile.shiftSummary,
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

  const tracking: Record<string, DailyTracking> = {};
  for (const [date, val] of Object.entries(raw.tracking)) {
    const t = validateDailyTracking(val);
    if (t) tracking[date] = t;
  }

  const remindersResult = validateReminders(raw.reminders);
  if (typeof remindersResult === 'string')
    throw new ImportValidationError(remindersResult);

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: isString(raw.exportedAt) ? raw.exportedAt : undefined,
    workouts,
    groceries,
    tracking,
    progress,
    reminders: remindersResult,
    profile: validateProfile(raw.profile),
  };
}
