export type TTheme = "light" | "dark" | "system";

export type TResolvedTheme = Exclude<TTheme, "system">;
