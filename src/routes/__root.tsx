import type { ReactNode } from "react";

import type { TRouterContext } from "@/router";

import { createRootRouteWithContext, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router";

import { AppProviders } from "@/components/AppProviders";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { THEME_BOOT_SCRIPT } from "@/lib/helpers";

import appCss from "@/styles/app.css?url";



export const Route = createRootRouteWithContext<TRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Steam Missing Content Lookup" },
      { name: "description", content: "Find the DLC, soundtracks, editions and franchise games missing from your Steam library." },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0e1419" },
      { property: "og:title", content: "Steam Missing Content Lookup" },
      { property: "og:description", content: "Find the DLC, soundtracks, editions and franchise games missing from your Steam library." },
      { property: "og:image", content: "/logo-large.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/logo.png" },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, trpcClient } = Route.useRouteContext();

  return (
    <AppProviders queryClient={queryClient} trpcClient={trpcClient}>
      <AmbientBackground />
      <div className="relative flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </AppProviders>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{THEME_BOOT_SCRIPT}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
