'use client';

import { SearchSection } from './components/SearchSection';
import { ErrorMessage } from './components/ErrorMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { ParticlesBackground } from './components/ParticlesBackground';
import { ExternalLink } from './components/ExternalLink';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showError, setShowError] = useState(false); // Control error visibility

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative flex flex-col">
      {/* tsParticles Background */}
      <ParticlesBackground />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />
      
      {/* Enhanced Floating Particles (CSS fallback) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[var(--steam-accent)]/20 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div 
          className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-tl from-[var(--steam-accent)]/15 to-transparent rounded-full blur-2xl animate-float opacity-40" 
          style={{ animationDelay: '1s', animationDirection: 'reverse' }} 
        />
        <div 
          className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-[var(--steam-accent)]/10 to-transparent rounded-full blur-xl animate-float opacity-50" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-gradient-to-tr from-[var(--steam-accent)]/8 to-transparent rounded-full blur-lg animate-float opacity-30" 
          style={{ animationDelay: '3s', animationDirection: 'reverse' }} 
        />
        
        {/* Small floating particles with improved animations */}
        <div className="absolute top-1/4 left-1/6 w-3 h-3 bg-[var(--steam-accent)]/40 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[var(--steam-accent)]/30 rounded-full animate-float" style={{ animationDelay: '2s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[var(--steam-accent)]/50 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 right-1/6 w-2.5 h-2.5 bg-[var(--steam-accent)]/35 rounded-full animate-float" style={{ animationDelay: '1.5s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-1/2 left-1/5 w-1 h-1 bg-[var(--steam-accent)]/45 rounded-full animate-float" style={{ animationDelay: '3.5s' }} />
        <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-[var(--steam-accent)]/25 rounded-full animate-float" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-3/4 right-2/3 w-2 h-2 bg-[var(--steam-accent)]/40 rounded-full animate-float" style={{ animationDelay: '7s', animationDirection: 'reverse' }} />
      </div>

      {/* Theme Toggle */}
      <div className={`absolute top-4 right-4 z-20 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
        <ThemeToggle />
      </div>

      {/* Main Content Container - Centered and Viewport Focused */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10">
        {/* Header Section - Enhanced Creative Layout */}
        <div className={`w-full max-w-6xl mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Enhanced Text Content */}
            <div className="text-left space-y-6">
              <div className="space-y-3">
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-accent)] to-[var(--steam-secondary)] bg-clip-text text-transparent leading-tight tracking-tight">
                  Steam
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground-secondary)] bg-clip-text text-transparent leading-tight">
                  Missing Content Lookup
                </h2>
              </div>
              
              <div className="max-w-lg">
                <p className="text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed font-medium">
                  Discover DLC, sequels, prequels, and spin-offs that are missing from your Steam library. 
                  Never miss out on content that could enhance your gaming experience.
                </p>
              </div>
            </div>
            
            {/* Right Side - Big Logo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-float">
                <Image
                  src="/logo.png"
                  alt="Steam Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Header Text - Matching Search Box Width */}
        <div className={`w-full max-w-2xl mb-6 text-center ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '50ms' }}>
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-accent)] to-[var(--steam-secondary)] bg-clip-text text-transparent leading-tight">
              Find Your Missing Games
            </h3>
            <p className="text-base md:text-lg text-[var(--foreground-muted)] font-medium leading-relaxed">
              Enter your Steam profile below to discover content you might have missed
            </p>
          </div>
        </div>

        {/* Search Section - The Main Focus */}
        <div className={`w-full max-w-2xl mb-6 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
          <SearchSection />
        </div>

        {/* Error Message Section - Only show when needed */}
        {showError && (
          <div className={`w-full max-w-3xl ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <ErrorMessage />
          </div>
        )}
      </div>

      {/* Footer - Enhanced with ExternalLink components */}
      <div className={`relative z-10 text-center py-3 border-t border-[var(--card-border)]/30 bg-[var(--background)]/50 backdrop-blur-sm ${mounted ? 'animate-fadeIn' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[var(--foreground-muted)] font-medium">
          <span>v0.1.0</span>
          <span className="hidden sm:inline">•</span>
          <span>
            Made with ❤️ by{' '}
            <ExternalLink href="https://ouss.es">
              eoussama
            </ExternalLink>
          </span>
          <span className="hidden sm:inline">•</span>
          <ExternalLink href="https://github.com/eoussama/steam-mcl">
            GitHub
          </ExternalLink>
        </div>
      </div>
    </main>
  );
}
