import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { getCachePolicy } from "@/server/trpc/cache";
import { appRouter } from "@/server/trpc/router";



function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => ({}),
    responseMeta: ({ paths, errors, type }) => ({
      headers: new Headers({
        "cache-control": type === "query" ? getCachePolicy(paths, errors.length > 0) : "no-store",
      }),
    }),
    onError: ({ error, path }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[trpc] ${path ?? "unknown"} failed:`, error.cause?.message ?? error.message);
      }
    },
  });
}

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: handler,
    },
  },
});
