import { useContext } from "react";
import { ThemeContext, TThemeContextType } from "../lib";



export const useTheme = (): TThemeContextType => {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};