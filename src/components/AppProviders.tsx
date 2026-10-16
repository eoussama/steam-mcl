import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { ReactNode } from "react";

import type { TAppRouter } from "@/server/trpc/router";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { lazy, Suspense, useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_VERSION } from "@/lib/consts";
import { ThemeProvider } from "@/lib/context";
import { CACHE_MAX_AGE } from "@/lib/query/cache-times";
import { makePersister } from "@/lib/query/persister";
import { TRPCProvider } from "@/lib/trpc";



type TAppProvidersProps = {
  queryClient: QueryClient;
  trpcClient: TRPCClient<TAppRouter>;
  children: ReactNode;
};

const Devtools = import.meta.env.DEV
  ? lazy(() => import("./Devtools").then(module => ({ default: module.Devtools })))
  : () => null;

/**
 * @description
 * Wraps the application with its providers: the persisted query cache, tRPC and the theme.
 *
 * @param props - Component props.
 * @param props.queryClient - Query client owned by the router.
 * @param props.trpcClient - tRPC client owned by the router.
 * @param props.children - Content rendered inside the providers.
 * @returns The wrapped content.
 */
export const AppProviders: React.FC<TAppProvidersProps> = ({ queryClient, trpcClient, children }) => {
  const [persister] = useState(makePersister);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        buster: APP_VERSION,
        dehydrateOptions: {
          shouldDehydrateQuery: query => query.state.status === "success",
        },
      }}
    >
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </TRPCProvider>

      <Suspense>
        <Devtools />
      </Suspense>
    </PersistQueryClientProvider>
  );
};
