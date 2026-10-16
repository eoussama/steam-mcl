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
 * Resolves a theme preference to the theme to display.
 *
 * @param theme - Theme preference.
 * @returns The light or dark theme.
 */
export function resolveTheme(theme: TTheme): TResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

/**
 * @description
 * Applies a resolved theme to the document root.
 *
 * @param theme - Theme to apply.
 */
export function applyTheme(theme: TResolvedTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Inline script applying the stored theme before the first paint, so pages never flash the wrong theme.
 */
export const THEME_BOOT_SCRIPT = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    const dark = stored === "dark" || (stored !== "light" && matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})()`;

/**
 * @description
 * Switches theme, revealing the new one as a circle growing from the given point when the browser supports
 * view transitions and the visitor allows motion.
 *
 * @param theme - Theme preference to switch to.
 * @param origin - Viewport point the reveal starts from, usually the toggle.
 * @param origin.x - Horizontal coordinate, in pixels.
 * @param origin.y - Vertical coordinate, in pixels.
 */
export function switchTheme(theme: TTheme, origin?: { x: number; y: number }): void {
  const apply = () => {
    storeTheme(theme);
    applyTheme(resolveTheme(theme));
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!origin || reduceMotion || typeof document.startViewTransition !== "function" || resolveTheme(theme) === resolveTheme(readStoredTheme())) {
    apply();

    return;
  }

  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));

  root.dataset.themeTransition = "";

  const transition = document.startViewTransition(apply);

  void transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });

  void transition.finished.finally(() => {
    delete root.dataset.themeTransition;
  });
}
