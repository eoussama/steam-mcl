import { QueryClient } from "@tanstack/react-query";

import { CACHE_MAX_AGE } from "./cache-times";
import { retryDelay, shouldRetry } from "./retry";



/**
 * @description
 * Creates a query client, one per request on the server and one per tab in the browser.
 *
 * @returns The query client.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: CACHE_MAX_AGE,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: false,
      },
    },
  });
}
