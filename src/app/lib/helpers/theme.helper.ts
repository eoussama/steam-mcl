import { TTheme } from "../types";
import { THEME_KEY } from "../consts";



export const getResolvedTheme = (currentTheme: TTheme): "light" | "dark" => {
  if (currentTheme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "light";
  }

  return currentTheme;
};

export const changeTheme = (theme: TTheme, resolvedTheme: "light" | "dark") => {
  const root = document.documentElement;

  root.removeAttribute("data-theme");
  root.setAttribute("data-theme", resolvedTheme);

  localStorage.setItem(THEME_KEY, theme);
}