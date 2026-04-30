import React, { useMemo, useState } from 'react';
import { useAppContext, ExerciseTracking, DailyTracking } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  Dumbbell,
  Edit3,
  Save,
  X,
  Shuffle,
  Check,
  SkipForward,
  StickyNote,
} from 'lucide-react';
import { WorkoutDay, Exercise } from '../../data/initialData';
import { formatDateKey } from '../../utils/dateKeys';
import PageVisual from '../ui/PageVisual';

const EMPTY_TRACKING: DailyTracking = {
  creatine: false,
  water: false,
  shake1: false,
  shake2: false,
  workoutCompleted: null,
};

export default function WorkoutsTab() {
  const { workouts, setWorkouts, tracking, setTracking } = useAppContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<WorkoutDay | null>(null);
  const [openNoteFor, setOpenNoteFor] = useState<string | null>(null);

  // Always read from the canonical workouts list so saves stay in sync.
  const activeWorkout = useMemo(
    () => (activeId ? workouts.find(w => w.id === activeId) ?? null : null),
    [workouts, activeId],
  );

  const todayStr = formatDateKey(new Date());
  const todayTracking = tracking[todayStr] ?? EMPTY_TRACKING;

  const startEdit = () => {
    if (!activeWorkout) return;
    setEditData(JSON.parse(JSON.stringify(activeWorkout)));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editData) return;
    setWorkouts(prev => prev.map(w => (w.id === editData.id ? editData : w)));
    setIsEditing(false);
  };

  const updateExercise = (
    idx: number,
    field: 'name' | 'sets' | 'rest' | 'alternatives',
    value: string,
  ) => {
    if (!editData) return;
    const newEx = [...editData.exercises];
    const currentExercise = newEx[idx];
    if (!currentExercise) return;
    if (field === 'alternatives') {
      newEx[idx] = {
        ...currentExercise,
        alternatives: value.split(',').map(s => s.trim()).filter(Boolean),
      };
    } else {
      newEx[idx] = { ...currentExercise, [field]: value };
    }
    setEditData({ ...editData, exercises: newEx });
  };

  const updateExerciseTracking = (
    exerciseId: string,
    patch: Partial<ExerciseTracking> | null,
  ) => {
    setTracking(prev => {
      const day = prev[todayStr] ?? EMPTY_TRACKING;
      const exMap = { ...(day.exercises ?? {}) };
      if (patch === null) {
        delete exMap[exerciseId];
      } else {
        const existing = exMap[exerciseId] ?? { status: 'done' as const };
        exMap[exerciseId] = { ...existing, ...patch };
      }
      return { ...prev, [todayStr]: { ...EMPTY_TRACKING, ...day, exercises: exMap } };
    });
  };

  const setStatus = (ex: Exercise, status: ExerciseTracking['status'] | null) => {
    if (status === null) {
      updateExerciseTracking(ex.id, null);
      return;
    }
    if (status === 'replaced') {
      updateExerciseTracking(ex.id, {
        status: 'replaced',
        replacementName: ex.alternatives[0] ?? '',
      });
    } else {
      updateExerciseTracking(ex.id, { status });
    }
  };

  if (activeWorkout && isEditing && editData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Edit workout</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              onClick={saveEdit}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Workout name">
            <input
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </Field>
          <Field label="Description / times">
            <textarea
              value={editData.description}
              onChange={e => setEditData({ ...editData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none h-20"
            />
          </Field>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Exercises</h3>
        <div className="space-y-4">
          {editData.exercises.map((ex, idx) => (
            <Card key={ex.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label={`Exercise ${idx + 1}`}>
                    <input
                      value={ex.name}
                      onChange={e => updateExercise(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Sets x reps">
                      <input
                        value={ex.sets}
                        onChange={e => updateExercise(idx, 'sets', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                      />
                    </Field>
                    <Field label="Rest">
                      <input
                        value={ex.rest}
                        onChange={e => updateExercise(idx, 'rest', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                      />
                    </Field>
                  </div>
                </div>
                <Field label="Alternatives (comma-separated)">
                  <input
                    value={ex.alternatives.join(', ')}
                    onChange={e => updateExercise(idx, 'alternatives', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeWorkout) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setActiveId(null)} className="mr-2 px-2">
              &larr; Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight text-white">{activeWorkout.name}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={startEdit}
            className="border-slate-700 bg-slate-800"
          >
            <Edit3 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Edit</span>
          </Button>
        </div>

        <p className="text-emerald-400 font-medium text-sm pb-4 border-b border-slate-800">
          {activeWorkout.description}
        </p>

        <div className="space-y-3 mt-6">
          {activeWorkout.exercises.map((ex, idx) => {
            const exTrack = todayTracking.exercises?.[ex.id];
            return (
              <ExerciseCard
                key={ex.id}
                index={idx}
                exercise={ex}
                tracking={exTrack}
                noteOpen={openNoteFor === ex.id}
                onToggleNote={() =>
                  setOpenNoteFor(openNoteFor === ex.id ? null : ex.id)
                }
                onSetStatus={status =>
                  setStatus(ex, exTrack?.status === status ? null : status)
                }
                onSetReplacement={name =>
                  updateExerciseTracking(ex.id, {
                    status: 'replaced',
                    replacementName: name,
                  })
                }
                onSetNote={note => updateExerciseTracking(ex.id, { note })}
              />
            );
          })}

          {activeWorkout.cardio && (
            <Card className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400 uppercase">
                  Cardio: {activeWorkout.cardio.description}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeWorkout.cardio.duration}
                  {activeWorkout.cardio.speed && ` • Speed: ${activeWorkout.cardio.speed}`}
                  {activeWorkout.cardio.incline && ` • Incline: ${activeWorkout.cardio.incline}`}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Weekly plan</h2>
        <p className="text-slate-400">
          Select a workout to view details, sets, and alternatives.
        </p>
      </div>

      <PageVisual name="workouts" />

      <div className="grid gap-4 sm:grid-cols-2">
        {workouts.map(workout => (
          <Card
            key={workout.id}
            className="cursor-pointer hover:border-emerald-500/50 transition bg-slate-900 border-slate-800"
            onClick={() => setActiveId(workout.id)}
          >
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
              <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="px-2 py-1 bg-slate-800 rounded font-semibold text-[10px] text-slate-300">
                {workout.exercises.length} exercises
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6 text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="text-xs font-medium text-amber-200/80">
          <p className="font-bold text-amber-500 mb-1 tracking-widest uppercase">Pro tip</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Machine busy? Use Replace and pick an alternative — don't skip.</li>
            <li>Start light for the first 2 weeks.</li>
            <li>No ego lifting. Stop on sharp pain.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

type ExerciseCardProps = {
  exercise: Exercise;
  index: number;
  tracking: ExerciseTracking | undefined;
  noteOpen: boolean;
  onToggleNote: () => void;
  onSetStatus: (status: ExerciseTracking['status']) => void;
  onSetReplacement: (name: string) => void;
  onSetNote: (note: string) => void;
};

function ExerciseCard({
  exercise: ex,
  index,
  tracking,
  noteOpen,
  onToggleNote,
  onSetStatus,
  onSetReplacement,
  onSetNote,
}: ExerciseCardProps) {
  const status = tracking?.status;
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';
  const isReplaced = status === 'replaced';

  const cardClass = isDone
    ? 'bg-emerald-900/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
    : isSkipped
    ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
    : isReplaced
    ? 'bg-amber-900/10 border-amber-500/30 ring-1 ring-amber-500/20'
    : 'bg-slate-800/40 hover:bg-slate-800/60 border-slate-700/50';

  const titleClass = isDone
    ? 'line-through text-emerald-300'
    : isSkipped
    ? 'line-through text-slate-500'
    : isReplaced
    ? 'line-through text-slate-500'
    : 'text-white';

  return (
    <Card className={`rounded-xl group transition-all duration-300 ${cardClass}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 ${
                isDone
                  ? 'border-emerald-500 text-emerald-500'
                  : isReplaced
                  ? 'border-amber-500 text-amber-500'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold">{index + 1}</span>
            </div>
            <div className="min-w-0">
              <h3 className={`font-semibold text-sm transition-colors truncate ${titleClass}`}>
                {ex.name}
              </h3>
              <p className="text-[11px] mt-0.5 text-slate-500">
                {ex.sets} • Rest: {ex.rest}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <StatusButton
              active={isDone}
              onClick={() => onSetStatus('done')}
              label="Done"
              tone="emerald"
              Icon={Check}
            />
            <StatusButton
              active={isSkipped}
              onClick={() => onSetStatus('skipped')}
              label="Skip"
              tone="slate"
              Icon={SkipForward}
            />
            {ex.alternatives.length > 0 && (
              <StatusButton
                active={isReplaced}
                onClick={() => onSetStatus('replaced')}
                label="Replace"
                tone="amber"
                Icon={Shuffle}
              />
            )}
            <button
              type="button"
              onClick={onToggleNote}
              aria-label="Toggle note"
              aria-expanded={noteOpen}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition ${
                tracking?.note
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isReplaced && ex.alternatives.length > 0 && (
          <div className="mt-4 ml-9 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <Shuffle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                  Doing instead
                </p>
                <select
                  value={tracking?.replacementName ?? ex.alternatives[0]}
                  onChange={e => onSetReplacement(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/20 rounded px-2 py-1.5 text-sm text-amber-100 focus:border-amber-500 outline-none"
                >
                  {ex.alternatives.map(alt => (
                    <option key={alt} value={alt}>
                      {alt}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-200/70 mt-1">
                  Same volume: keep it to {ex.sets} with {ex.rest} rest.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isReplaced && ex.alternatives.length > 0 && (
          <div className="mt-3 text-xs text-slate-400 ml-9">
            <span className="font-medium text-slate-300">Alternatives: </span>
            {ex.alternatives.join(', ')}
          </div>
        )}

        {ex.warning && !isReplaced && (
          <div className="mt-2 ml-9 flex items-start text-[10px] text-red-300 bg-red-950/20 p-1.5 rounded border border-red-900/30">
            <AlertTriangle className="w-3 h-3 mr-1.5 shrink-0 mt-0.5" />
            <p>{ex.warning}</p>
          </div>
        )}

        {noteOpen && (
          <div className="mt-3 ml-9">
            <textarea
              rows={2}
              value={tracking?.note ?? ''}
              onChange={e => onSetNote(e.target.value)}
              placeholder="Note for this exercise (weight used, form cues, etc.)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusButton({
  active,
  onClick,
  label,
  tone,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: 'emerald' | 'amber' | 'slate';
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const toneClasses = {
    emerald: active
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-emerald-300',
    amber: active
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-amber-300',
    slate: active
      ? 'bg-slate-700 text-slate-200 border-slate-600'
      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`h-7 px-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border flex items-center gap-1 transition ${toneClasses[tone]}`}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
