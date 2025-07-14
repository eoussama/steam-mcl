"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { STEAM_QUERY_KEYS } from "@/lib/consts";
import { type TSteamPlayerResponse, type TMissingContentResponse } from "@/lib/types";



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