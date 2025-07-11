/**
 * Steam API Service Module
 * Handles all Steam Web API interactions
 */

const STEAM_API_BASE_URL = 'https://api.steampowered.com';

// Steam API endpoints
export const STEAM_API_ENDPOINTS = {
  GET_APP_LIST: '/ISteamApps/GetAppList/v2/',
  GET_PLAYER_SUMMARIES: '/ISteamUser/GetPlayerSummaries/v2/',
  GET_OWNED_GAMES: '/IPlayerService/GetOwnedGames/v1/',
  GET_USER_STATS: '/ISteamUserStats/GetUserStatsForGame/v2/',
  RESOLVE_VANITY_URL: '/ISteamUser/ResolveVanityURL/v1/',
} as const;

/**
 * Interface for Steam App
 */
export interface SteamApp {
  appid: number;
  name: string;
}

/**
 * Interface for Steam User
 */
export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
}

/**
 * Interface for owned game
 */
export interface OwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
}

/**
 * Interface for API response structures
 */
export interface GetAppListResponse {
  applist: {
    apps: SteamApp[];
  };
}

export interface GetPlayerSummariesResponse {
  response: {
    players: SteamUser[];
  };
}

export interface GetOwnedGamesResponse {
  response: {
    game_count: number;
    games: OwnedGame[];
  };
}

export interface ResolveVanityURLResponse {
  response: {
    steamid?: string;
    success: number;
    message?: string;
  };
}

/**
 * Get Steam API key from environment
 */
const getSteamAPIKey = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: Steam API key should not be exposed
    throw new Error('Steam API key should not be used on client-side');
  }
  
  const apiKey = process.env.STEAM_KEY;
  if (!apiKey) {
    throw new Error('STEAM_KEY environment variable is not set');
  }
  return apiKey;
};

/**
 * Generic API request function
 */
async function steamAPIRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getSteamAPIKey();
  
  const url = new URL(STEAM_API_BASE_URL + endpoint);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('format', 'json');
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Steam API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get complete list of Steam apps
 */
export async function getAppList(): Promise<SteamApp[]> {
  const data = await steamAPIRequest<GetAppListResponse>(STEAM_API_ENDPOINTS.GET_APP_LIST);
  return data.applist.apps;
}

/**
 * Get player information by Steam ID
 */
export async function getPlayerSummaries(steamIds: string[]): Promise<SteamUser[]> {
  const data = await steamAPIRequest<GetPlayerSummariesResponse>(
    STEAM_API_ENDPOINTS.GET_PLAYER_SUMMARIES,
    { steamids: steamIds.join(',') }
  );
  return data.response.players;
}

/**
 * Get owned games for a player
 */
export async function getOwnedGames(steamId: string, includeAppInfo = true): Promise<OwnedGame[]> {
  const data = await steamAPIRequest<GetOwnedGamesResponse>(
    STEAM_API_ENDPOINTS.GET_OWNED_GAMES,
    {
      steamid: steamId,
      include_appinfo: includeAppInfo ? '1' : '0',
      include_played_free_games: '1',
    }
  );
  return data.response.games || [];
}

/**
 * Resolve vanity URL to Steam ID
 */
export async function resolveVanityURL(vanityUrl: string): Promise<string | null> {
  try {
    const data = await steamAPIRequest<ResolveVanityURLResponse>(
      STEAM_API_ENDPOINTS.RESOLVE_VANITY_URL,
      { vanityurl: vanityUrl }
    );
    
    if (data.response.success === 1 && data.response.steamid) {
      return data.response.steamid;
    }
    return null;
  } catch (error) {
    console.error('Error resolving vanity URL:', error);
    return null;
  }
}

/**
 * Search for games by name in the app list
 */
export async function searchGames(query: string, limit = 50): Promise<SteamApp[]> {
  const apps = await getAppList();
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return [];
  }
  
  const filteredApps = apps
    .filter(app => app.name.toLowerCase().includes(searchTerm))
    .slice(0, limit);
    
  return filteredApps;
}

/**
 * Helper function to extract Steam ID from various input formats
 */
export function extractSteamId(input: string): string | null {
  // Remove whitespace
  const trimmed = input.trim();
  
  // Check if it's already a Steam ID (17 digits)
  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Extract from profile URL patterns
  const urlPatterns = [
    /steamcommunity\.com\/profiles\/(\d{17})/,
    /steamcommunity\.com\/id\/([^\/]+)/,
  ];
  
  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      if (pattern.source.includes('profiles')) {
        return match[1]; // Direct Steam ID
      } else {
        return match[1]; // Vanity URL - will need to be resolved
      }
    }
  }
  
  // If no pattern matches, assume it's a vanity URL
  return trimmed;
} 