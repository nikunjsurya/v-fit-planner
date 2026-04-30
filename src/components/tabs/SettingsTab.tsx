import React, { useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Upload, Trash2, User, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDateKey } from '../../utils/dateKeys';

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

export default function SettingsTab() {
  const {
    resetToDefaults,
    exportData,
    importData,
    reminders,
    setReminders,
    profile,
    setProfile,
  } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState(false);

  const handleExport = () => {
    const dataStr = exportData();
    // Use a Blob URL — the dataURI approach in the original implementation hits
    // browser URL-length limits when tracking history grows large.
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitplanner-backup-${formatDateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportOk(false);

    if (file.size > MAX_BACKUP_BYTES) {
      setImportError('Backup file is too large. Please choose a file under 2 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        setImportError('Could not read file contents.');
        return;
      }
      try {
        importData(content);
        setImportOk(true);
        window.setTimeout(() => setImportOk(false), 3000);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Unknown import error.');
      }
    };
    reader.onerror = () => setImportError('Could not read file.');
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Settings & profile</h2>
        <p className="text-slate-400">Manage your data and profile.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-400">
            <User className="w-5 h-5 mr-2" />
            Profile
          </CardTitle>
          <CardDescription>Used to seed default plans and personal targets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <ProfileField label="Name">
              <input
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Age">
              <input
                type="number"
                min={10}
                max={120}
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: Number(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Height (cm)">
              <input
                type="number"
                min={100}
                max={250}
                value={profile.heightCm}
                onChange={e => setProfile({ ...profile, heightCm: Number(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Goal weight (kg)">
              <input
                type="number"
                step="0.5"
                min={30}
                max={250}
                value={profile.goalWeightKg}
                onChange={e =>
                  setProfile({ ...profile, goalWeightKg: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Diet">
              <input
                value={profile.diet}
                onChange={e => setProfile({ ...profile, diet: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Shift / schedule">
              <input
                value={profile.shiftSummary}
                onChange={e => setProfile({ ...profile, shiftSummary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </ProfileField>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-400">
            <Bell className="w-5 h-5 mr-2" />
            Reminders (placeholder)
          </CardTitle>
          <CardDescription>
            Stored locally. Will drive iOS local notifications after the React Native port.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-2">
            <ProfileField label="Workout reminder time">
              <input
                type="time"
                value={reminders.workoutReminderTime}
                onChange={e =>
                  setReminders({ ...reminders, workoutReminderTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Protein reminder time">
              <input
                type="time"
                value={reminders.proteinReminderTime}
                onChange={e =>
                  setReminders({ ...reminders, proteinReminderTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Creatine reminder time">
              <input
                type="time"
                value={reminders.creatineReminderTime}
                onChange={e =>
                  setReminders({ ...reminders, creatineReminderTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </ProfileField>
            <ProfileField label="Meal-prep day">
              <select
                value={reminders.mealPrepReminderDay}
                onChange={e =>
                  setReminders({ ...reminders, mealPrepReminderDay: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </ProfileField>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={reminders.waterReminderEnabled}
              onChange={e =>
                setReminders({ ...reminders, waterReminderEnabled: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/20"
            />
            <span className="text-slate-300 text-sm">
              Enable water reminders (every 2 hours)
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Data management</CardTitle>
          <CardDescription>
            Backup your progress and custom routines to a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Backup data
            </Button>

            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Restore data
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json,application/json"
              className="hidden"
            />
          </div>

          {importError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400">Import failed</p>
                <p className="text-red-200/80">{importError}</p>
                <p className="text-xs text-red-200/60 mt-1">Your existing data was not changed.</p>
              </div>
            </div>
          )}
          {importOk && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Backup restored.
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-slate-800/50">
            <h4 className="text-red-400 font-medium mb-3 text-sm">Danger zone</h4>
            <Button variant="destructive" onClick={resetToDefaults}>
              <Trash2 className="w-4 h-4 mr-2" />
              Reset all app data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
