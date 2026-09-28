/**
 * Safe localStorage helpers.
 *
 * Progress is the whole point of a learning platform, so the account must
 * survive a refresh. Every access is guarded: localStorage is unavailable
 * during SSR and throws in private mode or when storage is full, and none of
 * that should ever break the app.
 */

const PREFIX = "tokenexchange:";

export function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota exceeded or storage blocked
  }
}

export function clearAll(keys) {
  if (typeof window === "undefined") return;
  for (const key of keys) {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }
}
