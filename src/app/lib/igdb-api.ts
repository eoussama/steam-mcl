/**
 * IGDB API Service Module
 * Handles all IGDB (Internet Game Database) API interactions for game content analysis
 */

import igdb from 'igdb-api-node';
import { twitchTokenManager } from './twitch-token-manager';

/**
 * Game category types in IGDB
 */
export enum GameCategory {
  MAIN_GAME = 0,
  DLC_ADDON = 1,
  EXPANSION = 2,
  BUNDLE = 3,
  STANDALONE_EXPANSION = 4,
  MOD = 5,
  EPISODE = 6,
  SEASON = 7,
  REMAKE = 8,
  REMASTER = 9,
  EXPANDED_GAME = 10,
  PORT = 11,
  FORK = 12,
  PACK = 13,
  UPDATE = 14,
}

/**
 * Interface for missing content analysis result
 */
export interface MissingContent {
  id: number;
  steamAppId?: number;
  name: string;
  type: 'DLC' | 'Expansion' | 'Sequel' | 'Prequel' | 'Spin-off' | 'Remaster' | 'Bundle';
  baseGame?: string;
  description?: string;
  releaseDate?: Date;
  price?: string;
  platforms?: string[];
  coverUrl?: string;
}

/**
 * Interface for IGDB game data
 */
export interface IGDBGame {
  id: number;
  name: string;
  category?: number;
  parent_game?: number;
  version_parent?: number;
  version_title?: string;
  standalone_expansions?: number[];
  expansions?: number[];
  dlcs?: number[];
  similar_games?: number[];
  franchise?: number;
  franchises?: number[];
  collection?: number;
  first_release_date?: number;
  platforms?: number[];
  summary?: string;
  cover?: {
    id: number;
    url: string;
  };
}

/**
 * Get IGDB client instance with automatic token management
 */
async function getIGDBClient() {
  if (typeof window !== 'undefined') {
    throw new Error('IGDB API should not be used on client-side');
  }
  
  const clientId = process.env.TWITCH_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('TWITCH_CLIENT_ID environment variable is required');
  }
  
  // Get a valid access token from the token manager
  const accessToken = await twitchTokenManager.getAccessToken();
  
  return igdb(clientId, accessToken);
}

/**
 * Search for games by name in IGDB
 */
export async function searchGamesInIGDB(query: string, limit = 10): Promise<IGDBGame[]> {
  const client = await getIGDBClient();
  
  try {
    const response = await client
      .fields(['id', 'name', 'category', 'parent_game', 'version_parent', 'first_release_date', 'platforms', 'summary', 'cover.url'])
      .search(query)
      .limit(limit)
      .request('/games');
    
    return response.data;
  } catch (error) {
    console.error('Error searching games in IGDB:', error);
    throw new Error('Failed to search games in IGDB');
  }
}

/**
 * Get game details by IGDB ID
 */
export async function getGameById(id: number): Promise<IGDBGame | null> {
  const client = await getIGDBClient();
  
  try {
    const response = await client
      .fields([
        'id', 'name', 'category', 'parent_game', 'version_parent', 'version_title',
        'standalone_expansions', 'expansions', 'dlcs', 'similar_games',
        'franchise', 'franchises', 'collection', 'first_release_date',
        'platforms', 'summary', 'cover.url'
      ])
      .where(`id = ${id}`)
      .request('/games');
    
    return response.data[0] || null;
  } catch (error) {
    console.error('Error getting game by ID from IGDB:', error);
    return null;
  }
}

/**
 * Get related content for a game (DLC, expansions, sequels, etc.)
 */
