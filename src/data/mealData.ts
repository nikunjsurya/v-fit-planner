export type MealPrepSession = {
  id: string;
  dayName: string;
  targetDays: string;
  defaultMeal: string;
  amount: string;
};

export const defaultMealPrepSessions: MealPrepSession[] = [
  {
    id: 'session-1',
    dayName: 'Session 1: Sunday Evening',
    targetDays: 'Prep for Sunday night, Monday, Tuesday',
    defaultMeal: 'Soya Chunks Masala + Rice',
    amount: 'Make 3 boxes',
  },
  {
    id: 'session-2',
    dayName: 'Session 2: Wed / Thu (After waking)',
    targetDays: 'Prep for Thursday, Friday, Saturday',
    defaultMeal: 'Tofu / Chana / Rajma / Paneer Curry + Rice',
    amount: 'Make 3 boxes',
  }
];

export const proteinSources = [
  'Whey protein', 'Soya chunks', 'Tofu', 'Paneer', 'Greek yogurt',
  'Skyr', 'Curd', 'Chickpeas (Chana)', 'Rajma', 'Lentils', 'Milk', 'Cottage cheese'
];

export const carbSources = [
  'Rice', 'Oats', 'Banana', 'Potato', 'Vector cereal / Cornflakes (occasionally)',
  'Frozen paratha (occasionally, not daily)'
];

export const avoidItems = [
  'Coke', 'Canada Dry', 'Sugary drinks', 'Namkeen', 'Chips',
  'Cookies', 'Fried food', 'Fast food', 'Late-night junk'
];
