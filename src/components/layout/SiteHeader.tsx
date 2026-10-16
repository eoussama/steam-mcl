import { Link, useMatchRoute } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_LINKS, APP_VERSION } from "@/lib/consts";
import { cn } from "@/lib/utils";

import { GitHubIcon } from "./GitHubIcon";



/**
 * @description
 * Top row with the brand, which morphs from the home page title, and the global actions. It has no surface of its
 * own so the morph reads as the title settling into place.
 *
 * @returns The site header.
 */
export const SiteHeader: React.FC = () => {
  const matchRoute = useMatchRoute();
  const isHome = Boolean(matchRoute({ to: "/" }));

  return (
    <header
      className={cn(
        "mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4",
        // Pinned on the results, where the sticky bar paints the backdrop behind it.
        !isHome && "sticky top-0 z-40",
      )}
    >
      {isHome
        ? <span />
        : (
            <Tooltip>
              <TooltipTrigger
                render={(
                  <Link
                    to="/"
                    aria-label="Steam Missing Content Lookup, back to search"
                    className="flex items-baseline gap-1.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                )}
              >
                <span className="font-heading text-xl font-black tracking-tight steam-title [view-transition-name:brand-title]">
                  Steam
                </span>
                <span className="font-heading text-xl font-black tracking-tight text-muted-foreground">MCL</span>
                <span className="font-mono text-xs text-muted-foreground/80">
                  v
                  {APP_VERSION}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">Steam Missing Content Lookup</TooltipContent>
            </Tooltip>
          )}

      <nav className="flex items-center gap-1">
        {!isHome && (
          <Button
            variant="ghost"
            size="icon"
            render={<a href={APP_LINKS.repository} target="_blank" rel="noopener noreferrer" aria-label="Source code on GitHub" />}
          >
            <GitHubIcon />
          </Button>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
};
