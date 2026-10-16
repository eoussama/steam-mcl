import type { TResultsSearch } from "@/features/results/search-params";

import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Import, RotateCw, UserX, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLibraryAnalysis } from "@/features/analysis";
import { useOwnership } from "@/features/ownership";
import { ProfileActions } from "@/features/profile/ProfileActions";
import { ProfileHeader, ProfileHeaderSkeleton } from "@/features/profile/ProfileHeader";
import { getProfileSlug, useLibrary, useProfile } from "@/features/profile/queries";
import { ResultsList } from "@/features/results/ResultsList";
import { NoMatchState, NothingMissingState, PrivateLibraryState, ResultsSkeleton, ResultsState } from "@/features/results/ResultsStates";
import { ResultsToolbar } from "@/features/results/ResultsToolbar";
import { RESULTS_SEARCH_DEFAULTS, resultsSearchSchema } from "@/features/results/search-params";
import { selectResults } from "@/features/results/select-results";
import { useLocalFlag } from "@/hooks/useLocalFlag";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { SITE_HEADER_HEIGHT } from "@/lib/consts";
import { getErrorCode } from "@/lib/query/retry";
import { cn } from "@/lib/utils";



export const Route = createFileRoute("/$profile")({
  validateSearch: resultsSearchSchema,
  search: {
    middlewares: [stripSearchParams(RESULTS_SEARCH_DEFAULTS)],
  },
  head: ({ params }) => ({
    meta: [{ title: `${params.profile} · Steam Missing Content Lookup` }],
  }),
  component: ProfilePage,
});

function getProfileError(error: unknown): { title: string; message: string } {
  switch (getErrorCode(error)) {
    case "NOT_FOUND":
      return { title: "Profile not found", message: "No Steam profile matches that name or ID. Check it and try again." };

    case "BAD_REQUEST":
      return { title: "Invalid profile", message: "Use a Steam ID64, a profile URL or a custom profile name." };

    case "TOO_MANY_REQUESTS":
      return { title: "Steam is busy", message: "Steam is limiting requests right now. Please try again in a minute." };

    default:
      return { title: "Something went wrong", message: "Steam could not be reached. Please try again in a moment." };
  }
}

