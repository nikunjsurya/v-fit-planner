import { format, isValid, parseISO } from 'date-fns';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function isDateKey(value: string): boolean {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const parsed = parseDateKey(value);
  return isValid(parsed) && formatDateKey(parsed) === value;
}
