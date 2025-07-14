"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

import { Footer } from "@/app/components/Footer";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { UserResultsView } from "@/app/components/UserResultsView";
import { ParticlesBackground } from "@/app/components/ParticlesBackground";

import { useSteamUserSearch } from "@/hooks/useSteam";



export default function UserProfilePage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useTransitionRouter();
  const username = decodeURIComponent(params.username as string);
  
  const { data, isLoading, error } = useSteamUserSearch(username);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] relative flex flex-col">
      <ParticlesBackground />
      
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent pointer-events-none" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[var(--steam-accent)]/20 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div 
          className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-tl from-[var(--steam-accent)]/15 to-transparent rounded-full blur-2xl animate-float opacity-40" 
          style={{ animationDelay: "1s", animationDirection: "reverse" }} 
        />
        <div 
          className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-[var(--steam-accent)]/10 to-transparent rounded-full blur-xl animate-float opacity-50" 
          style={{ animationDelay: "2s" }} 
        />
        <div 
          className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-gradient-to-tr from-[var(--steam-accent)]/8 to-transparent rounded-full blur-lg animate-float opacity-30" 
          style={{ animationDelay: "3s", animationDirection: "reverse" }} 
        />
        
        <div className="absolute top-1/4 left-1/6 w-3 h-3 bg-[var(--steam-accent)]/40 rounded-full animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[var(--steam-accent)]/30 rounded-full animate-float" style={{ animationDelay: "2s", animationDirection: "reverse" }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[var(--steam-accent)]/50 rounded-full animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/2 right-1/6 w-2.5 h-2.5 bg-[var(--steam-accent)]/35 rounded-full animate-float" style={{ animationDelay: "1.5s", animationDirection: "reverse" }} />
        <div className="absolute bottom-1/2 left-1/5 w-1 h-1 bg-[var(--steam-accent)]/45 rounded-full animate-float" style={{ animationDelay: "3.5s" }} />
        <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-[var(--steam-accent)]/25 rounded-full animate-float" style={{ animationDelay: "6s" }} />
        <div className="absolute bottom-3/4 right-2/3 w-2 h-2 bg-[var(--steam-accent)]/40 rounded-full animate-float" style={{ animationDelay: "7s", animationDirection: "reverse" }} />
      </div>

      <div className={`absolute top-4 right-4 z-20 ${mounted ? "animate-fadeIn" : "opacity-0"}`}>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center w-full py-8 relative z-10">
        <div className="w-full max-w-4xl mb-6 text-center flex-shrink-0">
          <button 
            onClick={handleBackToHome}
            className="inline-block hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight steam-title mb-2 hover:text-[var(--steam-accent)] transition-colors duration-300">
              Steam
            </h1>
          </button>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground-secondary)] bg-clip-text text-transparent">
            Missing Content Lookup
          </h2>
        </div>

        {isLoading && (
          <div className={`w-full max-w-4xl space-y-6 flex flex-col ${mounted ? "animate-fadeInUp" : "opacity-0"}`}>
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 border-4 border-[var(--steam-accent)]/30 border-t-[var(--steam-accent)] rounded-full animate-spin" />
                <span className="text-lg font-medium text-[var(--foreground)]">
                  Searching for {username}...
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={`w-full max-w-4xl space-y-6 flex flex-col ${mounted ? "animate-fadeInUp" : "opacity-0"}`}>
            <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="text-red-400 text-4xl">⚠️</div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  User Not Found
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md">
                  Unable to find the Steam user &ldquo;{username}&rdquo;. Please check the username and try again.
                </p>
                <button
                  onClick={handleBackToHome}
                  className="px-6 py-3 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50"
                >
                  Back to Search
                </button>
              </div>
            </div>
          </div>
        )}

        {data && data.player && (
          <UserResultsView 
            data={data} 
            onClose={handleBackToHome}
          />
        )}
      </div>

      <Footer mounted={mounted} />
    </main>
  );
} 