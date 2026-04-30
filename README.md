# V-Fit Planner

A personal, single-user fitness planner: weekly workouts, daily tracking, vegetarian meal-prep, grocery list, progress logs, and reminder placeholders. Mobile-first, dark-only, fully offline. Ships as an installable PWA you add to your iPhone home screen. Architected so a React Native / Expo iOS port stays a mechanical refactor.

## Stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS 4 (`@tailwindcss/vite`)
- `vite-plugin-pwa` + `@vite-pwa/assets-generator` (manifest, service worker, iOS icons)
- `lucide-react` icons, `date-fns`, `uuid`
- No backend, no auth, no analytics. All data lives in `localStorage`.

## Install

```bash
npm install
```

Requires Node 18+ (Node 20+ recommended).

## Run

```bash
npm run dev      # http://localhost:3000 (HMR, no PWA)
npm run build    # production build → dist/ (PWA assets generated)
npm run preview  # serve the production build
npm run lint     # tsc --noEmit (type check)
```

## Test on Windows

Local testing on your dev machine is just a browser. Two flavors:

1. **Quick iteration**: `npm run dev`, open `http://localhost:3000` in any browser. The PWA service worker is intentionally disabled in dev mode so HMR works.
2. **PWA install dry-run**: `npm run build && npm run preview`, open `http://localhost:4173` in Chrome. Open DevTools → Application → Manifest to confirm name/icons/theme. Application → Service Workers shows the registered SW. Lighthouse → PWA gives a score.

Use Chrome's mobile viewport (DevTools → Toggle Device Toolbar) to preview the bottom-nav layout. iPhone-specific behavior (safe-area insets under the home indicator and notch) only renders on a real iPhone in standalone mode.

## Deploy + install on iPhone

The fastest free path is Vercel. From the project root:

```bash
npx vercel              # first run: login in browser, set up project (Vite auto-detected)
npx vercel --prod       # subsequent deploys to production
```

Vercel hands you back a `https://<your-project>.vercel.app` URL. Open it on your iPhone in **Safari** (not Chrome — Chrome on iOS uses Safari's engine but does not expose the Add-to-Home-Screen flow).

To install:

1. Tap the **Share** icon (square with up arrow) at the bottom of Safari.
2. Scroll the share sheet, tap **Add to Home Screen**.
3. Confirm the name (V-Fit) and tap **Add**. The icon appears on your home screen.
4. Open it from the home screen. The app launches full-screen with no Safari chrome and works offline once the service worker has cached its assets (open it once with internet, then again offline to confirm).

Netlify and Cloudflare Pages also work; both auto-detect Vite and deploy on push if you connect a Git repo.

## Folder structure

```
public/
  icon.svg                 # source PWA icon (rasterised at build time into all sizes)
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
    Layout.tsx             # responsive shell (sidebar on desktop, bottom nav on mobile, iOS safe-area aware)
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

Reads are wrapped in try/catch. A corrupted key clears itself and falls back to defaults instead of crashing the app.

`DailyTracking` per day stores: water/creatine/shake1/shake2 booleans, sleep hours, meal-prep boxes done (0–3), free-form note, completed workout id, and a per-exercise map keyed by exercise id (`done` / `skipped` / `replaced` with optional replacement name and per-exercise note).

## Backup / restore

**Backup** (Settings → Data → Backup data) downloads `fitplanner-backup-YYYY-MM-DD.json` containing every slice plus `schemaVersion` and `exportedAt`.

**Restore** (Settings → Data → Restore data) reads the file and runs it through a structural validator before touching state. Malformed files surface an inline error and your existing data is left untouched. Backups from older formats (no `schemaVersion`) still import — slot fields and meal-prep box counts are migrated automatically.

**Reset** (Settings → Danger zone → Reset all app data) restores all slices to their defaults after a confirmation prompt.

Because the app is local-only, the only durable backup of your data is the JSON file. Export occasionally, especially before clearing Safari data or reinstalling the home-screen app.

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
9. Progress → log an entry → refresh → entry persists, has a stable id (no collisions if you log twice fast).
10. Settings → edit profile fields → refresh → persists, and the desktop sidebar reflects the new values.
11. Settings → Backup → JSON downloads, contains `"schemaVersion": 1`.
12. Settings → corrupt one key in DevTools (`localStorage.setItem('fit_workouts', '{not json')`) → reload → app still loads (slice falls back, console warns).
13. Settings → Restore with a malformed file → friendly inline error, state unchanged.
14. Settings → Reset → confirm → all slices return to defaults.
15. DevTools mobile viewport (375px) → bottom tab bar visible, all tabs render legibly.

PWA-only checks (run `npm run build && npm run preview`):

16. DevTools → Application → Manifest → name, theme color, icons all present, no errors.
17. DevTools → Application → Service Workers → `sw.js` registered and activated.
18. Reload with the Network tab on "Offline" → app still loads from the SW cache.

## Known limitations

- Data lives in one browser / one installed PWA. No sync across devices, no account, no recovery if you wipe Safari data without exporting first.
- The reminder time fields are stored only — no notifications fire. Web Push on iOS Safari requires a separate setup that the React Native port handles more cleanly.
- The Meals and Meal Prep tabs are reference-only; they don't yet persist per-day meal choices.
- Day-of-week mapping is hard-coded to the night-shift (Tue–Sat) schedule. Editing your shift in Settings updates the displayed text but does not yet regenerate the rotation.
- `lint` is just `tsc --noEmit`; there's no ESLint or test framework. Verification is via the manual smoke test above.

## Future iOS conversion (React Native / Expo)

The PWA is the bridge. When ready to put this in the App Store, the architecture is set up so the port is mechanical:

1. **Storage**: replace the body of `src/hooks/useLocalStorage.ts` with `@react-native-async-storage/async-storage`. The public hook signature stays — every consumer keeps working.
2. **Routing**: today, `Layout.tsx` switches tabs via `useState`. Replace with `@react-navigation/bottom-tabs`. The seven tab components are already self-contained.
3. **UI**: `View` / `Text` / `TextInput` instead of `div` / `span` / `input`; `NativeWind` keeps Tailwind classNames working, otherwise translate to `StyleSheet`.
4. **Pure logic** in `src/utils/dayPlan.ts` and `src/utils/validateImport.ts` ports unchanged.
5. **Local notifications**: `expo-notifications`. Watch the `reminders` slice in a `useEffect` inside `AppProvider` and call `Notifications.scheduleNotificationAsync` whenever a time changes. Cancel and re-schedule on update.
6. **Defaults and types** in `src/data/initialData.ts` are shared verbatim.
7. **Build + ship**: EAS Build (cloud) compiles the iOS binary from Windows. Apple Developer Program membership ($99/yr) is required for TestFlight + App Store submission.

## Future features (not yet built)

- React Native / Expo iOS app + EAS Build pipeline
- Local notifications driven by the `reminders` slice (web push first, native after)
- Onboarding questionnaire (shift hours, training preferences) on first run
- Lifestyle-based plan generator that re-orders the weekly rotation around the answers
- Optional cloud sync (single-user, end-to-end)
- Progress charts (weight / waist / sleep trends) using an RN-portable charting approach
