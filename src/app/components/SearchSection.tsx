"use client";

import { useState, useEffect } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Search, Sparkles, AlertCircle, Loader2 } from "lucide-react";

import { ExternalLink } from "./ExternalLink";
import { TSteamPlayerResponse } from "@/lib/types";
import { useSteamUserSearch } from "@/hooks/useSteam";



export type TSearchSectionProps = {
  onUserFound?: (data: TSteamPlayerResponse) => void;
  morphProps?: Record<string, unknown>;
  autoNavigate?: boolean;
}

export const SearchSection: React.FC<TSearchSectionProps> = ({ onUserFound, morphProps, autoNavigate = true }) => {
  const [steamProfile, setSteamProfile] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [supportsViewTransitions, setSupportsViewTransitions] = useState(false);

  const router = useTransitionRouter();
  const { data, isLoading, error } = useSteamUserSearch(searchQuery);

  useEffect(() => {
    setSupportsViewTransitions("startViewTransition" in document);
  }, []);

  useEffect(() => {
    if (data && data.player) {
      if (autoNavigate) {
        router.push(`/${encodeURIComponent(steamProfile.trim())}`);
      } else if (onUserFound) {
        onUserFound(data);
      }
    }
  }, [data, onUserFound, autoNavigate, router, steamProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteamProfile(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamProfile.trim()) {
      setSearchQuery(steamProfile.trim());
    }
  };

  const containerClassName = `relative animate-fadeInUp ${!supportsViewTransitions ? "page-transition-fallback" : ""}`;

  return (
    <div
      className={containerClassName}
      style={{
        viewTransitionName: supportsViewTransitions ? "search-morph-container" : undefined,
        ...(morphProps?.style || {})
      }}
      {...morphProps}
    >
      <div
        className="relative bg-[var(--card-background)]/80 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden hover:shadow-[var(--steam-accent)]/20 transition-all duration-500"
        style={{ viewTransitionName: supportsViewTransitions ? "search-card" : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/10 via-transparent to-[var(--steam-accent)]/5 opacity-50 hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--steam-accent)]/30 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-[var(--steam-accent)]/40 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative p-4 lg:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label
                htmlFor="steam-profile"
                className="flex items-center space-x-2 text-base font-bold text-[var(--foreground)] mb-2"
              >
                <Sparkles size={18} className="text-[var(--steam-accent)] animate-pulse" />
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
                    w-full px-4 py-3 text-lg font-medium
                    bg-[var(--input-background)]/80 backdrop-blur-sm
                    border-2 rounded-xl
                    text-[var(--input-text)]
                    placeholder:text-[var(--foreground-muted)]
                    transition-all duration-500 ease-out
                    focus:outline-none focus:ring-0 cursor-text
                    ${isFocused
                      ? "border-[var(--steam-accent)] shadow-xl shadow-[var(--steam-accent)]/30 scale-[1.01] bg-[var(--input-background)]"
                      : "border-[var(--input-border)] hover:border-[var(--steam-accent)]/60 hover:shadow-lg"
                    }
                  `}
                  style={{ viewTransitionName: supportsViewTransitions ? "search-input" : undefined }}
                  placeholder="Enter your Steam profile..."
                  disabled={isLoading}
                />

                <div className={`
                  absolute inset-0 rounded-xl pointer-events-none
                  transition-all duration-500 ease-out
                  ${isFocused
                    ? "ring-3 ring-[var(--steam-accent)]/20 ring-offset-3 ring-offset-[var(--card-background)] scale-[1.02]"
                    : ""
                  }
                `} />

                <div className={`
                  absolute right-4 top-1/2 -translate-y-1/2
                  transition-all duration-300 pointer-events-none
                  ${isFocused ? "text-[var(--steam-accent)] scale-110" : "text-[var(--foreground-muted)]"}
                `}>
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 mt-3 p-2 bg-[var(--background-secondary)]/40 rounded-lg border border-[var(--card-border)]/30">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--steam-accent)] mt-1.5 flex-shrink-0 animate-pulse" />
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  Supports{" "}
                  <ExternalLink href="https://help.daybreakgames.com/hc/en-us/articles/230631407-How-do-I-locate-my-Steam-ID">
                    Steam ID64
                  </ExternalLink>,{" "}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Steam nickname
                  </ExternalLink>,{" "}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Profile URL
                  </ExternalLink> or{" "}
                  <ExternalLink href="https://steamcommunity.com/discussions/forum/1/618458030664854265/">
                    Profile permalink
                  </ExternalLink>
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={!steamProfile.trim() || isLoading}
                className="group relative px-8 py-3 bg-gradient-to-r from-[var(--steam-primary)] via-[var(--steam-secondary)] to-[var(--steam-primary)] text-white font-bold text-base rounded-xl shadow-xl transition-all duration-500 ease-out transform focus:outline-none focus:ring-3 focus:ring-[var(--steam-accent)]/50 focus:ring-offset-3 focus:ring-offset-[var(--card-background)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:shadow-[var(--steam-accent)]/40 enabled:hover:scale-105 enabled:hover:-translate-y-1 enabled:cursor-pointer"
                aria-label="Search Steam profile"
              >
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search
                      size={20}
                      className="transition-all duration-500 group-enabled:group-hover:scale-125 group-enabled:group-hover:rotate-12"
                    />
                  )}
                  <span>{isLoading ? "Searching..." : "Discover Missing Content"}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-enabled:group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-[var(--steam-accent)]/20 rounded-xl scale-0 group-enabled:group-hover:scale-100 transition-transform duration-500 -z-10" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">
                  {error instanceof Error ? error.message : "Failed to fetch Steam data"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-[var(--steam-accent)]/30 to-[var(--steam-accent)]/10 rounded-full blur-lg animate-pulse" />
      <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-tl from-[var(--steam-accent)]/20 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}; 