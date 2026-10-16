import type { QueryClient } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";



const CACHE_KEY = "steam-mcl:query-cache";

/**
 * @description
 * Creates a persister that stores the query cache in IndexedDB, which has room for large libraries
 * unlike local storage.
 *
 * @returns The persister.
 */
export function makePersister(): Persister {
  return createAsyncStoragePersister({
    key: CACHE_KEY,
    throttleTime: 2_000,
    storage: {
      getItem: async key => (await get<string>(key)) ?? null,
      setItem: (key, value: string) => set(key, value),
      removeItem: key => del(key),
    },
  });
}

/**
 * @description
 * Drops every cached response, in memory and on disk. Local marks and imports are kept.
 *
 * @param queryClient - Query client to empty.
 * @returns A promise resolving once the stored cache is deleted.
 */
export async function clearCachedData(queryClient: QueryClient): Promise<void> {
  queryClient.clear();
  await del(CACHE_KEY);
}
