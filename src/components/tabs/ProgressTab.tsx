import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAppContext, ProgressEntry } from '../../context/AppContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

const blankEntry = (): Omit<ProgressEntry, 'id'> => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  weight: '',
  waist: '',
  sleep: '',
  notes: '',
});

export default function ProgressTab() {
  const { progress, setProgress } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(blankEntry);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: ProgressEntry = { ...draft, id: Date.now().toString() };
    setProgress(prev => [entry, ...prev]);
    setDraft(blankEntry());
    setShowAdd(false);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm('Delete this entry?')) {
      setProgress(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Progress</h2>
          <p className="text-sm text-slate-400">Track weight, waist, and sleep over time.</p>
        </div>
        <Button onClick={() => setShowAdd(s => !s)}>
          {showAdd ? 'Cancel' : (<><Plus className="w-4 h-4 mr-2" /> Log</>)}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-emerald-500/20 bg-slate-900 border">
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <input
                    type="date"
                    value={draft.date}
                    onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 82.5"
                    value={draft.weight}
                    onChange={e => setDraft(d => ({ ...d, weight: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
                  />
                </Field>
                <Field label="Waist">
                  <input
                    type="text"
                    placeholder="e.g. 34 in"
                    value={draft.waist}
                    onChange={e => setDraft(d => ({ ...d, waist: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
                  />
                </Field>
                <Field label="Sleep (hrs)">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 7.5"
                    value={draft.sleep}
                    onChange={e => setDraft(d => ({ ...d, sleep: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
                  />
                </Field>
              </div>
              <Field label="Notes">
                <textarea
                  rows={2}
                  placeholder="Felt strong today. Took progress photo."
                  value={draft.notes}
                  onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition"
                />
              </Field>
              <Button type="submit" className="w-full">Save entry</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {progress.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-slate-800 border-dashed rounded-3xl bg-slate-900/50">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No progress logged yet. Log your starting stats to begin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map(entry => (
            <Card key={entry.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-5 relative group">
                <button
                  onClick={() => deleteEntry(entry.id)}
                  aria-label="Delete entry"
                  className="absolute top-5 right-5 text-slate-600 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-emerald-400 mb-3">
                  {format(new Date(entry.date), 'MMM do, yyyy')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {entry.weight && (
                    <Stat label="Weight" value={`${entry.weight} kg`} />
                  )}
                  {entry.waist && <Stat label="Waist" value={entry.waist} />}
                  {entry.sleep && (
                    <Stat label="Sleep" value={`${entry.sleep} hrs`} />
                  )}
                </div>
                {entry.notes && (
                  <p className="mt-4 text-sm text-slate-300 bg-slate-800/30 p-3 flex border-l-2 border-emerald-500/50 rounded-r-xl">
                    {entry.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
        {label}
      </span>
      <span className="text-slate-100 font-medium">{value}</span>
    </div>
  );
}
