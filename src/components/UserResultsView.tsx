import type { TAnalysisState, TMissingCategory, TMissingItem } from "@/features/analysis";
import type { TLibrary, TSteamProfile } from "@/lib/steam";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertTriangle, Disc3, Download, Filter, Gamepad2, Globe, Layers, Loader2, Lock, Search, Sparkles, Users, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { cn } from "@/lib/helpers";
import { getStoreUrl } from "@/lib/steam";

import { ExternalLink } from "./ExternalLink";



type TCategoryConfig = {
  label: string;
  color: string;
  icon: React.FC<{ size?: number; className?: string }>;
  describe: (names: string) => string;
};

const CATEGORIES: Readonly<Record<TMissingCategory, TCategoryConfig>> = {
  dlc: {
    label: "DLC",
    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    icon: Download,
    describe: names => `DLC for ${names}`,
  },
  soundtrack: {
    label: "Soundtrack",
    color: "bg-pink-500/10 border-pink-500/30 text-pink-400",
    icon: Disc3,
    describe: names => `Soundtrack of ${names}`,
  },
  edition: {
    label: "Edition",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    icon: Sparkles,
    describe: names => `Another edition of ${names}`,
  },
  franchise: {
    label: "Franchise",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    icon: Layers,
    describe: names => `Same franchise as ${names}`,
  },
  studio: {
    label: "Studio",
    color: "bg-green-500/10 border-green-500/30 text-green-400",
    icon: Users,
    describe: names => `From the studio behind ${names}`,
  },
};

const CATEGORY_ORDER: ReadonlyArray<TMissingCategory> = ["dlc", "soundtrack", "edition", "franchise", "studio"];

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

const SkeletonItem: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="animate-pulse mb-4"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex gap-3 sm:gap-4 w-full p-3 sm:p-4 bg-[var(--foreground)]/4 rounded-xl border border-[var(--card-border)]/10">
      <div className="w-24 sm:w-32 aspect-[460/215] bg-[var(--foreground)]/4 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 sm:h-5 bg-[var(--foreground)]/4 rounded" style={{ width: `${60 + ((index * 37) % 40)}%` }} />
        <div className="h-3 sm:h-4 bg-[var(--foreground)]/4 rounded" style={{ width: `${40 + ((index * 23) % 30)}%` }} />
      </div>
    </div>
  </div>
);

export type TUserResultsViewProps = {
  profile: TSteamProfile;
  library: TLibrary | undefined;
  analysis: TAnalysisState;
  onClose: () => void;
};

/**
 * @description
 * Profile header and the list of missing content for a resolved Steam profile.
 *
 * @param props - Component props.
 * @param props.profile - Resolved Steam profile.
 * @param props.library - Owned games, undefined while loading.
 * @param props.analysis - Progressive analysis state.
 * @param props.onClose - Invoked to return to the search.
 * @returns The results view.
 */
