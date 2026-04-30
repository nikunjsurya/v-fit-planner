import { v4 as uuidv4 } from 'uuid';

export type WorkoutSlot = 'push' | 'pull' | 'legs' | 'shoulders';

export type WorkoutDay = {
  id: string;
  slot: WorkoutSlot;
  name: string;
  description: string;
  exercises: Exercise[];
  alternateDescription?: string;
  alternateExercises?: Exercise[];
  cardio: CardioConfig | null;
};

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  rest: string;
  alternatives: string[];
  notes?: string;
  warning?: string;
};

export type CardioConfig = {
  description: string;
  duration: string;
  speed?: string;
  incline?: string;
};

export type GroceryItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type GroceryCategory = {
  id: string;
  category: string;
  items: GroceryItem[];
};

export type UserProfile = {
  name: string;
  age: number;
  heightCm: number;
  goalWeightKg: number;
  diet: string;
  shiftSummary: string;
};

export const defaultProfile: UserProfile = {
  name: '',
  age: 26,
  heightCm: 180,
  goalWeightKg: 81,
  diet: 'Vegetarian (No eggs)',
  shiftSummary: 'Tue-Sat, 10 PM - 6 AM',
};

export const defaultWorkouts: WorkoutDay[] = [
  {
    id: uuidv4(),
    slot: 'push',
    name: 'Day 1: Push',
    description:
      'Chest, triceps, light shoulders. Best time: Sunday night into Monday around 12 AM.',
    exercises: [
      { id: uuidv4(), name: 'Machine Chest Press', sets: '4 sets x 10-12 reps', rest: '90s', alternatives: ['Dumbbell chest press', 'Smith machine press', 'Push-ups'] },
      { id: uuidv4(), name: 'Incline Chest Press', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['Incline dumbbell press', 'Low-incline Smith press', 'Incline push-up'] },
      { id: uuidv4(), name: 'Cable Fly', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Pec deck', 'Dumbbell fly', 'Band fly'] },
      { id: uuidv4(), name: 'Shoulder Press Machine', sets: '2 sets x 8-10 reps', rest: '90s', alternatives: ['Seated dumbbell shoulder press', 'Landmine press', 'Arnold press'], warning: 'Keep shoulder movements controlled' },
      { id: uuidv4(), name: 'Lateral Raises', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Cable lateral raise', 'Lean-away lateral raise', 'Machine lateral raise'] },
      { id: uuidv4(), name: 'Cable Triceps Pushdown', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Rope pushdown', 'Single-arm cable pushdown', 'Close-grip push-up'] },
      { id: uuidv4(), name: 'Overhead Rope Triceps Extension', sets: '2 sets x 12-15 reps', rest: '45-60s', alternatives: ['Dumbbell overhead extension', 'Cable skull crusher', 'Dumbbell skull crusher'], warning: 'Watch shoulder mobility' },
    ],
    alternateDescription:
      'Gym-busy version: same chest, shoulder, and triceps targets with dumbbells, bodyweight, or common machines.',
    alternateExercises: [
      { id: uuidv4(), name: 'Dumbbell Bench Press', sets: '4 sets x 8-12 reps', rest: '90s', alternatives: ['Push-ups', 'Smith machine press', 'Machine chest press'] },
      { id: uuidv4(), name: 'Low-Incline Dumbbell Press', sets: '3 sets x 8-12 reps', rest: '90s', alternatives: ['Incline push-up', 'Incline machine press', 'Low-incline Smith press'] },
      { id: uuidv4(), name: 'Pec Deck or Dumbbell Fly', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Cable fly', 'Band fly', 'Push-up plus'] },
      { id: uuidv4(), name: 'Seated Dumbbell Shoulder Press', sets: '2 sets x 8-10 reps', rest: '90s', alternatives: ['Landmine press', 'Machine shoulder press', 'Arnold press'], warning: 'Keep shoulder movements controlled' },
      { id: uuidv4(), name: 'Dumbbell Lateral Raise', sets: '3 sets x 12-20 reps', rest: '45-60s', alternatives: ['Cable lateral raise', 'Machine lateral raise', 'Lean-away lateral raise'] },
      { id: uuidv4(), name: 'Close-Grip Push-Up', sets: '3 sets x 8-15 reps', rest: '60s', alternatives: ['Bench dip', 'Cable pushdown', 'Rope pushdown'] },
      { id: uuidv4(), name: 'Dumbbell Skull Crusher', sets: '2 sets x 12-15 reps', rest: '45-60s', alternatives: ['Overhead dumbbell extension', 'Cable skull crusher', 'Rope overhead extension'] },
    ],
    cardio: { description: 'Incline walk', duration: '15 mins', speed: '3.0 km/h', incline: '6-7' },
  },
  {
    id: uuidv4(),
    slot: 'pull',
    name: 'Day 2: Pull',
    description:
      'Back, biceps, forearms. Best time: Monday night into Tuesday around 12 AM.',
    exercises: [
      { id: uuidv4(), name: 'Lat Pulldown', sets: '4 sets x 8-10 reps', rest: '90s', alternatives: ['Assisted pull-up machine', 'Neutral-grip pulldown', 'Single-arm cable pulldown'] },
      { id: uuidv4(), name: 'Seated Cable Row', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['Machine row', 'One-arm dumbbell row', 'Chest-supported dumbbell row'] },
      { id: uuidv4(), name: 'Chest Supported Row Machine', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['One-arm dumbbell row', 'T-bar row', 'Incline bench dumbbell row'] },
      { id: uuidv4(), name: 'Rear Delt Machine', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Face pulls', 'Bent-over dumbbell rear delt fly', 'Cable rear delt fly'] },
      { id: uuidv4(), name: 'Bicep Curl Machine or Dumbbell', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: ['Cable curl', 'Incline dumbbell curl', 'EZ-bar curl'] },
      { id: uuidv4(), name: 'Hammer Curls', sets: '3 sets x 12 reps', rest: '45-60s', alternatives: ['Rope hammer curl', 'Cross-body hammer curl', 'Neutral-grip cable curl'] },
      { id: uuidv4(), name: 'Wrist Curls', sets: '2 sets x 15-20 reps', rest: '45s', alternatives: ['Dumbbell wrist curls', 'Cable wrist curls', 'Farmer carries'] },
      { id: uuidv4(), name: 'Reverse Wrist Curls', sets: '2 sets x 15-20 reps', rest: '45s', alternatives: ['Reverse cable curl', 'EZ-bar reverse curl', 'Dumbbell reverse wrist curl'] },
    ],
    alternateDescription:
      'Gym-busy version: keeps the vertical pull, row, rear-delt, biceps, and forearm work intact.',
    alternateExercises: [
      { id: uuidv4(), name: 'Assisted Pull-Up or Inverted Row', sets: '4 sets x 8-10 reps', rest: '90s', alternatives: ['Lat pulldown', 'Band-assisted pull-up', 'Single-arm cable pulldown'] },
      { id: uuidv4(), name: 'One-Arm Dumbbell Row', sets: '3 sets x 10 reps each side', rest: '90s', alternatives: ['Seated cable row', 'Machine row', 'Chest-supported dumbbell row'] },
      { id: uuidv4(), name: 'Incline Bench Dumbbell Row', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['Chest-supported row machine', 'T-bar row', 'Cable row'] },
      { id: uuidv4(), name: 'Face Pull or Rear Delt Fly', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Rear delt machine', 'Cable rear delt fly', 'Bent-over dumbbell rear delt fly'] },
      { id: uuidv4(), name: 'Incline Dumbbell Curl', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: ['Cable curl', 'EZ-bar curl', 'Bicep curl machine'] },
      { id: uuidv4(), name: 'Cross-Body Hammer Curl', sets: '3 sets x 12 reps', rest: '45-60s', alternatives: ['Rope hammer curl', 'Dumbbell hammer curl', 'Neutral-grip cable curl'] },
      { id: uuidv4(), name: 'Farmer Carries', sets: '3 rounds x 30-45s', rest: '60s', alternatives: ['Wrist curls', 'Plate pinch hold', 'Suitcase carry'] },
      { id: uuidv4(), name: 'EZ-Bar Reverse Curl', sets: '2 sets x 12-15 reps', rest: '45s', alternatives: ['Reverse wrist curls', 'Cable reverse curl', 'Dumbbell reverse curl'] },
    ],
    cardio: null,
  },
  {
    id: uuidv4(),
    slot: 'legs',
    name: 'Day 3: Legs + Core',
    description: 'Tuesday before work, around 7:30 to 8:45 PM.',
    exercises: [
      { id: uuidv4(), name: 'Leg Press', sets: '4 sets x 10-12 reps', rest: '90s', alternatives: ['Hack squat machine', 'Goblet squat', 'Smith machine squat'] },
      { id: uuidv4(), name: 'Leg Extension', sets: '3 sets x 12-15 reps', rest: '60s', alternatives: ['Bulgarian split squat', 'Step-up', 'Sissy squat hold'] },
      { id: uuidv4(), name: 'Leg Curl', sets: '3 sets x 12-15 reps', rest: '60s', alternatives: ['Dumbbell Romanian deadlift', 'Stability ball hamstring curl', 'Cable leg curl'] },
      { id: uuidv4(), name: 'Calf Raises', sets: '4 sets x 15-20 reps', rest: '45-60s', alternatives: ['Single-leg calf raise', 'Leg press calf raise', 'Smith machine calf raise'] },
      { id: uuidv4(), name: 'Plank', sets: '3 sets x 30-45s', rest: '45s', alternatives: ['Dead bug', 'Side plank', 'Pallof press'] },
      { id: uuidv4(), name: 'Cable Crunch', sets: '2 sets x 12-15 reps', rest: '45s', alternatives: ['Machine crunch', 'Reverse crunch', 'Weighted dead bug'] },
    ],
    alternateDescription:
      'Gym-busy version: same quad, hamstring, calf, and core coverage with dumbbells or bodyweight.',
    alternateExercises: [
      { id: uuidv4(), name: 'Goblet Squat', sets: '4 sets x 10-12 reps', rest: '90s', alternatives: ['Hack squat machine', 'Smith machine squat', 'Leg press'] },
      { id: uuidv4(), name: 'Bulgarian Split Squat', sets: '3 sets x 8-12 reps each side', rest: '75-90s', alternatives: ['Step-up', 'Walking lunge', 'Leg extension'] },
      { id: uuidv4(), name: 'Dumbbell Romanian Deadlift', sets: '3 sets x 10-12 reps', rest: '75-90s', alternatives: ['Leg curl', 'Cable pull-through', 'Stability ball hamstring curl'] },
      { id: uuidv4(), name: 'Single-Leg Calf Raise', sets: '4 sets x 12-20 reps each side', rest: '45-60s', alternatives: ['Standing calf raise', 'Leg press calf raise', 'Smith machine calf raise'] },
      { id: uuidv4(), name: 'Dead Bug', sets: '3 sets x 8-12 reps each side', rest: '45s', alternatives: ['Plank', 'Side plank', 'Pallof press'] },
      { id: uuidv4(), name: 'Reverse Crunch', sets: '2 sets x 12-15 reps', rest: '45s', alternatives: ['Cable crunch', 'Machine crunch', 'Weighted dead bug'] },
    ],
    cardio: { description: 'Incline walk', duration: '15 mins', speed: '3.0 km/h', incline: '7' },
  },
  {
    id: uuidv4(),
    slot: 'shoulders',
    name: 'Day 4: Shoulders, Arms, Pump',
    description: 'Thursday or Friday before work.',
    exercises: [
      { id: uuidv4(), name: 'Shoulder Press Machine', sets: '3 sets x 8-10 reps', rest: '90s', alternatives: ['Seated dumbbell shoulder press', 'Landmine press', 'Arnold press'] },
      { id: uuidv4(), name: 'Lateral Raises', sets: '4 sets x 12-15 reps', rest: '45-60s', alternatives: ['Cable lateral raise', 'Machine lateral raise', 'Lean-away lateral raise'] },
      { id: uuidv4(), name: 'Rear Delt Machine', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Face pulls', 'Bent-over dumbbell rear delt fly', 'Cable rear delt fly'] },
      { id: uuidv4(), name: 'Incline Chest Press Machine (Light)', sets: '2 sets x 10-12 reps', rest: '90s', alternatives: ['Incline dumbbell press', 'Push-ups', 'Smith machine incline press'] },
      { id: uuidv4(), name: 'Lat Pulldown (Light)', sets: '2 sets x 10-12 reps', rest: '90s', alternatives: ['Assisted pull-up', 'One-arm dumbbell row', 'Cable row'] },
      { id: uuidv4(), name: 'Triceps Pushdown', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Rope pushdown', 'Overhead dumbbell extension', 'Close-grip push-up'] },
      { id: uuidv4(), name: 'Dumbbell Curls', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: ['Cable curl', 'Incline dumbbell curl', 'EZ-bar curl'] },
      { id: uuidv4(), name: 'Hammer Curls or Farmer Carries', sets: '3 sets x 12 reps OR 3 rounds x 30s', rest: '45-60s', alternatives: ['Rope hammer curl', 'Cross-body hammer curl', 'Suitcase carry'] },
    ],
    alternateDescription:
      'Gym-busy version: same shoulder cap, rear-delt, light push/pull, and arm pump balance.',
    alternateExercises: [
      { id: uuidv4(), name: 'Seated Dumbbell Shoulder Press', sets: '3 sets x 8-10 reps', rest: '90s', alternatives: ['Shoulder press machine', 'Landmine press', 'Arnold press'] },
      { id: uuidv4(), name: 'Cable or Dumbbell Lateral Raise', sets: '4 sets x 12-15 reps', rest: '45-60s', alternatives: ['Machine lateral raise', 'Lean-away lateral raise', 'Partial lateral raise finisher'] },
      { id: uuidv4(), name: 'Bent-Over Dumbbell Rear Delt Fly', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Rear delt machine', 'Face pulls', 'Cable rear delt fly'] },
      { id: uuidv4(), name: 'Push-Ups or Light Dumbbell Press', sets: '2 sets x 10-12 reps', rest: '75-90s', alternatives: ['Incline chest press machine', 'Smith incline press', 'Machine chest press'] },
      { id: uuidv4(), name: 'One-Arm Dumbbell Row', sets: '2 sets x 10-12 reps each side', rest: '75-90s', alternatives: ['Lat pulldown', 'Assisted pull-up', 'Cable row'] },
      { id: uuidv4(), name: 'Overhead Dumbbell Triceps Extension', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Triceps pushdown', 'Rope overhead extension', 'Close-grip push-up'] },
      { id: uuidv4(), name: 'Incline Dumbbell Curl', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: ['Dumbbell curls', 'Cable curl', 'EZ-bar curl'] },
      { id: uuidv4(), name: 'Suitcase Carry or Cross-Body Hammer Curl', sets: '3 rounds x 30s OR 3 sets x 12 reps', rest: '45-60s', alternatives: ['Farmer carries', 'Hammer curls', 'Rope hammer curl'] },
    ],
    cardio: { description: 'Incline walk', duration: '15-20 mins', speed: '3.0 km/h', incline: '6' },
  },
];

const cloneExercise = (exercise: Exercise): Exercise => ({
  ...exercise,
  alternatives: [...exercise.alternatives],
});

export function ensureWorkoutAlternates(workouts: WorkoutDay[]): WorkoutDay[] {
  let changed = false;
  const normalized = workouts.map((workout, idx) => {
    const fallback =
      defaultWorkouts.find(defaultWorkout => defaultWorkout.slot === workout.slot) ??
      defaultWorkouts[idx];
    if (!fallback) return workout;

    const next: WorkoutDay = { ...workout };
    if (!next.alternateDescription && fallback.alternateDescription) {
      next.alternateDescription = fallback.alternateDescription;
      changed = true;
    }
    if (!next.alternateExercises?.length && fallback.alternateExercises?.length) {
      next.alternateExercises = fallback.alternateExercises.map(cloneExercise);
      changed = true;
    }

    return next;
  });

  return changed ? normalized : workouts;
}

export const defaultGroceries: GroceryCategory[] = [
  {
    id: uuidv4(),
    category: 'Protein',
    items: [
      { id: uuidv4(), name: 'Soya Chunks', checked: false },
      { id: uuidv4(), name: 'Tofu', checked: false },
      { id: uuidv4(), name: 'Paneer', checked: false },
      { id: uuidv4(), name: 'Greek Yogurt / Skyr / Curd', checked: false },
      { id: uuidv4(), name: 'Chickpeas (Chana)', checked: false },
      { id: uuidv4(), name: 'Rajma (Kidney Beans)', checked: false },
      { id: uuidv4(), name: 'Lentils', checked: false },
      { id: uuidv4(), name: 'Milk', checked: false },
      { id: uuidv4(), name: 'Whey Protein', checked: false },
    ],
  },
  {
    id: uuidv4(),
    category: 'Carbs',
    items: [
      { id: uuidv4(), name: 'Rice', checked: false },
      { id: uuidv4(), name: 'Oats', checked: false },
      { id: uuidv4(), name: 'Bananas', checked: false },
      { id: uuidv4(), name: 'Potatoes', checked: false },
      { id: uuidv4(), name: 'Vector Cereal / Cornflakes', checked: false },
      { id: uuidv4(), name: 'Frozen Parathas', checked: false },
    ],
  },
  {
    id: uuidv4(),
    category: 'Other',
    items: [
      { id: uuidv4(), name: 'Vegetables / Salad Mix', checked: false },
      { id: uuidv4(), name: 'Creatine', checked: false },
    ],
  },
];
