import type { UseQueryResult } from "@tanstack/react-query";
import type { TMissingContentResponse, TSteamPlayerResponse } from "@/lib/types";

import { useQuery } from "@tanstack/react-query";
import { STEAM_QUERY_KEYS } from "@/lib/consts";



/**
 * @description
 * Resolves a Steam profile and its owned games from user input.
 *
 * @param input - Steam ID64, vanity name or profile URL.
 * @returns The player query.
 */
export function useSteamUserSearch(input: string) {
  return useQuery({
    queryKey: STEAM_QUERY_KEYS.playerData(input),
    queryFn: async (): Promise<TSteamPlayerResponse> => {
      if (!input.trim()) {
        throw new Error("Input is required");
      }

      const response = await fetch(`/api/steam/player?input=${encodeURIComponent(input.trim())}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.error ?? "Failed to fetch Steam player data");
      }

      return response.json();
    },
    enabled: !!input && input.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

/**
 * @description
 * Analyzes the content missing from a Steam library.
 *
 * @param steamId - Steam ID64 of the profile.
 * @returns The analysis query.
 */
export function useMissingContentAnalysis(steamId: string): UseQueryResult<TMissingContentResponse, Error> {
  return useQuery({
    queryKey: STEAM_QUERY_KEYS.missingContent(steamId),
    queryFn: async (): Promise<TMissingContentResponse> => {
      if (!steamId.trim()) {
        throw new Error("Steam ID is required");
      }

      const response = await fetch(`/api/missing-content?steamId=${encodeURIComponent(steamId.trim())}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.error || "Failed to analyze missing content");
      }

      return response.json();
    },
    enabled: !!steamId && steamId.trim().length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("credentials not configured")) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
