import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// Mobile-port seam: when moving to React Native / Expo, replace the body of this
// hook with @react-native-async-storage/async-storage. Read becomes async (load
// via useEffect, hydrate state on resolve); write stays fire-and-forget. The
// public signature stays the same so callers do not have to change.

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (err) {
    console.warn('[useLocalStorage] Browser storage is unavailable.', err);
    return null;
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
      return fallback;
    }
  });

  useEffect(() => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Quota or serialization error. Don't crash; user can still use the app
      // for the current session. Surface to the console for debugging.
      console.warn(`[useLocalStorage] Failed to write "${key}".`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
