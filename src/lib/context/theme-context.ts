import type { TNullable } from "@eoussama/core";

import type { TResolvedTheme, TTheme } from "../types";

import { createContext } from "react";



export type TThemeContextType = {
  theme: TTheme;
  /**
   * Switches theme, optionally revealing it from a viewport point.
   */
  setTheme: (theme: TTheme, origin?: { x: number; y: number }) => void;
  resolvedTheme: TResolvedTheme;
};

export const ThemeContext = createContext<TNullable<TThemeContextType>>(null);
