'use client';

import { useTheme } from '../lib/theme-context';
import { useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { 
      value: 'light' as const, 
      label: 'Light', 
      icon: Sun
    },
    { 
      value: 'dark' as const, 
      label: 'Dark', 
      icon: Moon
    },
    { 
      value: 'system' as const, 
      label: 'System', 
      icon: Monitor
    },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-3 px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-background)]/80 backdrop-blur-md hover:bg-[var(--background-secondary)]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] hover:scale-105 hover:shadow-lg"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <span className="text-[var(--steam-accent)] transition-transform duration-300 group-hover:scale-110">
          <CurrentIcon size={18} />
        </span>
        <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
          {currentTheme.label}
        </span>
        <ChevronDown 
          size={16}
          className={`text-[var(--foreground-muted)] transition-all duration-300 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-3 w-44 bg-[var(--card-background)]/95 backdrop-blur-lg border border-[var(--card-border)] rounded-xl shadow-xl z-20 overflow-hidden animate-fadeIn">
            {themes.map((themeOption, index) => {
              const IconComponent = themeOption.icon;
              return (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[var(--background-secondary)]/80 transition-all duration-200 transform hover:scale-[1.02] ${
                    theme === themeOption.value 
                      ? 'bg-[var(--background-secondary)]/60 text-[var(--steam-accent)]' 
                      : 'text-[var(--foreground)]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={`transition-all duration-200 ${theme === themeOption.value ? 'text-[var(--steam-accent)] scale-110' : 'text-[var(--foreground-muted)]'}`}>
                    <IconComponent size={16} />
                  </span>
                  <span className="flex-1 text-left">{themeOption.label}</span>
                  {theme === themeOption.value && (
                    <Check size={14} className="text-[var(--steam-accent)] animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}; 