import type { TResolvedTheme, TTheme } from "../types";

import { THEME_KEY } from "../consts";



const THEMES: ReadonlyArray<TTheme> = ["light", "dark", "system"];
const THEME_CHANGE_EVENT = "steam-mcl:theme-change";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * @description
 * Checks whether a value is a supported theme.
 *
 * @param value - Value to check.
 * @returns Whether the value is a theme.
 */
export function isTheme(value: unknown): value is TTheme {
  return THEMES.includes(value as TTheme);
}

/**
 * @description
 * Reads the persisted theme preference, falling back to the system theme.
 *
 * @returns The stored theme preference.
 */
export function readStoredTheme(): TTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY);

    return isTheme(stored) ? stored : "system";
  }
  catch {
    return "system";
  }
}

/**
 * @description
 * Persists a theme preference and notifies subscribers in the current tab.
 *
 * @param theme - Theme preference to persist.
 */
export function storeTheme(theme: TTheme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  }
  catch {
    // Storage can be unavailable (private mode, blocked site data), the change still applies in memory.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/**
 * @description
 * Subscribes to theme preference changes, from this tab and from other tabs.
 *
 * @param callback - Invoked whenever the preference changes.
 * @returns A function that removes the subscription.
 */
export function subscribeToTheme(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY) {
      callback();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * @description
 * Reads the operating system color scheme.
 *
 * @returns The system theme.
 */
export function getSystemTheme(): TResolvedTheme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

/**
 * @description
 * Subscribes to operating system color scheme changes.
 *
 * @param callback - Invoked whenever the system color scheme changes.
 * @returns A function that removes the subscription.
 */
export function subscribeToSystemTheme(callback: () => void): () => void {
  const query = window.matchMedia(DARK_SCHEME_QUERY);

  query.addEventListener("change", callback);

  return () => query.removeEventListener("change", callback);
}

/**
 * @description
 * Applies a resolved theme to the document root.
 *
 * @param theme - Theme to apply.
 */
export function applyTheme(theme: TResolvedTheme): void {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}
