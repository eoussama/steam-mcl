import type { TNullable } from "@eoussama/core";

import type { TResolvedTheme, TTheme } from "../types";

import { createContext } from "react";



export type TThemeContextType = {
  theme: TTheme;
  setTheme: (theme: TTheme) => void;
  resolvedTheme: TResolvedTheme;
};

export const ThemeContext = createContext<TNullable<TThemeContextType>>(null);
