export function getLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore quota/private-mode failures.
  }
}

export function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore errors when storage is unavailable.
  }
}

export function getLocalStorageBoolean(key: string, fallback: boolean): boolean {
  const value = getLocalStorageItem(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function setLocalStorageBoolean(key: string, value: boolean): void {
  setLocalStorageItem(key, String(value));
}

export function getLocalStorageJson<T>(key: string): T | null {
  const value = getLocalStorageItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function setLocalStorageJson<T>(key: string, value: T): void {
  setLocalStorageItem(key, JSON.stringify(value));
}

