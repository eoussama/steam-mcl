"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

import { useTheme } from "../hooks/useTheme";



export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = (): React.ReactNode => {
    switch (theme) {
      case "light":
        return <Sun size={18} className="transition-all duration-300 group-hover:rotate-180" />;
      case "dark":
        return <Moon size={18} className="transition-all duration-300 group-hover:rotate-12" />;
      case "system":
        return <Monitor size={18} className="transition-all duration-300 group-hover:scale-110" />;
      default:
        return <Monitor size={18} className="transition-all duration-300 group-hover:scale-110" />;
    }
  };

  const themes = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "system", name: "System", icon: Monitor },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-1.5 px-3 py-2 bg-[var(--card-background)]/80 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-xl shadow-lg hover:shadow-[var(--steam-accent)]/20 transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 cursor-pointer"
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
        <ChevronDown 
          size={14} 
          className={`transition-all duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-[var(--steam-accent)]`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-[var(--card-background)]/95 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-xl shadow-2xl overflow-hidden animate-fadeInUp">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 text-left transition-all duration-300 cursor-pointer
                  hover:bg-[var(--steam-accent)]/10 hover:text-[var(--steam-accent)]
                  ${theme === themeOption.id 
                    ? 'bg-[var(--steam-accent)]/20 text-[var(--steam-accent)] font-semibold' 
                    : 'text-[var(--foreground)]'
                  }
                `}
                aria-label={`Switch to ${themeOption.name} theme`}
              >
                <Icon size={16} className="transition-all duration-300" />
                <span className="font-medium text-sm">{themeOption.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}; 