'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ExternalLink } from './ExternalLink';

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
    <div className="relative animate-fadeInUp">
      {/* Card with enhanced gradient background */}
      <div className="relative bg-[var(--card-background)]/80 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-3xl shadow-2xl overflow-hidden group hover:shadow-[var(--steam-accent)]/20 transition-all duration-500">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/10 via-transparent to-[var(--steam-accent)]/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating particles effect */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--steam-accent)]/30 rounded-full animate-pulse" />
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-[var(--steam-accent)]/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative p-6 lg:p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label 
                htmlFor="steam-profile" 
                className="flex items-center space-x-2 text-lg font-bold text-[var(--foreground)] mb-3"
              >
                <Sparkles size={20} className="text-[var(--steam-accent)] animate-pulse" />
                <span>Steam Profile</span>
              </label>
              
              <div className="relative group/input">
                <input
                  id="steam-profile"
                  type="text"
                  value={steamProfile}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`
                    w-full px-6 py-5 text-xl font-medium
                    bg-[var(--input-background)]/80 backdrop-blur-sm
                    border-2 rounded-2xl
                    text-[var(--input-text)]
                    placeholder:text-[var(--foreground-muted)]
                    transition-all duration-500 ease-out
                    focus:outline-none focus:ring-0 cursor-text
                    ${isFocused 
                      ? 'border-[var(--steam-accent)] shadow-2xl shadow-[var(--steam-accent)]/30 scale-[1.02] bg-[var(--input-background)]' 
                      : 'border-[var(--input-border)] hover:border-[var(--steam-accent)]/60 hover:shadow-lg'
                    }
                  `}
                  placeholder="Enter your Steam profile..."
                />
                
                {/* Enhanced focus ring with glow */}
                <div className={`
                  absolute inset-0 rounded-2xl pointer-events-none
                  transition-all duration-500 ease-out
                  ${isFocused 
                    ? 'ring-4 ring-[var(--steam-accent)]/20 ring-offset-4 ring-offset-[var(--card-background)] scale-105' 
                    : ''
                  }
                `} />
                
                {/* Input icon */}
                <div className={`
                  absolute right-5 top-1/2 -translate-y-1/2
                  transition-all duration-300 pointer-events-none
                  ${isFocused ? 'text-[var(--steam-accent)] scale-110' : 'text-[var(--foreground-muted)]'}
                `}>
                  <Search size={24} />
                </div>
              </div>
              
              <div className="flex items-start space-x-3 mt-4 p-3 bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--card-border)]/30">
                <div className="w-2 h-2 rounded-full bg-[var(--steam-accent)] mt-2 flex-shrink-0 animate-pulse" />
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  Supports{' '}
                  <ExternalLink href="https://help.daybreakgames.com/hc/en-us/articles/230631407-How-do-I-locate-my-Steam-ID">
                    Steam ID64
                  </ExternalLink>,{' '}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Steam nickname
                  </ExternalLink>,{' '}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Profile URL
                  </ExternalLink> or{' '}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Profile permalink
                  </ExternalLink>
                </p>
              </div>
            </div>
            
            <div className="flex justify-center pt-3">
              <button
                type="submit"
                className="group relative px-10 py-4 bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-secondary)] to-[var(--steam-primary)] text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-[var(--steam-accent)]/40 transition-all duration-500 ease-out transform hover:scale-110 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-[var(--steam-accent)]/50 focus:ring-offset-4 focus:ring-offset-[var(--card-background)] overflow-hidden cursor-pointer"
                aria-label="Search Steam profile"
              >
                <div className="flex items-center space-x-3">
                  <Search 
                    size={24}
                    className="transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" 
                  />
                  <span>Discover Missing Content</span>
                </div>
                
                {/* Enhanced shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                {/* Pulse effect on hover */}
                <div className="absolute inset-0 bg-[var(--steam-accent)]/20 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500 -z-10" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-[var(--steam-accent)]/30 to-[var(--steam-accent)]/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-tl from-[var(--steam-accent)]/20 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}; 