import { APP_LINKS, APP_VERSION } from "@/lib/consts";

import { ExternalLink } from "./ExternalLink";



/**
 * @description
 * Page footer with the app version and external links.
 *
 * @returns The footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer
      style={{ animationDelay: "300ms" }}
      className="relative z-10 text-center py-2 border-t border-[var(--card-border)]/30 bg-[var(--background)]/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="flex flex-row items-center justify-center gap-1.5 text-xs text-[var(--foreground-muted)] font-medium">
        <span>
          v
          {APP_VERSION}
        </span>

        <span>•</span>

        <ExternalLink href={APP_LINKS.author}>eoussama</ExternalLink>

        <span>•</span>

        <ExternalLink href={APP_LINKS.repository}>GitHub</ExternalLink>
      </div>
    </footer>
  );
};
