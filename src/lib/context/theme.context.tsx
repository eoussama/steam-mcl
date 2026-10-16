import type { ReactNode } from "react";
import type { TResolvedTheme, TTheme } from "../types";
import type { TThemeContextType } from "./theme-context";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import {
  applyTheme,
  getSystemTheme,
  readStoredTheme,
  storeTheme,
  subscribeToSystemTheme,
  subscribeToTheme,
} from "../helpers";
import { ThemeContext } from "./theme-context";



type TThemeProviderProps = {
  children: ReactNode;
};

const getServerTheme = (): TTheme => "system";
const getServerSystemTheme = (): TResolvedTheme => "light";

/**
 * @description
 * Provides the theme preference, synced with local storage, other tabs and the system color scheme.
 *
 * @param props - Component props.
 * @param props.children - Content rendered inside the provider.
 * @returns The theme provider.
 */
export const ThemeProvider: React.FC<TThemeProviderProps> = ({ children }) => {
  const theme = useSyncExternalStore(subscribeToTheme, readStoredTheme, getServerTheme);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo<TThemeContextType>(
    () => ({ theme, setTheme: storeTheme, resolvedTheme }),
    [theme, resolvedTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
};