export async function getRelatedContent(gameName: string): Promise<IGDBGame[]> {
  const client = await getIGDBClient();
  
  try {
    // First, find the main game
    const gameResponse = await client
      .fields(['id', 'name', 'franchise', 'franchises', 'collection'])
      .search(gameName)
      .limit(5)
      .request('/games');
    
    const mainGame = gameResponse.data[0];
    if (!mainGame) {
      return [];
    }
    
    const queries: Promise<{ data: IGDBGame[] }>[] = [];
    
    // Get DLCs and expansions for this game
    queries.push(
      client
        .fields(['id', 'name', 'category', 'parent_game', 'first_release_date', 'platforms', 'summary', 'cover.url'])
        .where(`parent_game = ${mainGame.id}`)
        .request('/games')
    );
    
    // Get games in the same franchise
    if (mainGame.franchise) {
      queries.push(
        client
          .fields(['id', 'name', 'category', 'franchise', 'first_release_date', 'platforms', 'summary', 'cover.url'])
          .where(`franchise = ${mainGame.franchise} & id != ${mainGame.id}`)
          .limit(20)
          .request('/games')
      );
    }
    
    // Get games in the same collection
    if (mainGame.collection) {
      queries.push(
        client
          .fields(['id', 'name', 'category', 'collection', 'first_release_date', 'platforms', 'summary', 'cover.url'])
          .where(`collection = ${mainGame.collection} & id != ${mainGame.id}`)
          .limit(20)
          .request('/games')
      );
    }
    
    const results = await Promise.all(queries);
    const allRelatedGames: IGDBGame[] = [];
    
    results.forEach(result => {
      if (result.data) {
        allRelatedGames.push(...result.data);
      }
    });
    
    // Remove duplicates
    const uniqueGames = allRelatedGames.filter((game, index, self) => 
      index === self.findIndex(g => g.id === game.id)
    );
    
    return uniqueGames;
  } catch (error) {
    console.error('Error getting related content from IGDB:', error);
    return [];
  }
}

/**
 * Analyze missing content for owned Steam games
 */
export async function analyzeMissingContent(ownedGameNames: string[]): Promise<MissingContent[]> {
  const missingContent: MissingContent[] = [];
  
  try {
    // Process games in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < ownedGameNames.length; i += batchSize) {
      const batch = ownedGameNames.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (gameName) => {
        try {
          const relatedGames = await getRelatedContent(gameName);
          
          return relatedGames.map(game => {
            const contentType = categorizeGameType(game.category);
            
            return {
              id: game.id,
              name: game.name,
              type: contentType,
              baseGame: gameName,
              description: game.summary || `Related content for ${gameName}`,
              releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : undefined,
              platforms: game.platforms ? game.platforms.map(p => `Platform ${p}`) : [],
              coverUrl: game.cover?.url ? `https:${game.cover.url}` : undefined,
            } as MissingContent;
          });
        } catch (error) {
          console.error(`Error analyzing game ${gameName}:`, error);
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(gameResults => {
        missingContent.push(...gameResults);
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < ownedGameNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Filter and sort results
    return missingContent
      .filter(content => content.name && content.type !== 'Spin-off') // Remove low-quality results
      .sort((a, b) => {
        // Prioritize DLC and Expansions
        const typeOrder = { 'DLC': 1, 'Expansion': 2, 'Sequel': 3, 'Prequel': 4, 'Remaster': 5, 'Bundle': 6, 'Spin-off': 7 };
        return typeOrder[a.type] - typeOrder[b.type];
      })
      .slice(0, 50); // Limit results
      
  } catch (error) {
    console.error('Error analyzing missing content:', error);
    return [];
  }
}

/**
 * Categorize IGDB game category into user-friendly types
 */
function categorizeGameType(category?: number): MissingContent['type'] {
  switch (category) {
    case GameCategory.DLC_ADDON:
      return 'DLC';
    case GameCategory.EXPANSION:
    case GameCategory.STANDALONE_EXPANSION:
      return 'Expansion';
    case GameCategory.BUNDLE:
      return 'Bundle';
    case GameCategory.REMAKE:
    case GameCategory.REMASTER:
      return 'Remaster';
    default:
      // For franchise/collection games, we'll need additional logic to determine if it's a sequel/prequel
      return 'Sequel';
  }
}

/**
 * Convert IGDB cover URL to specific size
 */
export function getIGDBImageUrl(coverUrl: string, size: 'thumb' | 'cover_small' | 'cover_big' | 'screenshot_med' = 'cover_small'): string {
  if (!coverUrl.includes('igdb.com')) {
    return coverUrl;
  }
  
  // Replace the size in the IGDB URL
  return coverUrl.replace(/\/t_[^\/]+\//, `/t_${size}/`);
} 