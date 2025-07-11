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
 * Interface for missing content analysis using Steam data only
 */
export interface SteamMissingContent {
  appid: number;
  name: string;
  type: 'DLC' | 'Expansion' | 'Sequel' | 'Edition' | 'Bundle' | 'Related';
  baseGame: string;
  baseGameAppid: number;
  description: string;
  steamUrl: string;
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

/**
 * Check if a Steam app is available on the store (not removed/delisted)
 * This is a basic check - apps with very generic names or those that redirect to homepage are likely unavailable
 */
function isAppLikelyAvailable(app: SteamApp): boolean {
  const name = app.name.toLowerCase();
  
  // Filter out apps with very generic or system-like names that are likely not real games
  const genericPatterns = [
    /^test$/,
    /^demo$/,
    /^sdk$/,
    /^tool$/,
    /^server$/,
    /^dedicated server$/,
    /^beta$/,
    /^alpha$/,
    /^prototype$/,
    /^sample$/,
    /^template$/,
    /^placeholder$/,
    /^unknown$/,
    /^untitled$/,
    /valve.*tool/,
    /source.*sdk/,
    /steamworks/,
    /^steam/,
    /^valve/
  ];
  
  // Check if the name matches any generic pattern
  if (genericPatterns.some(pattern => pattern.test(name))) {
    return false;
  }
  
  // Filter out apps with very short names (likely system apps)
  if (app.name.trim().length < 3) {
    return false;
  }
  
  // Filter out apps that are clearly system/development tools
  if (name.includes('dedicated server') || 
      name.includes('source sdk') || 
      name.includes('steamworks') ||
      name.includes('valve tool')) {
    return false;
  }
  
  return true;
}

/**
 * Analyze missing content using Steam data only
 * Compares owned games with full Steam catalog to find potential DLC, expansions, etc.
 */
export async function analyzeMissingContentSteamOnly(ownedGames: OwnedGame[]): Promise<SteamMissingContent[]> {
  try {
    // Get the complete Steam app list
    const allApps = await getAppList();
    const missingContent: SteamMissingContent[] = [];
    
    // Create a set of owned app IDs for quick lookup
    const ownedAppIds = new Set(ownedGames.map(game => game.appid));
    
    // Filter out likely unavailable/system apps
    const availableApps = allApps.filter(isAppLikelyAvailable);
    
    // Analyze each owned game for missing content
    for (const ownedGame of ownedGames) {
      if (!ownedGame.name) continue;
      
      const baseName = ownedGame.name;
      const baseNameLower = baseName.toLowerCase();
      
      // Find related content by pattern matching
      const relatedApps = availableApps.filter(app => {
        // Skip if we already own this app (double-check with both appid and name)
        if (ownedAppIds.has(app.appid)) return false;
        
        // Also check by name to catch cases where same game has different app IDs
        const appNameLower = app.name.toLowerCase();
        if (appNameLower === baseNameLower) return false;
        
        // Skip if the app name is too short or generic
        if (app.name.length < 3) return false;
        
        // Check for various patterns that indicate related content
        return (
          // DLC patterns
          appNameLower.includes(baseNameLower + ' -') ||
          appNameLower.includes(baseNameLower + ':') ||
          appNameLower.includes(baseNameLower + ' dlc') ||
          appNameLower.includes(baseNameLower + ' expansion') ||
          
          // Edition patterns
          (appNameLower.includes(baseNameLower) && (
            appNameLower.includes('edition') ||
            appNameLower.includes('remaster') ||
            appNameLower.includes('enhanced') ||
            appNameLower.includes('definitive') ||
            appNameLower.includes('complete') ||
            appNameLower.includes('ultimate') ||
            appNameLower.includes('deluxe') ||
            appNameLower.includes('gold') ||
            appNameLower.includes('goty') ||
            appNameLower.includes('game of the year')
          )) ||
          
          // Sequel patterns (be more restrictive to avoid false positives)
          (appNameLower.startsWith(baseNameLower + ' ') && (
            /\s(2|3|4|5|ii|iii|iv|v)\b/.test(appNameLower) ||
            appNameLower.includes(' sequel') ||
            appNameLower.includes(' returns') ||
            appNameLower.includes(' continues')
          )) ||
          
          // Bundle patterns
          (appNameLower.includes('bundle') && appNameLower.includes(baseNameLower)) ||
          (appNameLower.includes('collection') && appNameLower.includes(baseNameLower)) ||
          (appNameLower.includes('pack') && appNameLower.includes(baseNameLower))
        );
      });
      
      // Categorize and add related apps
      for (const relatedApp of relatedApps) {
        const relatedNameLower = relatedApp.name.toLowerCase();
        let type: SteamMissingContent['type'] = 'Related';
        let description = `Related content for ${baseName}`;
        
        // Determine content type based on name patterns
        if (relatedNameLower.includes('dlc') || 
            relatedNameLower.includes(baseNameLower + ' -') ||
            relatedNameLower.includes(baseNameLower + ':')) {
          type = 'DLC';
          description = `DLC for ${baseName}`;
        } else if (relatedNameLower.includes('expansion')) {
          type = 'Expansion';
          description = `Expansion for ${baseName}`;
        } else if (relatedNameLower.includes('edition') || 
                   relatedNameLower.includes('remaster') ||
                   relatedNameLower.includes('enhanced') ||
                   relatedNameLower.includes('definitive') ||
                   relatedNameLower.includes('complete') ||
                   relatedNameLower.includes('ultimate') ||
                   relatedNameLower.includes('deluxe') ||
                   relatedNameLower.includes('gold') ||
                   relatedNameLower.includes('goty')) {
          type = 'Edition';
          description = `Enhanced edition of ${baseName}`;
        } else if (relatedNameLower.includes('bundle') || 
                   relatedNameLower.includes('collection') ||
                   relatedNameLower.includes('pack')) {
          type = 'Bundle';
          description = `Bundle containing ${baseName}`;
        } else if (/\s(2|3|4|5|ii|iii|iv|v)\b/.test(relatedNameLower) ||
                   relatedNameLower.includes(' sequel') ||
                   relatedNameLower.includes(' returns') ||
                   relatedNameLower.includes(' continues')) {
          type = 'Sequel';
          description = `Sequel to ${baseName}`;
        }
        
        missingContent.push({
          appid: relatedApp.appid,
          name: relatedApp.name,
          type,
          baseGame: baseName,
          baseGameAppid: ownedGame.appid,
          description,
          steamUrl: `https://store.steampowered.com/app/${relatedApp.appid}/`
        });
      }
    }
    
    // Remove duplicates and sort by type priority
    const uniqueContent = missingContent.filter((content, index, self) => 
      index === self.findIndex(c => c.appid === content.appid)
    );
    
    // Sort by type priority and then by name
    const typePriority = { 'DLC': 1, 'Expansion': 2, 'Edition': 3, 'Sequel': 4, 'Bundle': 5, 'Related': 6 };
    uniqueContent.sort((a, b) => {
      const priorityDiff = typePriority[a.type] - typePriority[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });
    
    // Limit results to avoid overwhelming the user
    return uniqueContent;
    
  } catch (error) {
    console.error('Error analyzing missing content with Steam data:', error);
    return [];
  }
} 