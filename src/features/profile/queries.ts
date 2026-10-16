import type { TSteamProfile } from "@/lib/steam";

import { skipToken, useQuery } from "@tanstack/react-query";

import { STALE_TIMES } from "@/lib/query/cache-times";
import { useTRPC } from "@/lib/trpc";



/**
 * @description
 * Canonical URL segment of a profile: its custom name when it has one, its Steam ID64 otherwise.
 *
 * @param profile - Resolved profile.
 * @returns The profile slug.
 */
export function getProfileSlug(profile: TSteamProfile): string {
  return profile.vanity ?? profile.steamId;
}

/**
 * @description
 * Resolves a profile reference, cached for a day.
 *
 * @param input - Steam ID64, custom profile name or profile URL.
 * @returns The profile query.
 */
export function useProfile(input: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.profile.resolve.queryOptions({ input }),
    staleTime: STALE_TIMES.profile,
  });
}

/**
 * @description
 * Fetches the games owned by a profile, cached for an hour.
 *
 * @param steamId - Steam ID64, the query waits until it is known.
 * @returns The library query.
 */
export function useLibrary(steamId: string | undefined) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.library.owned.queryOptions(steamId ? { steamId } : skipToken),
    staleTime: STALE_TIMES.library,
  });
}
