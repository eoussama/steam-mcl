"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";

import { THEME_KEY } from "../consts";
import { TNullable, TTheme } from "../types";
import { changeTheme, getResolvedTheme } from "../helpers";



export type TThemeContextType = {
  theme: TTheme;
  setTheme: (theme: TTheme) => void;
  resolvedTheme: "light" | "dark";
}

export const ThemeContext = createContext<TNullable<TThemeContextType>>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: TTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system"
}) => {
  const [theme, setTheme] = useState<TTheme>(defaultTheme);
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as TTheme;

    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
      setResolvedTheme(getResolvedTheme(savedTheme));
    } else {
      setResolvedTheme(getResolvedTheme(defaultTheme));
    }
    setMounted(true);
  }, [defaultTheme]);

  useEffect(() => {
    if (!mounted) return;

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    changeTheme(theme, resolvedTheme);
  }, [theme, resolvedTheme, mounted]);

  const handleSetTheme = (newTheme: TTheme) => {
    setTheme(newTheme);
    if (mounted) {
      setResolvedTheme(getResolvedTheme(newTheme));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};