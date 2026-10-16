import { APP_LINKS, APP_VERSION } from "@/lib/consts";



const linkClass = "font-medium text-link underline-offset-4 hover:underline focus-visible:underline outline-none";

/**
 * @description
 * Page footer with the app version, credits and the Valve disclaimer.
 *
 * @returns The footer.
 */
export const SiteFooter: React.FC = () => (
  <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground">
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      <span className="font-mono">
        v
        {APP_VERSION}
      </span>
      <span aria-hidden="true">•</span>
      <a href={APP_LINKS.author} target="_blank" rel="noopener noreferrer" className={linkClass}>eoussama</a>
      <span aria-hidden="true">•</span>
      <a href={APP_LINKS.repository} target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub</a>
    </p>
    <p className="mt-1.5">Not affiliated with Valve Corporation or Steam.</p>
  </footer>
);
