"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { cn } from "@/lib/helpers";

import { Footer } from "@/app/components/Footer";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { SearchSection } from "@/app/components/SearchSection";
import { ParticlesBackground } from "@/app/components/ParticlesBackground";



export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative flex flex-col">
      <ParticlesBackground />

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />

      <div className={cn(
        "absolute top-4 right-4 z-20",
        mounted ? "animate-fadeIn" : "opacity-0",
      )}>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10">
        <div className={`w-full max-w-2xl space-y-6 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-logo pointer-events-none z-0">
              <Image
                fill
                priority
                sizes="1080px"
                src="/logo.png"
                alt="Steam Logo"
                className="object-contain drop-shadow-2xl animate-float"
              />
            </div>

            <div className="relative z-10 text-left space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight tracking-tight steam-title">
                  Steam
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground-secondary)] bg-clip-text text-transparent leading-tight">
                  Missing Content Lookup
                </h2>
              </div>

              <div>
                <p className="text-sm sm:text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed font-medium">
                  Discover DLC, sequels, prequels, and spin-offs that are missing from your Steam library.
                  Never miss out on content that could enhance your gaming experience.
                </p>
              </div>
            </div>
          </div>

          <div className={`${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
            <SearchSection />
          </div>
        </div>
      </div>

      <Footer mounted={mounted} />
    </main>
  );
}
