import { v4 as uuidv4 } from 'uuid';

export type WorkoutSlot = 'push' | 'pull' | 'legs' | 'shoulders';

export type WorkoutDay = {
  id: string;
  slot: WorkoutSlot;
  name: string;
  description: string;
  exercises: Exercise[];
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
      { id: uuidv4(), name: 'Machine Chest Press', sets: '4 sets x 10-12 reps', rest: '90s', alternatives: ['Dumbbell chest press', 'Push-ups'] },
      { id: uuidv4(), name: 'Incline Chest Press', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['Incline dumbbell press', 'Incline push-up'] },
      { id: uuidv4(), name: 'Cable Fly', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Mid cable fly', 'High-to-low cable fly', 'Low-to-high cable fly', 'Pec deck'] },
      { id: uuidv4(), name: 'Shoulder Press Machine', sets: '2 sets x 8-10 reps', rest: '90s', alternatives: ['Light dumbbell shoulder press'], warning: 'Keep shoulder movements controlled' },
      { id: uuidv4(), name: 'Lateral Raises', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Cable lateral raise'] },
      { id: uuidv4(), name: 'Cable Triceps Pushdown', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Rope pushdown'] },
      { id: uuidv4(), name: 'Overhead Rope Triceps Extension', sets: '2 sets x 12-15 reps', rest: '45-60s', alternatives: ['Dumbbell overhead extension'], warning: 'Watch shoulder mobility' },
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
      { id: uuidv4(), name: 'Lat Pulldown', sets: '4 sets x 8-10 reps', rest: '90s', alternatives: ['Assisted pull-up machine'] },
      { id: uuidv4(), name: 'Seated Cable Row', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['Machine row'] },
      { id: uuidv4(), name: 'Chest Supported Row Machine', sets: '3 sets x 10 reps', rest: '90s', alternatives: ['One-arm dumbbell row'] },
      { id: uuidv4(), name: 'Rear Delt Machine', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: ['Face pulls'] },
      { id: uuidv4(), name: 'Bicep Curl Machine or Dumbbell', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: ['Cable curl'] },
      { id: uuidv4(), name: 'Hammer Curls', sets: '3 sets x 12 reps', rest: '45-60s', alternatives: ['Rope hammer curl'] },
      { id: uuidv4(), name: 'Wrist Curls', sets: '2 sets x 15-20 reps', rest: '45s', alternatives: [] },
      { id: uuidv4(), name: 'Reverse Wrist Curls', sets: '2 sets x 15-20 reps', rest: '45s', alternatives: [] },
    ],
    cardio: null,
  },
  {
    id: uuidv4(),
    slot: 'legs',
    name: 'Day 3: Legs + Core',
    description: 'Tuesday before work, around 7:30 to 8:45 PM.',
    exercises: [
      { id: uuidv4(), name: 'Leg Press', sets: '4 sets x 10-12 reps', rest: '90s', alternatives: ['Hack squat machine', 'Goblet squat'] },
      { id: uuidv4(), name: 'Leg Extension', sets: '3 sets x 12-15 reps', rest: '60s', alternatives: [] },
      { id: uuidv4(), name: 'Leg Curl', sets: '3 sets x 12-15 reps', rest: '60s', alternatives: [] },
      { id: uuidv4(), name: 'Calf Raises', sets: '4 sets x 15-20 reps', rest: '45-60s', alternatives: [] },
      { id: uuidv4(), name: 'Plank', sets: '3 sets x 30-45s', rest: '45s', alternatives: [] },
      { id: uuidv4(), name: 'Cable Crunch', sets: '2 sets x 12-15 reps', rest: '45s', alternatives: [] },
    ],
    cardio: { description: 'Incline walk', duration: '15 mins', speed: '3.0 km/h', incline: '7' },
  },
  {
    id: uuidv4(),
    slot: 'shoulders',
    name: 'Day 4: Shoulders, Arms, Pump',
    description: 'Thursday or Friday before work.',
    exercises: [
      { id: uuidv4(), name: 'Shoulder Press Machine', sets: '3 sets x 8-10 reps', rest: '90s', alternatives: [] },
      { id: uuidv4(), name: 'Lateral Raises', sets: '4 sets x 12-15 reps', rest: '45-60s', alternatives: [] },
      { id: uuidv4(), name: 'Rear Delt Machine', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: [] },
      { id: uuidv4(), name: 'Incline Chest Press Machine (Light)', sets: '2 sets x 10-12 reps', rest: '90s', alternatives: [] },
      { id: uuidv4(), name: 'Lat Pulldown (Light)', sets: '2 sets x 10-12 reps', rest: '90s', alternatives: [] },
      { id: uuidv4(), name: 'Triceps Pushdown', sets: '3 sets x 12-15 reps', rest: '45-60s', alternatives: [] },
      { id: uuidv4(), name: 'Dumbbell Curls', sets: '3 sets x 10-12 reps', rest: '45-60s', alternatives: [] },
      { id: uuidv4(), name: 'Hammer Curls or Farmer Carries', sets: '3 sets x 12 reps OR 3 rounds x 30s', rest: '45-60s', alternatives: [] },
    ],
    cardio: { description: 'Incline walk', duration: '15-20 mins', speed: '3.0 km/h', incline: '6' },
  },
];

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
