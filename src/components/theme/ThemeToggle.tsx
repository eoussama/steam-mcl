import type { TTheme } from "@/lib/types";

import { Monitor, Moon, Sun } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { isTheme } from "@/lib/helpers";



const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * @description
 * Theme menu. The new theme is revealed as a circle growing from the toggle.
 *
 * @returns The theme toggle.
 */
export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleChange = (value: unknown) => {
    if (!isTheme(value)) {
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();

    setTheme(value as TTheme, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined);
  };

  const CurrentIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={triggerRef}
        render={<Button variant="ghost" size="icon" aria-label="Change theme" />}
      >
        <CurrentIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={handleChange}>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
