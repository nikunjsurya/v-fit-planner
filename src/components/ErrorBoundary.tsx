import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

// App-level error boundary. Catches render-time crashes in any tab so the
// whole shell doesn't blank out. Offers a reload button and surfaces the
// error message in dev mode. We don't pipe to a service yet — local-first
// app, so the message stays on the device.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught render error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    if (
      window.confirm(
        'Wipe all locally stored data (workouts, tracking, progress, profile) and reload?',
      )
    ) {
      try {
        for (const key of [
          'fit_workouts',
          'fit_groceries',
          'fit_tracking',
          'fit_progress',
          'fit_reminders',
          'fit_profile',
        ]) {
          localStorage.removeItem(key);
        }
      } catch {
        /* localStorage unavailable; just reload */
      }
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#09090b] text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Something broke</h2>
          </div>
          <p className="text-sm text-slate-300">
            The app hit an unexpected error and stopped rendering. Your saved data is
            still on this device — a reload usually fixes it.
          </p>
          <pre className="text-[11px] text-slate-500 bg-slate-950 border border-slate-800 rounded p-3 overflow-auto max-h-32">
            {this.state.error?.message ?? 'Unknown error'}
          </pre>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg py-2 transition"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg py-2 transition border border-slate-700"
            >
              Reset + Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
