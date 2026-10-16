import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";

import type { TAppRouter } from "@/server/trpc/router";

import { createRouter } from "@tanstack/react-router";
import { getGlobalStartContext } from "@tanstack/react-start";

import { makeQueryClient } from "@/lib/query/client";
import { makeTrpcClient } from "@/lib/trpc";

import { routeTree } from "./routeTree.gen";



export type TRouterContext = {
  queryClient: QueryClient;
  trpcClient: TRPCClient<TAppRouter>;
};

/**
 * @description
 * Creates a fresh router instance, one per request on the server.
 *
 * @returns The application router.
 */
export function getRouter() {
  return createRouter({
    routeTree,
    context: {
      queryClient: makeQueryClient(),
      trpcClient: makeTrpcClient(),
    } satisfies TRouterContext,
    ssr: {
      nonce: getGlobalStartContext()?.nonce,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultViewTransition: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
