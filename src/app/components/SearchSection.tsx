'use client';

import { useState } from 'react';

export const SearchSection: React.FC = () => {
  const [steamProfile, setSteamProfile] = useState('eoussama');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteamProfile(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Functionality will be added later
    console.log('Searching for:', steamProfile);
  };

  return (
    <div className="relative">
      {/* Card with gradient background */}
      <div className="relative bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />
        
        <div className="relative p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label 
                htmlFor="steam-profile" 
                className="block text-sm font-semibold text-[var(--foreground)] mb-3"
              >
                Steam Profile
              </label>
              
              <div className="relative">
                <input
                  id="steam-profile"
                  type="text"
                  value={steamProfile}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`
                    w-full px-6 py-4 text-lg
                    bg-[var(--input-background)] 
                    border-2 rounded-xl
                    text-[var(--input-text)]
                    placeholder:text-[var(--foreground-muted)]
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-0
                    ${isFocused 
                      ? 'border-[var(--steam-accent)] shadow-lg shadow-[var(--steam-accent)]/20 scale-[1.02]' 
                      : 'border-[var(--input-border)] hover:border-[var(--steam-accent)]/50'
                    }
                  `}
                  placeholder="Enter your Steam profile..."
                />
                
                {/* Animated focus ring */}
                <div className={`
                  absolute inset-0 rounded-xl pointer-events-none
                  transition-all duration-300 ease-in-out
                  ${isFocused 
                    ? 'ring-2 ring-[var(--steam-accent)]/30 ring-offset-2 ring-offset-[var(--card-background)]' 
                    : ''
                  }
                `} />
              </div>
              
              <div className="flex items-start space-x-2 mt-3">
                <div className="w-1 h-1 rounded-full bg-[var(--steam-accent)] mt-2 flex-shrink-0" />
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  You can also input{' '}
                  <span className="text-[var(--steam-accent)] font-semibold">Steam ID64</span>,{' '}
                  <span className="text-[var(--steam-accent)] font-semibold">Steam nickname</span>,{' '}
                  <span className="text-[var(--steam-accent)] font-semibold">Profile URL</span> or{' '}
                  <span className="text-[var(--steam-accent)] font-semibold">Profile permalink</span>.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="group relative px-8 py-4 bg-gradient-to-r from-[var(--steam-primary)] to-[var(--steam-secondary)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)] focus:ring-offset-2 focus:ring-offset-[var(--card-background)]"
                aria-label="Search Steam profile"
              >
                <div className="flex items-center space-x-3">
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Profile</span>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-[var(--steam-accent)]/20 rounded-full blur-sm" />
      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-[var(--steam-accent)]/10 rounded-full blur-sm" />
    </div>
  );
}; 