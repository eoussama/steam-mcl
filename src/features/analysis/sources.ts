import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { TAnalysisSources } from "./types";
import type { TStoreItem } from "@/lib/steam";

import type { TAppRouter } from "@/server/trpc/router";

import { retry } from "@eoussama/core";

import { STALE_TIMES } from "@/lib/query/cache-times";
import { isRateLimitError, retryDelay, shouldRetry } from "@/lib/query/retry";



type TSourceDependencies = {
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<TAppRouter>;
  trpcClient: TRPCClient<TAppRouter>;
};

const ITEM_BATCH_SIZE = 50;
const ITEM_BATCH_CONCURRENCY = 3;

/**
 * @description
 * Query key of a single cached store item.
 *
 * @param appid - App id.
 * @returns The query key.
 */
export function storeItemKey(appid: number) {
  return ["steam", "store-item", appid] as const;
}

function sortedUnique(appids: ReadonlyArray<number>): Array<number> {
  return [...new Set(appids)].sort((a, b) => a - b);
}

async function mapWithConcurrency<T, R>(values: ReadonlyArray<T>, limit: number, fn: (value: T) => Promise<R>): Promise<Array<R>> {
  const results: Array<R> = Array.from({ length: values.length });
  let next = 0;

  const worker = async () => {
    while (next < values.length) {
      const index = next++;

      results[index] = await fn(values[index] as T);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));

  return results;
}

/**
 * @description
 * Builds the analyzer data sources on top of the tRPC client and the query cache, so repeated runs and
 * overlapping libraries only fetch what is missing or stale.
 *
 * @param dependencies - Query client and tRPC accessors.
 * @param dependencies.queryClient - Query client whose cache backs every lookup.
 * @param dependencies.trpc - tRPC query options factory.
 * @param dependencies.trpcClient - tRPC client used for batched store item lookups.
 * @returns The analysis sources.
 */
export function createAnalysisSources({ queryClient, trpc, trpcClient }: TSourceDependencies): TAnalysisSources {
  // Rate limits are left to the analyzer, which pauses the whole queue instead of hammering Steam per request.
  const retryLookup = (failureCount: number, error: unknown) => !isRateLimitError(error) && shouldRetry(failureCount, error);

  const withRetry = <T>(fn: () => Promise<T>) => retry(fn, {
    retries: 3,
    delay: (attempt, error) => retryDelay(attempt - 1, error),
    shouldRetry: (error, attempt) => retryLookup(attempt - 1, error),
  });

  const readCachedItem = (appid: number): TStoreItem | null | undefined => {
    const state = queryClient.getQueryState<TStoreItem | null>(storeItemKey(appid));

    if (!state || state.data === undefined || Date.now() - state.dataUpdatedAt > STALE_TIMES.storeItem) {
      return undefined;
    }

    return state.data;
  };

  return {
    items: async (appids) => {
      const found: Array<TStoreItem> = [];
      const missing: Array<number> = [];

      for (const appid of sortedUnique(appids)) {
        const cached = readCachedItem(appid);

        if (cached === undefined) {
          missing.push(appid);
        }
        else if (cached) {
          found.push(cached);
        }
      }

      const batches: Array<Array<number>> = [];

      for (let index = 0; index < missing.length; index += ITEM_BATCH_SIZE) {
        batches.push(missing.slice(index, index + ITEM_BATCH_SIZE));
      }

      const fetched = await mapWithConcurrency(batches, ITEM_BATCH_CONCURRENCY, async (batch) => {
        const items = await withRetry(() => trpcClient.store.items.query({ appids: batch }));
        const byId = new Map(items.map(item => [item.appid, item]));

        // Unknown apps are cached as null so they are not requested again.
        for (const appid of batch) {
          queryClient.setQueryData(storeItemKey(appid), byId.get(appid) ?? null);
        }

        return items;
      });

      return [...found, ...fetched.flat()];
    },

    dlcBatch: appids => queryClient.fetchQuery({
      ...trpc.store.dlcBatch.queryOptions({ appids: sortedUnique(appids) }),
      staleTime: STALE_TIMES.storeLists,
      retry: retryLookup,
      retryDelay,
    }),

    dlc: appid => queryClient.fetchQuery({
      ...trpc.store.dlc.queryOptions({ appid }),
      staleTime: STALE_TIMES.storeLists,
      retry: retryLookup,
      retryDelay,
    }),

    related: (kind, name) => queryClient.fetchQuery({
      ...trpc.store.related.queryOptions({ kind, name }),
      staleTime: STALE_TIMES.storeLists,
      retry: retryLookup,
      retryDelay,
    }),
  };
}
