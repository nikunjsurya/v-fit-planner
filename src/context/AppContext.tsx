import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  WorkoutDay,
  GroceryCategory,
  UserProfile,
  defaultWorkouts,
  defaultGroceries,
  defaultProfile,
  ensureWorkoutAlternates,
} from '../data/initialData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  validateImport,
  SCHEMA_VERSION,
} from '../utils/validateImport';
import type {
  DailyTracking,
  ProgressEntry,
  ReminderSettings,
} from '../utils/validateImport';

export type {
  DailyTracking,
  ExerciseTracking,
  ProgressEntry,
  ReminderSettings,
} from '../utils/validateImport';

const STORAGE_KEYS = {
  workouts: 'fit_workouts',
  groceries: 'fit_groceries',
  tracking: 'fit_tracking',
  progress: 'fit_progress',
  reminders: 'fit_reminders',
  profile: 'fit_profile',
} as const;

const defaultReminders: ReminderSettings = {
  workoutReminderTime: '18:30',
  proteinReminderTime: '21:00',
  creatineReminderTime: '21:00',
  mealPrepReminderDay: 'Sunday',
  waterReminderEnabled: true,
};

type AppContextType = {
  workouts: WorkoutDay[];
  setWorkouts: Dispatch<SetStateAction<WorkoutDay[]>>;
  groceries: GroceryCategory[];
  setGroceries: Dispatch<SetStateAction<GroceryCategory[]>>;
  tracking: Record<string, DailyTracking>;
  setTracking: Dispatch<SetStateAction<Record<string, DailyTracking>>>;
  progress: ProgressEntry[];
  setProgress: Dispatch<SetStateAction<ProgressEntry[]>>;
  reminders: ReminderSettings;
  setReminders: Dispatch<SetStateAction<ReminderSettings>>;
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  resetToDefaults: () => void;
  exportData: () => string;
  importData: (jsonString: string) => void; // throws on validation failure
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useLocalStorage<WorkoutDay[]>(
    STORAGE_KEYS.workouts,
    defaultWorkouts,
  );
  const [groceries, setGroceries] = useLocalStorage<GroceryCategory[]>(
    STORAGE_KEYS.groceries,
    defaultGroceries,
  );
  const [tracking, setTracking] = useLocalStorage<Record<string, DailyTracking>>(
    STORAGE_KEYS.tracking,
    {},
  );
  const [progress, setProgress] = useLocalStorage<ProgressEntry[]>(
    STORAGE_KEYS.progress,
    [],
  );
  const [reminders, setReminders] = useLocalStorage<ReminderSettings>(
    STORAGE_KEYS.reminders,
    defaultReminders,
  );
  const [profile, setProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.profile,
    defaultProfile,
  );
  const normalizedWorkouts = useMemo(
    () => ensureWorkoutAlternates(workouts),
    [workouts],
  );

  useEffect(() => {
    if (normalizedWorkouts !== workouts) {
      setWorkouts(normalizedWorkouts);
    }
  }, [normalizedWorkouts, setWorkouts, workouts]);

  const resetToDefaults = () => {
    if (
      typeof window === 'undefined' ||
      window.confirm('Reset all data to defaults? This cannot be undone.')
    ) {
      setWorkouts(defaultWorkouts);
      setGroceries(defaultGroceries);
      setTracking({});
      setProgress([]);
      setReminders(defaultReminders);
      setProfile(defaultProfile);
    }
  };

  const exportData = () => {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      workouts,
      groceries,
      tracking,
      progress,
      reminders,
      profile,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Throws Error with a human-readable message if the file is malformed.
  // Caller is responsible for catching and surfacing the message in UI.
  const importData = (jsonString: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('File is not valid JSON.');
    }
    const data = validateImport(parsed); // throws ImportValidationError on failure
    setWorkouts(data.workouts);
    setGroceries(data.groceries);
    setTracking(data.tracking);
    setProgress(data.progress);
    setReminders(data.reminders);
    setProfile(data.profile);
  };

  return (
    <AppContext.Provider
      value={{
        workouts: normalizedWorkouts, setWorkouts,
        groceries, setGroceries,
        tracking, setTracking,
        progress, setProgress,
        reminders, setReminders,
        profile, setProfile,
        resetToDefaults, exportData, importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
