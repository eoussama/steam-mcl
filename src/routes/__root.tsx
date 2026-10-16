import type { ReactNode } from "react";

import type { TRouterContext } from "@/router";

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { AppProviders } from "@/components/AppProviders";

import appCss from "@/styles/app.css?url";



export const Route = createRootRouteWithContext<TRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Steam Missing Content Lookup" },
      { name: "description", content: "Find the DLC, soundtracks, editions and franchise games missing from your Steam library." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, trpcClient } = Route.useRouteContext();

  return (
    <AppProviders queryClient={queryClient} trpcClient={trpcClient}>
      <Outlet />
    </AppProviders>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
