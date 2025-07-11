'use client';

import { SearchSection } from './components/SearchSection';
import { ErrorMessage } from './components/ErrorMessage';
import { ThemeToggle } from './components/ThemeToggle';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />
      
      {/* Floating Background Steam Logo */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <div className="relative w-[500px] h-[500px] animate-float">
          <Image
            src="/logo.png"
            alt="Steam Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Enhanced Decorative Elements with staggered animations */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[var(--steam-accent)]/20 to-transparent rounded-full blur-3xl animate-pulse opacity-60" />
      <div 
        className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-tl from-[var(--steam-accent)]/15 to-transparent rounded-full blur-2xl animate-pulse opacity-40" 
        style={{ animationDelay: '1s' }} 
      />
      <div 
        className="absolute top-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-[var(--steam-accent)]/10 to-transparent rounded-full blur-xl animate-pulse opacity-50" 
        style={{ animationDelay: '2s' }} 
      />
      <div 
        className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-gradient-to-tr from-[var(--steam-accent)]/8 to-transparent rounded-full blur-lg animate-pulse opacity-30" 
        style={{ animationDelay: '3s' }} 
      />

      {/* Theme Toggle */}
      <div className={`absolute top-6 right-6 z-20 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
        <ThemeToggle />
      </div>

      {/* Main Content Container - Centered and Viewport Focused */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10">
        {/* Header Section - Compact and Focused */}
        <div className={`text-center mb-12 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          {/* Logo */}
          <div className="inline-block mb-6">
            <div className="relative w-20 h-20 mx-auto animate-float">
              <Image
                src="/logo.png"
                alt="Steam Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-secondary)] to-[var(--steam-accent)] bg-clip-text text-transparent leading-tight">
              Steam MCL
            </h1>
            <p className="text-lg md:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed font-medium">
              Discover missing content from your Steam library
            </p>
          </div>
        </div>

        {/* Search Section - The Main Focus */}
        <div className={`w-full max-w-2xl mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
          <SearchSection />
        </div>

        {/* Error Message Section - Compact */}
        <div className={`w-full max-w-3xl ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <ErrorMessage />
        </div>
      </div>

      {/* Footer - Minimal and Fixed to Bottom */}
      <div className={`relative z-10 text-center py-4 border-t border-[var(--card-border)]/30 bg-[var(--background)]/50 backdrop-blur-sm ${mounted ? 'animate-fadeIn' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
        <p className="text-xs text-[var(--foreground-muted)] font-medium">
          Built with ❤️ for the Steam community
        </p>
      </div>

      {/* Floating Animation Orbs */}
      <div className="absolute top-1/4 left-1/6 w-3 h-3 bg-[var(--steam-accent)]/40 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[var(--steam-accent)]/30 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[var(--steam-accent)]/50 rounded-full animate-ping" style={{ animationDelay: '4s' }} />
    </main>
  );
}
