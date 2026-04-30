import { WorkoutDay, WorkoutSlot } from '../data/initialData';

// Pure function — no React, no DOM. Lifts cleanly into a React Native bundle.

export type DayPlan = {
  expectedSlot: WorkoutSlot | null;
  expectedWorkout: WorkoutDay | null;
  scheduleNote: string;
  eatingNotes: string[];
};

// Maps JS getDay() (0=Sun..6=Sat) to the user's training rotation. The user
// works Tue–Sat 22:00–06:00, trains before work on workdays and ~midnight on
// off days. Wednesday and Saturday are recovery.
const DAY_TO_SLOT: Record<number, WorkoutSlot | null> = {
  0: 'push',      // Sunday — off, train ~midnight (Sun→Mon)
  1: 'pull',      // Monday — off, train ~midnight (Mon→Tue)
  2: 'legs',      // Tuesday — work day, train before shift
  3: null,        // Wednesday — recovery
  4: 'shoulders', // Thursday — work day, train before shift
  5: 'shoulders', // Friday — work day, alt option to Thursday
  6: null,        // Saturday — recovery
};

const SCHEDULE_NOTES: Record<number, string> = {
  0: 'Off day. Train tonight ~12 AM (into Monday).',
  1: 'Off day. Train tonight ~12 AM (into Tuesday).',
  2: 'Work day. Train before shift, 7:30–8:45 PM.',
  3: 'Recovery / rest day. Work day.',
  4: 'Work day. Train before shift, 7:30–8:45 PM (pick Thu or Fri).',
  5: 'Work day. Train before shift, 7:30–8:45 PM (pick Thu or Fri).',
  6: 'Recovery / rest day. Work day.',
};

const EATING_NOTES: Record<number, string[]> = {
  0: [
    'Meal Prep: cook Soya Chunks + Rice tonight for Sun/Mon/Tue.',
    'Pre-gym (~11:30 PM): Banana or cereal',
    'Post-gym (~1:00 AM): Shake immediately after',
  ],
  1: [
    'Meal-prep box (Soya Chunks).',
    'Pre-gym (~11:30 PM): Banana or cereal',
    'Post-gym (~1:00 AM): Shake immediately after',
  ],
  2: [
    'Wake 2:30–4 PM: Soya box',
    'Pre-gym (6:30 PM): Banana / Vector',
    'Post-gym (9:00 PM): 2 scoops whey + creatine',
    'Work 1–3 AM: Meal box / Greek yogurt',
  ],
  3: ['Meal Prep: cook Tofu / Chana / Rajma for Thu/Fri/Sat.'],
  4: [
    'Wake 2:30–4 PM: Curry box',
    'Pre-gym (6:30 PM): Banana / Vector',
    'Post-gym (9:00 PM): 2 scoops whey + creatine',
    'Work 1–3 AM: Meal box',
  ],
  5: [
    'Wake 2:30–4 PM: Curry box',
    'Pre-gym (6:30 PM): Banana / Vector',
    'Post-gym (9:00 PM): 2 scoops whey + creatine',
    'Work 1–3 AM: Meal box',
  ],
  6: ['Curry box', 'Greek yogurt'],
};

export function getDayPlan(date: Date, workouts: WorkoutDay[]): DayPlan {
  const dayOfWeek = date.getDay();
  const expectedSlot = DAY_TO_SLOT[dayOfWeek] ?? null;
  const expectedWorkout = expectedSlot
    ? workouts.find((w) => w.slot === expectedSlot) ?? null
    : null;

  return {
    expectedSlot,
    expectedWorkout,
    scheduleNote: SCHEDULE_NOTES[dayOfWeek] ?? '',
    eatingNotes: EATING_NOTES[dayOfWeek] ?? [],
  };
}