export const UserResultsView: React.FC<TUserResultsViewProps> = ({ profile, library, analysis, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  const ownedNames = useMemo(
    () => new Map((library?.games ?? []).map(game => [game.appid, game.name])),
    [library],
  );

  const sortedItems = useMemo(() => {
    const playtime = new Map((library?.games ?? []).map(game => [game.appid, game.playtimeMinutes]));
    const relevance = (entry: TMissingItem) => Math.max(0, ...entry.relatedTo.map(appid => playtime.get(appid) ?? 0));

    return [...analysis.items.values()].sort((a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      || relevance(b) - relevance(a)
      || a.item.name.localeCompare(b.item.name),
    );
  }, [analysis.items, library]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return query ? sortedItems.filter(entry => entry.item.name.toLowerCase().includes(query)) : sortedItems;
  }, [sortedItems, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 104,
    overscan: 6,
  });

  const isScanning = analysis.phase === "library" || analysis.phase === "scanning";
  const total = sortedItems.length;

  const describe = (entry: TMissingItem) => {
    const names = entry.relatedTo.map(appid => ownedNames.get(appid)).filter(Boolean);
    const shown = names.slice(0, 2).join(", ");
    const more = names.length > 2 ? ` and ${names.length - 2} more` : "";

    return CATEGORIES[entry.category].describe(`${shown}${more}` || "a game you own");
  };

  const status = (() => {
    if (library?.isPrivate) {
      return "This library is private";
    }

    if (analysis.phase === "library" || !library) {
      return "Reading your library...";
    }

    if (analysis.phase === "scanning" && analysis.pausedUntil) {
      return `Steam is busy, pausing briefly • ${total} found so far`;
    }

    if (analysis.phase === "scanning") {
      return `Scanning ${analysis.done} of ${analysis.total} lookups • ${total} found so far`;
    }

    if (searchQuery) {
      return `${filteredItems.length} of ${total} items match "${searchQuery}"`;
    }

    return `${total} items found that you might be interested in`;
  })();

  const renderBody = () => {
    if (library?.isPrivate) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Lock size={48} className="text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">This Library Is Private</h3>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md">
            Set &ldquo;Game details&rdquo; to Public in your Steam privacy settings, then search again.
          </p>
        </div>
      );
    }

    if (analysis.error && total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analysis Failed</h3>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md">
            Steam did not answer as expected. Please try again in a moment.
          </p>
        </div>
      );
    }

    if (total === 0 && isScanning) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center text-center p-8 mb-6">
            <Loader2 size={48} className="text-[var(--steam-accent)] mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analyzing Your Library</h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-md">
              Looking for DLC, soundtracks, editions and franchise games, most played first...
            </p>
          </div>

          {SKELETON_KEYS.map((key, index) => (
            <SkeletonItem key={key} index={index} />
          ))}
        </div>
      );
    }

    if (total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Gamepad2 size={48} className="text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Missing Content Found</h3>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md">
            You already own everything related to your games on the Steam store.
          </p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Search size={48} className="text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Results Found</h3>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md">
            Nothing matches &ldquo;
            {searchQuery}
            &rdquo;.
            {" "}
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[var(--steam-accent)] hover:text-[var(--steam-accent)]/80 underline transition-colors duration-300 cursor-pointer"
            >
              Clear the filter
            </button>
            {" "}
            to see all results.
          </p>
        </div>
      );
    }

    return (
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const entry = filteredItems[virtualItem.index];

          if (!entry) {
            return null;
          }

          const config = CATEGORIES[entry.category];
          const Icon = config.icon;

          return (
            <div
              key={entry.item.appid}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="absolute top-0 left-0 w-full pb-3"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <a
                href={getStoreUrl(entry.item.appid)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 sm:gap-4 w-full p-3 sm:p-4 bg-[var(--background-secondary)]/40 hover:bg-[var(--background-secondary)]/60 rounded-xl border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 transition-all duration-300 hover:shadow-lg"
              >
                {entry.item.headerImage
                  ? (
                      <img
                        src={entry.item.headerImage}
                        alt=""
                        loading="lazy"
                        className="w-24 sm:w-32 aspect-[460/215] object-cover rounded-lg flex-shrink-0 bg-[var(--foreground)]/5"
                      />
                    )
                  : (
                      <div className="w-24 sm:w-32 aspect-[460/215] rounded-lg flex-shrink-0 bg-[var(--foreground)]/5 flex items-center justify-center">
                        <Icon size={24} className="text-[var(--foreground-muted)]" />
                      </div>
                    )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--steam-accent)] transition-colors duration-300 line-clamp-2">
                      {entry.item.name}
                    </h3>

                    <span className={cn("inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0", config.color)}>
                      <Icon size={12} />
                      {config.label}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] line-clamp-2">
                    {describe(entry)}
                  </p>

                  <p className="text-xs font-semibold text-[var(--foreground-secondary)]">
                    {entry.item.isComingSoon ? "Coming soon" : entry.item.isFree ? "Free" : entry.item.price}
                    {entry.item.discountPercent > 0 && (
                      <span className="ml-2 px-1 rounded bg-green-500/15 text-green-500">
                        -
                        {entry.item.discountPercent}
                        %
                      </span>
                    )}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="w-full max-w-4xl space-y-6 flex flex-col h-full px-4 animate-fadeInUp page-transition-fallback"
      style={{ viewTransitionName: "search-morph-container" }}
    >
      <div
        className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ viewTransitionName: "search-card" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/10 via-transparent to-[var(--steam-accent)]/5 opacity-50" />

        <div className="relative p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <img
                src={profile.avatar}
                alt={`${profile.name}'s avatar`}
                width={80}
                height={80}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-3 sm:border-4 border-[var(--steam-accent)]/30 shadow-xl flex-shrink-0"
              />

              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--foreground)] truncate">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] font-mono truncate">
                  Steam ID:
                  {" "}
                  {profile.steamId}
                </p>
                {library && !library.isPrivate && (
                  <div className="flex items-center space-x-1 sm:space-x-2 text-[var(--foreground-secondary)]">
                    <Gamepad2 size={16} />
                    <span className="font-semibold text-xs sm:text-sm line-clamp-1">
                      {library.games.length}
                      {" "}
                      games owned
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <ExternalLink
                href={profile.profileUrl}
                showIcon={false}
                className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white hover:text-white text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">View Profile</span>
              </ExternalLink>

              <button
                type="button"
                onClick={onClose}
                className="group relative px-3 sm:px-4 py-2 bg-[var(--background-secondary)]/50 hover:bg-[var(--steam-accent)]/10 border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center space-x-2"
                aria-label="Back to search"
                style={{ viewTransitionName: "search-input" }}
              >
                <Search size={16} className="text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300" />
                <span className="hidden sm:inline text-sm font-medium text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300">
                  Search Again
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/5 via-transparent to-[var(--steam-accent)]/10 opacity-50" />

        <div className="relative p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0 gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                Missing Content
              </h2>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] flex items-center gap-2" aria-live="polite">
                {isScanning && <Loader2 size={14} className="animate-spin flex-shrink-0" />}
                <span className="truncate">{status}</span>
              </p>
            </div>

            {total > 0 && (
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "group relative px-2 sm:px-3 py-2 border rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center space-x-1 sm:space-x-2 flex-shrink-0",
                  showSearch
                    ? "bg-[var(--steam-accent)]/10 border-[var(--steam-accent)]/30 text-[var(--steam-accent)]"
                    : "bg-[var(--background-secondary)]/50 hover:bg-[var(--steam-accent)]/10 border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 text-[var(--foreground-muted)] hover:text-[var(--steam-accent)]",
                )}
                aria-expanded={showSearch}
                aria-label={showSearch ? "Hide filter" : "Show filter"}
              >
                <Filter size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  {showSearch ? "Hide Filter" : "Filter"}
                </span>
              </button>
            )}
          </div>

          {isScanning && analysis.total > 0 && (
            <div
              className="h-1 mb-4 rounded-full bg-[var(--foreground)]/10 overflow-hidden flex-shrink-0"
              role="progressbar"
              aria-label="Analysis progress"
              aria-valuemin={0}
              aria-valuemax={analysis.total}
              aria-valuenow={analysis.done}
            >
              <div
                className="h-full bg-[var(--steam-accent)] transition-[width] duration-300"
                style={{ width: `${(analysis.done / analysis.total) * 100}%` }}
              />
            </div>
          )}

          {showSearch && total > 0 && (
            <div className="mb-4 sm:mb-6 flex-shrink-0 animate-fadeInUp">
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  aria-label="Filter by name"
                  className={cn(
                    "w-full px-3 sm:px-4 py-2 sm:py-3 pr-16 sm:pr-20 text-sm sm:text-base font-medium bg-[var(--input-background)]/80 backdrop-blur-sm border-2 rounded-xl text-[var(--input-text)] placeholder:text-[var(--foreground-muted)] transition-all duration-500 ease-out focus:outline-none cursor-text",
                    searchFocused
                      ? "border-[var(--steam-accent)] shadow-xl shadow-[var(--steam-accent)]/30 bg-[var(--input-background)]"
                      : "border-[var(--input-border)] hover:border-[var(--steam-accent)]/60 hover:shadow-lg",
                  )}
                  placeholder="Filter by name..."
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[var(--background-secondary)]/50 rounded-lg transition-all duration-300 cursor-pointer"
                    aria-label="Clear filter"
                  >
                    <X size={16} className="text-[var(--foreground-muted)]" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            ref={parentRef}
            className={cn(
              "flex-1 pr-2 scrollbar-thin scrollbar-thumb-steam scrollbar-track-transparent overflow-auto",
              showSearch ? "results-view-height" : "results-view-height-no-search",
            )}
          >
            {renderBody()}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--card-border)]/20 flex-shrink-0">
            <p className="text-xs text-[var(--foreground-muted)] text-center line-clamp-1">
              Analysis powered by Steam store data
              {analysis.failed > 0 && ` • ${analysis.failed} lookups failed and will be retried next time`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
