/**
 * Tiny localStorage cache for offline fallbacks.
 * Scoped per user so accounts don't leak data between sessions on shared devices.
 */
const PREFIX = 'ssh-cache:v1';

export function cacheKey(scope: string, userId: string | undefined | null) {
  return `${PREFIX}:${scope}:${userId ?? 'anon'}`;
}

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; savedAt: number };
    return parsed.data;
  } catch {
    return null;
  }
}

export function readCacheMeta<T>(key: string): { data: T; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // storage full or disabled — silently ignore
  }
}

export function clearCache(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