function ProfilePage() {
  const { profile: profileParam } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [toolbarKey, setToolbarKey] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isCompact = useScrolledPast(sentinelRef, SITE_HEADER_HEIGHT);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [importHintDismissed, setImportHintDismissed] = useLocalFlag("steam-mcl:import-hint-dismissed");

  const profileQuery = useProfile(profileParam);
  const profile = profileQuery.data;
  const libraryQuery = useLibrary(profile?.steamId);
  const library = libraryQuery.data;
  const analysis = useLibraryAnalysis(library && !library.isPrivate ? library.games : undefined);
  const ownership = useOwnership(profile?.steamId);

  useEffect(() => {
    if (profile && getProfileSlug(profile) !== profileParam) {
      void navigate({ params: { profile: getProfileSlug(profile) }, search: prev => prev, replace: true, viewTransition: false });
    }
  }, [navigate, profile, profileParam]);

  // Items stream in while scanning, sorting them can wait for scrolling and typing.
  const items = useDeferredValue(analysis.items);
  const selection = useMemo(
    () => selectResults(items.values(), library?.games ?? [], search, ownership.statusOf),
    [items, library, search, ownership.statusOf],
  );

  const groupKeys = useMemo(
    () => selection.rows.flatMap(row => (row.kind === "group" ? [row.key] : [])),
    [selection.rows],
  );
  const allCollapsed = groupKeys.length > 0 && groupKeys.every(key => collapsed.has(key));

  // Changed results show from their top, right under the sticky bar.
  const scrollToResults = () => {
    const sentinel = sentinelRef.current;

    if (sentinel && sentinel.getBoundingClientRect().bottom < SITE_HEADER_HEIGHT) {
      window.scrollTo({ top: sentinel.offsetTop + sentinel.offsetHeight - SITE_HEADER_HEIGHT + 1 });
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);

      if (!next.delete(key)) {
        next.add(key);
      }

      return next;
    });
  };

  const toggleAllGroups = () => {
    scrollToResults();
    setCollapsed(allCollapsed ? new Set() : new Set(groupKeys));
  };

  const updateSearch = (patch: Partial<TResultsSearch>, options: { animate?: boolean } = {}) => {
    scrollToResults();

    void navigate({
      search: prev => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
      viewTransition: options.animate ? { types: ["filter"] } : false,
    });
  };

  const resetFilters = () => {
    setToolbarKey(key => key + 1);
    updateSearch({ category: "all", q: "", view: "missing" }, { animate: true });
  };

  const refreshLibrary = () => {
    void profileQuery.refetch();
    void libraryQuery.refetch();
  };

  const queryError = profileQuery.error ?? libraryQuery.error;

  if (queryError) {
    const copy = getProfileError(queryError);
    const retry = () => void (profileQuery.error ? profileQuery.refetch() : libraryQuery.refetch());

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ResultsState
          icon={getErrorCode(queryError) === "NOT_FOUND" ? UserX : AlertTriangle}
          title={copy.title}
          action={(
            <div className="flex gap-2">
              <Button variant="outline" onClick={retry}>
                <RotateCw />
                Try again
              </Button>
              <Button onClick={() => void navigate({ to: "/" })}>New search</Button>
            </div>
          )}
        >
          {copy.message}
        </ResultsState>
      </div>
    );
  }

  const isScanning = analysis.phase === "library" || analysis.phase === "scanning";
  const hasItems = analysis.items.size > 0;
  const showToolbar = Boolean(library && !library.isPrivate && hasItems);
  const showImportHint = search.view === "missing" && !ownership.imported && !importHintDismissed && analysis.phase === "done";

  const renderResults = () => {
    if (library?.isPrivate) {
      return <PrivateLibraryState />;
    }

    if (!library || (!hasItems && isScanning) || analysis.phase === "idle") {
      return <ResultsSkeleton />;
    }

    if (analysis.error && !hasItems) {
      return (
        <ResultsState
          icon={AlertTriangle}
          title="Analysis failed"
          action={(
            <Button variant="outline" onClick={analysis.restart}>
              <RotateCw />
              Try again
            </Button>
          )}
        >
          Steam did not answer as expected. Please try again in a moment.
        </ResultsState>
      );
    }

    if (!hasItems) {
      return <NothingMissingState />;
    }

    return (
      <div className="space-y-4">
        {showImportHint && (
          <Alert className="glass border-steam-blue/30 animate-in fade-in-0 slide-in-from-top-1">
            <Import className="text-steam-blue" />
            <AlertTitle>Own some of these already?</AlertTitle>
            <AlertDescription>
              Steam keeps the DLC and soundtracks you own private, so they show up here. Import what your account owns to
              set them aside.
            </AlertDescription>
            <AlertAction className="flex gap-1">
              <Button size="sm" onClick={() => setImportOpen(true)}>Import</Button>
              <Button variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={() => setImportHintDismissed(true)}>
                <X />
              </Button>
            </AlertAction>
          </Alert>
        )}

        <div className="[view-transition-name:results]">
          {selection.matched === 0
            ? <NoMatchState onReset={resetFilters} />
            : (
                <ResultsList
                  rows={selection.rows}
                  collapsed={collapsed}
                  onToggleGroup={toggleGroup}
                  view={search.view}
                  onSetStatus={ownership.setStatus}
                />
              )}
        </div>

        {analysis.failed > 0 && analysis.phase === "done" && (
          <p className="text-center text-xs text-muted-foreground">
            {analysis.failed}
            {" "}
            lookups failed and will be retried on your next visit.
            {" "}
            <button type="button" onClick={analysis.restart} className="font-medium text-link underline-offset-4 hover:underline">
              Retry now
            </button>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8">
      {/* Leaves the viewport exactly when the bar below sticks. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-4 sm:h-6" />

      <div
        data-compact={isCompact || undefined}
        className={cn(
          // Sits under the pinned site header, its backdrop reaches up behind the header.
          "sticky top-14 z-30 -mx-4 space-y-3 px-4 py-2 transition-[padding] duration-300",
          "before:pointer-events-none before:absolute before:-top-14 before:bottom-0 before:left-1/2 before:-z-10 before:w-dvw before:-translate-x-1/2",
          "before:border-b before:border-border/60 before:opacity-0 before:shadow-lg before:shadow-steam-navy/5 before:glass before:transition-opacity before:duration-300",
          "data-compact:before:opacity-100 dark:before:shadow-black/20",
        )}
      >
        {profile
          ? (
              <ProfileHeader
                profile={profile}
                library={library}
                analysis={analysis}
                compact={isCompact}
                missingCount={selection.views.missing}
                actions={(
                  <ProfileActions
                    profileName={profile.name}
                    ownership={ownership}
                    isRefreshing={libraryQuery.isFetching || profileQuery.isFetching}
                    onRefresh={refreshLibrary}
                    compact={isCompact}
                    importOpen={importOpen}
                    onImportOpenChange={setImportOpen}
                  />
                )}
              />
            )
          : <ProfileHeaderSkeleton />}

        {showToolbar && <ResultsToolbar key={toolbarKey} search={search} counts={selection.counts} onChange={updateSearch} allCollapsed={allCollapsed} onToggleAll={toggleAllGroups} views={selection.views} />}
      </div>

      {/* Keeps enough room to scroll so the bar stays compact when few results match. */}
      <section aria-label="Missing content" className="min-h-dvh space-y-4 pt-3">
        {profile ? renderResults() : <ResultsSkeleton />}
      </section>
    </div>
  );
}
