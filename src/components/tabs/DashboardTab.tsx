import React, { useEffect, useMemo, useState } from 'react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { useAppContext, DailyTracking } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import {
  CheckCircle2,
  Droplets,
  Moon,
  Coffee,
  AlertTriangle,
  Calculator,
  ChefHat,
  StickyNote,
} from 'lucide-react';
import { WorkoutDay } from '../../data/initialData';
import { getDayPlan } from '../../utils/dayPlan';
import { formatDateKey, parseDateKey } from '../../utils/dateKeys';
import PageVisual from '../ui/PageVisual';

const EMPTY_TRACKING: DailyTracking = {
  creatine: false,
  water: false,
  shake1: false,
  shake2: false,
  workoutCompleted: null,
  dayCompleted: false,
};

const SLEEP_MIN = 0;
const SLEEP_MAX = 14;

export default function DashboardTab() {
  const { tracking, setTracking, workouts } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [missedWorkout, setMissedWorkout] = useState<{ date: string; workout: WorkoutDay } | null>(null);

  const [proteinCalcOpen, setProteinCalcOpen] = useState(false);
  const [protBoxes, setProtBoxes] = useState(2);
  const [protShakes, setProtShakes] = useState(2);
  const [protExtra, setProtExtra] = useState(20);

  const todayStr = formatDateKey(selectedDate);
  const selectedTracking: DailyTracking = tracking[todayStr] ?? EMPTY_TRACKING;
  const isViewingToday = isSameDay(selectedDate, new Date());

  const { expectedWorkout, scheduleNote, eatingNotes } = useMemo(
    () => getDayPlan(selectedDate, workouts),
    [selectedDate, workouts],
  );
  const plannedWorkoutCompleted =
    !!expectedWorkout && selectedTracking.workoutCompleted === expectedWorkout.id;

  useEffect(() => {
    // Surface the most recent missed workout in the last 3 days, but only when
    // viewing today — don't nag while reviewing history.
    if (!isViewingToday) {
      setMissedWorkout(null);
      return;
    }
    for (let i = 1; i <= 3; i++) {
      const checkDate = subDays(startOfDay(new Date()), i);
      const checkStr = formatDateKey(checkDate);
      const plan = getDayPlan(checkDate, workouts);
      const checkTrack = tracking[checkStr];
      if (
        plan.expectedWorkout &&
        checkTrack?.workoutCompleted !== plan.expectedWorkout.id
      ) {
        setMissedWorkout({ date: checkStr, workout: plan.expectedWorkout });
        return;
      }
    }
    setMissedWorkout(null);
  }, [selectedDate, tracking, workouts, isViewingToday]);

  const updateTracking = (patch: Partial<DailyTracking>) => {
    setTracking(prev => ({
      ...prev,
      [todayStr]: { ...EMPTY_TRACKING, ...prev[todayStr], ...patch },
    }));
  };

  const toggleBool = (key: 'creatine' | 'water' | 'shake1' | 'shake2' | 'dayCompleted') => {
    updateTracking({ [key]: !selectedTracking[key] } as Partial<DailyTracking>);
  };

  const setSleepHours = (h: number) => {
    updateTracking({ sleepHours: Math.max(SLEEP_MIN, Math.min(SLEEP_MAX, h)) });
  };

  const setMealPrepBoxes = (n: number) => {
    updateTracking({ mealPrepBoxesDone: Math.max(0, Math.min(3, n)) });
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const totalProtein = protBoxes * 35 + protShakes * 25 + protExtra;
  const sleepHours = selectedTracking.sleepHours ?? 7;
  const mealPrepBoxes = selectedTracking.mealPrepBoxesDone ?? 0;

  return (
    <div className="space-y-6">
      {/* Weekly calendar strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-x-auto select-none">
        <div className="flex justify-between items-center min-w-[320px] gap-2">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dStr = formatDateKey(day);
            const hasData = tracking[dStr]?.dayCompleted;
            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(day)}
                aria-label={`Select ${format(day, 'EEEE, MMM do')}`}
                aria-pressed={isSelected}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-[3.5rem] transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 scale-105 shadow-md shadow-emerald-500/20'
                    : isToday
                    ? 'bg-slate-800/80 text-white border border-slate-700'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-black mt-1 leading-none">
                  {format(day, 'd')}
                </span>
                <div className="h-1.5 w-1.5 rounded-full mt-2">
                  {hasData ? (
                    <div className={`w-full h-full rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-500'}`} />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isViewingToday ? 'Today' : format(selectedDate, 'EEEE')}
          </h2>
          <span className="text-sm font-semibold text-slate-500">
            {format(selectedDate, 'MMM do, yyyy')}
          </span>
        </div>
        <p className="text-emerald-400 font-medium">{scheduleNote}</p>
      </div>

      <PageVisual name="today" />

      {sleepHours < 5 && isViewingToday && expectedWorkout && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 shadow-lg max-w-full">
          <span className="text-red-400 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">
              Low sleep warning ({sleepHours} hrs)
            </p>
            <p className="text-sm text-red-200/80">
              You slept less than 5 hours. Keep your workout light: drop 1 set per exercise, skip cardio, or take an active recovery day to prevent injury.
            </p>
          </div>
        </div>
      )}

      {missedWorkout && isViewingToday && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="text-xs font-medium text-amber-200/80">
              <p className="font-bold text-amber-500 mb-0.5 tracking-widest uppercase">Missed workout</p>
              <p>
                You missed{' '}
                <strong className="text-amber-400">{missedWorkout.workout.name}</strong>{' '}
                on {format(parseDateKey(missedWorkout.date), 'EEEE')}.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              onClick={() => setMissedWorkout(null)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
              onClick={() => {
                updateTracking({ workoutCompleted: missedWorkout.workout.id });
                setMissedWorkout(null);
              }}
            >
              Do it today
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Workout of the day */}
        <Card
          className={`border overflow-hidden relative ${
            selectedTracking.dayCompleted
              ? 'bg-slate-900 border-slate-800 opacity-80'
              : 'bg-slate-900 border-emerald-500/20'
          }`}
        >
          <CardHeader>
            <CardTitle className={plannedWorkoutCompleted ? 'text-slate-400' : 'text-emerald-400'}>
              Workout of the day
            </CardTitle>
            <CardDescription>
              {expectedWorkout ? expectedWorkout.name : 'Rest or active recovery'}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col h-[calc(100%-80px)]">
            {expectedWorkout ? (
              <div className="space-y-4 flex-1">
                <p className="text-sm text-slate-300">{expectedWorkout.description}</p>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() =>
                      updateTracking({
                        workoutCompleted: plannedWorkoutCompleted
                          ? null
                          : expectedWorkout.id,
                      })
                    }
                    aria-pressed={plannedWorkoutCompleted}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition text-sm font-bold shadow-sm ${
                      plannedWorkoutCompleted
                        ? 'bg-slate-800 text-emerald-400 border-slate-700'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {plannedWorkoutCompleted ? 'Completed' : 'Mark completed'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 flex-1">
                Take it easy. Just hit your water and protein goals.
              </p>
            )}

            <div className="mt-8 pt-4 border-t border-slate-800/50">
              <Button
                variant={selectedTracking.dayCompleted ? 'outline' : 'default'}
                className="w-full"
                onClick={() => toggleBool('dayCompleted')}
              >
                {selectedTracking.dayCompleted ? 'Day finished' : 'Finish day'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily habits */}
        <Card className={selectedTracking.dayCompleted ? 'opacity-80' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily habits</CardTitle>
            <button
              onClick={() => setProteinCalcOpen(o => !o)}
              className="text-slate-500 hover:text-emerald-400"
              aria-label="Toggle protein calculator"
              aria-expanded={proteinCalcOpen}
            >
              <Calculator className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            {proteinCalcOpen && (
              <div className="mb-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
                  <Calculator className="w-3 h-3 mr-2" /> Protein estimator
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Meal boxes (~35g)</span>
                    <Stepper value={protBoxes} onChange={setProtBoxes} min={0} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Shakes (~25g)</span>
                    <Stepper value={protShakes} onChange={setProtShakes} min={0} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Extra (yogurt, etc.)</span>
                    <input
                      type="number"
                      value={protExtra}
                      onChange={e => setProtExtra(Number(e.target.value) || 0)}
                      className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-center font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-200">Estimated total:</span>
                    <span className="text-lg font-black text-emerald-400">{totalProtein}g</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-200">Sleep (hours)</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSleepHours(sleepHours - 0.5)}
                    aria-label="Decrease sleep"
                    className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-indigo-300 w-8 text-center">
                    {sleepHours}h
                  </span>
                  <button
                    onClick={() => setSleepHours(sleepHours + 0.5)}
                    aria-label="Increase sleep"
                    className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <HabitToggle
                checked={selectedTracking.water}
                onToggle={() => toggleBool('water')}
                label="Water: 2.5 - 3L"
                Icon={Droplets}
                color="text-emerald-500"
              />
              <HabitToggle
                checked={selectedTracking.creatine}
                onToggle={() => toggleBool('creatine')}
                label="Creatine: 5g"
                color="text-emerald-500"
              />
              <HabitToggle
                checked={selectedTracking.shake1}
                onToggle={() => toggleBool('shake1')}
                label="Shake 1 (post-workout usually)"
                Icon={Coffee}
                color="text-orange-400"
              />
              <HabitToggle
                checked={selectedTracking.shake2}
                onToggle={() => toggleBool('shake2')}
                label="Shake 2 (optional)"
                Icon={Coffee}
                color="text-orange-400"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule, eating plan, meal-prep boxes */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & eating plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eatingNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <p className="text-sm font-semibold text-slate-200">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Meal-prep boxes done</p>
                  <p className="text-[11px] text-slate-500">Out of 3 daily portions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMealPrepBoxes(mealPrepBoxes - 1)}
                  aria-label="Fewer boxes"
                  className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-bold text-amber-300 w-8 text-center">
                  {mealPrepBoxes}/3
                </span>
                <button
                  onClick={() => setMealPrepBoxes(mealPrepBoxes + 1)}
                  aria-label="More boxes"
                  className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {mealPrepBoxes < 1 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <p className="font-bold text-amber-500 text-xs tracking-wider uppercase mb-3">
                  Quick no-cook backups
                </p>
                <ul className="space-y-2.5 text-sm text-amber-200/90">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <div>
                      <strong>Double shake:</strong> 2 scoops whey + peanut butter + banana
                      <span className="text-xs opacity-70 block">~60g protein. Quickest fix.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <div>
                      <strong>Yogurt bowl:</strong> 1 big cup Greek yogurt + 1 scoop whey
                      <span className="text-xs opacity-70 block">~40-50g protein. Filling & sweet.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <div>
                      <strong>Quick paneer:</strong> 200g paneer cubes, raw or pan-fried
                      <span className="text-xs opacity-70 block">~36g protein. Simple fats + protein.</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/50">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
              <StickyNote className="w-4 h-4 text-emerald-500" />
              Notes for this day
            </label>
            <textarea
              rows={2}
              value={selectedTracking.notes ?? ''}
              onChange={e => updateTracking({ notes: e.target.value })}
              placeholder="Anything to remember? Mood, energy, soreness..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
        className="w-6 h-6 bg-slate-700 rounded text-xs"
      >
        -
      </button>
      <span className="text-sm font-mono w-4 text-center">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        className="w-6 h-6 bg-slate-700 rounded text-xs"
      >
        +
      </button>
    </div>
  );
}

function HabitToggle({
  checked,
  onToggle,
  label,
  Icon,
  color = 'text-emerald-500',
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="flex items-center space-x-3 w-full text-left group"
    >
      <span className={color}>
        {checked ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : Icon ? (
          <Icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition" />
        ) : (
          <span className="block w-5 h-5 border-2 border-emerald-500 rounded-lg opacity-70 group-hover:opacity-100" />
        )}
      </span>
      <span className={`text-sm select-none font-medium ${checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
        {label}
      </span>
    </button>
  );
}
