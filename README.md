# V-Fit Planner

A personal, single-user fitness planner: weekly workouts, daily tracking, vegetarian meal-prep, grocery list, progress logs, and reminder placeholders. Mobile-first, dark-only, fully offline, all data stored in `localStorage`. Designed to be ported to a React Native / Expo iOS app later.

## Stack
- Vite 6 + React 19 + TypeScript
- Tailwind CSS 4 (`@tailwindcss/vite`)
- `lucide-react` icons, `date-fns`, `uuid`
- No backend, no auth, no analytics

## Install

```bash
npm install
```

Requires Node 18+ (Node 20+ recommended).

## Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build → dist/
npm run preview  # serve the production build
npm run lint     # tsc --noEmit (type check)
```

## Folder structure

```
src/
  App.tsx                  # AppProvider + Layout
  main.tsx                 # React root
  index.css                # Tailwind import + body styles
  context/
    AppContext.tsx         # global state, defaults, export/import, reset
  hooks/
    useLocalStorage.ts     # safe read/write hook (mobile-port seam)
  utils/
    dayPlan.ts             # pure: day-of-week → expected workout + eating notes
    validateImport.ts      # pure: structural validator + migrator for backups
  data/
    initialData.ts         # types + default workouts, groceries, profile
    mealData.ts            # static meal-prep sessions, protein/carb/avoid lists
  lib/
    utils.ts               # cn() className helper
  components/
    Layout.tsx             # responsive shell (sidebar on desktop, bottom nav on mobile)
    ui/
      card.tsx, button.tsx
    tabs/
      DashboardTab.tsx     # Today: habits, sleep, meal-prep boxes, daily note
      WorkoutsTab.tsx      # weekly plan, edit, per-exercise done/skip/replace + notes
      MealsTab.tsx         # static reference: protein, carb, avoid
      MealPrepTab.tsx      # weekly cooking sessions + portion sizes
      GroceryTab.tsx       # checklist + auto-fill staples
      ProgressTab.tsx      # weight / waist / sleep history
      SettingsTab.tsx      # editable profile, reminder placeholders, backup, reset
```

## Data storage

All state lives in `localStorage` under these keys:

| Key | Shape |
|---|---|
| `fit_workouts` | `WorkoutDay[]` (slot, exercises, cardio) |
| `fit_groceries` | `GroceryCategory[]` |
| `fit_tracking` | `Record<yyyy-MM-dd, DailyTracking>` |
| `fit_progress` | `ProgressEntry[]` (weight/waist/sleep history) |
| `fit_reminders` | `ReminderSettings` (placeholder time fields) |
| `fit_profile` | `UserProfile` (name, age, height, goal weight, diet, shift) |

Reads are wrapped in try/catch — a corrupted key clears itself and falls back to defaults instead of crashing the app.

`DailyTracking` per day stores: water/creatine/shake1/shake2 booleans, sleep hours, meal-prep boxes done (0–3), free-form note, completed workout id, and a per-exercise map keyed by exercise id (`done` / `skipped` / `replaced` with optional replacement name and per-exercise note).

## Backup / restore

**Backup** (Settings → Data → Backup data) downloads `fitplanner-backup-YYYY-MM-DD.json` containing every slice plus `schemaVersion` and `exportedAt`.

**Restore** (Settings → Data → Restore data) reads the file and runs it through a structural validator before touching state. Malformed files surface an inline error and your existing data is left untouched. Backups from older formats (no `schemaVersion`) still import — slot fields and meal-prep box counts are migrated automatically.

**Reset** (Settings → Danger zone → Reset all app data) restores all slices to their defaults after a confirmation prompt.

## Manual smoke test

Run `npm run dev` and walk through:

1. Fresh load with empty `localStorage` → defaults seed every tab without errors.
2. Switch every tab — no console errors.
3. Workouts → open Push → edit a name and exercise → Save → refresh → edit persists.
4. Workouts → mark an exercise Done / Skip / Replace → refresh → status persists.
5. Workouts → open the per-exercise note → type → refresh → note persists.
6. Today → step "Meal-prep boxes done" 0 → 3 → refresh → persists.
7. Today → type a daily note → refresh → persists.
8. Today → step sleep hours → can't go below 0 or above 14.
9. Settings → edit profile fields → refresh → persists, and the desktop sidebar reflects the new values.
10. Settings → Backup → JSON downloads, contains `"schemaVersion": 1`.
11. Settings → corrupt one key in DevTools (`localStorage.setItem('fit_workouts', '{not json')`) → reload → app still loads (slice falls back, console warns).
12. Settings → Restore with a malformed file → friendly inline error, state unchanged.
13. Settings → Reset → confirm → all slices return to defaults.
14. DevTools mobile viewport (375px) → bottom tab bar visible, all tabs render legibly.

## Known limitations

- All data is local to one browser. No sync across devices, no account, no recovery if you wipe the browser without exporting first.
- The reminder time fields are stored only — no actual notifications fire until the iOS port lands.
- The Meals and Meal Prep tabs are reference-only; they don't yet persist per-day meal choices.
- Day-of-week mapping is hard-coded to the night-shift (Tue–Sat) schedule. Editing your shift in Settings updates the displayed text but does not yet regenerate the rotation.
- `lint` is just `tsc --noEmit`; there's no ESLint or test framework. Verification is via the manual smoke test above.

## Future iOS conversion (React Native / Expo)

The architecture deliberately leaves a clean seam:

1. **Storage**: replace the body of `src/hooks/useLocalStorage.ts` with `@react-native-async-storage/async-storage`. The public hook signature stays — every consumer keeps working.
2. **Routing**: today, `Layout.tsx` switches tabs via `useState`. Replace with `@react-navigation/bottom-tabs`. The seven tab components are already self-contained.
3. **UI**: `View` / `Text` / `TextInput` instead of `div` / `span` / `input`; `NativeWind` keeps Tailwind classNames working, otherwise translate to `StyleSheet`.
4. **Pure logic** in `src/utils/dayPlan.ts` and `src/utils/validateImport.ts` ports unchanged.
5. **Local notifications**: `expo-notifications`. Watch the `reminders` slice in a `useEffect` inside `AppProvider` and call `Notifications.scheduleNotificationAsync` whenever a time changes. Cancel and re-schedule on update.
6. **Defaults and types** in `src/data/initialData.ts` are shared verbatim.

## Future features (not yet built)

- React Native / Expo iOS app
- Local notifications driven by the `reminders` slice
- Onboarding questionnaire (shift hours, training preferences) on first run
- Lifestyle-based plan generator that re-orders the weekly rotation around the answers
- Optional cloud sync (single-user, end-to-end)
- Progress charts (weight / waist / sleep trends) — `recharts` on web, `react-native-chart-kit` on iOS
