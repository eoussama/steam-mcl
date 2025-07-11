'use client';

import { SearchSection } from './components/SearchSection';
import { ErrorMessage } from './components/ErrorMessage';
import { ThemeToggle } from './components/ThemeToggle';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />
      
      {/* Floating Background Steam Logo */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none animate-pulse">
        <div className="relative w-[400px] h-[400px]">
          <Image
            src="/logo.png"
            alt="Steam Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--steam-accent)]/10 rounded-full blur-3xl animate-pulse" />
      <div 
        className="absolute bottom-20 right-20 w-24 h-24 bg-[var(--steam-accent)]/5 rounded-full blur-2xl animate-pulse" 
        style={{ animationDelay: '1s' }} 
      />
      <div 
        className="absolute top-1/3 left-1/4 w-16 h-16 bg-[var(--steam-accent)]/5 rounded-full blur-xl animate-pulse" 
        style={{ animationDelay: '2s' }} 
      />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-8">
            <div className="relative w-32 h-32 mx-auto animate-float">
              <Image
                src="/logo.png"
                alt="Steam Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-secondary)] to-[var(--steam-accent)] bg-clip-text text-transparent leading-tight">
              Steam
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--foreground-secondary)] mb-8">
              Missing Content Lookup
            </h2>
            <div className="relative">
              <p className="text-lg md:text-xl text-[var(--foreground-muted)] max-w-3xl mx-auto leading-relaxed">
                Easily lookup up missing DLC, Sequels, Prequels, Spin-Offs... etc from your Steam library.
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[var(--steam-accent)] to-[var(--steam-hover)] rounded-full" />
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <SearchSection />
          </div>
        </div>

        {/* Error Message Section */}
        <div className="max-w-4xl mx-auto">
          <div className="transform hover:scale-[1.01] transition-transform duration-300">
            <ErrorMessage />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-10 border-t border-[var(--card-border)]">
          <p className="text-sm text-[var(--foreground-muted)]">
            Built with ❤️ for the Steam community
          </p>
        </div>
      </div>
    </main>
  );
}
