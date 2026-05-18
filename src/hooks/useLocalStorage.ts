import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// Mobile-port seam: when moving to React Native / Expo, replace the body of this
// hook with @react-native-async-storage/async-storage. Read becomes async (load
// via useEffect, hydrate state on resolve); write stays fire-and-forget. The
// public signature stays the same so callers do not have to change.

// One-time signal that some key got auto-cleared on read because its
// JSON was corrupt. SettingsTab reads this and shows a recovery banner
// so users notice they were silently reset to defaults.
export const RECOVERY_FLAG_KEY = '_fit_last_recovery';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (err) {
    console.warn('[useLocalStorage] Browser storage is unavailable.', err);
    return null;
  }
}

function flagRecovery(key: string, message: string) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(
      RECOVERY_FLAG_KEY,
      JSON.stringify({
        key,
        message,
        at: new Date().toISOString(),
      }),
    );
  } catch {
    /* if we can't flag it, the user won't see the notice — not fatal */
  }
}

export function useLocalStorage<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storage = getLocalStorage();
    if (!storage) return fallback;
    try {
      const raw = storage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(
        `[useLocalStorage] Corrupted value at "${key}" — clearing and falling back to defaults.`,
        err,
      );
      try {
        storage.removeItem(key);
      } catch {
        /* no-op */
      }
      flagRecovery(
        key,
        `Stored data for "${key}" was corrupted and reset to defaults.`,
      );
      return fallback;
    }
  });

  useEffect(() => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Quota or serialization error. The in-memory state still has the
      // value for the session, but writes won't persist. Flag it so the
      // SettingsTab recovery banner explains the silence; we don't throw
      // because the user can keep using the app for this session.
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' ||
          err.code === 22 ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      const reason = isQuota
        ? `Storage quota was exceeded while saving "${key}". New changes for this session will not persist on reload. Free up space by exporting + resetting.`
        : `Failed to write "${key}" to storage. New changes for this session may not persist.`;
      console.warn(`[useLocalStorage] ${reason}`, err);
      flagRecovery(key, reason);
    }
  }, [key, value]);

  return [value, setValue];
}
