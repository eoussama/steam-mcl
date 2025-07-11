/**
 * Custom React Query hooks for Steam API
 * Separates API logic from components
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Types for API responses
export interface SteamApp {
  appid: number;
  name: string;
}

export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
}

export interface OwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
}

export interface SteamPlayerResponse {
  player: SteamUser;
  ownedGames: OwnedGame[];
  steamId: string;
}

// Query keys for React Query caching
export const STEAM_QUERY_KEYS = {
  appList: ['steam', 'apps'] as const,
  playerData: (input: string) => ['steam', 'player', input] as const,
  searchGames: (query: string) => ['steam', 'search-games', query] as const,
} as const;

/**
 * Hook to get the complete Steam app list
 */
export function useSteamAppList(): UseQueryResult<SteamApp[], Error> {
  return useQuery({
    queryKey: STEAM_QUERY_KEYS.appList,
    queryFn: async () => {
      const response = await fetch('/api/steam/apps');
      if (!response.ok) {
        throw new Error('Failed to fetch Steam apps');
      }
      const data = await response.json();
      return data.apps;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - app list doesn't change often
    gcTime: 48 * 60 * 60 * 1000, // 48 hours
  });
}

/**
 * Hook to search for games
 */
export function useSearchGames(query: string, limit = 50): UseQueryResult<SteamApp[], Error> {
  const { data: appList } = useSteamAppList();
  
  return useQuery({
    queryKey: STEAM_QUERY_KEYS.searchGames(query),
    queryFn: () => {
      if (!appList) return [];
      
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return [];
      
      const filteredApps = appList
        .filter(app => app.name.toLowerCase().includes(searchTerm))
        .slice(0, limit);
        
      return filteredApps;
    },
    enabled: !!query && query.trim().length > 0 && !!appList,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Main hook for Steam user search with multiple input formats
 * This uses the API route for server-side Steam API calls
 */
export function useSteamUserSearch(input: string) {
  return useQuery({
    queryKey: STEAM_QUERY_KEYS.playerData(input),
    queryFn: async (): Promise<SteamPlayerResponse> => {
      if (!input.trim()) {
        throw new Error('Input is required');
      }

      const response = await fetch(`/api/steam/player?input=${encodeURIComponent(input.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch Steam player data');
      }
      
      return response.json();
    },
    enabled: !!input && input.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (user not found)
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to analyze missing content for a Steam user
 * This would be used for the main feature of finding missing DLC, sequels, etc.
 */
export function useMissingContentAnalysis(steamId: string) {
  const { data, isLoading, error } = useSteamUserSearch(steamId);
  
  // This is a placeholder for the missing content analysis logic
  // In a real implementation, this would analyze owned games against a database
  // of related content (DLC, sequels, prequels, spin-offs)
  
  return {
    ownedGames: data?.ownedGames || [],
    missingContent: [], // TODO: Implement missing content detection
    isLoading,
    error,
  };
} 