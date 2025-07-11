'use client';

import { useTheme } from '../lib/theme-context';
import { useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { 
      value: 'light' as const, 
      label: 'Light', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      )
    },
    { 
      value: 'dark' as const, 
      label: 'Dark', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )
    },
    { 
      value: 'system' as const, 
      label: 'System', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-background)] hover:bg-[var(--background-secondary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <span className="text-[var(--steam-accent)]">
          {currentTheme.icon}
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">
          {currentTheme.label}
        </span>
        <svg 
          className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-36 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg shadow-lg z-20 overflow-hidden">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-[var(--background-secondary)] transition-colors duration-150 ${
                  theme === themeOption.value 
                    ? 'bg-[var(--background-secondary)] text-[var(--steam-accent)]' 
                    : 'text-[var(--foreground)]'
                }`}
              >
                <span className={theme === themeOption.value ? 'text-[var(--steam-accent)]' : 'text-[var(--foreground-muted)]'}>
                  {themeOption.icon}
                </span>
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <svg className="w-3 h-3 ml-auto text-[var(--steam-accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 