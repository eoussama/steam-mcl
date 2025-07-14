"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Gamepad2,
  Globe,
  AlertTriangle,
  Search,
  Loader2,
  Download,
  Package,
  RotateCcw,
  Sparkles,
  Gift,
  Link,
  X,
  Filter
} from "lucide-react";

import { ExternalLink } from "./ExternalLink";

import { cn } from "@/lib/helpers";
import { TSteamPlayerResponse } from "@/lib/types";
import { useMissingContentAnalysis } from "@/hooks/useSteam";



export type TUserResultsViewProps = {
  data: TSteamPlayerResponse;
  onClose: () => void;
}

export const UserResultsView: React.FC<TUserResultsViewProps> = ({ data, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [supportsViewTransitions, setSupportsViewTransitions] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);
  const { data: missingContentData, isLoading: isAnalyzing, error: analysisError } = useMissingContentAnalysis(data.steamId);

  // Filter missing content based on search query
  const filteredMissingContent = useMemo(() => {
    if (!missingContentData?.missingContent) return [];
    if (!searchQuery.trim()) return missingContentData.missingContent;

    return missingContentData.missingContent.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [missingContentData?.missingContent, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredMissingContent.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
    enabled: !!filteredMissingContent.length,
  });

  useEffect(() => {
    setMounted(true);
    setSupportsViewTransitions("startViewTransition" in document);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const SkeletonItem = ({ index }: { index: number }) => (
    <div
      className="animate-pulse mb-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="group relative w-full block p-3 sm:p-4 bg-[var(--foreground)]/4 rounded-xl border border-[var(--card-border)]/10">
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="h-5 sm:h-6 w-12 sm:w-16 bg-[var(--foreground)]/4 rounded-md"></div>
        </div>

        <div className="flex-1 space-y-2 pr-14 sm:pr-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-5 sm:w-6 h-5 sm:h-6 bg-[var(--foreground)]/4 rounded"></div>
            <div className="flex-1">
              <div className="h-4 sm:h-5 bg-[var(--foreground)]/4 rounded mb-1 sm:mb-2" style={{ width: `${60 + Math.random() * 40}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-3 sm:h-4 bg-[var(--foreground)]/4 rounded" style={{ width: `${70 + Math.random() * 30}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const missingContentTypes = {
    DLC: {
      color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      icon: Download,
      label: "DLC"
    },
    Expansion: {
      color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      icon: Package,
      label: "Expansion"
    },
    Sequel: {
      color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      icon: RotateCcw,
      label: "Sequel"
    },
    Edition: {
      color: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      icon: Sparkles,
      label: "Edition"
    },
    Bundle: {
      color: "bg-green-500/10 border-green-500/30 text-green-400",
      icon: Gift,
      label: "Bundle"
    },
    Related: {
      color: "bg-gray-500/10 border-gray-500/30 text-gray-400",
      icon: Link,
      label: "Related"
    }
  };

  const containerClassName = `w-full max-w-4xl space-y-6 flex flex-col h-full ${mounted ? "animate-fadeInUp" : "opacity-0"} ${!supportsViewTransitions ? "page-transition-fallback" : ""}`;

  return (
    <div
      className={cn(containerClassName, "px-4")}
      style={{ viewTransitionName: supportsViewTransitions ? "search-morph-container" : undefined }}
    >
      <div
        className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ viewTransitionName: supportsViewTransitions ? "search-card" : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/10 via-transparent to-[var(--steam-accent)]/5 opacity-50" />

        <div className="relative p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Image
                  src={data.player.avatarfull}
                  alt={`${data.player.personaname}"s avatar`}
                  width={80}
                  height={80}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-3 sm:border-4 border-[var(--steam-accent)]/30 shadow-xl"
                />
              </div>

              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--foreground)] truncate">
                  {data.player.personaname}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] font-mono truncate">
                  Steam ID: {data.player.steamid}
                </p>
                {data.ownedGames && (
                  <div className="flex items-center space-x-1 sm:space-x-2 text-[var(--foreground-secondary)]">
                    <Gamepad2 size={14} className="sm:hidden" />
                    <Gamepad2 size={16} className="hidden sm:block" />
                    <span className="font-semibold text-xs sm:text-sm line-clamp-1">{data.ownedGames.length} games owned</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <ExternalLink
                href={data.player.profileurl}
                className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white hover:text-white text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 shadow-lg hover:shadow-xl"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">View Profile</span>
              </ExternalLink>

              <button
                onClick={onClose}
                className="group relative px-3 sm:px-4 py-2 bg-[var(--background-secondary)]/50 hover:bg-[var(--steam-accent)]/10 border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 cursor-pointer flex items-center space-x-2"
                aria-label="Back to search"
                style={{ viewTransitionName: supportsViewTransitions ? "search-input" : undefined }}
              >
                <Search
                  size={16}
                  className="text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300"
                />
                <span className="hidden sm:inline text-sm font-medium text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300">
                  Search Again
                </span>

                <div className="absolute inset-0 bg-[var(--steam-accent)]/20 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/5 via-transparent to-[var(--steam-accent)]/10 opacity-50" />

        <div className="relative p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                Missing Content
              </h2>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                {isAnalyzing
                  ? "Analyzing your game library..."
                  : analysisError
                    ? "Error analyzing content"
                    : searchQuery
                      ? `${filteredMissingContent.length} of ${missingContentData?.missingContent?.length || 0} items match "${searchQuery}"`
                      : `${missingContentData?.missingContent?.length || 0} items found that you might be interested in`
                }
              </p>
            </div>

            {!isAnalyzing && !analysisError && missingContentData?.missingContent?.length && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`group relative px-2 sm:px-3 py-2 border rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 cursor-pointer flex items-center space-x-1 sm:space-x-2 ${showSearch
                    ? "bg-[var(--steam-accent)]/10 border-[var(--steam-accent)]/30 text-[var(--steam-accent)]"
                    : "bg-[var(--background-secondary)]/50 hover:bg-[var(--steam-accent)]/10 border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 text-[var(--foreground-muted)] hover:text-[var(--steam-accent)]"
                  }`}
                aria-label={showSearch ? "Hide search" : "Show search"}
              >
                <Filter size={16} className="transition-colors duration-300" />
                <span className="hidden sm:inline text-sm font-medium transition-colors duration-300">
                  {showSearch ? "Hide Filter" : "Filter"}
                </span>
                <div className="absolute inset-0 bg-[var(--steam-accent)]/20 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
              </button>
            )}
          </div>

          {/* Search Section */}
          {showSearch && !isAnalyzing && !analysisError && missingContentData?.missingContent?.length && (
            <div className="mb-4 sm:mb-6 flex-shrink-0 animate-fadeInUp">
              <div className="relative group/input">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-3 pr-16 sm:pr-20 text-sm sm:text-base font-medium
                    bg-[var(--input-background)]/80 backdrop-blur-sm
                    border-2 rounded-xl
                    text-[var(--input-text)]
                    placeholder:text-[var(--foreground-muted)]
                    transition-all duration-500 ease-out
                    focus:outline-none focus:ring-0 cursor-text
                    ${searchFocused
                      ? "border-[var(--steam-accent)] shadow-xl shadow-[var(--steam-accent)]/30 scale-[1.01] bg-[var(--input-background)]"
                      : "border-[var(--input-border)] hover:border-[var(--steam-accent)]/60 hover:shadow-lg"
                    }
                  `}
                  placeholder="Search by game name..."
                />

                <div className={`
                  absolute inset-0 rounded-xl pointer-events-none
                  transition-all duration-500 ease-out
                  ${searchFocused
                    ? "ring-3 ring-[var(--steam-accent)]/20 ring-offset-3 ring-offset-[var(--card-background)] scale-[1.02]"
                    : ""
                  }
                `} />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="p-1 sm:p-1.5 hover:bg-[var(--background-secondary)]/50 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 cursor-pointer group"
                      aria-label="Clear search"
                    >
                      <X size={14} className="sm:hidden text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300" />
                      <X size={16} className="hidden sm:block text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300" />
                    </button>
                  )}
                  <div className={`
                    p-1 sm:p-1.5 transition-all duration-300 pointer-events-none
                    ${searchFocused ? "text-[var(--steam-accent)] scale-110" : "text-[var(--foreground-muted)]"}
                  `}>
                    <Search size={14} className="sm:hidden" />
                    <Search size={16} className="hidden sm:block" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={parentRef}
            className={cn(
              "flex-1 pr-2 scrollbar-thin scrollbar-thumb-steam scrollbar-track-transparent overflow-auto",
              showSearch ? "results-view-height" : "results-view-height-no-search"
            )}
            style={{
              height: "100%",
              contain: "strict"
            }}
          >
            {analysisError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analysis Failed</h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                  Unable to analyze your game library. Please try again later.
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center text-center p-8 mb-6">
                  <Loader2 size={48} className="text-[var(--steam-accent)] mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analyzing Your Library</h3>
                  <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                    Searching for missing DLC, expansions, sequels, and related content using Steam data...
                  </p>
                </div>

                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonItem key={index} index={index} />
                ))}
              </div>
            ) : !missingContentData?.missingContent?.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Gamepad2 size={48} className="text-[var(--foreground-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Missing Content Found</h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                  Great! It looks like you have all the available content for your games, or we couldn&apos;t find any related content in the Steam catalog.
                </p>
              </div>
            ) : filteredMissingContent.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Search size={48} className="text-[var(--foreground-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Results Found</h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                  No games match &ldquo;{searchQuery}&rdquo;. Try adjusting your search or{" "}
                  <button
                    onClick={handleClearSearch}
                    className="text-[var(--steam-accent)] hover:text-[var(--steam-accent)]/80 underline transition-colors duration-300 cursor-pointer"
                  >
                    clear the filter
                  </button>
                  {" "}to see all results.
                </p>
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const item = filteredMissingContent[virtualItem.index];
                  if (!item) return null;

                  const typeConfig = missingContentTypes[item.type as keyof typeof missingContentTypes];
                  const IconComponent = typeConfig?.icon || Gamepad2;

                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div
                        className="group relative w-full block p-3 sm:p-4 bg-[var(--background-secondary)]/40 hover:bg-[var(--background-secondary)]/60 rounded-xl border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 transition-all duration-300 hover:shadow-lg no-underline items-start justify-between cursor-pointer"
                        onClick={() => window.open(`https://store.steampowered.com/app/${item.appid}`, "_blank")}
                      >
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <span
                            className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium border ${typeConfig?.color || "bg-gray-500/10 border-gray-500/30 text-gray-400"}`}
                          >
                            {typeConfig?.label || item.type}
                          </span>
                        </div>

                        <div className="flex-1 space-y-1 sm:space-y-2 pr-12 sm:pr-16">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <IconComponent size={20} className={`sm:hidden ${typeConfig?.color?.split(" ")[2] || "text-gray-400"}`} />
                            <IconComponent size={24} className={`hidden sm:block ${typeConfig?.color?.split(" ")[2] || "text-gray-400"}`} />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--steam-accent)] transition-colors duration-300 line-clamp-2">
                                {item.name}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-[var(--foreground-muted)] line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--card-border)]/20 flex-shrink-0">
            <p className="text-xs text-[var(--foreground-muted)] text-center">
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 bg-[var(--steam-accent)] rounded-full animate-pulse" />
                <span className="line-clamp-1">
                  Analysis powered by Steam catalog data
                  {missingContentData?.analyzedGames && (
                    <> • Analyzed {missingContentData.analyzedGames} games</>
                  )}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 