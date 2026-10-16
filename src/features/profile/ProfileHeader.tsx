import type { TAnalysisState } from "@/features/analysis";
import type { TLibrary, TSteamProfile } from "@/lib/steam";

import { Link } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, Lock, PackageSearch, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";



type TProfileHeaderProps = {
  profile: TSteamProfile;
  library: TLibrary | undefined;
  analysis: TAnalysisState;
  compact?: boolean;
  /**
   * Items still missing once owned and hidden ones are set aside.
   */
  missingCount: number;
  actions?: React.ReactNode;
};

const EASE = "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

function getStatus(library: TLibrary | undefined, analysis: TAnalysisState): string | null {
  if (!library) {
    return "Reading your library…";
  }

  if (library.isPrivate) {
    return null;
  }

  switch (analysis.phase) {
    case "idle":

    case "library":
      return "Reading store data for your games…";

    case "scanning":
      return analysis.pausedUntil
        ? "Steam is rate limiting, resuming shortly…"
        : `Checking ${analysis.done} of ${analysis.total} lookups, most played games first`;

    default:
      return null;
  }
}

/**
 * @description
 * Collapses its content to nothing, animating the height.
 *
 * @param props - Component props.
 * @param props.open - Whether the content shows.
 * @param props.className - Classes of the content.
 * @param props.children - Content.
 * @returns The collapsible wrapper.
 */
const Collapse: React.FC<{ open: boolean; className?: string; children: React.ReactNode }> = ({ open, className, children }) => (
  <div
    aria-hidden={!open || undefined}
    className={cn("grid transition-[grid-template-rows,opacity]", EASE, open ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-0")}
  >
    <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
  </div>
);

/**
 * @description
 * Profile summary with live analysis progress. Shares its view transition name with the home search card so the
 * card morphs into it. Once the page scrolls, it shrinks into a single row that blends into the sticky bar.
 *
 * @param props - Component props.
 * @param props.profile - Resolved profile.
 * @param props.library - Owned games, undefined while loading.
 * @param props.analysis - Analysis state.
 * @param props.compact - Whether to show the condensed single row form.
 * @param props.missingCount - Items still missing once owned and hidden ones are set aside.
 * @param props.actions - Extra actions shown after the main buttons.
 * @returns The profile header.
 */
export const ProfileHeader: React.FC<TProfileHeaderProps> = ({ profile, library, analysis, compact = false, missingCount, actions }) => {
  const status = getStatus(library, analysis);
  const progress = analysis.total > 0 ? Math.round((analysis.done / analysis.total) * 100) : 0;
  const labelClass = cn("overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity]", EASE, compact ? "ml-0 max-w-0 opacity-0" : "ml-1.5 max-w-32");

  return (
    <Card
      data-compact={compact || undefined}
      className={cn(
        // Visible overflow keeps the avatar ring whole once the padding is gone.
        "overflow-visible rounded-2xl transition-[background-color,box-shadow,padding]",
        EASE,
        "[view-transition-name:search-card]",
        compact
          ? "bg-transparent py-0 shadow-none ring-transparent"
          : "glass shadow-xl shadow-steam-navy/5 dark:shadow-black/30",
      )}
    >
      <CardContent className={cn("transition-[padding]", EASE, compact && "px-0")}>
        <div className={cn("flex items-center", compact ? "gap-3" : "flex-wrap gap-4")}>
          <Avatar
            className={cn(
              "ring-2 ring-steam-blue/40 ring-offset-2 ring-offset-card transition-[width,height]",
              EASE,
              compact ? "size-9" : "size-16 sm:size-20",
            )}
          >
            <AvatarImage src={profile.avatar} alt="" />
            <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className={cn("truncate font-black tracking-tight transition-[font-size,line-height]", EASE, compact ? "text-base" : "text-2xl sm:text-3xl")}>
              {profile.name}
            </h1>
            <Collapse open={!compact}>
              <p className="truncate pt-1 font-mono text-xs text-muted-foreground">{profile.steamId}</p>
            </Collapse>
            <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 transition-[padding,font-size]", EASE, compact ? "text-xs" : "pt-2 text-sm")}>
              {library && !library.isPrivate && (
                <span className="inline-flex items-center gap-1.5">
                  <Gamepad2 className="size-[1.15em] text-steam-blue" aria-hidden="true" />
                  <strong className="tabular-nums">{library.games.length}</strong>
                  <span className={cn(compact && "sr-only sm:not-sr-only")}>games owned</span>
                </span>
              )}
              {library?.isPrivate && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Lock className="size-[1.15em]" aria-hidden="true" />
                  Private library
                </span>
              )}
              {analysis.items.size > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <PackageSearch className="size-[1.15em] text-steam-blue" aria-hidden="true" />
                  <strong className="tabular-nums">{missingCount}</strong>
                  <span className={cn(compact && "sr-only sm:not-sr-only")}>missing items</span>
                </span>
              )}
            </div>
          </div>

          <div className={cn("flex gap-2", !compact && "w-full sm:w-auto sm:self-start")}>
            {/* The labels fold away in the compact form, the tooltips stand in for them. */}
            <Tooltip disabled={!compact}>
              <TooltipTrigger
                render={(
                  <Button
                    variant="outline"
                    size={compact ? "icon-sm" : "default"}
                    className={cn("gap-0", compact ? "w-auto px-2" : "flex-1 sm:flex-none")}
                    render={<a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" />}
                  />
                )}
              >
                <ExternalLink />
                <span className={labelClass}>Steam profile</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">Open the Steam profile</TooltipContent>
            </Tooltip>
            <Tooltip disabled={!compact}>
              <TooltipTrigger
                render={(
                  <Button
                    size={compact ? "icon-sm" : "default"}
                    className={cn("gap-0", compact ? "w-auto px-2" : "flex-1 sm:flex-none")}
                    render={<Link to="/" state={{ focusSearch: true }} />}
                  />
                )}
              >
                <Search />
                <span className={labelClass}>New search</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">Look up another profile</TooltipContent>
            </Tooltip>
            {actions}
          </div>
        </div>

        {status && (
          <div role="status" aria-live="polite" className={cn("transition-[padding]", EASE, compact ? "pt-2" : "pt-4")}>
            <Collapse open={!compact}>
              <p className="pb-2 text-xs text-muted-foreground">{status}</p>
            </Collapse>
            <Progress value={analysis.phase === "scanning" ? progress : null} aria-label="Analysis progress" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * @description
 * Placeholder shown while the profile resolves.
 *
 * @returns The skeleton header.
 */
export const ProfileHeaderSkeleton: React.FC = () => (
  <Card className="glass rounded-2xl [view-transition-name:search-card]">
    <CardContent className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-full sm:size-20" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
    </CardContent>
  </Card>
);
