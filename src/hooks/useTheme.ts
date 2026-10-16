import type { TThemeContextType } from "@/lib/context";

import { use } from "react";

import { ThemeContext } from "@/lib/context";



/**
 * @description
 * Reads the current theme preference and its resolved value.
 *
 * @returns The theme context.
 */
export function useTheme(): TThemeContextType {
  const context = use(ThemeContext);

  if (context == null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
